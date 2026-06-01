import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { packRepository, parseMarkdownManifest, renderMarkdown, resolveOptions } from "../src/index.js";

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "ctxquilt-test-"));
  await writeFile(join(root, "README.md"), "# Fixture\n\nHello agent.\n", "utf8");
  await writeFile(join(root, "secret.env"), "API_TOKEN=super-secret\n", "utf8");
  await writeFile(join(root, "large.txt"), "x ".repeat(400), "utf8");
  await writeFile(join(root, ".gitignore"), "ignored.txt\n", "utf8");
  await writeFile(join(root, "ignored.txt"), "ignore me\n", "utf8");
  await writeFile(join(root, "binary.bin"), Buffer.from([0, 1, 2, 3, 0]));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("ctxquilt", () => {
  it("packs text files with redactions and omission reasons", async () => {
    const options = resolveOptions({}, {
      root,
      include: ["*.md", "*.env", "*.txt", "*.bin"],
      budget: 80,
      maxFileBytes: 256
    });

    const bundle = await packRepository(options);

    assert.deepEqual(bundle.files.map((file) => file.path), ["README.md", "secret.env"]);
    assert.equal(bundle.files.find((file) => file.path === "secret.env")?.content, "API_TOKEN=[REDACTED]\n");
    assert.equal(bundle.manifest.includedCount, 2);
    assert.equal(bundle.manifest.omitted.some((file) => file.path === "large.txt" && file.reason === "over-max-file-bytes"), true);
    assert.equal(bundle.manifest.omitted.some((file) => file.path === "binary.bin" && file.reason === "binary"), true);
    assert.equal(bundle.manifest.omitted.some((file) => file.path === "ignored.txt"), false);
  });

  it("renders markdown with a parseable manifest", async () => {
    const options = resolveOptions({}, {
      root,
      include: ["README.md"],
      budget: 1000
    });
    const bundle = await packRepository(options);
    const markdown = renderMarkdown(bundle);
    const manifest = parseMarkdownManifest(markdown);

    assert.equal(manifest?.includedCount, 1);
    assert.equal(manifest?.files[0].path, "README.md");
  });

  it("produces deterministic markdown for identical inputs", async () => {
    const options = resolveOptions({}, {
      root,
      include: ["README.md"],
      budget: 1000
    });

    const first = renderMarkdown(await packRepository(options));
    const second = renderMarkdown(await packRepository(options));

    assert.equal(first, second);
  });

  it("marks files included by pinned globs as pinned", async () => {
    const fixtureRoot = resolve("tests/fixtures/sample-project");
    const options = resolveOptions({}, {
      root: fixtureRoot,
      include: ["README.md"],
      pinned: ["docs/*.md"],
      budget: 1
    });

    const bundle = await packRepository(options);
    const prd = bundle.files.find((file) => file.path === "docs/PRD.md");

    assert.equal(prd?.pinned, true);
    assert.equal(bundle.manifest.files.find((file) => file.path === "docs/PRD.md")?.pinned, true);
    assert.equal(bundle.manifest.omitted.some((file) => file.path === "README.md" && file.reason === "over-budget"), true);
  });

  it("uses static fixtures for gitignore and default redaction coverage", async () => {
    const fixtureRoot = resolve("tests/fixtures/sample-project");
    const options = resolveOptions({}, {
      root: fixtureRoot,
      include: ["**/*"],
      budget: 1000
    });

    const bundle = await packRepository(options);
    const env = bundle.files.find((file) => file.path === ".env");

    assert.equal(bundle.files.some((file) => file.path === "ignored/ignored.txt"), false);
    assert.match(env?.content ?? "", /API_TOKEN=\[REDACTED\]/u);
    assert.equal(env?.redactions["env-secret"], 1);
  });
});
