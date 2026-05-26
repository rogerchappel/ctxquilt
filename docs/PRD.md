# ctxquilt PRD

Status: in-progress

## Summary

ctxquilt builds compact, reproducible context packs for coding agents. It takes
include/exclude globs, token budgets, redaction rules, and pinned file lists,
then emits a markdown or JSON bundle with a manifest that explains exactly what
was included and why.

## Why now

Agentic coding workflows live or die on context quality. Developers need a
repeatable local tool that makes small, reviewable context bundles instead of
dragging entire repositories into a prompt.

## Source attribution

Inspired by current terminal-agent workflow coverage and the growing need for
portable context between Codex, Claude Code, Gemini CLI, OpenClaw, and related
tools. ctxquilt is an original repo-context packaging CLI.

## Target users

- Developers handing tasks to coding agents.
- Maintainers creating issue-ready context bundles.
- Agent orchestrators that need deterministic context manifests.

## MVP

- Read a config file or CLI globs.
- Collect text files with size limits, binary detection, and ignore support.
- Apply simple redaction rules for env-looking values and user-supplied regexes.
- Estimate token cost with a deterministic approximation.
- Emit markdown and JSON bundles plus an inclusion manifest.
- Include fixture-backed tests and CLI smokes.

## Non-goals

- Semantic embedding search.
- Cloud storage.
- Model-specific tokenizer dependencies.

## CLI sketch

```bash
ctxquilt pack --include "src/**/*.ts" --include README.md --budget 12000
ctxquilt pack --config ctxquilt.json --format json --output context.json
ctxquilt explain context.json
```

## Success criteria

- Context packs are stable across runs for the same inputs.
- Redaction and omitted-file reasons are visible in the manifest.
