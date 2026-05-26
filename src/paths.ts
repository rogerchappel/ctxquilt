import { relative, sep } from "node:path";

export function toPosixPath(path: string): string {
  return path.split(sep).join("/");
}

export function relativePosix(root: string, path: string): string {
  return toPosixPath(relative(root, path));
}

export function sortPaths(paths: string[]): string[] {
  return [...paths].sort((left, right) => left.localeCompare(right));
}
