const NULL_BYTE = 0;
const UTF8_DECODER = new TextDecoder("utf-8", { fatal: true });

export function isProbablyBinary(buffer: Buffer): boolean {
  if (buffer.includes(NULL_BYTE)) {
    return true;
  }

  const sample = buffer.subarray(0, Math.min(buffer.length, 8000));
  let suspicious = 0;

  for (const byte of sample) {
    if (byte < 7 || (byte > 14 && byte < 32)) {
      suspicious += 1;
    }
  }

  return sample.length > 0 && suspicious / sample.length > 0.3;
}

export function decodeText(buffer: Buffer): string | undefined {
  try {
    return UTF8_DECODER.decode(buffer);
  } catch {
    return undefined;
  }
}

export function byteLength(value: string): number {
  return Buffer.byteLength(value, "utf8");
}
