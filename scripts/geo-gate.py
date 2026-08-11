#!/usr/bin/env python3
"""GEO release gate.

Runs after the Hugo build and before deploy. Verifies that the built site
and the post sources meet the GEO (generative engine optimization) contract:
crawlability files, structured data, content thresholds, and a fresh
prompt-battery snapshot. Any failed check exits non-zero and blocks deploy.

Usage: scripts/geo-gate.py [repo-root]   (defaults to the script's parent repo)

No dependencies beyond the Python 3 standard library.
"""

import json
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path

REQUIRED_BOTS = [
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "Claude-SearchBot",
    "Claude-User",
]
LLMS_MIN_LINKS = 10
DESCRIPTION_MIN = 80
DESCRIPTION_MAX = 160
MIN_INTERNAL_LINKS_PER_POST = 1
MIN_TOTAL_EXTERNAL_LINKS = 40
BATTERY_MAX_AGE_DAYS = 45
BATTERY_FIX = (
    "run ~/dev/geo-prompt-battery/run_battery.sh then sync_snapshot.sh "
    "<blog-repo> and commit data/geo-battery.json"
)
SITE_DOMAIN = "prestonbernstein.com"

MD_LINK_RE = re.compile(r"(?<!\!)\[[^\]]*\]\(\s*<?([^)\s>]+)>?[^)]*\)")
JSONLD_RE = re.compile(
    r"<script[^>]*type=(?:\"|')?application/ld\+json(?:\"|')?[^>]*>(.*?)</script>",
    re.DOTALL | re.IGNORECASE,
)


def split_front_matter(text):
    """Return (front_matter, body) for a '---' YAML-delimited markdown file."""
    m = re.match(r"\A---\s*\n(.*?)\n---\s*\n?(.*)\Z", text, re.DOTALL)
    if not m:
        return None, text
    return m.group(1), m.group(2)


def fm_value(front_matter, key):
    """Extract a simple single-line scalar value from front matter."""
    m = re.search(
        rf"^{key}:\s*(.+?)\s*$", front_matter, re.MULTILINE
    )
    if not m:
        return None
    val = m.group(1)
    if len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
        val = val[1:-1]
    return val


def parse_iso(value):
    """Parse an ISO-8601 datetime or date string to an aware datetime."""
    value = value.strip()
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(value)
    except ValueError:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def published_posts(root):
    """Return [(path, front_matter, body)] for non-draft post sources."""
    posts = []
    for md in sorted((root / "content" / "english" / "blog").glob("*.md")):
        if md.name == "_index.md":
            continue
        fm, body = split_front_matter(md.read_text(encoding="utf-8"))
        if fm is None:
            continue
        if (fm_value(fm, "draft") or "").lower() == "true":
            continue
        posts.append((md, fm, body))
    return posts


def built_post_pages(root):
    """Return built post pages public/blog/<slug>/index.html, excluding list pages."""
    pages = []
    blog_dir = root / "public" / "blog"
    if not blog_dir.is_dir():
        return pages
    for child in sorted(blog_dir.iterdir()):
        if not child.is_dir() or child.name == "page":
            continue
        page = child / "index.html"
        if page.is_file():
            pages.append(page)
    return pages


def classify_link(url):
    """Return 'internal', 'external', or None (anchors, mailto, images, etc.)."""
    url = url.strip()
    if not url or url.startswith("#") or url.startswith("mailto:"):
        return None
    if url.startswith(("http://", "https://", "//")):
        host = re.sub(r"^(https?:)?//", "", url).split("/")[0].lower()
        if host == SITE_DOMAIN or host.endswith("." + SITE_DOMAIN):
            return "internal"
        return "external"
    return "internal"  # root-relative or relative path


def find_blogposting(node):
    """Recursively find a JSON-LD node whose @type is/contains BlogPosting."""
    if isinstance(node, dict):
        t = node.get("@type")
        types = t if isinstance(t, list) else [t]
        if "BlogPosting" in types:
            return node
        for value in node.values():
            found = find_blogposting(value)
            if found:
                return found
    elif isinstance(node, list):
        for item in node:
            found = find_blogposting(item)
            if found:
                return found
    return None


