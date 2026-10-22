import { TAU, circle, pick } from './util';

// Procedural art for background layers. Everything is drawn once into sprites.

export interface TreePal { trunk: string; trunkLight?: string; dark: string; mid: string; light: string }
export interface BushPal { dark: string; mid: string; light: string; flower: string[] }

export const CASTLE_PAL = {
  wall: '#c4bfe6', wallLight: '#e2ddf8', roof: '#ec9fc6', roofLight: '#f8c3de',
  win: '#fff2b8', flag: '#ff8fc0', gate: '#a79fd6',
};

export function drawRoundTree(g, w, h, p, r) {
  const cx = w / 2, top = h * 0.5;
  g.fillStyle = p.trunk;
  g.beginPath();
  g.moveTo(cx - w * 0.09, h);
  g.quadraticCurveTo(cx - w * 0.03, h * 0.75, cx - w * 0.035, top);
  g.lineTo(cx + w * 0.035, top);
  g.quadraticCurveTo(cx + w * 0.03, h * 0.75, cx + w * 0.1, h);
  g.closePath(); g.fill();
  g.strokeStyle = p.trunk; g.lineWidth = w * 0.025; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx, h * 0.62); g.quadraticCurveTo(cx + w * 0.12, h * 0.55, cx + w * 0.18, h * 0.42); g.stroke();
  g.beginPath(); g.moveTo(cx, h * 0.66); g.quadraticCurveTo(cx - w * 0.12, h * 0.6, cx - w * 0.2, h * 0.46); g.stroke();

  const ccy = h * 0.34, rx = w * 0.27, ry = h * 0.19, R = Math.min(w * 0.2, h * 0.15);
  const blobs = [];
  for (let i = 0; i < 18; i++) {
    const a = r() * TAU, d = Math.sqrt(r());
    blobs.push({ x: cx + Math.cos(a) * rx * d, y: ccy + Math.sin(a) * ry * d, r: R * (0.6 + r() * 0.5) });
  }
  g.fillStyle = p.dark; for (const b of blobs) circle(g, b.x, b.y + b.r * 0.18, b.r);
  g.fillStyle = p.mid; for (const b of blobs) circle(g, b.x + b.r * 0.06, b.y - b.r * 0.04, b.r * 0.84);
  g.fillStyle = p.light; for (const b of blobs) if (b.y < ccy + ry * 0.2) circle(g, b.x + b.r * 0.24, b.y - b.r * 0.28, b.r * 0.45);
}

export function drawPine(g, w, h, p, _r?) {
  const cx = w / 2;
  g.fillStyle = p.trunk; g.fillRect(cx - w * 0.04, h * 0.75, w * 0.08, h * 0.25);
  for (let i = 0; i < 4; i++) {
    const yb = h * (0.82 - 0.18 * i), wt = w * (0.46 - 0.09 * i), ht = h * 0.3;
    for (const [col, dx, dy, s] of [[p.dark, 0, 4, 1], [p.mid, 2, 0, 0.9]] as [string, number, number, number][]) {
      g.fillStyle = col; g.beginPath();
      g.moveTo(cx - wt * s + dx, yb + dy);
      g.quadraticCurveTo(cx + dx, yb + dy + ht * 0.12, cx + wt * s + dx, yb + dy);
      g.quadraticCurveTo(cx + wt * 0.3 + dx, yb - ht * 0.5 + dy, cx + dx, yb - ht + dy);
      g.quadraticCurveTo(cx - wt * 0.3 + dx, yb - ht * 0.5 + dy, cx - wt * s + dx, yb + dy);
      g.fill();
    }
    g.fillStyle = p.light; g.beginPath();
    g.moveTo(cx + 2, yb - ht + 6);
    g.quadraticCurveTo(cx + wt * 0.35, yb - ht * 0.45, cx + wt * 0.7, yb - 4);
    g.quadraticCurveTo(cx + wt * 0.3, yb - ht * 0.3, cx + 2, yb - ht + 6);
    g.fill();
  }
}

