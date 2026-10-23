import { ctx, V, visible } from '../engine/view';
import { glow, sparkleBurst } from '../engine/fx';
import { TAU, circle, mod, rr, mulberry32 } from '../util';
import { Sound } from '../sound';
import { playerNear, win, fadeTheme } from '../game/world';
import { drawBubble } from '../render/hud';
import { drawCanopy, drawZ } from '../render/terrain';
import { Hand, type Thing } from './carry';
import type { Entity, World } from '../game/types';

// Chapter 2 friends: Owl, Badger, and the things they need.

// ---------------------------------------------------------------- owl ----
export function drawOwl(s: number, opts: { glasses?: boolean; sleepy?: boolean; flap?: number; look?: number } = {}): void {
  const t = V.time, blink = mod(t, 3.3) < 0.12 || opts.sleepy;
  ctx.save(); ctx.scale(s, s);
  // wings
  const fl = opts.flap ?? 0;
  ctx.fillStyle = '#8a6a58';
  for (const d of [-1, 1]) { ctx.save(); ctx.translate(d * 20, -26); ctx.rotate(d * (0.2 + fl)); ctx.beginPath(); ctx.ellipse(d * 4, 4, 10, 20, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  // body
  ctx.fillStyle = '#a8866e'; ctx.beginPath(); ctx.ellipse(0, -30, 24, 30, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#e8d2b8'; ctx.beginPath(); ctx.ellipse(0, -22, 15, 20, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(140,100,80,0.5)'; ctx.lineWidth = 1.5;
  for (const [x, y] of [[-6, -26], [6, -24], [0, -16], [-6, -10], [6, -10]]) { ctx.beginPath(); ctx.arc(x, y, 3, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  // ear tufts
  ctx.fillStyle = '#8a6a58';
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 8, -56); ctx.lineTo(d * 20, -70); ctx.lineTo(d * 20, -50); ctx.closePath(); ctx.fill(); }
  // eyes
  const lx = opts.look ?? 0;
  for (const d of [-1, 1]) {
    ctx.fillStyle = '#f6e7c8'; circle(ctx, d * 10, -44, 10);
    if (blink) { ctx.strokeStyle = '#3b2550'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(d * 10, -45, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
    else { ctx.fillStyle = '#ffb020'; circle(ctx, d * 10 + lx, -44, 6); ctx.fillStyle = '#2d2438'; circle(ctx, d * 10 + lx, -44, 3.5); ctx.fillStyle = '#fff'; circle(ctx, d * 10 + lx + 1.5, -46, 1.3); }
  }
  ctx.fillStyle = '#f0a838'; ctx.beginPath(); ctx.moveTo(-4, -38); ctx.lineTo(4, -38); ctx.lineTo(0, -30); ctx.closePath(); ctx.fill();
  if (opts.glasses) {
    ctx.strokeStyle = '#5b3a8c'; ctx.lineWidth = 2.5;
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 10, -44, 11, 0, TAU); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-1, -46); ctx.lineTo(1, -46); ctx.stroke();
  }
  // feet
  ctx.strokeStyle = '#f0a838'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (const d of [-1, 1]) for (const k of [-3, 0, 3]) { ctx.beginPath(); ctx.moveTo(d * 8, -2); ctx.lineTo(d * 8 + k, 3); ctx.stroke(); }
  ctx.restore();
}

export const GLASSES: Thing = {
  kind: 'glasses',
  draw() {
    ctx.strokeStyle = '#5b3a8c'; ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(200,230,255,0.6)';
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * 12, 0, 10, 0, TAU); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-2, -2); ctx.quadraticCurveTo(0, -6, 2, -2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; circle(ctx, -15, -3, 2.5); circle(ctx, 9, -3, 2.5);
  },
};

// A big old tree with Owl on a branch. Bring the glasses → Owl can see → level done.
export class OwlTree implements Entity {
  z = -1;
  canopy: { x: number; y: number; r: number }[] = [];
  happyT = -1;
  wasNear = false;
  bubbleA = 0;
  constructor(public x: number, public branchY: number, public hand: Hand) {
    const r = mulberry32(x);
    for (let i = 0; i < 30; i++) this.canopy.push({ x: x + (r() - 0.5) * 420, y: branchY - 170 + (r() - 0.5) * 150, r: 48 + r() * 40 });
    this.canopy.sort((a, b) => a.y - b.y);
  }
  owlPos() { return { x: this.x - 110, y: this.branchY }; }

  update(w: World, dt: number): void {
    const o = this.owlPos();
    const near = w.mode === 'play' && playerNear(w, o.x, o.y - 40, 80);
    if (near && !this.wasNear && this.happyT < 0 && this.hand.holding?.kind === 'glasses') {
      this.hand.holding = null; this.happyT = 0;
      Sound.happy(); Sound.magic(); sparkleBurst(o.x, o.y - 40, 24);
    }
    this.wasNear = near;
    if (this.happyT >= 0) {
      this.happyT += dt;
      if (this.happyT > 1.6) win(w, { x: o.x - 150, y: o.y - 40 });
    }
    const show = this.happyT < 0 && w.mode === 'play' && Math.abs(w.player.x - o.x) < 600;
    this.bubbleA += ((show ? 1 : 0) - this.bubbleA) * Math.min(1, dt * 4);
  }

  draw(w: World): void {
    if (!visible(this.x - 320, this.x + 320)) return;
    const gy = w.ground(this.x), by = this.branchY;
    const g = ctx.createLinearGradient(this.x - 60, 0, this.x + 60, 0);
    g.addColorStop(0, '#4e3a3a'); g.addColorStop(1, '#7a5a4a');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(this.x - 110, gy + 20); ctx.quadraticCurveTo(this.x - 50, gy - 20, this.x - 44, gy - 120);
    ctx.lineTo(this.x - 36, by - 200); ctx.lineTo(this.x + 36, by - 200); ctx.lineTo(this.x + 44, gy - 120);
    ctx.quadraticCurveTo(this.x + 50, gy - 20, this.x + 112, gy + 20); ctx.closePath(); ctx.fill();
    // hollow
    ctx.fillStyle = '#2a1e2a'; ctx.beginPath(); ctx.ellipse(this.x + 6, by + 80, 18, 26, 0, 0, TAU); ctx.fill();
    // branch
    ctx.fillStyle = '#6a4a3a';
    ctx.beginPath(); ctx.moveTo(this.x, by - 6); ctx.quadraticCurveTo(this.x - 90, by - 4, this.x - 170, by); ctx.lineTo(this.x - 170, by + 10); ctx.quadraticCurveTo(this.x - 90, by + 14, this.x, by + 24); ctx.fill();
    drawCanopy(this.canopy, ['#1c3a3a', '#24504a', '#3a6a5a']);
    const o = this.owlPos(), hop = this.happyT >= 0 ? Math.abs(Math.sin(this.happyT * 8)) * 12 : 0;
    ctx.save(); ctx.translate(o.x, o.y - hop);
    drawOwl(1.4, { glasses: this.happyT >= 0, flap: this.happyT >= 0 ? Math.abs(Math.sin(this.happyT * 14)) * 0.8 : 0, look: Math.sin(V.time * 0.7) * 2 });
    ctx.restore();
  }

  drawOver(): void {
    if (this.bubbleA < 0.02) return;
    const o = this.owlPos();
    drawBubble(o.x, o.y - 110, this.bubbleA, 70, () => GLASSES.draw());
  }
}

// Glowing feathers on the ground that show the way.
export class FeatherTrail implements Entity {
  z = -1;
  constructor(public pts: { x: number; y?: number }[]) {}
  update(): void {}
  draw(w: World): void {
    for (const [i, p] of this.pts.entries()) {
      if (!visible(p.x - 30, p.x + 30)) continue;
      const y = (p.y ?? w.ground(p.x)) - 4;
      ctx.save(); ctx.translate(p.x, y); ctx.rotate(-0.6 + Math.sin(V.time + i) * 0.1);
      ctx.fillStyle = '#e8d2b8'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 5, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#a8866e'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(14, 0); ctx.stroke();
      ctx.restore();
    }
  }
  drawLight(w: World): void {
    for (const p of this.pts) if (visible(p.x - 40, p.x + 40)) glow(p.x, (p.y ?? w.ground(p.x)) - 6, 34, 'rgba(255,240,200,A)', 0.4);
  }
}

// ------------------------------------------------------------- badger ----
export function drawBadger(s: number, sleeping: boolean, walk = 0): void {
  ctx.save(); ctx.scale(s, s);
  ctx.fillStyle = '#7a7a86';
  ctx.beginPath(); ctx.ellipse(-6, -18, 34, 18, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2d2a34';
  for (const [x, ph] of [[-28, 0], [-14, 1], [6, 2], [18, 3]] as [number, number][]) { ctx.beginPath(); ctx.ellipse(x + Math.sin(walk + ph) * 3, -3, 5, 6, 0, 0, TAU); ctx.fill(); }
  // head with stripes
  ctx.fillStyle = '#f4f2f4'; ctx.beginPath(); ctx.ellipse(28, -22, 17, 13, 0.15, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2d2a34';
  for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(28, -22 + d * 6, 16, 3.6, 0.15, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#2d2a34'; circle(ctx, 44, -19, 4);
  ctx.fillStyle = '#9a9aa6'; circle(ctx, 20, -34, 5);
  if (sleeping) { ctx.strokeStyle = '#2d2a34'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(34, -24, 3, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
  else { ctx.fillStyle = '#fff'; circle(ctx, 34, -24, 2.6); ctx.fillStyle = '#2d2a34'; circle(ctx, 34.8, -24, 1.4); }
  ctx.fillStyle = 'rgba(255,130,160,0.5)'; circle(ctx, 38, -16, 2.6);
  ctx.restore();
}

export const OLD_LEAVES: Thing = {
  kind: 'old',
  draw() {
    for (const [x, y, a, c] of [[-8, 2, 0.4, '#8a6a3a'], [6, 0, -0.5, '#a07a3a'], [0, -6, 0.1, '#6a5030']] as [number, number, number, string][]) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, 0, 14, 7, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    ctx.strokeStyle = '#5a4030'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-14, 8); ctx.lineTo(14, -10); ctx.stroke();
  },
};
export const MOSS: Thing = {
  kind: 'moss',
  draw() {
    ctx.fillStyle = '#4fae5a';
    for (const [x, y, r] of [[-10, 2, 10], [4, -2, 12], [14, 4, 8], [0, 6, 9]]) circle(ctx, x, y, r);
    ctx.fillStyle = '#8fe36a'; for (const [x, y] of [[-8, -2], [4, -8], [14, 0]]) circle(ctx, x, y, 3);
  },
};

// The den: needs the old leaves out (to the heap) and soft moss in (the bed).
// When both are done the sun rises and Badger comes home to sleep.
export class Den implements Entity {
  z = -1;
  moss = 0;
  out = 0;
  badgerX: number;
  phase: 'work' | 'sunrise' | 'home' | 'sleep' = 'work';
  t = 0;
  constructor(public x: number, public need: { moss: number; out: number }, public heapX: number, public hand: Hand) {
    this.badgerX = x + 900;
  }
  bedPos(w: World) { return { x: this.x, y: w.ground(this.x) - 20 }; }

  update(w: World, dt: number): void {
    this.t += dt;
    if (this.phase === 'work' && this.moss >= this.need.moss && this.out >= this.need.out) { this.phase = 'sunrise'; Sound.magic(); }
    if (this.phase === 'sunrise' && fadeTheme(w, 'morning', dt, 3)) { this.phase = 'home'; }
    if (this.phase === 'home') {
      this.badgerX = Math.max(this.x + 20, this.badgerX - 160 * dt);
      if (this.badgerX <= this.x + 20) { this.phase = 'sleep'; this.t = 0; Sound.happy(); }
    }
    if (this.phase === 'sleep' && this.t > 1.8 && w.mode === 'play') win(w, { x: this.x - 220, y: w.ground(this.x) - 200 });
  }

  draw(w: World): void {
    if (!visible(this.x - 260, this.x + 260) && !visible(this.badgerX - 80, this.badgerX + 80)) return;
    const gy = w.ground(this.x);
    // earth mound with a cut-away room
    ctx.fillStyle = '#6a4a3a';
    ctx.beginPath(); ctx.moveTo(this.x - 240, gy + 6); ctx.quadraticCurveTo(this.x - 200, gy - 210, this.x, gy - 220); ctx.quadraticCurveTo(this.x + 200, gy - 210, this.x + 240, gy + 6); ctx.fill();
    ctx.fillStyle = '#5cb04a';
    ctx.beginPath(); ctx.moveTo(this.x - 230, gy - 30); ctx.quadraticCurveTo(this.x - 190, gy - 214, this.x, gy - 224); ctx.quadraticCurveTo(this.x + 190, gy - 214, this.x + 230, gy - 30); ctx.lineTo(this.x + 200, gy - 40); ctx.quadraticCurveTo(this.x, gy - 200, this.x - 200, gy - 40); ctx.fill();
    ctx.fillStyle = '#7a5440'; ctx.beginPath(); ctx.ellipse(this.x, gy - 40, 170, 120, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#8a6248'; ctx.fillRect(this.x - 170, gy - 40, 340, 46);
    // mess on the floor, fewer as it is cleaned
    const left = this.need.out - this.out;
    for (let i = 0; i < left * 3; i++) {
      ctx.save(); ctx.translate(this.x - 120 + i * 26, gy - 8 - (i % 2) * 6); ctx.rotate(i);
      ctx.fillStyle = i % 2 ? '#8a6a3a' : '#6a5030'; ctx.beginPath(); ctx.ellipse(0, 0, 12, 5, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    // bed: grows soft and green with moss
    ctx.fillStyle = '#5a3e2e'; rr(ctx, this.x - 70, gy - 34, 140, 26, 13); ctx.fill();
    for (let i = 0; i < this.moss * 4; i++) { ctx.fillStyle = i % 2 ? '#4fae5a' : '#6cc562'; circle(ctx, this.x - 56 + (i * 37) % 112, gy - 34 + (i % 3) * 4, 13); }
    // compost heap
    const hy = w.ground(this.heapX);
    ctx.fillStyle = '#6a5030'; ctx.beginPath(); ctx.ellipse(this.heapX, hy, 70, 24 + this.out * 10, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#8a6a3a'; for (let i = 0; i < 5 + this.out * 3; i++) { ctx.beginPath(); ctx.ellipse(this.heapX - 50 + (i * 23) % 100, hy - 6 - (i % 3) * 8, 11, 5, i, 0, TAU); ctx.fill(); }
    // badger
    if (this.phase === 'home' || this.phase === 'sleep') {
      const bx = this.badgerX, sleeping = this.phase === 'sleep';
      ctx.save(); ctx.translate(bx, w.ground(bx) - (sleeping ? 24 : 0)); ctx.scale(-1, 1);
      drawBadger(1.4, sleeping, this.t * 12);
      ctx.restore();
      if (sleeping) drawZ(bx - 40, w.ground(bx) - 90, 0, 18);
    }
  }

  drawLight(w: World): void {
    const gy = w.ground(this.x);
    glow(this.x, gy - 70, 220, 'rgba(255,200,140,A)', 0.45);
  }

  // what is still needed: moss pictures for the bed, leaf pictures to take out
  drawOver(w: World): void {
    if (this.phase !== 'work' || w.mode !== 'play' || Math.abs(w.player.x - this.x) > 700) return;
    const gy = w.ground(this.x);
    drawBubble(this.x, gy - 250, 1, 96, () => {
      const items: [Thing, boolean][] = [];
      for (let i = 0; i < this.need.out; i++) items.push([OLD_LEAVES, i < this.out]);
      for (let i = 0; i < this.need.moss; i++) items.push([MOSS, i < this.moss]);
      items.forEach(([th, done], i) => {
        ctx.save(); ctx.translate(-30 + (i % 3) * 30, -16 + Math.floor(i / 3) * 32); ctx.scale(0.62, 0.62);
        ctx.globalAlpha = done ? 0.25 : 1; th.draw(); ctx.restore();
        if (done) { ctx.strokeStyle = '#4fae5a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-36 + (i % 3) * 30, -16 + Math.floor(i / 3) * 32); ctx.lineTo(-30 + (i % 3) * 30, -10 + Math.floor(i / 3) * 32); ctx.lineTo(-20 + (i % 3) * 30, -24 + Math.floor(i / 3) * 32); ctx.stroke(); }
      });
    });
  }
}
