import { ctx, V, visible } from '../engine/view';
import { sparkleBurst } from '../engine/fx';
import { TAU, circle, rr } from '../util';
import { Sound } from '../sound';
import { playerNear } from '../game/world';
import { Friend, touchGlow, type Blocker } from './friend';
import type { Thing } from './carry';
import type { OrderItem } from './order';
import type { Entity, World } from '../game/types';

// Chapter 4 pieces: ducks, rubbish and bins, logs, floating things, water cycle, fish, crabs, turtles, coral.

// ---------------------------------------------------------------- ducks ----
export function drawDuck(s: number, moving: boolean): void {
  ctx.save(); ctx.scale(s, s);
  const bob = moving ? Math.sin(V.time * 14) * 1.5 : 0;
  ctx.fillStyle = s > 1.2 ? '#f6f0e4' : '#ffe066';
  ctx.beginPath(); ctx.ellipse(-2, -12 + bob, 16, 11, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-16, -14 + bob); ctx.lineTo(-24, -20 + bob); ctx.lineTo(-14, -8 + bob); ctx.fill();
  circle(ctx, 10, -24 + bob, 8);
  ctx.fillStyle = '#ff9a3c'; ctx.beginPath(); ctx.moveTo(16, -25 + bob); ctx.lineTo(25, -22 + bob); ctx.lineTo(16, -19 + bob); ctx.fill();
  ctx.fillStyle = '#2d2438'; circle(ctx, 12, -26 + bob, 1.8);
  ctx.fillStyle = s > 1.2 ? '#e6dccc' : '#f6cc40'; ctx.beginPath(); ctx.ellipse(-4, -12 + bob, 8, 5, -0.2, 0, TAU); ctx.fill();
  ctx.restore();
}

// -------------------------------------------------------------- rubbish ----
export const PAPER: Thing = { kind: 'paper', draw() {
  ctx.fillStyle = '#f4f0e8'; ctx.save(); ctx.rotate(-0.2); rr(ctx, -14, -12, 28, 24, 3); ctx.fill();
  ctx.strokeStyle = '#a8a4b8'; ctx.lineWidth = 2; for (const y of [-5, 0, 5]) { ctx.beginPath(); ctx.moveTo(-9, y); ctx.lineTo(9, y); ctx.stroke(); } ctx.restore();
} };
export const BOTTLE: Thing = { kind: 'plastic', draw() {
  ctx.fillStyle = 'rgba(140,210,255,0.85)'; rr(ctx, -8, -10, 16, 26, 6); ctx.fill(); ctx.fillRect(-4, -16, 8, 8);
  ctx.fillStyle = '#4a9ae8'; ctx.fillRect(-5, -19, 10, 4); ctx.fillStyle = '#ffd166'; ctx.fillRect(-8, -2, 16, 7);
} };
export const JAR: Thing = { kind: 'glass', draw() {
  ctx.fillStyle = 'rgba(150,220,170,0.75)'; rr(ctx, -11, -10, 22, 24, 6); ctx.fill();
  ctx.fillStyle = '#c8a070'; rr(ctx, -12, -15, 24, 7, 3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-7, -6, 3, 14);
} };
export const BIN_COLORS: Record<string, string> = { paper: '#4a8ae8', plastic: '#ffcf3a', glass: '#4ab868' };

export function binLook(kind: string, icon: Thing) {
  return (count: number): void => {
    const c = BIN_COLORS[kind];
    ctx.fillStyle = c; rr(ctx, -34, -64, 68, 70, 10); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.15)'; rr(ctx, -38, -72, 76, 14, 6); ctx.fill();
    ctx.fillStyle = c; rr(ctx, -38, -74, 76, 12, 6); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; circle(ctx, 0, -34, 20);
    ctx.save(); ctx.translate(0, -34); ctx.scale(0.8, 0.8); icon.draw(); ctx.restore();
    for (let i = 0; i < count; i++) { ctx.fillStyle = '#fff'; circle(ctx, -20 + i * 12, -6, 4); }
  };
}

