/**
 * Generates PWA PNG icons with no native dependencies.
 *
 * Draws the TrackExpense logo (gradient rounded square + ascending white bars
 * + an accent dot) into raw RGBA pixels, then encodes them as PNG using only
 * Node's built-in `zlib`. Run with: `node scripts/generate-icons.mjs`.
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../public');
mkdirSync(outDir, { recursive: true });

// ---- tiny PNG encoder ------------------------------------------------------
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // rest (compression, filter, interlace) default 0

  // add filter byte (0) at the start of every scanline
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---- drawing helpers -------------------------------------------------------
function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function drawIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4); // transparent by default
  const radius = maskable ? 0 : size * 0.22;
  // maskable icons fill the full bleed; standard icons use a safe inset
  const pad = maskable ? size * 0.12 : 0;
  const inner = size - pad * 2;

  const set = (x, y, r, g, b, a = 255) => {
    const i = (y * size + x) * 4;
    rgba[i] = r;
    rgba[i + 1] = g;
    rgba[i + 2] = b;
    rgba[i + 3] = a;
  };

  // gradient background (#6366f1 -> #8b5cf6) within a rounded square
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const lx = x - pad;
      const ly = y - pad;
      if (lx < 0 || ly < 0 || lx >= inner || ly >= inner) continue;
      // rounded-corner test
      if (radius > 0) {
        const rx = Math.min(lx, inner - 1 - lx);
        const ry = Math.min(ly, inner - 1 - ly);
        if (rx < radius && ry < radius) {
          const dx = radius - rx;
          const dy = radius - ry;
          if (dx * dx + dy * dy > radius * radius) continue;
        }
      }
      const t = (lx + ly) / (inner * 2);
      set(x, y, lerp(0x63, 0x8b, t), lerp(0x66, 0x5c, t), lerp(0xf1, 0xf6, t));
    }
  }

  // three ascending white rounded bars (a bar chart)
  const bars = [
    { h: 0.30, x: 0.23 },
    { h: 0.48, x: 0.42 },
    { h: 0.70, x: 0.61 },
  ];
  const barW = inner * 0.14;
  const barR = barW * 0.32;
  for (const bar of bars) {
    const bx = pad + inner * bar.x;
    const bh = inner * bar.h;
    const by = pad + inner * 0.84 - bh;
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < barW; x++) {
        // rounded bar tops
        const ry = Math.min(y, bh - 1 - y);
        const rx = Math.min(x, barW - 1 - x);
        if (ry < barR && rx < barR) {
          const dx = barR - rx;
          const dy = barR - ry;
          if (dx * dx + dy * dy > barR * barR) continue;
        }
        const px = Math.round(bx + x);
        const py = Math.round(by + y);
        if (px >= 0 && py >= 0 && px < size && py < size) set(px, py, 255, 255, 255);
      }
    }
  }

  // accent dot (emerald) at top-right of the tallest bar
  const cx = pad + inner * 0.7;
  const cy = pad + inner * 0.2;
  const cr = inner * 0.07;
  for (let y = Math.floor(cy - cr); y <= cy + cr; y++) {
    for (let x = Math.floor(cx - cr); x <= cx + cr; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= cr * cr && x >= 0 && y >= 0 && x < size && y < size) {
        set(x, y, 0x34, 0xd3, 0x99);
      }
    }
  }

  return encodePNG(size, size, rgba);
}

const targets = [
  ['pwa-192x192.png', 192, {}],
  ['pwa-512x512.png', 512, {}],
  ['maskable-icon-512x512.png', 512, { maskable: true }],
  ['apple-touch-icon-180x180.png', 180, {}],
];

for (const [name, size, opts] of targets) {
  writeFileSync(resolve(outDir, name), drawIcon(size, opts));
  console.log('generated', name);
}
