import { ctx, V, visible } from '../engine/view';
import { glow, sparkleBurst, spawn, star } from '../engine/fx';
import { TAU, circle, ease, clamp, mulberry32 } from '../util';
import { Sound } from '../sound';
import { playerNear, win } from '../game/world';
import { drawBubble } from '../render/hud';
import { drawCanopy } from '../render/terrain';
import { Friend, touchGlow, type Blocker } from './friend';
import { Trail } from './follow';
import { Squirrel } from './squirrel';
import { drawOwl, drawBadger } from './nightFriends';
import { numberBadge, OrderGame, type OrderItem } from './order';
import type { Singer } from './frogs';
import type { Entity, World } from '../game/types';

// More Chapter 2 friends: hedgehog, mouse, glow-worms, owlets, foxes, moths.

// ----------------------------------------------------------- hedgehog ----
export function drawApple(s = 1): void {
  ctx.save(); ctx.scale(s, s);
  ctx.fillStyle = '#e8455a'; ctx.beginPath(); ctx.arc(-4, 2, 10, 0, TAU); ctx.arc(4, 2, 10, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; circle(ctx, -6, -2, 3);
  ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(1, -13); ctx.stroke();
  ctx.fillStyle = '#5cbf5a'; ctx.beginPath(); ctx.ellipse(6, -11, 6, 3, -0.4, 0, TAU); ctx.fill();
  ctx.restore();
}

export function drawHedgehog(got: number): void {
  ctx.fillStyle = '#7a5a46';
  ctx.beginPath();
  for (let i = 0; i <= 14; i++) {
    const a = Math.PI + (i / 14) * Math.PI, r = i % 2 ? 22 : 30;
    ctx.lineTo(-6 + Math.cos(a) * r * 1.2, -14 + Math.sin(a) * r);
  }
  ctx.closePath(); ctx.fill();
  // solid round body under the spikes (the spikes only cover the top)
  ctx.fillStyle = '#8a6a54'; ctx.beginPath(); ctx.ellipse(-4, -13, 31, 13, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#d8b08a'; ctx.beginPath(); ctx.ellipse(16, -12, 14, 11, 0.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2d2438'; circle(ctx, 29, -12, 3.5); circle(ctx, 18, -16, 2.4);
  ctx.fillStyle = '#fff'; circle(ctx, 18.8, -16.8, 0.8);
  ctx.fillStyle = 'rgba(255,130,150,0.55)'; circle(ctx, 20, -9, 2.4);
  ctx.fillStyle = '#5a3e30'; for (const x of [-20, -4, 10]) { ctx.beginPath(); ctx.ellipse(x, -1, 5, 3, 0, 0, TAU); ctx.fill(); }
  for (let i = 0; i < Math.min(got, 5); i++) { ctx.save(); ctx.translate(-22 + i * 9, -34 - (i % 2) * 6); drawApple(0.55); ctx.restore(); }
}

export function makeHedgehog(x: number): Squirrel {
  const h = new Squirrel(x, 5);
  h.item = drawApple;
  h.body = got => drawHedgehog(got);
  return h;
}

// Touch the tree → it shakes and an apple drops for Hedgehog.
export class AppleTree implements Entity {
  z = -1;
  shakeT = -1;
  canopy: { x: number; y: number; r: number }[] = [];
  constructor(public x: number, public apples: boolean, public collector: Squirrel) {
    const r = mulberry32(x);
    for (let i = 0; i < 14; i++) this.canopy.push({ x: x + (r() - 0.5) * 170, y: -150 + (r() - 0.5) * 70, r: 34 + r() * 24 });
  }
  update(w: World, dt: number): void {
    const gy = w.ground(this.x);
    if (this.shakeT < 0 && w.mode === 'play' && playerNear(w, this.x, gy - 140, 110)) {
      this.shakeT = 0; Sound.rustle();
      for (let i = 0; i < 8; i++) spawn({ kind: 'leaf', x: this.x + (Math.random() - 0.5) * 120, y: gy - 170, vx: (Math.random() - 0.5) * 80, vy: 20, g: 80, life: 1.4, max: 1.4, size: 6, color: '#3a6a5a', rot: Math.random() * TAU, vr: 4, drag: 1 });
      if (this.apples) { Sound.magic(); this.collector.give(this.x, gy - 140); }
    }
    if (this.shakeT >= 0) this.shakeT += dt;
  }
  draw(w: World): void {
    if (!visible(this.x - 140, this.x + 140)) return;
    const gy = w.ground(this.x), sh = this.shakeT >= 0 && this.shakeT < 0.6 ? Math.sin(this.shakeT * 40) * 5 : 0;
    ctx.fillStyle = '#5a4038'; ctx.fillRect(this.x - 12, gy - 110, 24, 114);
    ctx.save(); ctx.translate(sh, gy);
    drawCanopy(this.canopy, ['#1e3e3a', '#2a5448', '#3e7060']);
    if (this.apples && this.shakeT < 0) for (const [dx, dy] of [[-40, -130], [30, -150], [0, -110]]) { ctx.save(); ctx.translate(this.x + dx, dy); drawApple(0.9); ctx.restore(); }
    ctx.restore();
    if (this.shakeT < 0) touchGlow(this.x, gy - 140, 90);
  }
}

// ---------------------------------------------------- mouse + worms ----
function drawMouse(walk: number, happy: boolean): void {
  ctx.strokeStyle = '#c8a8a8'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-18, -8); ctx.quadraticCurveTo(-36, -4, -40, -18); ctx.stroke();
  ctx.fillStyle = '#b8a8b0'; ctx.beginPath(); ctx.ellipse(0, -12, 20, 12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffc6d6'; for (const x of [-10, 8]) { ctx.beginPath(); ctx.ellipse(x + Math.sin(walk + x) * 2, -1, 4, 2.5, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#b8a8b0'; circle(ctx, 18, -16, 10);
  ctx.fillStyle = '#ffc6d6'; circle(ctx, 14, -27, 7); ctx.fillStyle = '#b8a8b0'; circle(ctx, 14, -27, 4);
  ctx.fillStyle = '#ff8fb0'; circle(ctx, 28, -15, 2.6);
  ctx.fillStyle = '#2d2438'; circle(ctx, 21, -18, 2.2);
  ctx.strokeStyle = '#2d2438'; ctx.lineWidth = 1.2;
  if (happy) { ctx.beginPath(); ctx.arc(23, -12, 2, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
}

export class Mouse extends Friend {
  height = 44;
  constructor(x: number, homeX: number) { super(x, 120, homeX); }
  drawMini(): void { ctx.translate(-6, 8); drawMouse(0, true); }
  drawBody(_w: World, moving: boolean): void { ctx.scale(1.3, 1.3); drawMouse(moving ? this.walkT * 14 : 0, this.state !== 'wait'); }
}

// Glow-worms numbered 1…10. Light them in order; then the path is bright.
export function glowWorms(pts: { x: number; y: number }[]): OrderGame {
  const items: OrderItem[] = pts.map((p, i) => ({
    x: p.x, y: p.y,
    draw(lit, wiggle, next) {
      const wg = wiggle > 0 ? Math.sin(wiggle * 40) * 4 : Math.sin(V.time * 3 + i) * 1.5;
      ctx.save(); ctx.translate(wg, 0);
      ctx.fillStyle = lit ? '#d8ff8a' : '#6a7a5a';
      for (let k = 0; k < 4; k++) circle(ctx, -12 + k * 8, 18 - Math.abs(Math.sin(V.time * 4 + k + i)) * 3, 5.5 - k * 0.3);
      if (lit) { ctx.fillStyle = '#ffffff'; circle(ctx, 12, 16, 2); }
      ctx.restore();
      if (next) touchGlow(0, 10, 50);
      numberBadge(i + 1, lit, 15);
    },
  }));
  return new OrderGame(items, () => {}, 58);
}

// One stop per worm: Mouse runs on as soon as the next worm is glowing.
// Stops never go backwards, so a worm placed a bit to the left is passed by already.
export function orderBlockers(game: OrderGame, startX: number, icon: (n: number) => void): Blocker[] {
  let far = startX;
  return game.items.map((it, i) => {
    far = Math.max(far, it.x - 60);
    return {
      stopX: far,
      get cleared() { return game.got > i; },
      drawIcon: () => icon(i + 1),
      target: () => ({ x: it.x, y: it.y + 50 }),
    };
  });
}

// --------------------------------------------------------------- stars ----
export function starPicture(pts: { x: number; y: number }[], onDone: (w: World) => void): OrderGame {
  const items: OrderItem[] = pts.map((p, i) => ({
    x: p.x, y: p.y,
    draw(lit, wiggle, next) {
      const wg = wiggle > 0 ? Math.sin(wiggle * 40) * 4 : 0;
      ctx.save(); ctx.translate(wg, 0); ctx.rotate(Math.sin(V.time + i) * 0.1);
      ctx.fillStyle = lit ? '#fff3a8' : 'rgba(230,230,255,0.7)';
      star(0, 0, lit ? 26 : 20, -Math.PI / 2);
      ctx.restore();
      if (next) touchGlow(0, 0, 54);
      ctx.save(); ctx.translate(0, 34); numberBadge(i + 1, lit, 13); ctx.restore();
    },
  }));
  const g = new OrderGame(items, onDone, 56);
  g.lines = true;
  return g;
}

// -------------------------------------------------------------- owlets ----
export class Owlet implements Entity {
  z = 1;
  state: 'lost' | 'follow' | 'home' = 'lost';
  trail: Trail;
  x: number; y: number;
  seat = { x: 0, y: 0 };
  constructor(x: number, y: number, delay: number, public school: OwlSchool) {
    this.x = x; this.y = y; this.trail = new Trail(delay, -66);
    school.owlets.push(this);
  }
  update(w: World, dt: number): void {
    if (this.state === 'lost') {
      if (w.mode === 'play' && playerNear(w, this.x, this.y - 20, 60)) {
        this.state = 'follow'; this.trail.reset(this.x, this.y); Sound.happy(); sparkleBurst(this.x, this.y - 20, 10);
      }
    } else if (this.state === 'follow') {
      this.trail.update(w, dt); this.x = this.trail.x; this.y = this.trail.y + 20;
      if (playerNear(w, this.school.x, this.school.y - 40, 160)) {
        this.state = 'home'; this.seat = this.school.seatFor(this); Sound.happy();
      }
    } else {
      this.x += (this.seat.x - this.x) * Math.min(1, dt * 4); this.y += (this.seat.y - this.y) * Math.min(1, dt * 4);
    }
  }
  draw(): void {
    if (!visible(this.x - 40, this.x + 40)) return;
    const flap = this.state === 'follow' ? Math.abs(Math.sin(V.time * 14)) * 0.9 : 0;
    ctx.save(); ctx.translate(this.x, this.y + (this.state === 'lost' ? Math.sin(V.time * 3 + this.x) * 2 : 0));
    drawOwl(0.7, { flap, sleepy: false });
    ctx.restore();
  }
  drawOver(w: World): void {
    if (this.state !== 'lost' || !playerNear(w, this.x, this.y, 400)) return;
    drawBubble(this.x, this.y - 60, 1, 60, () => { ctx.save(); ctx.translate(0, 22); drawOwl(0.5, {}); ctx.restore(); });
  }
}

// A school branch with a teacher owl; when all owlets sit there, it is time for the clock.
export class OwlSchool implements Entity {
  z = -1;
  owlets: Owlet[] = [];
  constructor(public x: number, public y: number) {}
  get full() { return this.owlets.length > 0 && this.owlets.every(o => o.state === 'home'); }
  seatFor(o: Owlet) { const i = this.owlets.filter(k => k.state === 'home').indexOf(o); return { x: this.x - 70 + i * 44, y: this.y }; }
  update(): void {}
  draw(w: World): void {
    if (!visible(this.x - 220, this.x + 220)) return;
    const gy = w.ground(this.x);
    ctx.fillStyle = '#5a4038'; ctx.fillRect(this.x + 70, this.y - 80, 34, gy - this.y + 84);
    ctx.fillStyle = '#6a4a3a'; ctx.fillRect(this.x - 110, this.y, 214, 14);
    ctx.fillStyle = '#4a6a5a'; ctx.fillRect(this.x - 100, this.y - 130, 150, 90);
    ctx.strokeStyle = '#8a5a3a'; ctx.lineWidth = 6; ctx.strokeRect(this.x - 100, this.y - 130, 150, 90);
    ctx.fillStyle = '#fff'; ctx.font = '700 26px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('1 2 3', this.x - 25, this.y - 86);
    ctx.save(); ctx.translate(this.x + 86, this.y - 80); drawOwl(1.1, { glasses: true }); ctx.restore();
  }
  drawOver(w: World): void {
    if (this.full || w.mode !== 'play' || Math.abs(w.player.x - this.x) > 600) return;
    const home = this.owlets.filter(o => o.state === 'home').length;
    drawBubble(this.x - 25, this.y - 150, 1, 90, () => {
      for (let i = 0; i < this.owlets.length; i++) { ctx.save(); ctx.translate(-26 + i * 26, 18); ctx.globalAlpha = i < home ? 1 : 0.3; drawOwl(0.42, {}); ctx.restore(); }
    });
  }
}

// --------------------------------------------------------------- foxes ----
export function drawFox(s: number, happy: boolean): void {
  ctx.save(); ctx.scale(s, s);
  ctx.fillStyle = '#e8763a';
  ctx.beginPath(); ctx.moveTo(-14, -16); ctx.quadraticCurveTo(-44, -18, -46, -36); ctx.quadraticCurveTo(-30, -26, -12, -26); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-44, -34, 6, 4, -0.6, 0, TAU); ctx.fill();
  ctx.fillStyle = '#e8763a'; ctx.beginPath(); ctx.ellipse(-2, -16, 18, 12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2d2438'; for (const x of [-12, 8]) { ctx.beginPath(); ctx.ellipse(x, -3, 3.5, 5, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#e8763a'; circle(ctx, 16, -26, 12);
  ctx.beginPath(); ctx.moveTo(8, -34); ctx.lineTo(8, -48); ctx.lineTo(16, -36); ctx.fill();
  ctx.beginPath(); ctx.moveTo(18, -36); ctx.lineTo(24, -48); ctx.lineTo(26, -32); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(20, -24); ctx.quadraticCurveTo(34, -22, 30, -16); ctx.quadraticCurveTo(22, -14, 16, -18); ctx.fill();
  ctx.fillStyle = '#2d2438'; circle(ctx, 32, -20, 2.4); circle(ctx, 19, -29, 2.2);
  if (happy) { ctx.strokeStyle = '#2d2438'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(26, -17, 2.4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
  ctx.restore();
}

// A bush with a fox tail sticking out. Touch it → the cub pops out and runs home.
export class HidingCub implements Entity {
  z = 1;
  found = false;
  t = 0;
  constructor(public x: number, public homeX: number, public y?: number) {}
  baseY(w: World) { return this.y ?? w.ground(this.x); }
  update(w: World, dt: number): void {
    if (!this.found && w.mode === 'play' && playerNear(w, this.x, this.baseY(w) - 30, 70)) {
      this.found = true; Sound.happy(); sparkleBurst(this.x, this.baseY(w) - 40, 14, ['#ffb070', '#ffffff']);
    }
    if (this.found) this.t += dt;
  }
  // a steady little run home, however far it is (about 300 px a second)
  get runTime() { return Math.max(1.5, Math.abs(this.homeX - this.x) / 300); }
  get home() { return this.found && this.t > this.runTime; }
  draw(w: World): void {
    const by = this.baseY(w);
    if (this.found) {
      const u = clamp(this.t / this.runTime, 0, 1), x = this.x + (this.homeX - this.x) * u;
      const hop = Math.abs(Math.sin(this.t * 9)) * 12 * (u < 1 ? 1 : 0);
      if (u < 1 && visible(x - 50, x + 50)) {
        ctx.save(); ctx.translate(x, (this.y != null ? by + (w.ground(this.homeX) - by) * u : w.ground(x)) - hop); ctx.scale(this.homeX < this.x ? -1 : 1, 1); drawFox(0.8, true); ctx.restore();
      }
    }
    if (!visible(this.x - 80, this.x + 80)) return;
    if (!this.found) {
      // tail peeking out, wagging
      ctx.save(); ctx.translate(this.x + 34, by - 14); ctx.rotate(Math.sin(V.time * 3 + this.x) * 0.3);
      ctx.fillStyle = '#e8763a'; ctx.beginPath(); ctx.ellipse(14, -6, 16, 7, -0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(26, -13, 5, 4, -0.5, 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#2a5448';
    for (const [dx, dy, r] of [[-26, -18, 24], [0, -30, 30], [24, -18, 24], [10, -10, 22]]) circle(ctx, this.x + dx, by + dy, r);
    ctx.fillStyle = '#3e7060';
    for (const [dx, dy, r] of [[-20, -26, 12], [6, -40, 14]]) circle(ctx, this.x + dx, by + dy, r);
  }
}

// Mama fox at her den counts the cubs coming home.
export class FoxDen implements Entity {
  z = -1;
  done = false;
  constructor(public x: number, public cubs: HidingCub[]) {}
  update(w: World): void {
    if (!this.done && this.cubs.every(c => c.home) && w.mode === 'play') {
      this.done = true; Sound.magic(); win(w, { x: this.x + 160, y: w.ground(this.x) - 180 });
    }
  }
  draw(w: World): void {
    if (!visible(this.x - 200, this.x + 200)) return;
    const gy = w.ground(this.x);
    ctx.fillStyle = '#5a4a3a'; ctx.beginPath(); ctx.ellipse(this.x, gy + 4, 120, 90, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#2a1e1e'; ctx.beginPath(); ctx.ellipse(this.x + 10, gy + 4, 46, 40, 0, Math.PI, 0); ctx.fill();
    ctx.save(); ctx.translate(this.x - 70, gy - 4); drawFox(1.3, true); ctx.restore();
    const home = this.cubs.filter(c => c.home).length;
    for (let i = 0; i < home; i++) { ctx.save(); ctx.translate(this.x - 10 + i * 30, gy - 2); drawFox(0.7, true); ctx.restore(); }
  }
  drawOver(w: World): void {
    if (this.done || w.mode !== 'play') return;
    const gy = w.ground(this.x), home = this.cubs.filter(c => c.home).length;
    if (Math.abs(w.player.x - this.x) > 700) return;
    drawBubble(this.x - 70, gy - 90, 1, 100, () => {
      for (let i = 0; i < this.cubs.length; i++) { ctx.save(); ctx.translate(-30 + (i % 2) * 34, -6 + Math.floor(i / 2) * 26); ctx.globalAlpha = i < home ? 1 : 0.3; drawFox(0.45, true); ctx.restore(); }
    });
  }
}

// -------------------------------------------------------------- moths ----
export const MOTH_COLS = ['#ff6b8a', '#ffd166', '#7ee08a', '#6cc4ff'];

// A lantern on a pole; it lights up in its colour when it "sings" (in the moths' song game).
export class MothLantern implements Entity, Singer {
  z = 0;
  noT = 0;
  jumpT = -1;
  singT = 0;
  onTouch: (() => void) | null = null;
  wasNear = false;
  constructor(public x: number, public y: number, public col: string, public note: number) {}
  sing(): void { this.singT = 0.7; Sound.note(this.note); }
  update(w: World, dt: number): void {
    this.singT = Math.max(0, this.singT - dt); this.noT = Math.max(0, this.noT - dt);
    if (this.jumpT >= 0) this.jumpT += dt;
    const near = w.mode === 'play' && playerNear(w, this.x, this.y, 60);
    if (near && !this.wasNear) this.onTouch?.();
    this.wasNear = near;
  }
  draw(w: World): void {
    if (!visible(this.x - 80, this.x + 80)) return;
    const gy = w.ground(this.x), on = this.singT > 0 || this.jumpT >= 0, sh = this.noT > 0 ? Math.sin(this.noT * 40) * 4 : 0;
    ctx.fillStyle = '#4a3a3a'; ctx.fillRect(this.x - 4, this.y + 20, 8, gy - this.y - 16);
    ctx.save(); ctx.translate(this.x + sh, this.y);
    ctx.fillStyle = on ? this.col : '#5a5478';
    ctx.beginPath(); ctx.ellipse(0, 0, 22, 28, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = this.col; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#3a2e3a'; ctx.fillRect(-12, -32, 24, 6); ctx.fillRect(-10, 26, 20, 6);
    ctx.restore();
    // moths dancing around a lit lantern
    if (on) for (let i = 0; i < 3; i++) {
      const a = V.time * 4 + i * TAU / 3;
      drawMoth(this.x + Math.cos(a) * 36, this.y + Math.sin(a) * 20, '#f6e7d8');
    }
  }
  drawLight(): void {
    const on = this.singT > 0 || this.jumpT >= 0;
    const n = parseInt(this.col.slice(1), 16);
    glow(this.x, this.y, on ? 140 : 40, `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},A)`, on ? 0.6 : 0.2);
  }
}

export function drawMoth(x: number, y: number, col: string): void {
  const f = Math.abs(Math.sin(V.time * 18 + x));
  ctx.save(); ctx.translate(x, y); ctx.scale(0.3 + f * 0.7, 1);
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(-7, -3, 8, 6, -0.5, 0, TAU); ctx.ellipse(7, -3, 8, 6, 0.5, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#8a7a6a'; ctx.fillRect(x - 1, y - 6, 2, 10);
}

// ------------------------------------------------------- moon festival ----
// A stage under the moon where all the night friends dance at the end.
export class MoonStage implements Entity {
  z = -1;
  open = false;
  danceT = -1;
  constructor(public x: number) {}
  update(w: World, dt: number): void {
    if (this.open && this.danceT < 0 && w.mode === 'play' && Math.abs(w.player.x - this.x) < 200) { this.danceT = 0; Sound.finale(); }
    if (this.danceT >= 0) {
      this.danceT += dt;
      if (this.danceT > 2 && w.mode === 'play') win(w, { x: this.x, y: w.ground(this.x) - 260 });
    }
  }
  draw(w: World): void {
    if (!visible(this.x - 400, this.x + 400)) return;
    const gy = w.ground(this.x), d = this.danceT >= 0 ? this.danceT : 0, hop = (k: number) => this.danceT >= 0 ? Math.abs(Math.sin(d * 6 + k)) * 16 : 0;
    ctx.fillStyle = '#8a6a4a'; ctx.fillRect(this.x - 300, gy - 40, 600, 44);
    ctx.fillStyle = '#a8885a'; ctx.fillRect(this.x - 300, gy - 44, 600, 10);
    const friends: [number, () => void][] = [
      [-220, () => drawOwl(1.2, { glasses: true, flap: this.danceT >= 0 ? Math.abs(Math.sin(d * 10)) : 0 })],
      [-110, () => drawBadger(1.1, false, d * 10)],
      [0, () => { ctx.scale(1.2, 1.2); drawHedgehog(0); }],
      [100, () => { ctx.scale(1.3, 1.3); drawMouse(d * 10, true); }],
      [200, () => drawFox(1.1, true)],
    ];
    friends.forEach(([dx, f], i) => { ctx.save(); ctx.translate(this.x + dx, gy - 44 - hop(i)); f(); ctx.restore(); });
  }
  drawLight(w: World): void {
    const gy = w.ground(this.x);
    if (this.open) glow(this.x, gy - 120, 360, 'rgba(255,240,200,A)', 0.35);
  }
}

export const MOTH_ROUNDS = [[0, 2, 1], [3, 1, 0, 2]];
