export type BundleFormat = "markdown" | "json";

export interface RedactionRule {
  name: string;
  pattern: string;
  replacement?: string;
}

export interface PackConfig {
  root?: string;
  include?: string[];
  exclude?: string[];
  pinned?: string[];
  budget?: number;
  maxFileBytes?: number;
  format?: BundleFormat;
  output?: string;
  redact?: RedactionRule[];
  respectGitignore?: boolean;
}

export interface ResolvedPackOptions {
  root: string;
  include: string[];
  exclude: string[];
  pinned: string[];
  budget: number;
  maxFileBytes: number;
  format: BundleFormat;
  output?: string;
  redact: RedactionRule[];
  respectGitignore: boolean;
}

export type OmitReason =
  | "binary"
  | "over-max-file-bytes"
  | "over-budget"
  | "read-error"
  | "not-text";

export interface IncludedFile {
  path: string;
  bytes: number;
  tokens: number;
  pinned: boolean;
  redactions: Record<string, number>;
  content: string;
}

export interface OmittedFile {
  path: string;
  bytes?: number;
  tokens?: number;
  pinned: boolean;
  reason: OmitReason;
  detail?: string;
}

export interface ContextManifest {
  generatedAt: string;
  root: string;
  format: BundleFormat;
  budget: number;
  totalTokens: number;
  includedCount: number;
  omittedCount: number;
  include: string[];
  exclude: string[];
  pinned: string[];
  files: Array<Omit<IncludedFile, "content">>;
  omitted: OmittedFile[];
}

export interface ContextBundle {
  manifest: ContextManifest;
  files: IncludedFile[];
}
