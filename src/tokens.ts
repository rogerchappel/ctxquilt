export function estimateTokens(text: string): number {
  if (text.length === 0) {
    return 0;
  }

  const words = text.trim().split(/\s+/u).filter(Boolean).length;
  const punctuation = (text.match(/[^\p{L}\p{N}\s]/gu) ?? []).length;
  const chars = Math.ceil(text.length / 4);

  return Math.max(1, Math.ceil(words * 1.25 + punctuation * 0.2), chars);
}