// ----------------------------------------------------------------- logs ----
export const LOGS: Thing[] = [4, 3, 2, 1].map(k => ({ kind: `log${k}`, draw() {
  const L = 14 + k * 9;
  ctx.fillStyle = '#9a6a42'; rr(ctx, -L, -7 - k, L * 2, 14 + k * 2, 7); ctx.fill();
  ctx.fillStyle = '#d8a870'; ctx.beginPath(); ctx.ellipse(L - 2, 0, 5 + k, 7 + k, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#9a6a42'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(L - 2, 0, 2 + k * 0.5, 3 + k * 0.5, 0, 0, TAU); ctx.stroke();
} }));

export function damLook(count: number): void {
  for (let i = 0; i < count; i++) {
    ctx.save(); ctx.translate(0, -10 - i * 20); LOGS[i].draw(); ctx.restore();
  }
  // ghost of the next log
  if (count < 4) { ctx.save(); ctx.translate(0, -10 - count * 20); ctx.globalAlpha = 0.3; LOGS[count].draw(); ctx.restore(); }
}

export function drawBeaver(happy: boolean): void {
  ctx.fillStyle = '#6a4a3a'; ctx.beginPath(); ctx.ellipse(-30, -8, 18, 8, 0.2, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#4a3226'; ctx.lineWidth = 1.5; for (const x of [-38, -30, -22]) { ctx.beginPath(); ctx.moveTo(x, -14); ctx.lineTo(x + 2, -2); ctx.stroke(); }
  ctx.fillStyle = '#9a6a4a'; ctx.beginPath(); ctx.ellipse(0, -22, 20, 22, 0, 0, TAU); ctx.fill();
  circle(ctx, 14, -44, 13);
  ctx.fillStyle = '#c89a72'; ctx.beginPath(); ctx.ellipse(20, -38, 7, 5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.fillRect(20, -34, 6, 7); ctx.strokeStyle = '#d8d0c8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(23, -34); ctx.lineTo(23, -27); ctx.stroke();
  ctx.fillStyle = '#2d2438'; circle(ctx, 25, -42, 2.4); circle(ctx, 16, -48, 2.2);
  if (happy) { ctx.fillStyle = 'rgba(255,130,150,0.5)'; circle(ctx, 10, -38, 3); }
}

// --------------------------------------------------------- sink / float ----
const thing = (kind: string, draw: () => void): Thing => ({ kind, draw });
export const FLOATERS: Thing[] = [
  thing('float', () => { ctx.fillStyle = '#5cbf5a'; ctx.beginPath(); ctx.ellipse(0, 0, 18, 8, -0.3, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-15, 4); ctx.lineTo(15, -4); ctx.stroke(); }),
  thing('float', () => { ctx.save(); ctx.scale(0.8, 0.8); drawDuck(1, false); ctx.restore(); }),
  thing('float', () => { ctx.fillStyle = '#9a6a42'; ctx.save(); ctx.rotate(0.3); rr(ctx, -20, -4, 40, 8, 4); ctx.fill(); ctx.restore(); }),
  thing('float', () => { ctx.fillStyle = '#e8c890'; rr(ctx, -9, -11, 18, 22, 5); ctx.fill(); ctx.fillStyle = 'rgba(160,110,60,0.4)'; for (const [x, y] of [[-4, -4], [3, 2], [-2, 6]]) circle(ctx, x, y, 1.6); }),
];
export const SINKERS: Thing[] = [
  thing('sink', () => { ctx.fillStyle = '#8a8a9a'; ctx.beginPath(); ctx.ellipse(0, 0, 16, 12, 0.2, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.3)'; circle(ctx, -5, -4, 4); }),
  thing('sink', () => { ctx.strokeStyle = '#d8a830'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-8, 0, 7, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(16, 0); ctx.moveTo(12, 0); ctx.lineTo(12, 6); ctx.stroke(); }),
  thing('sink', () => { ctx.fillStyle = '#e8b830'; circle(ctx, 0, 0, 12); ctx.strokeStyle = '#c89820'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.stroke(); }),
];

export function raftLook(need: number) {
  return (count: number): void => {
    ctx.fillStyle = '#b8824a'; for (let i = -3; i <= 3; i++) rr(ctx, i * 22 - 10, -10, 20, 18, 6), ctx.fill();
    ctx.fillStyle = '#8a5a2a'; ctx.fillRect(-80, -4, 160, 4);
    for (let i = 0; i < count; i++) { ctx.save(); ctx.translate(-45 + i * 30, -24); ctx.scale(0.7, 0.7); FLOATERS[i % FLOATERS.length].draw(); ctx.restore(); }
    for (let i = count; i < need; i++) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; circle(ctx, -45 + i * 30, -24, 7); }
  };
}

export function drawOtter(happy: boolean): void {
  ctx.fillStyle = '#8a5a42'; ctx.beginPath(); ctx.ellipse(0, -20, 14, 22, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-8, -4); ctx.quadraticCurveTo(-30, 4, -36, -10); ctx.quadraticCurveTo(-24, -6, -10, -12); ctx.fill();
  ctx.fillStyle = '#e8c8a8'; ctx.beginPath(); ctx.ellipse(3, -18, 8, 14, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8a5a42'; circle(ctx, 4, -46, 12);
  ctx.fillStyle = '#e8c8a8'; ctx.beginPath(); ctx.ellipse(8, -42, 8, 6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2d2438'; circle(ctx, 12, -45, 2.4); circle(ctx, 2, -50, 2.2); circle(ctx, -4, -50, 2.2);
  if (happy) { ctx.strokeStyle = '#2d2438'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(10, -40, 2.6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
}

// ------------------------------------------------------------ water cycle ----
export function waterCycleItems(pts: { x: number; y: number }[]): OrderItem[] {
  const icons = [
    () => { ctx.strokeStyle = '#ffb820'; ctx.lineWidth = 4; for (let i = 0; i < 8; i++) { const a = i * TAU / 8; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 22, Math.sin(a) * 22); ctx.lineTo(Math.cos(a) * 32, Math.sin(a) * 32); ctx.stroke(); } ctx.fillStyle = '#ffd23f'; circle(ctx, 0, 0, 18); },
    () => { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; for (const x of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(x, 18); ctx.quadraticCurveTo(x + 8, 6, x, -4); ctx.quadraticCurveTo(x - 8, -14, x, -24); ctx.stroke(); } },
    () => { ctx.fillStyle = '#9aa8c8'; for (const [x, y, r] of [[-18, 4, 14], [0, -6, 18], [18, 4, 14], [0, 8, 12]]) circle(ctx, x, y, r); },
    () => { ctx.fillStyle = '#6cc4ff'; for (const [x, y] of [[-14, -6], [0, 6], [14, -6]]) { ctx.beginPath(); ctx.moveTo(x, y - 12); ctx.bezierCurveTo(x + 7, y - 3, x + 8, y + 2, x, y + 6); ctx.bezierCurveTo(x - 8, y + 2, x - 7, y - 3, x, y - 12); ctx.fill(); } },
  ];
  return pts.map((p, i) => ({
    x: p.x, y: p.y,
    draw(lit, wiggle, next) {
      ctx.save(); ctx.translate(wiggle > 0 ? Math.sin(wiggle * 40) * 4 : 0, 0);
      ctx.fillStyle = lit ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)'; circle(ctx, 0, 0, 40);
      ctx.globalAlpha = lit ? 0.5 : 1; icons[i](); ctx.restore();
      if (next && !lit) touchGlow(0, 0, 60);
    },
  }));
}

// A blue stream that grows down the hill once the water cycle is done.
export class Stream implements Entity {
  z = -1;
  flow = 0;
  on = false;
  constructor(public x0: number, public x1: number) {}
  update(_w: World, dt: number): void { if (this.on) this.flow = Math.min(1, this.flow + dt * 0.5); }
  draw(w: World): void {
    if (this.flow <= 0) return;
    const xe = this.x0 + (this.x1 - this.x0) * this.flow;
    ctx.strokeStyle = 'rgba(110,200,250,0.9)'; ctx.lineWidth = 14; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let x = this.x0; x <= xe; x += 20) { const y = w.ground(x) - 2 + Math.sin(x * 0.05 + V.time * 3) * 1.5; if (x === this.x0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
    ctx.stroke();
  }
}

// ---------------------------------------------------------- fish rings ----
export function ringItems(pts: { x: number; y: number }[]): OrderItem[] {
  return pts.map(p => ({
    x: p.x, y: p.y,
    draw(lit, _wg, next) {
      ctx.strokeStyle = lit ? 'rgba(255,240,150,0.5)' : next ? '#ffd84a' : 'rgba(255,255,255,0.7)';
      ctx.lineWidth = next ? 9 : 6;
      ctx.beginPath(); ctx.ellipse(0, 0, 26, 46, 0, 0, TAU); ctx.stroke();
      if (next) touchGlow(0, 0, 50);
    },
  }));
}

export function drawFish(col: string, t: number): void {
  const wag = Math.sin(t * 10) * 0.3;
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(0, 0, 16, 9, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(-14, 0); ctx.rotate(wag); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-10, -8); ctx.lineTo(-10, 8); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#fff'; circle(ctx, 8, -2, 3); ctx.fillStyle = '#2d2438'; circle(ctx, 9, -2, 1.6);
}

// A little school of fish that swims after the fairy.
export class FishSchool implements Entity {
  z = 1;
  pts: { x: number; y: number }[] = [];
  cols = ['#ffb347', '#ff8fc7', '#86dcff', '#ffe066', '#b48cff'];
  constructor(n: number) { for (let i = 0; i < n; i++) this.pts.push({ x: 0, y: 0 }); }
  update(w: World, dt: number): void {
    const p = w.player;
    this.pts.forEach((f, i) => {
      const tx = p.x - p.face * (50 + i * 28), ty = p.y - 50 + Math.sin(V.time * 2 + i) * 18 + (i % 2 ? 20 : -20);
      if (f.x === 0 && f.y === 0) { f.x = tx; f.y = ty; }
      const k = Math.min(1, dt * (3 - i * 0.3));
      f.x += (tx - f.x) * k; f.y += (ty - f.y) * k;
    });
  }
  draw(w: World): void {
    this.pts.forEach((f, i) => { ctx.save(); ctx.translate(f.x, f.y); ctx.scale(w.player.face, 1); drawFish(this.cols[i % 5], V.time + i); ctx.restore(); });
  }
}

// --------------------------------------------------------------- crabs ----
export const SHELLS: Thing[] = [1, 2, 3].map(k => ({ kind: `shell${k}`, draw() {
  const r = 6 + k * 5;
  ctx.fillStyle = ['#ffc8a8', '#f2a8c8', '#c8b0f0'][k - 1];
  ctx.beginPath(); ctx.moveTo(-r, r * 0.4); ctx.quadraticCurveTo(-r, -r, 0, -r * 1.1); ctx.quadraticCurveTo(r, -r, r * 0.9, r * 0.4); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(160,90,110,0.5)'; ctx.lineWidth = 1.5;
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * r * 0.3, r * 0.4); ctx.lineTo(i * r * 0.12, -r); ctx.stroke(); }
} }));

export function crabLook(size: number) {
  return (count: number): void => {
    const s = 0.6 + size * 0.25;
    ctx.save(); ctx.scale(s, s);
    if (count > 0) { ctx.save(); ctx.translate(-4, -26); ctx.scale(1.4, 1.4); SHELLS[size - 1].draw(); ctx.restore(); }
    ctx.fillStyle = '#ff6b5a';
    ctx.beginPath(); ctx.ellipse(0, -12, 22, 13, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ff6b5a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (const d of [-1, 1]) for (const k of [0, 1, 2]) { ctx.beginPath(); ctx.moveTo(d * 14, -6 + k * 2); ctx.lineTo(d * (26 + k * 3), 2); ctx.stroke(); }
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 30, -24, 7, 0, TAU); ctx.fillStyle = '#ff6b5a'; ctx.fill(); }
    ctx.fillStyle = '#fff'; for (const d of [-1, 1]) circle(ctx, d * 7, -28, 4.5);
    ctx.fillStyle = '#2d2438'; for (const d of [-1, 1]) circle(ctx, d * 7, -28, 2.3);
    ctx.strokeStyle = '#2d2438'; ctx.lineWidth = 1.5; ctx.beginPath();
    if (count > 0) ctx.arc(0, -14, 5, 0.15 * Math.PI, 0.85 * Math.PI); else ctx.arc(0, -10, 4, 1.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
    ctx.restore();
  };
}

// -------------------------------------------------------------- turtles ----
function drawTurtle(walk: number): void {
  ctx.fillStyle = '#6cc472';
  for (const [x, ph] of [[-12, 0], [10, 1]] as [number, number][]) { ctx.beginPath(); ctx.ellipse(x + Math.sin(walk + ph) * 3, -3, 6, 4, 0, 0, TAU); ctx.fill(); }
  circle(ctx, 20, -12, 7);
  ctx.fillStyle = '#4a9a5a'; ctx.beginPath(); ctx.ellipse(0, -12, 17, 12, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = '#3a7a4a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-6, -22); ctx.lineTo(-2, -12); ctx.lineTo(6, -22); ctx.stroke();
  ctx.fillStyle = '#2d2438'; circle(ctx, 23, -14, 1.6);
}

export class Turtles extends Friend {
  height = 34;
  constructor(x: number, homeX: number) { super(x, 55, homeX); }
  drawMini(): void { ctx.translate(-4, 8); drawTurtle(0); }
  drawBody(_w: World, moving: boolean): void {
    const walk = moving ? this.walkT * 9 : 0;
    for (const [dx, k] of [[-90, 0.9], [-46, 1], [0, 1.1]] as [number, number][]) { ctx.save(); ctx.translate(dx, 0); ctx.scale(k * 1.2, k * 1.2); drawTurtle(walk + dx); ctx.restore(); }
  }
}

// Something left on the beach (a bucket, a sandcastle…). Touch it → gone.
export class BeachJunk implements Entity, Blocker {
  z = 1;
  cleared = false;
  t = -1;
  stopX: number;
  constructor(public x: number, public kind: 'bucket' | 'castle' | 'net') { this.stopX = x - 120; }
  target(w: World) { return { x: this.x, y: w.ground(this.x) - 50 }; }
  update(w: World, dt: number): void {
    if (this.t < 0 && w.mode === 'play' && playerNear(w, this.x, w.ground(this.x) - 30, 70)) {
      this.t = 0; Sound.thud(); sparkleBurst(this.x, w.ground(this.x) - 30, 14);
    }
    if (this.t >= 0) { this.t += dt; if (this.t > 0.3) this.cleared = true; }
  }
  draw(w: World): void {
    if (this.t > 0.6 || !visible(this.x - 80, this.x + 80)) return;
    const gy = w.ground(this.x), k = this.t < 0 ? 1 : 1 - this.t / 0.6;
    if (this.t < 0) touchGlow(this.x, gy - 30, 60);
    ctx.save(); ctx.translate(this.x, gy - (this.t > 0 ? this.t * 200 : 0)); ctx.scale(k, k);
    this.drawIcon();
    ctx.restore();
  }
  drawIcon(): void {
    if (this.kind === 'bucket') {
      ctx.fillStyle = '#ff6b8a'; ctx.beginPath(); ctx.moveTo(-18, -36); ctx.lineTo(18, -36); ctx.lineTo(13, 0); ctx.lineTo(-13, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#c84a6a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -36, 16, Math.PI, 0); ctx.stroke();
    } else if (this.kind === 'castle') {
      ctx.fillStyle = '#e8c880'; ctx.fillRect(-26, -26, 52, 26); ctx.fillRect(-20, -44, 14, 18); ctx.fillRect(6, -44, 14, 18);
      ctx.fillStyle = '#ff6b8a'; ctx.beginPath(); ctx.moveTo(13, -44); ctx.lineTo(13, -58); ctx.lineTo(24, -52); ctx.closePath(); ctx.fill();
    } else {
      ctx.strokeStyle = '#6a8aa8'; ctx.lineWidth = 2;
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 8, 0); ctx.lineTo(i * 8 + 10, -30); ctx.moveTo(i * 8, -30); ctx.lineTo(i * 8 + 10, 0); ctx.stroke(); }
    }
  }
}

// ---------------------------------------------------------------- coral ----
export function coralItems(pts: { x: number; y: number }[], cols: string[]): OrderItem[] {
  return pts.map((p, i) => ({
    x: p.x, y: p.y,
    draw(lit, wiggle, next) {
      const c = cols[i];
      ctx.save(); ctx.translate(wiggle > 0 ? Math.sin(wiggle * 40) * 4 : 0, 30);
      ctx.strokeStyle = lit ? c : 'rgba(255,255,255,0.35)'; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.globalAlpha = lit ? 1 : 0.9;
      for (const [a, l] of [[-0.6, 40], [0, 56], [0.6, 42], [-0.25, 30], [0.3, 34]]) {
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(Math.sin(a) * l * 0.3, -l * 0.5, Math.sin(a) * l, -Math.cos(a) * l); ctx.stroke();
      }
      ctx.fillStyle = c; circle(ctx, 0, -60, lit ? 9 : 11);
      ctx.restore();
      if (next && !lit) touchGlow(0, -10, 60);
    },
  }));
}

