import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { discoverFiles } from "./discover.js";
import { applyRedactions } from "./redact.js";
import { byteLength, decodeText, isProbablyBinary } from "./text.js";
import { estimateTokens } from "./tokens.js";
import type { ContextBundle, ContextManifest, IncludedFile, OmittedFile, ResolvedPackOptions } from "./types.js";

export async function packRepository(options: ResolvedPackOptions): Promise<ContextBundle> {
  const paths = await discoverFiles(options);
  const files: IncludedFile[] = [];
  const omitted: OmittedFile[] = [];
  let totalTokens = 0;

  for (const path of paths) {
    const pinned = options.pinned.includes(path);
    const absolutePath = join(options.root, path);

    try {
      const info = await stat(absolutePath);

      if (info.size > options.maxFileBytes && !pinned) {
        omitted.push({ path, bytes: info.size, pinned, reason: "over-max-file-bytes" });
        continue;
      }

      const buffer = await readFile(absolutePath);

      if (isProbablyBinary(buffer)) {
        omitted.push({ path, bytes: info.size, pinned, reason: "binary" });
        continue;
      }

      const decoded = decodeText(buffer);
      if (decoded === undefined) {
        omitted.push({ path, bytes: info.size, pinned, reason: "not-text" });
        continue;
      }

      const redacted = applyRedactions(decoded, options.redact);
      const tokens = estimateTokens(redacted.text);

      if (totalTokens + tokens > options.budget && !pinned) {
        omitted.push({ path, bytes: info.size, tokens, pinned, reason: "over-budget" });
        continue;
      }

      totalTokens += tokens;
      files.push({
        path,
        bytes: byteLength(redacted.text),
        tokens,
        pinned,
        redactions: redacted.counts,
        content: redacted.text
      });
    } catch (error) {
      omitted.push({
        path,
        pinned,
        reason: "read-error",
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const manifest: ContextManifest = {
    generatedAt: "1970-01-01T00:00:00.000Z",
    root: options.root,
    format: options.format,
    budget: options.budget,
    totalTokens,
    includedCount: files.length,
    omittedCount: omitted.length,
    include: options.include,
    exclude: options.exclude,
    pinned: options.pinned,
    files: files.map(({ content: _content, ...file }) => file),
    omitted
  };

  return { manifest, files };
}
