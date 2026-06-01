# ctxquilt Release Candidate

## Classification

Ship-ready local-first MVP, pending maintainer review and branch protection
confirmation.

## Highlights

- Packs deterministic markdown and JSON context bundles for coding agents.
- Supports config files, repeated include/exclude globs, pinned files, token
  budgets, per-file byte limits, `.gitignore`, binary detection, default
  redaction, and custom regex redaction.
- Includes `ctxquilt explain` for manifest summaries.
- Adds static fixtures, example config, orchestration docs, security policy,
  contributing guidance, package metadata, and release validation commands.

## Verification

Recorded for this release candidate on 2026-05-31:

- `npm ci`: passed, 24 packages audited, 0 vulnerabilities.
- `npm run release:check`: passed; typecheck, 5 Node tests, and npm package
  dry-run all passed.
- `npm run smoke`: passed; packed `README.md` and explained the markdown
  manifest.
- `bash scripts/validate.sh`: passed; required files/directories, package
  checks, build, tests, and release check passed. `agent-qc` was not installed
  and was skipped by design.
- Real CLI fixture flow: passed; generated markdown and JSON bundles from
  `tests/fixtures/sample-project`, verified redaction, pinned glob manifest
  metadata, `.gitignore` behavior, and `ctxquilt explain` output.

## Limitations

- JSON config only; YAML is intentionally out of scope for the MVP.
- Token counts use a deterministic approximation instead of model-specific
  tokenizers.
- Redaction catches common env-style secrets and configured regexes, but users
  must review bundles before sharing.
- Package is not published to npm yet.
