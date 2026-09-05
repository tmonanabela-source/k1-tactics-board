/* K1 Shooters Tactics Board — dependency-free streaming animated GIF encoder (global palette, LZW)
 * Used for "Export animation as GIF": works offline, in any browser, and does not depend on the tab
 * being visible (unlike MediaRecorder video capture). Frames are quantised as they arrive, so memory
 * stays at ~1 byte per pixel plus the output buffer. */
(function (K1) {
  'use strict';

  /** Growable byte buffer. */
  function ByteBuf(initial) {
    this.buf = new Uint8Array(initial || 1 << 16); this.len = 0;
  }
  ByteBuf.prototype.push = function (b) {
    if (this.len >= this.buf.length) { const n = new Uint8Array(this.buf.length * 2); n.set(this.buf); this.buf = n; }
    this.buf[this.len++] = b & 255;
  };
  ByteBuf.prototype.push16 = function (v) { this.push(v & 255); this.push((v >> 8) & 255); };
  ByteBuf.prototype.bytes = function () { return this.buf.subarray(0, this.len); };

  /** 256-colour global palette from one RGBA frame: the most frequent 15-bit colour bins. */
  function buildPalette(rgba) {
    const counts = new Uint32Array(32768);
    for (let i = 0; i < rgba.length; i += 4) counts[((rgba[i] >> 3) << 10) | ((rgba[i + 1] >> 3) << 5) | (rgba[i + 2] >> 3)]++;
    const bins = [];
    for (let k = 0; k < 32768; k++) if (counts[k]) bins.push(k);
    bins.sort((a, b) => counts[b] - counts[a]);
    const pal = new Uint8Array(256 * 3);
    const n = Math.min(256, bins.length);
    for (let i = 0; i < n; i++) {
      const k = bins[i];
      pal[i * 3] = ((k >> 10) & 31) * 8 + 4; pal[i * 3 + 1] = ((k >> 5) & 31) * 8 + 4; pal[i * 3 + 2] = (k & 31) * 8 + 4;
    }
    return { pal, n };
  }

  function Encoder(width, height, opts) {
    opts = opts || {};
    this.width = width; this.height = height;
    this.out = new ByteBuf(1 << 18);
    this.frames = 0;
    this.palette = null;
    this.cache = new Int16Array(32768);
    this.indices = new Uint8Array(width * height);
    this.table = new Int32Array(1 << 20);
    this.loop = opts.loop !== false;
    this.pending = []; // frames received before the palette existed (only the first)
  }

  Encoder.prototype.nearest = function (r, g, b) {
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const c = this.cache[key];
    if (c > 0) return c - 1;
    const pal = this.palette.pal, n = this.palette.n;
    let best = 0, bd = 1e9;
    for (let i = 0; i < n; i++) {
      const dr = pal[i * 3] - r, dg = pal[i * 3 + 1] - g, db = pal[i * 3 + 2] - b;
      const d = dr * dr + dg * dg + db * db;
      if (d < bd) { bd = d; best = i; if (d === 0) break; }
    }
    this.cache[key] = best + 1;
    return best;
  };

  Encoder.prototype.writeHeader = function () {
    const o = this.out;
    for (const ch of 'GIF89a') o.push(ch.charCodeAt(0));
    o.push16(this.width); o.push16(this.height);
    o.push(0xF7); o.push(0); o.push(0);
    for (let i = 0; i < 768; i++) o.push(this.palette.pal[i]);
    if (this.loop) {
      o.push(0x21); o.push(0xFF); o.push(0x0B);
      for (const ch of 'NETSCAPE2.0') o.push(ch.charCodeAt(0));
      o.push(3); o.push(1); o.push(0); o.push(0); o.push(0);
    }
  };

  /** GIF-flavoured LZW straight into the output buffer as 255-byte sub-blocks. */
  Encoder.prototype.lzw = function (indices, minCodeSize) {
    const o = this.out;
    const block = new Uint8Array(255);
    let bl = 0, cur = 0, curBits = 0;
    const flushBlock = () => { o.push(bl); for (let i = 0; i < bl; i++) o.push(block[i]); bl = 0; };
    const emit = (code, size) => {
      cur |= code << curBits; curBits += size;
      while (curBits >= 8) { block[bl++] = cur & 255; cur >>>= 8; curBits -= 8; if (bl === 255) flushBlock(); }
    };
    const clearCode = 1 << minCodeSize, eoiCode = clearCode + 1;
    let codeSize = minCodeSize + 1, nextCode = eoiCode + 1;
    const table = this.table; table.fill(-1);
    emit(clearCode, codeSize);
    let ib = indices[0];
    for (let i = 1; i < indices.length; i++) {
      const k = indices[i];
      const key = (ib << 8) | k;
      const code = table[key];
      if (code === -1) {
        emit(ib, codeSize);
        if (nextCode === 4096) { emit(clearCode, codeSize); nextCode = eoiCode + 1; codeSize = minCodeSize + 1; table.fill(-1); }
        else { if (nextCode >= (1 << codeSize)) codeSize++; table[key] = nextCode++; }
        ib = k;
      } else ib = code;
    }
    emit(ib, codeSize);
    emit(eoiCode, codeSize);
    if (curBits > 0) { block[bl++] = cur & 255; if (bl === 255) flushBlock(); }
    if (bl) flushBlock();
    o.push(0);
  };

  /** Add one RGBA frame (Uint8ClampedArray, width × height) shown for `delayMs`. */
  Encoder.prototype.addFrame = function (rgba, delayMs) {
    if (!this.palette) { this.palette = buildPalette(rgba); this.writeHeader(); }
    const idx = this.indices;
    for (let p = 0, i = 0; p < idx.length; p++, i += 4) idx[p] = this.nearest(rgba[i], rgba[i + 1], rgba[i + 2]);
    const delay = Math.max(2, Math.round((delayMs || 100) / 10));
    const o = this.out;
    o.push(0x21); o.push(0xF9); o.push(4); o.push(0x04); o.push(delay & 255); o.push((delay >> 8) & 255); o.push(0); o.push(0);
    o.push(0x2C); o.push16(0); o.push16(0); o.push16(this.width); o.push16(this.height); o.push(0);
    o.push(8);
    this.lzw(idx, 8);
    this.frames++;
    this.lastDelayPos = null;
  };

  /** Extend the delay of the most recent frame by re-encoding? No — we keep frame delays in the caller. */
  Encoder.prototype.finish = function () {
    this.out.push(0x3B);
    return this.out.bytes();
  };

  /** One-shot helper for small clips: frames = [{ data, delay }]. */
  function encode(frames, width, height, opts) {
    const enc = new Encoder(width, height, opts);
    frames.forEach((f, i) => { enc.addFrame(f.data, f.delay); if (opts && opts.onProgress) opts.onProgress((i + 1) / frames.length); });
    return enc.finish();
  }

  K1.GIF = { Encoder, encode };
})(window.K1 = window.K1 || {});
