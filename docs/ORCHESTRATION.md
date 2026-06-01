# Orchestration

ctxquilt is designed to be called by local agent runners before they delegate a
task. The orchestrator owns task selection; ctxquilt owns deterministic context
collection.

## Flow

1. Choose include globs for the task.
2. Pin files that must be included even when they are large or exceed budget.
3. Apply default and project-specific redaction rules.
4. Emit a markdown bundle for human-readable prompts or JSON for tools.
5. Use `ctxquilt explain` to inspect the manifest in logs or CI.

## Example

```bash
ctxquilt pack \
  --include "src/**/*.ts" \
  --include "test/**/*.ts" \
  --pin "docs/PRD.md" \
  --budget 12000 \
  --output context.md
```

The output manifest records inputs, included files, omitted files, redaction
counts, and estimated token totals so another agent can reproduce the pack.

## Release Candidate Gate

Factory and orchestration workers should treat the MVP as ship-ready only when
these local gates pass from a clean checkout:

```bash
npm ci
npm run release:check
npm run smoke
bash scripts/validate.sh
```

If any gate fails, push the branch to `incubate/ctxquilt` and record blockers in
the release-candidate pull request.
