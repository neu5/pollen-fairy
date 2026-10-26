import { ctx, V, layer, screenSpace } from '../engine/view';
import { glow } from '../engine/fx';
import { TAU, mulberry32, mod, pick, sprite, drawSprite, circle, type Sprite } from '../util';
import {
  CASTLE_PAL, drawRoundTree, drawPine, drawTallTree, drawBush, drawFern, drawCloud, drawCastle,
  drawGrassClump, drawBigLeaf, drawHangingVine, drawStalagmite, drawStalactites, drawSeaweed,
} from '../art';
import type { Theme } from '../themes';

// Everything behind and in front of the play layer, built once per theme.

const MAX_W = 8000;
const farHillY = (x: number) => 478 - 22 * Math.sin(x * 0.005 + 0.3) - 14 * Math.sin(x * 0.011 + 1);
const midHillY = (x: number) => 522 - 26 * Math.sin(x * 0.0037 + 2) - 14 * Math.sin(x * 0.009);
const backHillY = (x: number) => 556 - 30 * Math.sin(x * 0.0029 + 1.3) - 18 * Math.sin(x * 0.0077 + 0.2);
const ridge = (x: number, base: number, amp: number, freq: number, seed: number) => base - amp * (0.6 * Math.abs(Math.sin(x * freq + seed)) +
  0.28 * Math.sin(x * freq * 2.3 + seed * 2) + 0.12 * Math.sin(x * freq * 5.1 + seed));
const RANGE1: [number, number, number, number] = [455, 150, 0.0032, 1];
const RANGE2: [number, number, number, number] = [500, 120, 0.0045, 4];
const CASTLE_X = 760;

interface Item { x: number; y: number; s: Sprite; k: number; ay?: number }

export interface Backdrop {
  theme: Theme;
  art: { playBush: Sprite[]; fern: Sprite[] };
  drawBack(rainbowA: number): void;
  drawFront(): void;
  drawAtmos(): void;
}

function fillProfile(f: number, fy: number, fn: (x: number) => number, c0: string, c1: string, y0 = 430, y1 = 720): CanvasGradient {
  const oy = layer(f, fy);
  // snap samples to a fixed grid so the outline doesn't wobble while scrolling
  const x0 = Math.floor((V.camX * f - 20) / 14) * 14, x1 = V.camX * f + V.viewW + 34, bottom = oy + V.viewH + 20;
  ctx.beginPath(); ctx.moveTo(x0, bottom);
  for (let x = x0; x <= x1; x += 14) ctx.lineTo(x, fn(x));
  ctx.lineTo(x1, fn(x1)); ctx.lineTo(x1, bottom); ctx.closePath();
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, c0); g.addColorStop(1, c1);
  ctx.fillStyle = g; ctx.fill();
  return g;
}

function drawItems(items: Item[], f: number, fy: number, yOff = 0): void {
  layer(f, fy);
  const l = V.camX * f, r = l + V.viewW;
  for (const it of items) {
    const hw = (it.s.w * 0.5 + it.s.pad) * it.k;
    if (it.x + hw < l || it.x - hw > r) continue;
    drawSprite(ctx, it.s, it.x, it.y + yOff, it.k, 0.5, it.ay === undefined ? 1 : it.ay);
  }
}

export function drawRainbow(a: number): void {
  if (a <= 0) return;
  screenSpace();
  const cx = V.viewW * 0.55, cy = V.viewH * 0.98, r0 = Math.min(V.viewW * 0.42, 600);
  const cols = ['#ff7b9c', '#ffb36b', '#ffe36e', '#8fe388', '#7cc8ff', '#b39bff'];
  ctx.save(); ctx.globalAlpha = a * 0.55; ctx.lineWidth = 16;
  cols.forEach((c, i) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(cx, cy, r0 - i * 15, Math.PI, 0); ctx.stroke(); });
  ctx.restore();
}

const cache = new Map<string, Backdrop>();

export function getBackdrop(theme: Theme): Backdrop {
  let b = cache.get(theme.id);
  if (!b) { b = buildBackdrop(theme); cache.set(theme.id, b); }
  return b;
}

