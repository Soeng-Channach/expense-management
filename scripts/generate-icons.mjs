/**
 * Generates PWA PNG icons with no native dependencies.
 *
 * Draws the TrackExpense logo (gradient rounded square + an ascending white
 * trend arrow + an emerald accent dot) into raw RGBA pixels, then encodes them
 * as PNG using only Node's built-in `zlib`. Run with: `node scripts/generate-icons.mjs`.
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

// shortest distance from point (qx,qy) to the segment (ax,ay)-(bx,by)
function distToSeg(qx, qy, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((qx - ax) * dx + (qy - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(qx - (ax + t * dx), qy - (ay + t * dy));
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

  // alpha-composite a colour over an already-painted (opaque) pixel
  const blend = (x, y, r, g, b, a) => {
    if (x < 0 || y < 0 || x >= size || y >= size || a <= 0) return;
    const i = (y * size + x) * 4;
    const ia = 1 - a;
    rgba[i] = Math.round(r * a + rgba[i] * ia);
    rgba[i + 1] = Math.round(g * a + rgba[i + 1] * ia);
    rgba[i + 2] = Math.round(b * a + rgba[i + 2] * ia);
    rgba[i + 3] = Math.max(rgba[i + 3], Math.round(255 * a));
  };

  // ascending white trend arrow (shaft + arrowhead), coordinates as
  // fractions of the inner safe area so it scales with maskable padding
  const fx = (f) => pad + inner * f;
  const fy = (f) => pad + inner * f;
  const P0 = [fx(0.289), fy(0.703)]; // start of the trend line
  const P1 = [fx(0.492), fy(0.586)]; // mid bend
  const P2 = [fx(0.703), fy(0.344)]; // arrow tip
  const B1 = [fx(0.555), fy(0.387)]; // upper arrowhead barb
  const B2 = [fx(0.676), fy(0.496)]; // lower arrowhead barb
  const segs = [
    [P0, P1],
    [P1, P2],
    [B1, P2],
    [P2, B2],
  ];
  const half = inner * 0.0508; // half the stroke width

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let best = Infinity;
      for (const [a, b] of segs) {
        const d = distToSeg(x + 0.5, y + 0.5, a[0], a[1], b[0], b[1]);
        if (d < best) best = d;
      }
      const cov = Math.max(0, Math.min(1, half + 0.5 - best)); // 1px AA edge
      if (cov > 0) blend(x, y, 255, 255, 255, cov);
    }
  }

  // emerald accent dot at the start of the trend line
  const dotR = inner * 0.0586;
  for (let y = Math.floor(P0[1] - dotR - 1); y <= P0[1] + dotR + 1; y++) {
    for (let x = Math.floor(P0[0] - dotR - 1); x <= P0[0] + dotR + 1; x++) {
      const d = Math.hypot(x + 0.5 - P0[0], y + 0.5 - P0[1]);
      const cov = Math.max(0, Math.min(1, dotR + 0.5 - d));
      if (cov > 0) blend(x, y, 0x34, 0xd3, 0x99, cov);
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
