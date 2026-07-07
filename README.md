# ctxquilt

Pack compact, reproducible repository context bundles for coding agents.
ctxquilt collects text files from include globs, applies ignore rules and
redactions, estimates token cost, and emits a markdown or JSON bundle with a
manifest that explains what was included and omitted.


## Quickstart

Run the tool from a fresh checkout:

```sh
npm install
npm run build
node dist/src/cli.js --help
npm test
```

The help command is a quick smoke test for the CLI entrypoint, and `npm test` runs the committed regression suite before you depend on the output.

## Status

Local-first MVP. The CLI is usable locally, covered by fixture-backed tests, and
ready for release-candidate review. The package is not published yet.

## Install

```sh
npm install
npm run build
```

## Use

```sh
npx ctxquilt pack --include "src/**/*.ts" --include README.md --budget 12000 --output context.md
npx ctxquilt explain context.md
npx ctxquilt pack --format json --include "src/**/*.ts" --output context.json
```

Common options:

- `--config <path>` reads a JSON config file.
- `--root <path>` changes the repository root.
- `--include <glob>` and `--exclude <glob>` may be repeated.
- `--pin <glob>` includes matching files even when they exceed budget.
- `--budget <tokens>` sets the approximate token budget.
- `--max-file-bytes <bytes>` skips large unpinned files.
- `--redact <name:regex>` adds a custom redaction rule.
- `--no-gitignore` ignores `.gitignore` filtering.

Example config:

```json
{
  "include": ["src/**/*.ts", "README.md"],
  "exclude": ["**/*.test.ts"],
  "pinned": ["docs/PRD.md"],
  "budget": 12000,
  "format": "markdown",
  "redact": [
    {
      "name": "internal-host",
      "pattern": "internal-[a-z0-9.-]+"
    }
  ]
}
```

See [examples/ctxquilt.json](examples/ctxquilt.json) for a copyable starter
config.

## Output Contract

Every bundle contains:

- A manifest with stable `generatedAt`, root, format, budget, include/exclude
  inputs, pinned files, included file metadata, omitted file reasons, redaction
  counts, and total estimated tokens.
- File content after redaction.
- Deterministic ordering for reproducible output across identical inputs.

Pinned files bypass token budget and per-file byte limits, and the manifest marks
files matched by pinned globs as pinned.

## Limitations

- ctxquilt only packages local text context selected by includes, excludes, and
  config. It does not infer task intent or choose the best files automatically.
- Token budgets are approximate and meant for repeatable sizing, not exact
  provider billing or model-specific token accounting.
- Default redaction catches common secret shapes, but generated bundles still
  need review before they are shared outside a trusted workspace.
- Pinned files intentionally bypass budget and size limits; use them sparingly
  when deterministic inclusion matters more than compact output.

## Verify

Run the local validation script before opening a pull request:

```sh
bash scripts/validate.sh
```

Direct npm checks:

```sh
npm run check
npm test
npm run smoke
```

`scripts/validate.sh` runs the repository's standard local checks when they are
defined and will also run `agent-qc ready` when `agent-qc` is installed. Missing
`agent-qc` is treated as a skip, not a failure.

## Development

Run the same checks maintainers use before opening a PR:

```sh
npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```
## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes
should be small, reviewable, and verified before review.

## Security

ctxquilt includes default redaction for env-looking secret assignments and URL
credentials, but context bundles should still be reviewed before sharing. See
[SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## Release Readiness

Before tagging a release candidate, run:

```sh
npm ci
npm run release:check
npm run smoke
bash scripts/validate.sh
```

## License

MIT