# ---------------------------------------------------------------- checks ----

def check_robots(root):
    errors = []
    path = root / "public" / "robots.txt"
    if not path.is_file():
        return [f"{path.relative_to(root)} does not exist"]
    text = path.read_text(encoding="utf-8")

    # Parse into stanzas: user-agent line(s) followed by directives.
    stanzas = {}  # agent -> list of directive lines
    current_agents = []
    expecting_agents = False
    for line in text.splitlines():
        line = line.split("#", 1)[0].strip()
        if not line:
            continue
        m = re.match(r"(?i)^user-agent:\s*(.+)$", line)
        if m:
            if not expecting_agents:
                current_agents = []
            current_agents.append(m.group(1).strip())
            expecting_agents = True
            for agent in current_agents:
                stanzas.setdefault(agent, [])
            continue
        expecting_agents = False
        for agent in current_agents:
            stanzas[agent].append(line)

    for bot in REQUIRED_BOTS:
        directives = stanzas.get(bot)
        if directives is None:
            errors.append(f"robots.txt: no 'User-agent: {bot}' stanza")
        elif not any(re.match(r"(?i)^allow:", d) for d in directives):
            errors.append(f"robots.txt: stanza for {bot} has no Allow directive")

    if not re.search(r"(?im)^sitemap:\s*\S+", text):
        errors.append("robots.txt: missing 'Sitemap:' line")
    return errors


def check_llms(root):
    errors = []
    path = root / "public" / "llms.txt"
    if not path.is_file():
        return [f"{path.relative_to(root)} does not exist"]
    text = path.read_text(encoding="utf-8")
    first = text.splitlines()[0] if text.splitlines() else ""
    if not first.startswith("# "):
        errors.append(f"llms.txt: first line must start with '# ' (got: {first[:60]!r})")
    n_links = len(MD_LINK_RE.findall(text))
    if n_links < LLMS_MIN_LINKS:
        errors.append(f"llms.txt: only {n_links} markdown links, need >= {LLMS_MIN_LINKS}")
    return errors


def check_sitemap(root):
    path = root / "public" / "sitemap.xml"
    if not path.is_file():
        return [f"{path.relative_to(root)} does not exist"]
    return []


def check_jsonld(root):
    errors = []
    pages = built_post_pages(root)
    if not pages:
        return ["no built post pages found under public/blog/*/index.html"]
    for page in pages:
        rel = page.relative_to(root)
        html = page.read_text(encoding="utf-8")
        blobs = JSONLD_RE.findall(html)
        if not blobs:
            errors.append(f"{rel}: no <script type=\"application/ld+json\"> block")
            continue
        posting = None
        parse_errors = 0
        for blob in blobs:
            try:
                data = json.loads(blob)
            except json.JSONDecodeError:
                parse_errors += 1
                continue
            posting = posting or find_blogposting(data)
        if posting is None:
            if parse_errors:
                errors.append(f"{rel}: {parse_errors} JSON-LD block(s) failed to parse as JSON")
            errors.append(f"{rel}: no JSON-LD object with @type BlogPosting")
            continue
        pub_raw = posting.get("datePublished")
        mod_raw = posting.get("dateModified")
        if not pub_raw:
            errors.append(f"{rel}: BlogPosting missing datePublished")
        if not mod_raw:
            errors.append(f"{rel}: BlogPosting missing dateModified")
        if pub_raw and mod_raw:
            pub, mod = parse_iso(pub_raw), parse_iso(mod_raw)
            if pub is None:
                errors.append(f"{rel}: unparseable datePublished {pub_raw!r}")
            elif mod is None:
                errors.append(f"{rel}: unparseable dateModified {mod_raw!r}")
            elif mod < pub:
                errors.append(
                    f"{rel}: dateModified {mod_raw} is before datePublished {pub_raw}"
                )
    return errors


