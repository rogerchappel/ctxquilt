# ctxquilt

Pack compact, reproducible repository context bundles for coding agents.
ctxquilt collects text files from include globs, applies ignore rules and
redactions, estimates token cost, and emits a markdown or JSON bundle with a
manifest that explains what was included and omitted.

## Status

Early MVP. The CLI is usable locally, but the package is not published yet.

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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes
should be small, reviewable, and verified before review.

## Security

ctxquilt includes default redaction for env-looking secret assignments and URL
credentials, but context bundles should still be reviewed before sharing. See
[SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## License

MIT
