// Small shared helpers: math, seeded random, offscreen sprites.

export const TAU = Math.PI * 2;

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
export const ease = t => t * t * (3 - 2 * t);
export const mod = (a, n) => ((a % n) + n) % n;
export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

export const FILTER_OK = (() => {
  try {
    const g = makeCanvas(2, 2).getContext('2d');
    g.filter = 'blur(2px)';
    return g.filter === 'blur(2px)';
  } catch (e) { return false; }
})();

// Pre-render a drawing into an offscreen canvas. `res` < 1 renders at lower
// resolution, which (upscaled) also softens it — a cheap depth-of-field.
export interface Sprite { img: HTMLCanvasElement; w: number; h: number; pad: number }

export function sprite(w: number, h: number, res: number, blur: number, draw: (g: CanvasRenderingContext2D) => void): Sprite {
  const pad = 4 + blur * 3;
  const cw = (w + pad * 2) * res, ch = (h + pad * 2) * res;
  const c = makeCanvas(cw, ch);
  const g = c.getContext('2d');
  if (blur && FILTER_OK) {
    const t = makeCanvas(cw, ch);
    const tg = t.getContext('2d');
    tg.scale(res, res); tg.translate(pad, pad);
    draw(tg);
    g.filter = `blur(${blur * res}px)`;
    g.drawImage(t, 0, 0);
  } else {
    g.scale(res, res); g.translate(pad, pad);
    draw(g);
  }
  return { img: c, w, h, pad };
}

// Draw a sprite so that point (ax, ay) of its content box lands on (x, y).
export function drawSprite(ctx, s, x, y, k = 1, ax = 0.5, ay = 1) {
  const fw = (s.w + s.pad * 2) * k, fh = (s.h + s.pad * 2) * k;
  ctx.drawImage(s.img, x - (s.pad + s.w * ax) * k, y - (s.pad + s.h * ay) * k, fw, fh);
}

export function circle(g, x, y, r) {
  g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
}

export function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// Lighten (k > 0, towards white) or darken (k < 0, towards black) a #rrggbb colour.
export function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16), t = k > 0 ? 255 : 0, a = Math.abs(k);
  const c = (v: number) => Math.round(v + (t - v) * a).toString(16).padStart(2, '0');
  return `#${c(n >> 16)}${c((n >> 8) & 255)}${c(n & 255)}`;
}