def check_descriptions(root):
    errors = []
    posts = published_posts(root)
    if not posts:
        return ["no published post sources found under content/english/blog/*.md"]
    for md, fm, _body in posts:
        rel = md.relative_to(root)
        desc = fm_value(fm, "description")
        if desc is None:
            errors.append(f"{rel}: front matter has no description")
            continue
        n = len(desc)
        if not (DESCRIPTION_MIN <= n <= DESCRIPTION_MAX):
            errors.append(
                f"{rel}: description is {n} chars, need "
                f"{DESCRIPTION_MIN}-{DESCRIPTION_MAX}"
            )
    return errors


def count_links(body):
    internal = external = 0
    for url in MD_LINK_RE.findall(body):
        kind = classify_link(url)
        if kind == "internal":
            internal += 1
        elif kind == "external":
            external += 1
    return internal, external


def check_internal_links(root):
    errors = []
    for md, _fm, body in published_posts(root):
        internal, _ = count_links(body)
        if internal < MIN_INTERNAL_LINKS_PER_POST:
            errors.append(
                f"{md.relative_to(root)}: {internal} internal links, "
                f"need >= {MIN_INTERNAL_LINKS_PER_POST}"
            )
    return errors


def check_external_links_total(root):
    total = sum(count_links(body)[1] for _md, _fm, body in published_posts(root))
    if total < MIN_TOTAL_EXTERNAL_LINKS:
        return [
            f"site-wide in-body external links = {total}, regression floor is "
            f">= {MIN_TOTAL_EXTERNAL_LINKS}"
        ]
    return []


def check_battery(root):
    path = root / "data" / "geo-battery.json"
    if not path.is_file():
        return [f"{path.relative_to(root)} does not exist -- {BATTERY_FIX}"]
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [f"data/geo-battery.json does not parse as JSON ({exc}) -- {BATTERY_FIX}"]
    errors = []
    for key in ("date", "engine", "hits", "total"):
        if key not in data:
            errors.append(f"data/geo-battery.json missing key {key!r}")
    if errors:
        errors.append(BATTERY_FIX)
        return errors
    try:
        snap_date = date.fromisoformat(str(data["date"]))
    except ValueError:
        return [
            f"data/geo-battery.json date {data['date']!r} is not YYYY-MM-DD -- {BATTERY_FIX}"
        ]
    age = (date.today() - snap_date).days
    if age > BATTERY_MAX_AGE_DAYS:
        return [
            f"data/geo-battery.json snapshot is {age} days old "
            f"(max {BATTERY_MAX_AGE_DAYS}) -- {BATTERY_FIX}"
        ]
    return []


CHECKS = [
    ("robots.txt crawler stanzas", check_robots),
    ("llms.txt", check_llms),
    ("sitemap.xml", check_sitemap),
    ("BlogPosting JSON-LD on built posts", check_jsonld),
    ("front-matter descriptions 80-160 chars", check_descriptions),
    ("internal links per post", check_internal_links),
    ("site-wide external link floor", check_external_links_total),
    ("geo-battery snapshot freshness", check_battery),
]


def main():
    root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else (
        Path(__file__).resolve().parent.parent
    )
    if not (root / "public").is_dir():
        print(f"FATAL: {root}/public does not exist -- run the Hugo build first")
        return 1

    failures = 0
    print(f"GEO release gate -- {root}")
    print("-" * 60)
    for name, fn in CHECKS:
        errors = fn(root)
        if errors:
            failures += 1
            print(f"FAIL   {name}")
            for err in errors:
                print(f"       - {err}")
        else:
            print(f"PASS   {name}")
    print("-" * 60)
    if failures:
        print(f"RESULT: FAIL ({failures}/{len(CHECKS)} checks failed) -- deploy blocked")
        return 1
    print(f"RESULT: PASS ({len(CHECKS)}/{len(CHECKS)} checks)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
