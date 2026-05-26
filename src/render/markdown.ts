import type { ContextBundle } from "../types.js";

const MANIFEST_START = "<!-- ctxquilt-manifest";
const MANIFEST_END = "ctxquilt-manifest -->";

export function renderMarkdown(bundle: ContextBundle): string {
  const lines: string[] = [
    "# ctxquilt context pack",
    "",
    MANIFEST_START,
    JSON.stringify(bundle.manifest, null, 2),
    MANIFEST_END,
    "",
    "## Manifest",
    "",
    `- Budget: ${bundle.manifest.budget} tokens`,
    `- Included: ${bundle.manifest.includedCount} files`,
    `- Omitted: ${bundle.manifest.omittedCount} files`,
    `- Estimated tokens: ${bundle.manifest.totalTokens}`,
    ""
  ];

  if (bundle.manifest.omitted.length > 0) {
    lines.push("## Omitted files", "");
    for (const file of bundle.manifest.omitted) {
      lines.push(`- \`${file.path}\`: ${file.reason}`);
    }
    lines.push("");
  }

  lines.push("## Files", "");

  for (const file of bundle.files) {
    lines.push(`### ${file.path}`, "");
    lines.push(`- Bytes: ${file.bytes}`);
    lines.push(`- Estimated tokens: ${file.tokens}`);
    lines.push(`- Pinned: ${file.pinned ? "yes" : "no"}`);
    lines.push("");
    lines.push("```text");
    lines.push(file.content.replaceAll("```", "```\\`"));
    lines.push("```", "");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function parseMarkdownManifest(markdown: string) {
  const start = markdown.indexOf(MANIFEST_START);
  const end = markdown.indexOf(MANIFEST_END);

  if (start === -1 || end === -1 || end <= start) {
    return undefined;
  }

  const jsonStart = start + MANIFEST_START.length;
  return JSON.parse(markdown.slice(jsonStart, end).trim());
}
