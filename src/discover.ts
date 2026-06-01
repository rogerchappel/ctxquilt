import { readFile } from "node:fs/promises";
import { join } from "node:path";
import fg from "fast-glob";
import ignore from "ignore";
import { sortPaths } from "./paths.js";
import type { ResolvedPackOptions } from "./types.js";

const BUILT_IN_IGNORES = [
  ".git/**",
  "node_modules/**",
  "dist/**",
  "coverage/**",
  ".DS_Store"
];

export interface DiscoveredFiles {
  paths: string[];
  pinned: Set<string>;
}

export async function discoverSelection(options: ResolvedPackOptions): Promise<DiscoveredFiles> {
  const ignorePatterns = [...BUILT_IN_IGNORES, ...options.exclude];
  const entries = await fg(options.include, {
    cwd: options.root,
    dot: true,
    onlyFiles: true,
    unique: true,
    ignore: ignorePatterns,
    followSymbolicLinks: false
  });

  const pinned = await fg(options.pinned, {
    cwd: options.root,
    dot: true,
    onlyFiles: true,
    unique: true,
    ignore: BUILT_IN_IGNORES,
    followSymbolicLinks: false
  });

  const candidates = sortPaths(unique([...entries, ...pinned]));
  const pinnedSet = new Set(pinned);

  if (!options.respectGitignore) {
    return { paths: candidates, pinned: pinnedSet };
  }

  const gitignore = await loadGitignore(options.root);
  return {
    paths: candidates.filter((path) => !gitignore.ignores(path) || pinnedSet.has(path)),
    pinned: pinnedSet
  };
}

export async function discoverFiles(options: ResolvedPackOptions): Promise<string[]> {
  return (await discoverSelection(options)).paths;
}

async function loadGitignore(root: string) {
  const matcher = ignore();

  try {
    const raw = await readFile(join(root, ".gitignore"), "utf8");
    matcher.add(raw);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  return matcher;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