export function drawTallTree(g, w, h, p, r) {
  const cx = w / 2, tw = w * 0.16;
  const grd = g.createLinearGradient(cx - tw, 0, cx + tw, 0);
  grd.addColorStop(0, p.trunk); grd.addColorStop(0.6, p.trunk); grd.addColorStop(1, p.trunkLight);
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(cx - tw * 2.2, h);
  g.quadraticCurveTo(cx - tw * 0.7, h * 0.93, cx - tw * 0.55, h * 0.75);
  g.bezierCurveTo(cx - tw * 0.45, h * 0.5, cx - tw * 0.6, h * 0.35, cx - tw * 0.35, h * 0.2);
  g.lineTo(cx + tw * 0.35, h * 0.2);
  g.bezierCurveTo(cx + tw * 0.5, h * 0.35, cx + tw * 0.4, h * 0.5, cx + tw * 0.55, h * 0.75);
  g.quadraticCurveTo(cx + tw * 0.7, h * 0.93, cx + tw * 2.3, h);
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(40,25,30,0.22)'; g.lineWidth = 4; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const dx = (r() - 0.5) * tw * 0.6;
    g.beginPath(); g.moveTo(cx + dx, h * 0.95);
    g.bezierCurveTo(cx + dx + 8, h * 0.7, cx + dx - 8, h * 0.5, cx + dx * 0.6, h * 0.26);
    g.stroke();
  }
  // side branch
  g.strokeStyle = p.trunk; g.lineWidth = tw * 0.25;
  g.beginPath(); g.moveTo(cx, h * 0.42); g.quadraticCurveTo(cx + w * 0.2, h * 0.38, cx + w * 0.32, h * 0.3); g.stroke();
  const tuft = (x, y, R, n) => {
    const b = [];
    for (let i = 0; i < n; i++) b.push({ x: x + (r() - 0.5) * R * 2, y: y + (r() - 0.5) * R * 0.8, r: R * (0.45 + r() * 0.35) });
    g.fillStyle = p.dark; for (const k of b) circle(g, k.x, k.y + k.r * 0.18, k.r);
    g.fillStyle = p.mid; for (const k of b) circle(g, k.x + k.r * 0.06, k.y - k.r * 0.04, k.r * 0.84);
    g.fillStyle = p.light; for (const k of b) circle(g, k.x + k.r * 0.25, k.y - k.r * 0.3, k.r * 0.42);
  };
  tuft(cx + w * 0.32, h * 0.29, w * 0.12, 6);
  tuft(cx, h * 0.17, w * 0.3, 16);
}

export function drawBush(g, w, h, p, r, flowers) {
  const blobs = [];
  for (let i = 0; i < 10; i++) blobs.push({ x: w * 0.25 + r() * w * 0.5, y: h * 0.6 + r() * h * 0.25, r: h * (0.2 + r() * 0.18) });
  g.fillStyle = p.dark;
  for (const b of blobs) circle(g, b.x, b.y + b.r * 0.15, b.r);
  g.fillRect(w * 0.18, h * 0.78, w * 0.64, h * 0.22);
  g.fillStyle = p.mid; for (const b of blobs) circle(g, b.x + b.r * 0.05, b.y - b.r * 0.05, b.r * 0.82);
  g.fillStyle = p.light; for (const b of blobs) if (b.y < h * 0.74) circle(g, b.x + b.r * 0.25, b.y - b.r * 0.3, b.r * 0.4);
  if (flowers) {
    for (let i = 0; i < 7; i++) {
      const b = pick(r, blobs);
      const fx = b.x + (r() - 0.5) * b.r, fy = b.y - b.r * 0.5 + r() * b.r * 0.5;
      g.fillStyle = pick(r, p.flower);
      for (let k = 0; k < 5; k++) circle(g, fx + Math.cos(k * 1.2566) * 2.6, fy + Math.sin(k * 1.2566) * 2.6, 2.2);
      g.fillStyle = '#ffd34d'; circle(g, fx, fy, 1.6);
    }
  }
}

