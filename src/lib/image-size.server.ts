import { readFileSync } from 'node:fs';

export type ImageSize = { width: number; height: number };

// Reads intrinsic dimensions from the file header so figures reserve their space.
export function readImageSize(file: string): ImageSize {
  const bytes = readFileSync(file);
  const size = png(bytes) ?? gif(bytes) ?? webp(bytes) ?? jpeg(bytes);
  if (!size || size.width < 1 || size.height < 1)
    throw new Error(`Unsupported or unreadable image: ${file}`);
  return size;
}

function png(bytes: Buffer): ImageSize | null {
  if (bytes.length < 24 || bytes.toString('ascii', 1, 4) !== 'PNG') return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function gif(bytes: Buffer): ImageSize | null {
  if (bytes.length < 10 || bytes.toString('ascii', 0, 3) !== 'GIF') return null;
  return { width: bytes.readUInt16LE(6), height: bytes.readUInt16LE(8) };
}

function webp(bytes: Buffer): ImageSize | null {
  if (
    bytes.length < 30 ||
    bytes.toString('ascii', 0, 4) !== 'RIFF' ||
    bytes.toString('ascii', 8, 12) !== 'WEBP'
  )
    return null;
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8X')
    return {
      width: 1 + bytes.readUIntLE(24, 3),
      height: 1 + bytes.readUIntLE(27, 3),
    };
  if (chunk === 'VP8L') {
    const bits = bytes.readUInt32LE(21);
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
  }
  if (chunk === 'VP8 ')
    return {
      width: bytes.readUInt16LE(26) & 0x3fff,
      height: bytes.readUInt16LE(28) & 0x3fff,
    };
  return null;
}

function jpeg(bytes: Buffer): ImageSize | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1] ?? 0;
    const length = bytes.readUInt16BE(offset + 2);
    // Start-of-frame markers carry the dimensions (excluding DHT, JPG and DAC).
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    )
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      };
    offset += 2 + length;
  }
  return null;
}
