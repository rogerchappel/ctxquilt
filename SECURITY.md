# Security Policy

## Supported Versions

ctxquilt has not published a stable release yet. Until the first published
version exists, only the current `main` branch and active release-candidate
branches are reviewed for security fixes.

| Version | Supported |
| --- | --- |
| `main` / release candidates | Yes |
| Published npm versions | Not yet published |

## Reporting a Vulnerability

Please do not report suspected vulnerabilities in public issues, pull requests, or discussions.

Ask maintainers for the private security reporting path before sharing details.

If no private reporting path exists yet, ask maintainers through public project channels for a private reporting path. Do not include exploit details, secrets, personal data, or sensitive technical details in public messages.

## What to Include

When a private reporting path is available, include:

- A clear description of the issue.
- Affected versions, files, packages, workflows, or configuration.
- Steps to reproduce, proof of concept, or attack scenario when safe to share.
- Potential impact.
- Suggested mitigation, if known.

## Response Expectations

Maintainers review good-faith reports as capacity allows.

Do not imply paid support, guaranteed response times, guaranteed fixes, or service-level agreements unless `ctxquilt` explicitly provides them.

## Scope

In scope:

- Vulnerabilities in ctxquilt.
- Insecure default configuration shipped by this project.
- CI, release, or dependency guidance maintained by this project.
- Redaction bypasses that expose obvious env-style secrets in generated bundles.

Out of scope:

- General support requests.
- Requests for guaranteed maintenance timelines.
- Issues in unrelated downstream projects.

## Disclosure

Coordinate disclosure with maintainers before publishing vulnerability details.