export function drawFern(g, w, h, col, r) {
  g.strokeStyle = col; g.fillStyle = col; g.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i / 6 - 0.5) * 1.9;
    const len = h * (0.7 + r() * 0.25) * (1 - Math.abs(i / 6 - 0.5) * 0.5);
    let px = w / 2, py = h;
    g.lineWidth = 2.5; g.beginPath(); g.moveTo(px, py);
    const pts = [];
    for (let s = 1; s <= 10; s++) {
      const u = s / 10;
      const ang = a + (a < -Math.PI / 2 ? -1 : 1) * u * u * 0.8;
      px += Math.cos(ang) * len / 10; py += Math.sin(ang) * len / 10;
      pts.push([px, py, ang, u]); g.lineTo(px, py);
    }
    g.stroke();
    for (const [x, y, ang, u] of pts) {
      const lw = (1 - u) * 9 + 2;
      for (const s of [-1, 1]) {
        const la = ang + s * 1.1;
        g.beginPath(); g.ellipse(x + Math.cos(la) * lw * 0.6, y + Math.sin(la) * lw * 0.6, lw * 0.7, 2.2, la, 0, TAU); g.fill();
      }
    }
  }
}

export function drawCloud(g, w, h, r, shade = 'rgba(214,206,245,0.95)') {
  const blobs = [];
  for (let i = 0; i < 8; i++) {
    const u = i / 7;
    blobs.push({
      x: w * (0.18 + u * 0.64) + (r() - 0.5) * 20,
      y: h * 0.62 - Math.sin(u * Math.PI) * h * 0.2 + (r() - 0.5) * 10,
      r: h * (0.17 + Math.sin(u * Math.PI) * 0.17 + r() * 0.05),
    });
  }
  g.fillStyle = shade; for (const b of blobs) circle(g, b.x, b.y + 6, b.r);
  g.fillStyle = '#ffffff'; for (const b of blobs) circle(g, b.x, b.y, b.r * 0.94);
  g.fillStyle = 'rgba(255,246,226,0.95)'; for (const b of blobs) circle(g, b.x + b.r * 0.18, b.y - b.r * 0.25, b.r * 0.5);
}

export function drawCastle(g, w, h, c) {
  const tower = (x, base, tw, th, rh) => {
    g.fillStyle = c.wall; g.fillRect(x - tw / 2, base - th, tw, th);
    g.fillStyle = c.wallLight; g.fillRect(x, base - th, tw / 2, th);
    const ty = base - th;
    g.fillStyle = c.roof; g.beginPath();
    g.moveTo(x - tw / 2 - 6, ty + 2);
    g.quadraticCurveTo(x - tw * 0.1, ty - rh * 0.5, x, ty - rh);
    g.quadraticCurveTo(x + tw * 0.1, ty - rh * 0.5, x + tw / 2 + 6, ty + 2);
    g.closePath(); g.fill();
    g.fillStyle = c.roofLight; g.beginPath();
    g.moveTo(x, ty - rh);
    g.quadraticCurveTo(x + tw * 0.1, ty - rh * 0.5, x + tw / 2 + 6, ty + 2);
    g.lineTo(x + 2, ty + 2); g.closePath(); g.fill();
    g.strokeStyle = c.wall; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(x, ty - rh); g.lineTo(x, ty - rh - 16); g.stroke();
    g.fillStyle = c.flag; g.beginPath();
    g.moveTo(x, ty - rh - 16); g.lineTo(x + 13, ty - rh - 12); g.lineTo(x, ty - rh - 8); g.fill();
    g.fillStyle = c.win;
    const wy = ty + th * 0.22;
    g.beginPath(); g.moveTo(x - 4, wy + 12); g.lineTo(x - 4, wy + 3); g.arc(x, wy + 3, 4, Math.PI, 0); g.lineTo(x + 4, wy + 12); g.fill();
  };
  tower(w * 0.12, h, 24, h * 0.36, 34);
  tower(w * 0.88, h, 26, h * 0.4, 36);
  g.fillStyle = c.wall; g.fillRect(w * 0.1, h * 0.7, w * 0.8, h * 0.3);
  for (let x = w * 0.1; x < w * 0.9; x += 14) g.fillRect(x, h * 0.7 - 7, 8, 8);
  g.fillStyle = c.wallLight; g.fillRect(w * 0.5, h * 0.7, w * 0.4, h * 0.3);
  g.fillStyle = c.gate; g.beginPath();
  g.moveTo(w / 2 - 15, h); g.lineTo(w / 2 - 15, h - 26); g.arc(w / 2, h - 26, 15, Math.PI, 0); g.lineTo(w / 2 + 15, h); g.fill();
  tower(w * 0.3, h * 0.92, 34, h * 0.5, 46);
  tower(w * 0.7, h * 0.92, 34, h * 0.55, 48);
  tower(w * 0.5, h * 0.88, 48, h * 0.58, 70);
}

