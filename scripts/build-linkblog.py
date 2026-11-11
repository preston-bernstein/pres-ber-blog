#!/usr/bin/env python3
"""Linkblog build script.

Reads hand-authored link-post entries from `data/linkposts.json`, validates
them, and renders them via linkblog-commons into Hugo content pages and an
Atom feed.

`data/linkposts.json` is hand-authored, not Hugo-native: it is not a Hugo
content file and Hugo does not read it directly. Preston (or whoever is
adding a link post) edits this JSON file by hand, and this script is the
only thing that turns it into Hugo content + a feed.

Convention: once an entry's `url` and `published` fields are committed, they
are immutable — treat them as the entry's identity. Editing `comment` or
`tags` on an existing entry is fine; changing `url` or `published` after the
fact should be treated as removing the old entry and adding a new one (so
that permalinks/feed identity generated from those fields stay stable).

The Hugo content pages and Atom feed this script generates ARE committed to
the repo (not gitignored) and are NOT meant to be hand-edited — they are
regenerated from `data/linkposts.json` by this script. Treat any drift
between the generated output and what this script would produce as a bug to
fix by re-running the script, not by hand-patching the generated files.

Usage: scripts/build-linkblog.py

No dependencies beyond the Python 3 standard library and an installed
`linkblog-commons` (invoked via subprocess as `python -m linkblog_commons`,
never imported directly).
"""

import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

DATA_FILE = Path("data/linkposts.json")
CONTENT_DIR = Path("content/english/links")
FEED_OUT = Path("static/links/atom.xml")

# Hardcoded feed identity, mirroring this site's own identity (hugo.toml's
# `title` / `baseURL`) rather than reading hugo.toml dynamically — see
# docs/{slug}/plan.md and requirements.md for this decision.
FEED_TITLE = "Preston Bernstein — Links"
FEED_LINK = "https://prestonbernstein.com/links/"

REQUIRED_STRING_FIELDS = ("url", "published", "comment")

# Matches generated linkblog content filenames, e.g.
# "2026-08-15-4786f2bf04dc486c.md": a YYYY-MM-DD date prefix, a hyphen, then
# a 16-char lowercase hex string, then ".md". This only recognizes the
# SHAPE of a generated filename (see linkblog-commons' render.py) — it does
# not recompute or verify the hash itself.
GENERATED_FILENAME_RE = re.compile(r"^\d{4}-\d{2}-\d{2}-[0-9a-f]{16}\.md$")

# Same hand-rolled '---'-delimited YAML front matter approach as
# scripts/geo-gate.py's split_front_matter/fm_value (kept in sync
# deliberately rather than sharing a module, since this repo has no shared
# script library and adding one for two small regexes isn't worth it).
FRONT_MATTER_RE = re.compile(r"\A(---\s*\n)(.*?\n)(---\s*\n?)(.*)\Z", re.DOTALL)
PUBLISHED_LINE_RE = re.compile(r"^published:\s*(.+?)\s*$", re.MULTILINE)
DATE_LINE_RE = re.compile(r"^date:\s*.+$", re.MULTILINE)
URL_LINE_RE = re.compile(r"^url:\s*(.+?)\s*$", re.MULTILINE)
SOURCE_URL_LINE_RE = re.compile(r"^source_url:\s*.+$", re.MULTILINE)
DATE_VALUE_RE = re.compile(r"^date:\s*(.+?)\s*$", re.MULTILINE)


def parse_iso(value):
    """Parse an ISO-8601 datetime string. Returns None if invalid.

    linkblog-commons' own LinkPost validation requires `published` to be
    timezone-aware (a bare date like "2026-08-15", with no offset, parses
    fine with `datetime.fromisoformat` but is rejected downstream with
    `invalid_timestamp`). Reject tz-naive values here too, so a bad entry
    is caught with a clear message before the render subprocess ever runs,
    not several layers deeper with a less specific error.
    """
    value = value.strip()
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return None
    return parsed


def load_entries(path):
    """Read and JSON-parse `path`. Raises ValueError if the root isn't a list."""
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, list):
        raise ValueError(
            f"{path}: expected the JSON root to be a list, got {type(data).__name__}"
        )
    return data


