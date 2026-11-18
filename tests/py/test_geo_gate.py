"""Characterization tests for scripts/geo-gate.py: they pin today's output."""

import json
import tempfile
import unittest
from pathlib import Path

from script_loader import load_script

geo = load_script("geo-gate.py")

ROBOTS_OK = "".join(f"User-agent: {bot}\nAllow: /\n\n" for bot in geo.REQUIRED_BOTS)


class TempRootTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.root = Path(tmp.name)
        (self.root / "public").mkdir()

    def write_robots(self, text):
        (self.root / "public" / "robots.txt").write_text(text, encoding="utf-8")


class CheckRobotsTest(TempRootTest):
    def test_missing_file(self):
        self.assertEqual(
            geo.check_robots(self.root), ["public/robots.txt does not exist"]
        )

    def test_complete_file_passes(self):
        self.write_robots(ROBOTS_OK + "Sitemap: https://x/sitemap.xml\n")
        self.assertEqual(geo.check_robots(self.root), [])

    def test_missing_bots_and_sitemap(self):
        self.write_robots("User-agent: *\nDisallow:\n")
        errors = geo.check_robots(self.root)
        self.assertEqual(
            errors,
            [f"robots.txt: no 'User-agent: {bot}' stanza" for bot in geo.REQUIRED_BOTS]
            + ["robots.txt: missing 'Sitemap:' line"],
        )

    def test_stanza_without_allow(self):
        self.write_robots(
            "User-agent: OAI-SearchBot\nDisallow: /\n"
            + "".join(
                f"User-agent: {bot}\nAllow: /\n" for bot in geo.REQUIRED_BOTS[1:]
            )
            + "sitemap: https://x\n"
        )
        self.assertEqual(
            geo.check_robots(self.root),
            ["robots.txt: stanza for OAI-SearchBot has no Allow directive"],
        )

    def test_grouped_agents_share_directives(self):
        group = "".join(f"User-agent: {bot}\n" for bot in geo.REQUIRED_BOTS)
        self.write_robots(f"{group}Allow: /  # open\nSitemap: https://x\n")
        self.assertEqual(geo.check_robots(self.root), [])

    def test_comments_and_case_are_ignored(self):
        self.write_robots(
            "# top\nUSER-AGENT: OAI-SearchBot\nALLOW: /\n"
            + "".join(
                f"User-agent: {bot}\nAllow: /\n" for bot in geo.REQUIRED_BOTS[1:]
            )
            + "SITEMAP: https://x\n"
        )
        self.assertEqual(geo.check_robots(self.root), [])


def page_html(*blobs):
    return "".join(
        f'<script type="application/ld+json">{blob}</script>' for blob in blobs
    )


def posting(**fields):
    return json.dumps(dict({"@type": "BlogPosting"}, **fields))


class CheckJsonldTest(TempRootTest):
    def write_page(self, slug, html):
        page = self.root / "public" / "blog" / slug / "index.html"
        page.parent.mkdir(parents=True)
        page.write_text(html, encoding="utf-8")

    def test_no_pages(self):
        self.assertEqual(
            geo.check_jsonld(self.root),
            ["no built post pages found under public/blog/*/index.html"],
        )

    def test_valid_page(self):
        self.write_page(
            "a",
            page_html(
                posting(
                    datePublished="2026-01-01T00:00:00Z",
                    dateModified="2026-01-02T00:00:00Z",
                )
            ),
        )
        self.assertEqual(geo.check_jsonld(self.root), [])

    def test_no_block(self):
        self.write_page("a", "<html></html>")
        self.assertEqual(
            geo.check_jsonld(self.root),
            ['public/blog/a/index.html: no <script type="application/ld+json"> block'],
        )

    def test_unparseable_block_and_no_posting(self):
        self.write_page("a", page_html("{nope", '{"@type": "Person"}'))
        self.assertEqual(
            geo.check_jsonld(self.root),
            [
                "public/blog/a/index.html: 1 JSON-LD block(s) failed to parse as JSON",
                "public/blog/a/index.html: no JSON-LD object with @type BlogPosting",
            ],
        )

    def test_no_posting_without_parse_errors(self):
        self.write_page("a", page_html('{"@type": "Person"}'))
        self.assertEqual(
            geo.check_jsonld(self.root),
            ["public/blog/a/index.html: no JSON-LD object with @type BlogPosting"],
        )

    def test_posting_found_despite_bad_block(self):
        self.write_page(
            "a",
            page_html(
                "{nope",
                posting(datePublished="2026-01-01", dateModified="2026-01-01"),
            ),
        )
        self.assertEqual(geo.check_jsonld(self.root), [])

    def test_missing_dates(self):
        self.write_page("a", page_html(posting()))
        self.assertEqual(
            geo.check_jsonld(self.root),
            [
                "public/blog/a/index.html: BlogPosting missing datePublished",
                "public/blog/a/index.html: BlogPosting missing dateModified",
            ],
        )

    def test_one_missing_date_skips_comparison(self):
        self.write_page("a", page_html(posting(datePublished="bad")))
        self.assertEqual(
            geo.check_jsonld(self.root),
            ["public/blog/a/index.html: BlogPosting missing dateModified"],
        )

    def test_unparseable_dates(self):
        self.write_page(
            "a", page_html(posting(datePublished="bad", dateModified="bad"))
        )
        self.write_page(
            "b",
            page_html(posting(datePublished="2026-01-01", dateModified="bad")),
        )
        self.assertEqual(
            geo.check_jsonld(self.root),
            [
                "public/blog/a/index.html: unparseable datePublished 'bad'",
                "public/blog/b/index.html: unparseable dateModified 'bad'",
            ],
        )

    def test_modified_before_published(self):
        self.write_page(
            "a",
            page_html(
                posting(datePublished="2026-02-01", dateModified="2026-01-01")
            ),
        )
        self.assertEqual(
            geo.check_jsonld(self.root),
            [
                "public/blog/a/index.html: dateModified 2026-01-01 is before "
                "datePublished 2026-02-01"
            ],
        )

    def test_list_pages_are_skipped(self):
        self.write_page("page", "<html></html>")
        self.assertEqual(
            geo.check_jsonld(self.root),
            ["no built post pages found under public/blog/*/index.html"],
        )


class FindBlogpostingTest(unittest.TestCase):
    def test_direct_and_list_type(self):
        node = {"@type": "BlogPosting", "n": 1}
        self.assertIs(geo.find_blogposting(node), node)
        listed = {"@type": ["Thing", "BlogPosting"]}
        self.assertIs(geo.find_blogposting(listed), listed)

    def test_nested_in_dict_and_list(self):
        inner = {"@type": "BlogPosting"}
        self.assertIs(geo.find_blogposting({"a": {"b": [1, inner]}}), inner)
        self.assertIs(geo.find_blogposting([{"x": 1}, inner]), inner)

    def test_first_match_wins(self):
        first = {"@type": "BlogPosting", "n": 1}
        second = {"@type": "BlogPosting", "n": 2}
        self.assertIs(geo.find_blogposting([first, second]), first)

    def test_none_cases(self):
        self.assertIsNone(geo.find_blogposting({"@type": "Person"}))
        self.assertIsNone(geo.find_blogposting("BlogPosting"))
        self.assertIsNone(geo.find_blogposting({}))
        self.assertIsNone(geo.find_blogposting(None))


if __name__ == "__main__":
    unittest.main()
