#!/usr/bin/env node
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// CRC32 table for PNG chunk validation
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPNG(size, getPixel) {
  const rowLen = size * 4 + 1;
  const raw = Buffer.alloc(size * rowLen);
  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // filter byte: None
    for (let x = 0; x < size; x++) {
      const [r, g, b, a = 255] = getPixel(x, y, size);
      const i = y * rowLen + 1 + x * 4;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', zlib.deflateSync(raw)),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Blue Sky ──────────────────────────────────────────────────────────────────

function inCloud(x, y, size) {
  if (size < 32) return false;
  const s = size / 48;
  const cx = size * 0.55, cy = size * 0.42;
  const circles = [
    [cx,           cy,           7 * s],
    [cx - 6 * s,   cy + 3 * s,   5 * s],
    [cx + 6 * s,   cy + 3 * s,   5 * s],
    [cx - 2 * s,   cy + 5 * s,   5 * s],
    [cx + 3 * s,   cy + 5 * s,   5 * s],
  ];
  return circles.some(([ox, oy, r]) => (x - ox) ** 2 + (y - oy) ** 2 <= r * r);
}

function blueSky(x, y, size) {
  if (inCloud(x, y, size)) return [255, 255, 255];

  // Sky gradient: deep blue (#2196F3) at top → pale blue (#BBDEFB) at bottom
  const t = y / (size - 1);
  return [
    Math.round(33  + t * (187 - 33)),
    Math.round(150 + t * (222 - 150)),
    Math.round(243 + t * (251 - 243)),
  ];
}

// ── Starry Night ──────────────────────────────────────────────────────────────

// Pseudo-random but deterministic star positions
function getStars(size) {
  const all = [
    [0.08, 0.08], [0.28, 0.04], [0.52, 0.12], [0.72, 0.06], [0.90, 0.18],
    [0.18, 0.28], [0.62, 0.32], [0.84, 0.38], [0.12, 0.52], [0.42, 0.60],
    [0.76, 0.54], [0.32, 0.72], [0.58, 0.80], [0.92, 0.76], [0.04, 0.86],
    [0.66, 0.90], [0.22, 0.94], [0.80, 0.92], [0.48, 0.22], [0.94, 0.50],
  ];
  const count = size === 16 ? 6 : size === 32 ? 10 : 16;
  return all.slice(0, count);
}

function isMoon(x, y, size) {
  if (size < 32) return false;
  const r = size * 0.13;
  const mx = size * 0.76, my = size * 0.24;
  const outer = (x - mx) ** 2 + (y - my) ** 2 <= r * r;
  if (!outer) return false;
  const inner = (x - (mx + r * 0.45)) ** 2 + (y - (my - r * 0.1)) ** 2 <= (r * 0.78) ** 2;
  return !inner;
}

function starryNight(x, y, size) {
  if (isMoon(x, y, size)) return [255, 240, 160];

  const stars = getStars(size);
  for (const [sx, sy] of stars) {
    const px = Math.round(sx * (size - 1));
    const py = Math.round(sy * (size - 1));
    if (x === px && y === py) return [255, 255, 255];
    // 2×2 stars for larger icons
    if (size >= 48 && Math.abs(x - px) <= 1 && Math.abs(y - py) <= 1) return [220, 220, 255];
  }

  // Background: midnight navy (#0D0D2B) at top → deep indigo (#1A1040) at bottom
  const t = y / (size - 1);
  return [
    Math.round(13 + t * 26),
    Math.round(13 + t * 10),
    Math.round(43 + t * 64),
  ];
}

// ── Generate all icons ────────────────────────────────────────────────────────

const themes = { 'blue-sky': blueSky, 'starry-night': starryNight };
const sizes = [16, 32, 48, 128];

for (const [theme, pixelFn] of Object.entries(themes)) {
  const dir = path.join('icons', theme);
  fs.mkdirSync(dir, { recursive: true });
  for (const size of sizes) {
    const file = path.join(dir, `icon${size}.png`);
    fs.writeFileSync(file, createPNG(size, pixelFn));
    console.log(`  wrote ${file}`);
  }
}
console.log('Done.');