def validate_entries(entries):
    """Validate every entry. Returns a list of error strings (empty = all valid)."""
    errors = []
    seen_urls = {}

    for index, entry in enumerate(entries):
        if not isinstance(entry, dict):
            errors.append(
                f"{DATA_FILE}[{index}] (no url): entry is not a JSON object "
                f"(got {type(entry).__name__})"
            )
            continue

        raw_url = entry.get("url")
        url_label = (
            raw_url.strip()
            if isinstance(raw_url, str) and raw_url.strip()
            else "no url"
        )

        for field in REQUIRED_STRING_FIELDS:
            value = entry.get(field)
            if not isinstance(value, str) or not value.strip():
                errors.append(
                    f"{DATA_FILE}[{index}] ({url_label}): missing or empty "
                    f"required field '{field}'"
                )

        if isinstance(raw_url, str) and raw_url.strip():
            stripped_url = raw_url.strip()
            if not (
                stripped_url.startswith("http://")
                or stripped_url.startswith("https://")
            ):
                errors.append(
                    f"{DATA_FILE}[{index}] ({url_label}): url must start with "
                    f"'http://' or 'https://'"
                )
            seen_urls.setdefault(stripped_url, []).append(index)

        published = entry.get("published")
        if isinstance(published, str) and published.strip():
            if parse_iso(published) is None:
                errors.append(
                    f"{DATA_FILE}[{index}] ({url_label}): 'published' must be a "
                    f"timezone-aware ISO 8601 datetime (e.g. "
                    f"'2026-08-15T10:00:00+00:00', not a bare date or a "
                    f"tz-naive datetime): {published!r}"
                )

        if "tags" in entry:
            tags = entry["tags"]
            if not isinstance(tags, list) or not all(
                isinstance(t, str) for t in tags
            ):
                errors.append(
                    f"{DATA_FILE}[{index}] ({url_label}): 'tags' must be a list "
                    f"of strings if present"
                )

    for url, indices in seen_urls.items():
        if len(indices) > 1:
            for index in indices:
                others = [i for i in indices if i != index]
                errors.append(
                    f"{DATA_FILE}[{index}] ({url}): duplicate url, also used "
                    f"by entr{'y' if len(others) == 1 else 'ies'} at index "
                    f"{', '.join(str(i) for i in others)}"
                )

    return errors


def wipe_generated_content(content_dir):
    """Delete stale generated `.md` files under `content_dir`.

    Only deletes files whose name matches `GENERATED_FILENAME_RE` (the
    generated-filename shape). Never touches `_index.md` or anything else,
    as a safety guard against deleting a hand-added file that happens to be
    sitting in the same directory.
    """
    content_dir = Path(content_dir)
    if not content_dir.is_dir():
        return

    for path in content_dir.iterdir():
        if not path.is_file():
            continue
        if path.name == "_index.md":
            continue
        if GENERATED_FILENAME_RE.match(path.name):
            path.unlink()


def render_entry(entry, content_dir):
    """Render one validated entry via `python -m linkblog_commons render`.

    Builds the subprocess argument list from the entry's fields (never
    shell=True or string concatenation, since these values come from
    hand-authored JSON file content), runs it, and parses stdout as the
    JSON status envelope documented by linkblog-commons.

    Returns the envelope's `result` dict on success (status == "ok").
    Raises RuntimeError with a human-readable message on any failure:
    non-zero exit code, a "fail" status envelope, or unparseable stdout.
    """
    args = [
        sys.executable,
        "-m",
        "linkblog_commons",
        "render",
        "--url",
        entry["url"],
        "--published",
        entry["published"],
        "--comment",
        entry["comment"],
    ]
    for tag in entry.get("tags", []):
        args.extend(["--tag", tag])
    args.extend(["--output-dir", str(content_dir)])

    proc = subprocess.run(args, capture_output=True, text=True)

    try:
        envelope = json.loads(proc.stdout)
    except (json.JSONDecodeError, ValueError) as exc:
        raise RuntimeError(
            f"could not parse linkblog_commons render output as JSON "
            f"(exit code {proc.returncode}): {exc}\n"
            f"stdout: {proc.stdout!r}\nstderr: {proc.stderr!r}"
        ) from exc

    if envelope.get("status") != "ok" or proc.returncode != 0:
        error = envelope.get("error")
        raise RuntimeError(
            f"linkblog_commons render failed (exit code {proc.returncode}): "
            f"{error!r}\nstderr: {proc.stderr!r}"
        )

    return envelope.get("result")


