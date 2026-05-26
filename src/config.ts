import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { BundleFormat, PackConfig, ResolvedPackOptions } from "./types.js";

const DEFAULT_BUDGET = 12000;
const DEFAULT_MAX_FILE_BYTES = 256 * 1024;

export async function loadConfig(configPath?: string): Promise<PackConfig> {
  if (!configPath) {
    return {};
  }

  const absolutePath = resolve(configPath);
  const raw = await readFile(absolutePath, "utf8");
  return JSON.parse(raw) as PackConfig;
}

export function resolveOptions(config: PackConfig, overrides: PackConfig): ResolvedPackOptions {
  const root = resolve(overrides.root ?? config.root ?? process.cwd());
  const format = normalizeFormat(overrides.format ?? config.format ?? "markdown");

  return {
    root,
    include: nonEmptyArray(overrides.include, config.include, ["**/*"]),
    exclude: unique([...(config.exclude ?? []), ...(overrides.exclude ?? [])]),
    pinned: unique([...(config.pinned ?? []), ...(overrides.pinned ?? [])]),
    budget: overrides.budget ?? config.budget ?? DEFAULT_BUDGET,
    maxFileBytes: overrides.maxFileBytes ?? config.maxFileBytes ?? DEFAULT_MAX_FILE_BYTES,
    format,
    output: overrides.output ?? config.output,
    redact: [...(config.redact ?? []), ...(overrides.redact ?? [])],
    respectGitignore: overrides.respectGitignore ?? config.respectGitignore ?? true
  };
}

function normalizeFormat(format: string): BundleFormat {
  if (format === "markdown" || format === "json") {
    return format;
  }

  throw new Error(`Unsupported format "${format}". Use "markdown" or "json".`);
}

function nonEmptyArray<T>(primary: T[] | undefined, fallback: T[] | undefined, defaultValue: T[]): T[] {
  if (primary && primary.length > 0) {
    return unique(primary);
  }

  if (fallback && fallback.length > 0) {
    return unique(fallback);
  }

  return defaultValue;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
