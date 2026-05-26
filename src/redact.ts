import type { RedactionRule } from "./types.js";

export interface RedactionResult {
  text: string;
  counts: Record<string, number>;
}

const DEFAULT_RULES: RedactionRule[] = [
  {
    name: "env-secret",
    pattern: String.raw`\b[A-Z][A-Z0-9_]*(?:SECRET|TOKEN|KEY|PASSWORD|PASS|PWD)[A-Z0-9_]*\s*=\s*([^\s"'` + "`" + String.raw`]+|"[^"]*"|'[^']*')`,
    replacement: "$&"
  },
  {
    name: "dotenv-url-password",
    pattern: String.raw`\b[a-z][a-z0-9+.-]*:\/\/[^:\s]+:([^@\s]+)@`,
    replacement: "[REDACTED_URL_CREDENTIAL]@"
  }
];

export function applyRedactions(input: string, customRules: RedactionRule[]): RedactionResult {
  let text = input;
  const counts: Record<string, number> = {};

  for (const rule of [...DEFAULT_RULES, ...customRules]) {
    const regex = new RegExp(rule.pattern, "gu");
    let count = 0;
    text = text.replace(regex, (...args: unknown[]) => {
      count += 1;
      const match = String(args[0]);

      if (rule.replacement && rule.replacement !== "$&") {
        return rule.replacement;
      }

      if (rule.name === "env-secret") {
        const equalsIndex = match.indexOf("=");
        return `${match.slice(0, equalsIndex + 1)}[REDACTED]`;
      }

      return "[REDACTED]";
    });

    if (count > 0) {
      counts[rule.name] = (counts[rule.name] ?? 0) + count;
    }
  }

  return { text, counts };
}