def rename_url_field(md_path):
    """Rename linkblog-commons' `url:` front-matter key to `source_url:`.

    Hugo reserves `url` as a special front-matter field: setting it
    overrides a page's own generated permalink. linkblog-commons'
    `hugo_render()` writes `url: "<the shared link>"` as an ordinary data
    field, with no idea Hugo treats that key specially for its own
    consumers -- against a real external http(s) URL, this breaks the
    Hugo build outright (Hugo tries to route the page at that literal
    URL). Since linkblog-commons itself is out of scope to modify, rename
    the key here, immediately after render, before Hugo ever sees the file.

    Idempotent: does nothing if a `source_url:` line is already present.

    Raises RuntimeError if front matter can't be parsed, or no `url:`
    line is found within it.
    """
    text = md_path.read_text(encoding="utf-8")

    match = FRONT_MATTER_RE.match(text)
    if not match:
        raise RuntimeError(
            f"{md_path}: could not find '---'-delimited front matter"
        )
    open_delim, front_matter, close_delim, body = match.groups()

    if SOURCE_URL_LINE_RE.search(front_matter):
        return  # already patched; leave as-is

    url_match = URL_LINE_RE.search(front_matter)
    if not url_match:
        raise RuntimeError(f"{md_path}: no 'url:' line found in front matter")

    new_front_matter = (
        front_matter[: url_match.start()]
        + f"source_url: {url_match.group(1)}"
        + front_matter[url_match.end() :]
    )

    md_path.write_text(
        open_delim + new_front_matter + close_delim + body, encoding="utf-8"
    )


def inject_date_field(md_path):
    """Inject a Hugo-native `date:` front matter line next to `published:`.

    linkblog-commons' `hugo_render()` writes `published` in front matter,
    not Hugo's native `date` field, and Hugo/Blowfish's sorting and date
    display read `.Date`, which comes from front matter `date`. This copies
    the `published` value into a new `date:` line immediately after it.

    Idempotent: does nothing if a `date:` line is already present, so a
    re-run against an already-patched file is a no-op rather than a
    duplicate line.

    Raises RuntimeError if the file can't be parsed as '---'-delimited
    front matter, or if no `published:` line is found within it.
    """
    text = md_path.read_text(encoding="utf-8")

    match = FRONT_MATTER_RE.match(text)
    if not match:
        raise RuntimeError(
            f"{md_path}: could not find '---'-delimited front matter"
        )
    open_delim, front_matter, close_delim, body = match.groups()

    if DATE_LINE_RE.search(front_matter):
        return  # already patched; leave as-is

    published_match = PUBLISHED_LINE_RE.search(front_matter)
    if not published_match:
        raise RuntimeError(f"{md_path}: no 'published:' line found in front matter")
    published_value = published_match.group(1)

    insert_at = published_match.end()
    new_front_matter = (
        front_matter[:insert_at]
        + f"\ndate: {published_value}"
        + front_matter[insert_at:]
    )

    md_path.write_text(
        open_delim + new_front_matter + close_delim + body, encoding="utf-8"
    )


def render_all(entries, content_dir):
    """Render every entry, collecting failures instead of stopping early.

    Returns a tuple `(successes, failures)`:
    - `successes`: a list of `Path` objects, one per entry that rendered
      (and was date-injected) successfully, in entry order. Handed to
      `self_verify` so it can re-check the exact files this run wrote,
      rather than re-deriving that list some other way.
    - `failures`: a list of `(index, entry, error_message)` tuples for
      entries that failed to render (empty = all entries rendered
      successfully).

    Entries that succeeded before a later failure will already have written
    their files — that's fine under the wipe-and-regenerate model, since the
    next successful run's wipe step cleans up any partial output.

    After each successful render, renames the `url:` front-matter field to
    `source_url:` (see `rename_url_field` -- Hugo reserves `url`) and
    injects a `date:` field (see `inject_date_field`); a failure in either
    step is treated as a failure for that entry, same as a render failure.
    """
    successes = []
    failures = []
    for index, entry in enumerate(entries):
        try:
            result = render_entry(entry, content_dir)
            md_path = Path(result["path"])
            rename_url_field(md_path)
            inject_date_field(md_path)
            successes.append(md_path)
        except RuntimeError as exc:
            failures.append((index, entry, str(exc)))
    return successes, failures