export function drawGrassClump(g, w, h, col, r) {
  g.fillStyle = col;
  for (let i = 0; i < 24; i++) {
    const bx = w * 0.12 + r() * w * 0.76, bw = 6 + r() * 10, bh = h * (0.35 + r() * 0.65), lean = (r() - 0.5) * w * 0.45;
    g.beginPath(); g.moveTo(bx - bw / 2, h);
    g.quadraticCurveTo(bx + lean * 0.3, h - bh * 0.6, bx + lean, h - bh);
    g.quadraticCurveTo(bx + lean * 0.3 + bw * 0.2, h - bh * 0.5, bx + bw / 2, h);
    g.fill();
  }
}

export function drawBigLeaf(g, w, h, col, r) {
  g.fillStyle = col; g.strokeStyle = col; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const bx = w * (0.4 + r() * 0.2), ang = -Math.PI / 2 + (r() - 0.5) * 1.0, len = h * (0.55 + r() * 0.35);
    const tx = bx + Math.cos(ang) * len, ty = h + Math.sin(ang) * len;
    const sx = bx + Math.cos(ang) * len * 0.3, sy = h + Math.sin(ang) * len * 0.3;
    g.lineWidth = 6; g.beginPath(); g.moveTo(bx, h); g.lineTo(sx, sy); g.stroke();
    const nx = -Math.sin(ang), ny = Math.cos(ang), wd = len * 0.3;
    const mx = (sx + tx) / 2, my = (sy + ty) / 2;
    g.beginPath(); g.moveTo(sx, sy);
    g.quadraticCurveTo(mx + nx * wd, my + ny * wd, tx, ty);
    g.quadraticCurveTo(mx - nx * wd, my - ny * wd, sx, sy);
    g.fill();
  }
}

export function drawHangingVine(g, w, h, col, r) {
  g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 4; g.lineCap = 'round';
  for (let v = 0; v < 2; v++) {
    const x0 = w * (0.35 + v * 0.3), len = h * (0.6 + r() * 0.4);
    g.beginPath(); g.moveTo(x0, 0);
    for (let y = 0; y <= len; y += 10) g.lineTo(x0 + Math.sin(y * 0.03 + v) * 10, y);
    g.stroke();
    for (let y = 20; y < len; y += 22) {
      const x = x0 + Math.sin(y * 0.03 + v) * 10, s = Math.floor(y / 22) % 2 ? 1 : -1;
      g.beginPath(); g.ellipse(x + s * 10, y + 4, 11, 5, s * 0.6, 0, TAU); g.fill();
    }
  }
  for (let i = 0; i < 7; i++) circle(g, w * 0.15 + r() * w * 0.7, r() * 20, 18 + r() * 12);
}
