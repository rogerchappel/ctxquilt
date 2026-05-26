#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Command, Option } from "commander";
import { loadConfig, resolveOptions } from "./config.js";
import { packRepository } from "./pack.js";
import { renderJson } from "./render/json.js";
import { parseMarkdownManifest, renderMarkdown } from "./render/markdown.js";
import type { BundleFormat, PackConfig, RedactionRule } from "./types.js";

const program = new Command();

program
  .name("ctxquilt")
  .description("Pack compact, reproducible repository context bundles for coding agents.")
  .version("0.1.0");

program
  .command("pack")
  .description("Create a context bundle from repository files.")
  .option("-c, --config <path>", "read JSON config from a file")
  .option("-r, --root <path>", "repository root to pack")
  .option("-i, --include <glob>", "include glob; may be repeated", collect, [])
  .option("-x, --exclude <glob>", "exclude glob; may be repeated", collect, [])
  .option("-p, --pin <glob>", "pinned file or glob; may be repeated", collect, [])
  .option("-b, --budget <tokens>", "token budget", parsePositiveInteger)
  .option("--max-file-bytes <bytes>", "maximum bytes per unpinned file", parsePositiveInteger)
  .addOption(new Option("-f, --format <format>", "output format").choices(["markdown", "json"]))
  .option("-o, --output <path>", "write bundle to a file instead of stdout")
  .option("--redact <name:regex>", "custom redaction rule; may be repeated", collectRedaction, [])
  .option("--no-gitignore", "do not apply .gitignore")
  .action(async (flags: PackFlags) => {
    const config = await loadConfig(flags.config);
    const options = resolveOptions(config, packOverrides(flags));
    const bundle = await packRepository(options);
    const rendered = options.format === "json" ? renderJson(bundle) : renderMarkdown(bundle);

    if (options.output) {
      await writeFile(resolve(options.output), rendered, "utf8");
      return;
    }

    process.stdout.write(rendered);
  });

program
  .command("explain")
  .description("Print the manifest summary from a ctxquilt markdown or JSON bundle.")
  .argument("<bundle>", "bundle file to inspect")
  .action(async (bundlePath: string) => {
    const raw = await readFile(resolve(bundlePath), "utf8");
    const manifest = parseManifest(raw);

    if (!manifest) {
      throw new Error("Could not find a ctxquilt manifest in the bundle.");
    }

    process.stdout.write([
      `Format: ${manifest.format}`,
      `Root: ${manifest.root}`,
      `Budget: ${manifest.budget}`,
      `Included: ${manifest.includedCount}`,
      `Omitted: ${manifest.omittedCount}`,
      `Estimated tokens: ${manifest.totalTokens}`,
      ""
    ].join("\n"));
  });

program.parseAsync().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`ctxquilt: ${message}\n`);
  process.exitCode = 1;
});

interface PackFlags {
  config?: string;
  root?: string;
  include: string[];
  exclude: string[];
  pin: string[];
  budget?: number;
  maxFileBytes?: number;
  format?: BundleFormat;
  output?: string;
  redact: RedactionRule[];
  gitignore: boolean;
}

function packOverrides(flags: PackFlags): PackConfig {
  return {
    root: flags.root,
    include: flags.include,
    exclude: flags.exclude,
    pinned: flags.pin,
    budget: flags.budget,
    maxFileBytes: flags.maxFileBytes,
    format: flags.format,
    output: flags.output,
    redact: flags.redact,
    respectGitignore: flags.gitignore
  };
}

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

function collectRedaction(value: string, previous: RedactionRule[]): RedactionRule[] {
  const separator = value.indexOf(":");
  if (separator <= 0 || separator === value.length - 1) {
    throw new Error(`Invalid redaction rule "${value}". Use name:regex.`);
  }

  return [
    ...previous,
    {
      name: value.slice(0, separator),
      pattern: value.slice(separator + 1)
    }
  ];
}

function parsePositiveInteger(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Expected a positive integer, received "${value}".`);
  }

  return parsed;
}

function parseManifest(raw: string) {
  if (raw.trimStart().startsWith("{")) {
    const parsed = JSON.parse(raw);
    return "manifest" in parsed ? parsed.manifest : parsed;
  }

  return parseMarkdownManifest(raw);
}
