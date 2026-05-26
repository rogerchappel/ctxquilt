import type { ContextBundle } from "../types.js";

export function renderJson(bundle: ContextBundle): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}