function buildBackdrop(t: Theme): Backdrop {
  const R = mulberry32(20261021);
  const scatter = (f: number, spacing: number, make: (x: number) => Item): Item[] => {
    const out: Item[] = [];
    const span = MAX_W * f + 3200;
    for (let x = -300; x < span; x += spacing * (0.6 + R() * 0.8)) out.push(make(x));
    return out;
  };

  const clouds = [0, 1, 2, 3].map(() => sprite(280, 120, 0.5, 2, g => drawCloud(g, 280, 120, R, t.cloudShade)));
  const castle = sprite(300, 290, 0.9, 0.8, g => drawCastle(g, 300, 290, CASTLE_PAL));
  const far: Sprite[] = [];
  for (let i = 0; i < 9; i++) {
    const p = t.far[i % t.far.length], pine = i % 3 === 2;
    far.push(sprite(130, 210, 0.45, 1.6, g => (t.seaweed ? drawSeaweed : t.rocks ? drawStalagmite : pine ? drawPine : drawRoundTree)(g, 130, 210, p, R)));
  }
  const mid: Sprite[] = [];
  for (let i = 0; i < 10; i++) {
    const pine = i % 4 === 3, p = pine ? t.mid[Math.min(2, t.mid.length - 1)] : t.mid[i % t.mid.length];
    mid.push(sprite(230, 400, 0.6, 0.9, g => (t.seaweed ? drawSeaweed : t.rocks ? drawStalagmite : pine ? drawPine : drawRoundTree)(g, 230, 400, p, R)));
  }
  const near = [0, 1, 2].map(i => sprite(360, 1000, 0.6, 0.5, g => drawTallTree(g, 360, 1000, t.near[i % t.near.length], R)));
  const bush = [0, 1, 2, 3, 4].map(i => sprite(200, 110, 0.7, 0.4, g => drawBush(g, 200, 110, t.bushBack, R, i % 2 === 0)));
  const playBush = [0, 1, 2, 3].map(() => sprite(220, 130, 1, 0, g => drawBush(g, 220, 130, t.bushPlay, R, true)));
  const fern = [0, 1].map(() => sprite(200, 120, 1, 0, g => drawFern(g, 200, 120, t.fern, R)));
  const fgGrass = [0, 1, 2].map(() => sprite(320, 180, 0.3, 4, g => drawGrassClump(g, 320, 180, t.fg, R)));
  const fgLeaf = [0, 1].map(() => sprite(320, 240, 0.3, 4, g => drawBigLeaf(g, 320, 240, t.fgLeaf, R)));
  const hang = [0, 1].map(() => t.ceiling
    ? sprite(420, 260, 0.35, 3, g => drawStalactites(g, 420, 260, t.hang, R))
    : sprite(150, 320, 0.3, 4, g => drawHangingVine(g, 150, 320, t.hang, R)));
  const backCeil = t.ceiling ? [0, 1].map(() => sprite(420, 300, 0.4, 1.5, g => drawStalactites(g, 420, 300, t.range2[0], R))) : [];

  const L = {
    clouds: Array.from({ length: 9 }, (_, i) => ({ x: i * 380 + R() * 200, y: 30 + R() * 230, s: pick(R, clouds), k: 0.6 + R() * 0.8, drift: 5 + R() * 8 })),
    far: scatter(0.3, 52, x => ({ x, y: farHillY(x) + 14, s: pick(R, far), k: 0.55 + R() * 0.6 })).sort((a, b) => a.k - b.k),
    mid: scatter(0.55, 120, x => ({ x, y: midHillY(x) + 18, s: pick(R, mid), k: 0.6 + R() * 0.5 })).sort((a, b) => a.k - b.k),
    near: scatter(0.8, 760, x => ({ x, y: 690, s: pick(R, near), k: 0.85 + R() * 0.25 })),
    back: scatter(0.9, 110, x => ({ x, y: backHillY(x) + 22, s: pick(R, bush), k: 0.6 + R() * 0.6 })),
    fg: scatter(1.35, 520, x => ({ x, y: 772, s: R() < 0.6 ? pick(R, fgGrass) : pick(R, fgLeaf), k: 0.5 + R() * 0.35 })),
    hang: scatter(1.25, t.ceiling ? 330 : 1400, x => ({ x, y: 0, s: pick(R, hang), k: 0.7 + R() * 0.4, ay: 0 })),
    ceil: t.ceiling ? scatter(0.4, 300, x => ({ x, y: 0, s: pick(R, backCeil), k: 0.8 + R() * 0.5, ay: 0 })) : [],
    butterflies: Array.from({ length: 12 }, () => ({
      x: R() * (MAX_W * 0.75 + 2000), y: 250 + R() * 220, ph: R() * TAU, s: 0.7 + R() * 0.5,
      col: pick(R, ['#ffb3d9', '#ffe08a', '#b8a6ff', '#9fe3ff', '#ffc39e']),
    })),
    motes: Array.from({ length: t.moteCount }, () => ({ x: R() * 2400, y: R() * 1200, r: (1 + R() * 2.2) * t.moteSize, ph: R() * TAU, sp: 4 + R() * 10 })),
    stars: Array.from({ length: 140 }, () => ({ x: R(), y: -480 + R() * 760, r: 0.6 + R() * 1.4, ph: R() * TAU })),
  };

  let sunX = 0, sunScreenY = 0;

  function haze(a: number): void {
    a *= t.hazeK;
    screenSpace();
    const g = ctx.createLinearGradient(0, 0, 0, V.viewH);
    g.addColorStop(0, `rgba(${t.haze[0]},0)`);
    g.addColorStop(0.5, `rgba(${t.haze[0]},${a * 0.5})`);
    g.addColorStop(1, `rgba(${t.haze[1]},${a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, V.viewW, V.viewH);
  }

  function drawSky(): void {
    const oy = layer(0, 0.06);
    const g = ctx.createLinearGradient(0, -500, 0, 700);
    for (const [s, c] of t.sky) g.addColorStop(s, c);
    ctx.fillStyle = g; ctx.fillRect(-10, oy - 10, V.viewW + 20, V.viewH + 20);
    if (t.stars) {
      for (const s of L.stars) {
        const a = 0.5 + 0.5 * Math.sin(V.time * 1.5 + s.ph * 7);
        ctx.fillStyle = `rgba(255,255,240,${0.35 + a * 0.6})`;
        circle(ctx, s.x * V.viewW, s.y, s.r);
      }
    }
    sunX = V.viewW * 0.8;
    const sunY = 105;
    if (t.sun === 'sun') {
      const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 440);
      sg.addColorStop(0, 'rgba(255,255,245,1)'); sg.addColorStop(0.07, 'rgba(255,252,228,0.95)');
      sg.addColorStop(0.2, 'rgba(255,240,200,0.45)'); sg.addColorStop(1, 'rgba(255,236,200,0)');
      ctx.fillStyle = sg; ctx.fillRect(sunX - 440, sunY - 440, 880, 880);
    } else if (t.sun === 'moon') {
      glow(sunX, sunY, 240, 'rgba(190,200,255,A)', 0.35);
      ctx.fillStyle = '#fff8dc'; circle(ctx, sunX, sunY, 34);
      ctx.fillStyle = 'rgba(220,210,180,0.5)';
      circle(ctx, sunX - 10, sunY - 8, 7); circle(ctx, sunX + 12, sunY + 6, 5); circle(ctx, sunX + 2, sunY + 16, 4);
    }
    sunScreenY = sunY - oy;
  }

  function drawClouds(): void {
    if (t.clouds <= 0) return;
    layer(0, 0.08);
    ctx.globalAlpha = t.clouds;
    const span = Math.max(V.viewW + 700, 3400);
    for (const c of L.clouds) {
      const x = mod(c.x + V.time * c.drift - V.camX * 0.04, span) - 350;
      drawSprite(ctx, c.s, x, c.y, c.k, 0.5, 0.5);
    }
    ctx.globalAlpha = 1;
  }

  function drawMountains(): void {
    fillProfile(0.07, 0.1, x => ridge(x, ...RANGE1), t.range1[0], t.range1[1], 300, 560);
    const g = fillProfile(0.13, 0.15, x => ridge(x, ...RANGE2), t.range2[0], t.range2[1], 360, 600);
    if (!t.castle) return;
    const cy = ridge(CASTLE_X, ...RANGE2) + 22;
    drawSprite(ctx, castle, CASTLE_X, cy, 0.85, 0.5, 1);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(CASTLE_X, cy + 8, 150, 26, 0, 0, TAU); ctx.fill();
  }

  function drawRays(): void {
    if (t.rays <= 0) return;
    screenSpace();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const ox = sunX, oy = sunScreenY;
    for (let i = 0; i < 6; i++) {
      const a = 1.95 + i * 0.13 + Math.sin(V.time * 0.07 + i) * 0.03;
      const len = 1600, w0 = 8, w1 = 60 + (i % 3) * 45;
      const alpha = (0.05 + 0.035 * Math.sin(V.time * 0.35 + i * 1.7)) * t.rays * 0.6;
      const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
      const g = ctx.createLinearGradient(ox, oy, ox + dx * len, oy + dy * len);
      g.addColorStop(0, `rgba(255,246,210,${alpha * 1.6})`);
      g.addColorStop(0.5, `rgba(255,240,200,${alpha})`);
      g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = g; ctx.beginPath();
      ctx.moveTo(ox + nx * w0, oy + ny * w0); ctx.lineTo(ox - nx * w0, oy - ny * w0);
      ctx.lineTo(ox + dx * len - nx * w1, oy + dy * len - ny * w1);
      ctx.lineTo(ox + dx * len + nx * w1, oy + dy * len + ny * w1);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawBgButterflies(): void {
    if (!t.butterflies) return;
    layer(0.75, 0.7);
    const l = V.camX * 0.75, time = V.time;
    for (const b of L.butterflies) {
      const x = b.x + Math.sin(time * 0.23 + b.ph) * 160;
      const y = b.y + Math.sin(time * 0.8 + b.ph) * 35 + Math.sin(time * 2.3 + b.ph) * 8;
      if (x < l - 40 || x > l + V.viewW + 40) continue;
      const flap = Math.abs(Math.sin(time * 9 + b.ph));
      ctx.save(); ctx.translate(x, y); ctx.scale(b.s, b.s); ctx.globalAlpha = 0.85;
      ctx.save(); ctx.scale(0.25 + 0.75 * flap, 1); ctx.fillStyle = b.col;
      ctx.beginPath(); ctx.ellipse(-7, -4, 7, 5.5, -0.6, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(7, -4, 7, 5.5, 0.6, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-5, 4, 4.5, 3.5, 0.5, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5, 4, 4.5, 3.5, -0.5, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#6b4d7d'; ctx.fillRect(-1, -7, 2, 13);
      ctx.restore();
    }
  }

  function drawMotes(): void {
    screenSpace();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const wx = V.viewW + 80, wy = V.viewH + 80, firefly = t.weather === 'fireflies';
    for (const m of L.motes) {
      const wander = firefly ? Math.sin(V.time * 0.7 + m.ph * 3) * 40 : 0, bubble = t.weather === 'bubbles';
      const x = mod(m.x - V.camX * 1.1 + (bubble ? Math.sin(V.time + m.ph) * 8 : V.time * m.sp) + wander, wx) - 40;
      const y = mod(m.y - (V.camY - V.camRest) * 1.1 + (bubble ? -V.time * m.sp * 6 : Math.sin(V.time * 0.5 + m.ph) * 20), wy) - 40;
      const a = firefly ? Math.max(0, Math.sin(V.time * 1.1 + m.ph * 5)) : 0.35 + 0.35 * Math.sin(V.time * 1.3 + m.ph);
      glow(x, y, m.r * (firefly ? 9 : 5), `rgba(${t.motes},A)`, a * 0.6);
      ctx.fillStyle = `rgba(${t.motes},${a})`; circle(ctx, x, y, m.r);
    }
    ctx.restore();
  }

  const drops = Array.from({ length: 140 }, () => ({ x: R() * 2000, y: R() * 1000, sp: 700 + R() * 300, l: 14 + R() * 12 }));
  function drawRain(): void {
    screenSpace();
    ctx.strokeStyle = 'rgba(235,242,255,0.55)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath();
    const wx = V.viewW + 100, wy = V.viewH + 100;
    for (const d of drops) {
      const x = mod(d.x - V.camX * 1.2 - V.time * d.sp * 0.25, wx) - 50;
      const y = mod(d.y + V.time * d.sp - (V.camY - V.camRest), wy) - 50;
      ctx.moveTo(x, y); ctx.lineTo(x - d.l * 0.25, y + d.l);
    }
    ctx.stroke();
  }

  const falling = Array.from({ length: 34 }, () => ({ x: R() * 2000, y: R() * 1000, sp: 40 + R() * 50, ph: R() * TAU, s: 5 + R() * 5, c: pick(R, ['#f29c4a', '#ea7050', '#ecc040', '#d4553e']) }));
  function drawLeaves(): void {
    screenSpace();
    const wx = V.viewW + 100, wy = V.viewH + 100;
    for (const f of falling) {
      const x = mod(f.x - V.camX * 1.15 + Math.sin(V.time * 0.8 + f.ph) * 40 + V.time * 15, wx) - 50;
      const y = mod(f.y + V.time * f.sp - (V.camY - V.camRest), wy) - 50;
      const r = V.time * 2 + f.ph;
      ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(1, Math.abs(Math.cos(r * 0.7)) * 0.8 + 0.2);
      ctx.fillStyle = f.c; ctx.beginPath(); ctx.ellipse(0, 0, f.s, f.s * 0.55, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  const flakes = Array.from({ length: 90 }, () => ({ x: R() * 2000, y: R() * 1000, sp: 30 + R() * 40, r: 1.5 + R() * 2.5, ph: R() * TAU }));
  function drawSnow(): void {
    screenSpace();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    const wx = V.viewW + 60, wy = V.viewH + 60;
    for (const f of flakes) {
      const x = mod(f.x - V.camX * 1.1 + Math.sin(V.time * 0.7 + f.ph) * 30, wx) - 30;
      const y = mod(f.y + V.time * f.sp - (V.camY - V.camRest), wy) - 30;
      circle(ctx, x, y, f.r);
    }
  }
  function drawPetals(): void {
    screenSpace();
    const wx = V.viewW + 60, wy = V.viewH + 60;
    for (let i = 0; i < 30; i++) {
      const f = flakes[i];
      const x = mod(f.x - V.camX * 1.15 + Math.sin(V.time * 0.8 + f.ph) * 50 + V.time * 12, wx) - 30;
      const y = mod(f.y + V.time * f.sp * 0.8 - (V.camY - V.camRest), wy) - 30;
      const r = V.time * 2 + f.ph;
      ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(1, Math.abs(Math.cos(r * 0.7)) * 0.7 + 0.3);
      ctx.fillStyle = i % 3 ? '#ffc8dc' : '#ffffff'; ctx.beginPath(); ctx.ellipse(0, 0, 5, 3, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  function drawVignette(): void {
    screenSpace();
    const cx = V.viewW / 2, cy = V.viewH * 0.45;
    const g = ctx.createRadialGradient(cx, cy, Math.min(V.viewW, V.viewH) * 0.35, cx, cy, Math.max(V.viewW, V.viewH) * 0.75);
    g.addColorStop(0, `rgba(${t.vignette},0)`); g.addColorStop(1, `rgba(${t.vignette},0.28)`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, V.viewW, V.viewH);
  }

  return {
    theme: t,
    art: { playBush, fern },
    drawBack(rainbowA: number) {
      drawSky();
      drawRainbow(rainbowA);
      drawClouds();
      drawMountains();
      haze(0.22);
      fillProfile(0.3, 0.3, farHillY, t.farHill[0], t.farHill[1]);
      drawItems(L.far, 0.3, 0.3);
      if (L.ceil.length) drawItems(L.ceil, 0.4, 0, V.camRest - 30);
      haze(0.28);
      fillProfile(0.55, 0.55, midHillY, t.midHill[0], t.midHill[1]);
      drawItems(L.mid, 0.55, 0.55);
      haze(0.14);
      drawRays();
      if (t.nearTrees !== false) drawItems(L.near, 0.8, 0.8);
      drawBgButterflies();
      fillProfile(0.9, 0.9, backHillY, t.backHill[0], t.backHill[1], 500, 720);
      drawItems(L.back, 0.9, 0.9);
    },
    drawFront() {
      if (t.weather === 'rain') drawRain();
      if (t.weather === 'leaves') drawLeaves();
      if (t.weather === 'snow') drawSnow();
      if (t.weather === 'petals') drawPetals();
      drawItems(L.fg, 1.35, 1.15);
      drawItems(L.hang, 1.25, 0, V.camRest - 20); // pinned to screen top
    },
    // floating light specks + vignette: drawn last, never darkened
    drawAtmos() {
      drawMotes();
      drawVignette();
    },
  };
}
