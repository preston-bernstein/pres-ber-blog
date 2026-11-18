"""Characterization tests for the linkblog-commons calls in scripts/build-linkblog.py."""

import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from script_loader import load_script

linkblog = load_script("build-linkblog.py")

ENTRY = {"url": "https://e.com", "published": "2026-01-01T00:00:00+00:00", "comment": "c"}


def completed(stdout, returncode=0, stderr=""):
    return subprocess.CompletedProcess([], returncode, stdout, stderr)


def run_with(proc, call):
    with mock.patch.object(linkblog.subprocess, "run", return_value=proc) as run:
        try:
            return call(), run
        except RuntimeError as exc:
            return exc, run


class RenderEntryTest(unittest.TestCase):
    def render(self, proc):
        return run_with(proc, lambda: linkblog.render_entry(ENTRY, "out"))

    def test_returns_result_and_builds_args(self):
        result, run = self.render(completed('{"status": "ok", "result": {"path": "p"}}'))
        self.assertEqual(result, {"path": "p"})
        args = run.call_args.args[0]
        self.assertEqual(args[1:5], ["-m", "linkblog_commons", "render", "--url"])
        self.assertEqual(args[-2:], ["--output-dir", "out"])

    def test_tags_become_flags(self):
        entry = dict(ENTRY, tags=["a", "b"])
        with mock.patch.object(
            linkblog.subprocess, "run", return_value=completed('{"status": "ok"}')
        ) as run:
            linkblog.render_entry(entry, "out")
        args = run.call_args.args[0]
        self.assertEqual(args[args.index("--tag") :][:4], ["--tag", "a", "--tag", "b"])

    def test_unparseable_output(self):
        error, _ = self.render(completed("nope", 3, "boom"))
        self.assertEqual(
            str(error),
            "could not parse linkblog_commons render output as JSON (exit code 3): "
            "Expecting value: line 1 column 1 (char 0)\n"
            "stdout: 'nope'\nstderr: 'boom'",
        )

    def test_fail_status(self):
        error, _ = self.render(completed('{"status": "fail", "error": "bad"}', 0, "e"))
        self.assertEqual(
            str(error),
            "linkblog_commons render failed (exit code 0): 'bad'\nstderr: 'e'",
        )

    def test_nonzero_exit_with_ok_status(self):
        error, _ = self.render(completed('{"status": "ok"}', 1))
        self.assertIn("render failed (exit code 1): None", str(error))


class GenerateFeedTest(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.feed_out = Path(tmp.name) / "nested" / "atom.xml"

    def generate(self, proc):
        return run_with(
            proc, lambda: linkblog.generate_feed("in.json", self.feed_out)
        )

    def test_returns_result_and_creates_parent(self):
        result, run = self.generate(completed('{"status": "ok", "result": 7}'))
        self.assertEqual(result, 7)
        self.assertTrue(self.feed_out.parent.is_dir())
        args = run.call_args.args[0]
        self.assertEqual(args[3:7], ["feed", "--input", "in.json", "--output"])

    def test_unparseable_output(self):
        error, _ = self.generate(completed("", 2))
        self.assertTrue(
            str(error).startswith(
                "could not parse linkblog_commons feed output as JSON (exit code 2): "
            )
        )

    def test_failure(self):
        error, _ = self.generate(completed('{"status": "fail", "error": "x"}', 1, "s"))
        self.assertEqual(
            str(error),
            "linkblog_commons feed generation failed (exit code 1): 'x'\nstderr: 's'",
        )


if __name__ == "__main__":
    unittest.main()
