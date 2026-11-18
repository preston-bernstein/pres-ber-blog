# Agent rules for pres-ber-blog

This repo is a Hugo blog on the Blowfish theme. CLAUDE.md holds the voice and GEO rules for posts. This file holds the build and gate rules.

## Commands

- The one gate: `bash scripts/core-validate.sh` (file size, names, complexity, function length, parameters, nesting, duplication). Run it before you say a task is done.
- GitHub Actions gate: `bash scripts/gha-validate.sh` (workflow-check.py, actionlint, zizmor).
- JavaScript gate: `bash scripts/js-validate.sh` (package-check, eslint, `npm test`). Install with `npm ci`. `npm install` is not allowed.
- Shell gate: `bash scripts/shell-validate.sh` (bash -n, shell-check.py, shellcheck, shfmt, bats).
- Python script tests: `python3 -m unittest discover -s tests/py -t tests/py` (build-linkblog.py and geo-gate.py).
- Writing gate: `bash scripts/writing-validate.sh` (Vale on the files that changed against main).
- Hook: `git config core.hooksPath .githooks`. It runs all five gates. Never commit with `--no-verify`.
- Tools: `pip install --require-hashes -r scripts/gate-requirements.txt` (lizard, zizmor), `npm ci` (jscpd), `bash scripts/install-gate-tools.sh DIR` (actionlint, shellcheck, shfmt, vale, bats, hugo).

## Core rules

- Reuse before you write. Search for an existing function or module first. Extend it. Do not add a near copy.
- Put variants in data and in generic code. Do not copy code. When two things differ only in a type or a value, write one function that takes the type or the value.
- Extract on the second real occurrence. Never merge code that looks alike but belongs to different domains.
- No boolean flag arguments. Two behaviors are two functions.
- Organize by domain. Do not name files for their kind (utils, helpers, managers). Dependencies point one way: edge to domain, never back.
- A function does one thing at one level of detail. Use guard clauses. Keep it under 50 lines, under 10 branches, at most 4 parameters.
- Names say what a thing is or does. No `data`, `info`, `tmp`, `handle` or `process` as a whole name.
- Fail loudly: return or raise an error with context. Never swallow one. Comments say why, not what.
- Delete dead code and unused options.
- A behavior change ships with a test that fails without it. Do not edit generated files; change the generator.
- Never edit a limit or a config to make a run pass. Fix the code. A waiver goes in `.core-allow` with a reason. Baselines in `.core-baseline.json` only shrink.
- The scripts that start with `core-`, `gha-`, `js-`, `shell-`, `writing-` and `workflow-` come from the stack packs. Copy updates from the packs. Do not edit them here.

## GitHub Actions rules

- Pin every `uses:` to a full 40-character commit SHA with the version in a trailing comment. Dependabot keeps the pins current.
- Set `permissions: contents: read` at the top of every workflow. Raise it per job only where needed.
- Never put `${{ github.event... }}`, `${{ github.head_ref }}` or `${{ inputs.x }}` inside `run:`. Pass it through `env:`.
- Do not use `pull_request_target`. `actions/checkout` gets `persist-credentials: false`. Every job has `timeout-minutes`. No `secrets: inherit`.
- Run each gate once in CI. `gates.yml` runs them; do not add the same gate to another workflow.
- Never edit the workflow checks or `.github/zizmor.yml` to make a run pass. Fix the workflow.

## JavaScript rules

- Do not add a dependency without asking. No `*`, `latest`, git or URL dependencies. Do not edit the lockfile by hand.
- Do not add install scripts. Keep `min-release-age` in `.npmrc`.
- Await or return every promise. Reject with `Error` objects.
- Read configuration once at startup, validate it, and pass it in.
- Never edit the ESLint config or `.npmrc` to make a run pass.
- Tests are Playwright specs in `tests/e2e`. They run on the built site through `npm test`.

## Shell rules

- Use `#!/usr/bin/env bash` and `set -euo pipefail`. A deliberate exception is `# sh-allow: nostrict <reason>`.
- Scripts run on bash 3.2 and bash 5. No `mapfile`, `declare -A`, `${x,,}` or `|&`.
- Quote every expansion. Send errors to stderr. Check tools with `command -v`.
- Every `mktemp` has a `trap` cleanup. Never pipe a download into a shell.
- A behavior change to a script ships with a bats test in `tests/shell`.

## Writing rules

- Docs and code comments are short, plain, American English. Put the point first.
- Use common words. Put the condition first: "If the build fails, run X".
- A comment says why, in three sentences at most. No AI filler.
- A false positive gets `<!-- vale off -->` with a reason, or a line in `.writing-allow`.