def generate_feed(entries_path, feed_out):
    """Render the Atom feed via `python -m linkblog_commons feed`.

    One call per build (not per entry), unlike `render_entry`. Builds the
    subprocess argument list (never shell=True), runs it, creates
    `feed_out`'s parent directory if needed, and parses stdout as the same
    JSON status envelope shape `render_entry` handles.

    Raises RuntimeError with a human-readable message on any failure:
    non-zero exit code, a "fail" status envelope, or unparseable stdout.
    """
    feed_out = Path(feed_out)
    feed_out.parent.mkdir(parents=True, exist_ok=True)

    args = [
        sys.executable,
        "-m",
        "linkblog_commons",
        "feed",
        "--input",
        str(entries_path),
        "--output",
        str(feed_out),
        "--title",
        FEED_TITLE,
        "--link",
        FEED_LINK,
    ]

    proc = subprocess.run(args, capture_output=True, text=True)

    try:
        envelope = json.loads(proc.stdout)
    except (json.JSONDecodeError, ValueError) as exc:
        raise RuntimeError(
            f"could not parse linkblog_commons feed output as JSON "
            f"(exit code {proc.returncode}): {exc}\n"
            f"stdout: {proc.stdout!r}\nstderr: {proc.stderr!r}"
        ) from exc

    if envelope.get("status") != "ok" or proc.returncode != 0:
        error = envelope.get("error")
        raise RuntimeError(
            f"linkblog_commons feed generation failed (exit code "
            f"{proc.returncode}): {error!r}\nstderr: {proc.stderr!r}"
        )

    return envelope.get("result")


def self_verify(feed_out, rendered_paths):
    """Self-verify this run's freshly-written output before declaring success.

    Two checks, either of which raises RuntimeError with a clear message on
    failure (this matches this repo's deterministic-release-gate culture —
    see scripts/geo-gate.py — rather than leaving new output unchecked):

    1. `feed_out` parses as well-formed XML via `ET.parse`.
    2. Each path in `rendered_paths` (the files `render_all` just wrote) has
       front matter containing a `date:` field whose value itself parses
       via `parse_iso`.
    """
    feed_out = Path(feed_out)
    try:
        ET.parse(feed_out)
    except ET.ParseError as exc:
        raise RuntimeError(
            f"{feed_out}: self-verification failed — generated feed is not "
            f"well-formed XML: {exc}"
        ) from exc

    for md_path in rendered_paths:
        md_path = Path(md_path)
        text = md_path.read_text(encoding="utf-8")

        match = FRONT_MATTER_RE.match(text)
        if not match:
            raise RuntimeError(
                f"{md_path}: self-verification failed — could not find "
                f"'---'-delimited front matter"
            )
        _, front_matter, _, _ = match.groups()

        date_match = DATE_VALUE_RE.search(front_matter)
        if not date_match:
            raise RuntimeError(
                f"{md_path}: self-verification failed — no 'date:' field "
                f"found in front matter"
            )
        date_value = date_match.group(1)
        # linkblog-commons writes front matter values as YAML
        # double-quoted strings (e.g. `date: "2026-08-15T00:00:00+00:00"`,
        # copied verbatim from `published:` by inject_date_field). Strip a
        # single matching pair of surrounding quotes before parsing, same
        # as a YAML parser would, rather than rejecting a validly-quoted
        # value as unparseable.
        if len(date_value) >= 2 and date_value[0] == date_value[-1] and date_value[0] in "\"'":
            date_value = date_value[1:-1]
        if parse_iso(date_value) is None:
            raise RuntimeError(
                f"{md_path}: self-verification failed — 'date:' field is "
                f"not a parseable timezone-aware ISO 8601 datetime: "
                f"{date_match.group(1)!r}"
            )


def main():
    try:
        entries = load_entries(DATA_FILE)
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 1
    except (OSError, json.JSONDecodeError) as exc:
        print(f"{DATA_FILE}: failed to read/parse: {exc}", file=sys.stderr)
        return 1

    errors = validate_entries(entries)
    if errors:
        for error in errors:
            print(error, file=sys.stderr)
        return 1

    wipe_generated_content(CONTENT_DIR)

    successes, failures = render_all(entries, CONTENT_DIR)
    if failures:
        for index, entry, error in failures:
            url = entry.get("url", "no url") if isinstance(entry, dict) else "no url"
            print(f"{DATA_FILE}[{index}] ({url}): {error}", file=sys.stderr)
        return 1

    try:
        generate_feed(DATA_FILE, FEED_OUT)
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    try:
        self_verify(FEED_OUT, successes)
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
