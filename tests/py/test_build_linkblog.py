"""Characterization tests for scripts/build-linkblog.py: they pin today's output."""

import tempfile
import unittest
from pathlib import Path

from script_loader import load_script

linkblog = load_script("build-linkblog.py")

GOOD = {
    "url": "https://example.com/a",
    "published": "2026-01-01T00:00:00+00:00",
    "comment": "A comment.",
    "tags": ["x"],
}
FILE = "data/linkposts.json"


class ValidateEntriesTest(unittest.TestCase):
    def test_valid_entries_have_no_errors(self):
        self.assertEqual(linkblog.validate_entries([GOOD]), [])

    def test_non_object_entry(self):
        self.assertEqual(
            linkblog.validate_entries(["x"]),
            [f"{FILE}[0] (no url): entry is not a JSON object (got str)"],
        )

    def test_missing_fields_use_no_url_label(self):
        self.assertEqual(
            linkblog.validate_entries([{}]),
            [
                f"{FILE}[0] (no url): missing or empty required field 'url'",
                f"{FILE}[0] (no url): missing or empty required field 'published'",
                f"{FILE}[0] (no url): missing or empty required field 'comment'",
            ],
        )

    def test_blank_and_non_string_fields(self):
        entry = {"url": "  ", "published": 5, "comment": ""}
        errors = linkblog.validate_entries([entry])
        self.assertEqual(len(errors), 3)
        self.assertTrue(all("(no url)" in e for e in errors))

    def test_url_scheme(self):
        entry = dict(GOOD, url="ftp://example.com")
        self.assertEqual(
            linkblog.validate_entries([entry]),
            [
                f"{FILE}[0] (ftp://example.com): url must start with "
                f"'http://' or 'https://'"
            ],
        )

    def test_url_is_stripped_for_label(self):
        entry = dict(GOOD, url="  ftp://e  ")
        self.assertIn("(ftp://e)", linkblog.validate_entries([entry])[0])

    def test_naive_published(self):
        entry = dict(GOOD, published="2026-08-15")
        self.assertEqual(
            linkblog.validate_entries([entry]),
            [
                f"{FILE}[0] (https://example.com/a): 'published' must be a "
                f"timezone-aware ISO 8601 datetime (e.g. "
                f"'2026-08-15T10:00:00+00:00', not a bare date or a "
                f"tz-naive datetime): '2026-08-15'"
            ],
        )

    def test_bad_tags(self):
        for tags in ("x", [1], None):
            errors = linkblog.validate_entries([dict(GOOD, tags=tags)])
            self.assertEqual(
                errors,
                [
                    f"{FILE}[0] (https://example.com/a): 'tags' must be a list "
                    f"of strings if present"
                ],
            )

    def test_tags_are_optional(self):
        entry = {k: v for k, v in GOOD.items() if k != "tags"}
        self.assertEqual(linkblog.validate_entries([entry]), [])

    def test_duplicate_urls_pair(self):
        errors = linkblog.validate_entries([GOOD, dict(GOOD)])
        self.assertEqual(
            errors,
            [
                f"{FILE}[0] (https://example.com/a): duplicate url, also used "
                f"by entry at index 1",
                f"{FILE}[1] (https://example.com/a): duplicate url, also used "
                f"by entry at index 0",
            ],
        )

    def test_duplicate_urls_triple(self):
        errors = linkblog.validate_entries([GOOD, GOOD, GOOD])
        self.assertEqual(len(errors), 3)
        self.assertIn("also used by entries at index 1, 2", errors[0])
        self.assertIn("also used by entries at index 0, 2", errors[1])

    def test_errors_follow_entry_order_then_duplicates(self):
        bad = dict(GOOD, url="ftp://z")
        errors = linkblog.validate_entries([GOOD, bad, GOOD])
        self.assertEqual(len(errors), 3)
        self.assertIn("[1]", errors[0])
        self.assertIn("duplicate", errors[1])


def front_matter(date_line):
    return f'---\ntitle: "t"\n{date_line}\n---\nbody\n'


class SelfVerifyTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.dir = Path(self.tmp.name)
        self.feed = self.dir / "atom.xml"
        self.feed.write_text("<feed/>", encoding="utf-8")

    def post(self, text):
        path = self.dir / "post.md"
        path.write_text(text, encoding="utf-8")
        return path

    def message(self, paths):
        with self.assertRaises(RuntimeError) as ctx:
            linkblog.self_verify(self.feed, paths)
        return str(ctx.exception)

    def test_ok_with_quoted_and_bare_dates(self):
        quoted = self.post(front_matter('date: "2026-01-01T00:00:00+00:00"'))
        self.assertIsNone(linkblog.self_verify(self.feed, [quoted]))
        single = self.post(front_matter("date: '2026-01-01T00:00:00Z'"))
        self.assertIsNone(linkblog.self_verify(self.feed, [single]))
        bare = self.post(front_matter("date: 2026-01-01T00:00:00+00:00"))
        self.assertIsNone(linkblog.self_verify(self.feed, [bare]))

    def test_no_posts_is_ok(self):
        self.assertIsNone(linkblog.self_verify(str(self.feed), []))

    def test_malformed_feed(self):
        self.feed.write_text("<feed>", encoding="utf-8")
        message = self.message([])
        self.assertTrue(
            message.startswith(
                f"{self.feed}: self-verification failed — generated feed is "
                f"not well-formed XML: "
            )
        )

    def test_missing_front_matter(self):
        path = self.post("no front matter")
        self.assertEqual(
            self.message([path]),
            f"{path}: self-verification failed — could not find "
            f"'---'-delimited front matter",
        )

    def test_missing_date(self):
        path = self.post(front_matter("other: 1"))
        self.assertEqual(
            self.message([path]),
            f"{path}: self-verification failed — no 'date:' field found "
            f"in front matter",
        )

    def test_unparseable_date_reports_raw_value(self):
        path = self.post(front_matter('date: "2026-01-01"'))
        self.assertEqual(
            self.message([path]),
            f"{path}: self-verification failed — 'date:' field is not a "
            f"parseable timezone-aware ISO 8601 datetime: "
            f"'\"2026-01-01\"'",
        )

    def test_mismatched_quotes_are_not_stripped(self):
        path = self.post(front_matter("date: \"2026-01-01T00:00:00+00:00'"))
        self.assertIn("not a parseable", self.message([path]))

    def test_first_bad_post_wins(self):
        good = self.post(front_matter("date: 2026-01-01T00:00:00+00:00"))
        bad = self.dir / "bad.md"
        bad.write_text("nope", encoding="utf-8")
        self.assertIn("bad.md", self.message([good, bad]))


if __name__ == "__main__":
    unittest.main()
