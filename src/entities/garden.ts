import { ctx, V, visible } from '../engine/view';
import { glow, sparkleBurst, spawn } from '../engine/fx';
import { TAU, circle, clamp, ease, rr, mulberry32 } from '../util';
import { Sound } from '../sound';
import { playerNear, win } from '../game/world';
import { drawBubble } from '../render/hud';
import { drawFace, centerDisc, drawCanopy } from '../render/terrain';
import { Friend, touchGlow, type Blocker } from './friend';
import { Trail } from './follow';
import { Hand, type Thing } from './carry';
import type { Entity, World } from '../game/types';

// Chapter 3 pieces: seeds and growing, bees, colour mixing, vegetables, worms, seasons, rain, apples, winter.

// --------------------------------------------------------------- icons ----
export function drawSeed(s = 1): void {
  ctx.save(); ctx.scale(s, s);
  ctx.fillStyle = '#a8763f'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 13, 0.3, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(-3, -4, 2.5, 5, 0.3, 0, TAU); ctx.fill();
  ctx.restore();
}
export function drawDropIcon(s = 1, col = '#4aa8ff'): void {
  ctx.save(); ctx.scale(s, s); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, -16); ctx.bezierCurveTo(9, -5, 12, 2, 10, 7); ctx.arc(0, 7, 10, 0, Math.PI); ctx.bezierCurveTo(-12, 2, -9, -5, 0, -16); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(-3, 4, 2.5, 4, 0.3, 0, TAU); ctx.fill();
  ctx.restore();
}
export function drawSun(s = 1): void {
  ctx.save(); ctx.scale(s, s);
  ctx.strokeStyle = '#ffb820'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + V.time * 0.5; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 16, Math.sin(a) * 16); ctx.lineTo(Math.cos(a) * 24, Math.sin(a) * 24); ctx.stroke(); }
  ctx.fillStyle = '#ffd23f'; circle(ctx, 0, 0, 13);
  ctx.restore();
}
export function drawSnowflake(s = 1): void {
  ctx.save(); ctx.scale(s, s); ctx.strokeStyle = '#7ab8e8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(i * Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -18); ctx.moveTo(0, -11); ctx.lineTo(-5, -15); ctx.moveTo(0, -11); ctx.lineTo(5, -15); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
export function drawLeafIcon(s = 1, col = '#f29c4a'): void {
  ctx.save(); ctx.scale(s, s); ctx.rotate(-0.6); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, 16); ctx.quadraticCurveTo(-14, 0, 0, -18); ctx.quadraticCurveTo(14, 0, 0, 16); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 14); ctx.lineTo(0, -14); ctx.stroke();
  ctx.restore();
}
export function drawBlossom(s = 1): void {
  ctx.save(); ctx.scale(s, s); ctx.fillStyle = '#ffb3d6';
  for (let i = 0; i < 5; i++) { const a = i * TAU / 5 - Math.PI / 2; circle(ctx, Math.cos(a) * 8, Math.sin(a) * 8, 7); }
  ctx.fillStyle = '#ffd34d'; circle(ctx, 0, 0, 4.5);
  ctx.restore();
}
export function drawCloudIcon(s = 1, dark = false): void {
  ctx.save(); ctx.scale(s, s); ctx.fillStyle = dark ? '#9aa8c8' : '#ffffff';
  for (const [x, y, r] of [[-14, 2, 11], [0, -6, 14], [14, 2, 11], [0, 6, 10]]) circle(ctx, x, y, r);
  ctx.restore();
}

// ---------------------------------------------------------- 3-1 seed ----
export const SEED: Thing = { kind: 'seed', draw: () => drawSeed(1.2) };

// A patch of soil. Needs: seed → water → sun. Then a flower grows.
export class SeedPatch implements Entity {
  z = -1;
  stage = 0;          // 0 needs seed, 1 needs water, 2 needs sun, 3 growing
  grow = 0;
  wasNear = false;
  rainT = 0;
  constructor(public x: number, public hand: Hand) {}
  update(w: World, dt: number): void {
    const gy = w.ground(this.x);
    const near = w.mode === 'play' && playerNear(w, this.x, gy - 30, 80);
    if (near && !this.wasNear && this.stage === 0 && this.hand.holding?.kind === 'seed') {
      this.hand.holding = null; this.stage = 1; Sound.magic(); sparkleBurst(this.x, gy - 10, 12);
    }
    this.wasNear = near;
    this.rainT = Math.max(0, this.rainT - dt);
    if (this.rainT > 0 && Math.random() < 0.6) spawn({ kind: 'drop', x: this.x + (Math.random() - 0.5) * 120, y: gy - 230, vx: 0, vy: 380, g: 0, life: 0.55, max: 0.55, color: '#9fd8ff', drag: 0 });
    if (this.stage === 3) {
      this.grow = Math.min(1, this.grow + dt * 0.5);
      if (this.grow >= 1 && w.mode === 'play') win(w, { x: this.x - 140, y: gy - 200 });
    }
  }
  water(): void { if (this.stage === 1) { this.stage = 2; this.rainT = 2; Sound.splash(); } }
  shine(): void { if (this.stage === 2) { this.stage = 3; Sound.finale(); } }
  draw(w: World): void {
    if (!visible(this.x - 200, this.x + 200)) return;
    const gy = w.ground(this.x);
    ctx.fillStyle = this.stage >= 2 ? '#6a4632' : '#9a7050';
    ctx.beginPath(); ctx.ellipse(this.x, gy + 2, 70, 16, 0, Math.PI, 0); ctx.fill();
    if (this.stage === 0) touchGlow(this.x, gy - 10, 70);
    if (this.stage >= 1 && this.stage < 3) { ctx.fillStyle = '#5cbf5a'; ctx.fillRect(this.x - 2, gy - 14, 4, 14); ctx.beginPath(); ctx.ellipse(this.x + 6, gy - 14, 7, 3.5, -0.4, 0, TAU); ctx.fill(); }
    if (this.stage >= 2 && this.stage < 3) { ctx.beginPath(); ctx.ellipse(this.x - 6, gy - 20, 7, 3.5, 0.4, 0, TAU); ctx.fill(); }
    if (this.stage === 3) {
      const h = 40 + ease(this.grow) * 170, o = ease(clamp((this.grow - 0.4) / 0.6, 0, 1));
      ctx.strokeStyle = '#3d9a45'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(this.x, gy); ctx.quadraticCurveTo(this.x - 14, gy - h / 2, this.x, gy - h); ctx.stroke();
      ctx.save(); ctx.translate(this.x, gy - h);
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ctx.fillStyle = i % 2 ? '#ff8fc7' : '#ffb3d6'; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 30 * o, Math.sin(a) * 30 * o, 18 * o + 2, 9 * o + 2, a, 0, TAU); ctx.fill(); }
      if (o > 0.1) { ctx.scale(o, o); centerDisc(16); drawFace(16, true); }
      ctx.restore();
    }
  }
  drawOver(w: World): void {
    if (this.stage >= 3 || w.mode !== 'play' || Math.abs(w.player.x - this.x) > 700) return;
    const gy = w.ground(this.x);
    drawBubble(this.x, gy - 70, 1, 64, () => { if (this.stage === 0) drawSeed(1.4); else if (this.stage === 1) drawDropIcon(1.4); else drawSun(1.1); });
  }
}

// A rain cloud or the sun up in the sky: touch it and it helps the patch.
export class SkyHelper implements Entity {
  z = 1;
  used = false;
  constructor(public x: number, public y: number, public kind: 'rain' | 'sun', public patch: SeedPatch) {}
  ready() { return this.kind === 'rain' ? this.patch.stage === 1 : this.patch.stage === 2; }
  update(w: World): void {
    if (!this.used && this.ready() && w.mode === 'play' && playerNear(w, this.x, this.y, 80)) {
      this.used = true; sparkleBurst(this.x, this.y, 16);
      if (this.kind === 'rain') this.patch.water(); else this.patch.shine();
    }
  }
  draw(): void {
    if (!visible(this.x - 100, this.x + 100)) return;
    const k = this.used ? 0.6 : 1;
    if (this.ready() && !this.used) touchGlow(this.x, this.y, 80);
    ctx.save(); ctx.translate(this.x, this.y + Math.sin(V.time * 1.5 + this.x) * 6);
    if (this.kind === 'rain') drawCloudIcon(2.6 * k, true); else drawSun(2.2 * k);
    ctx.restore();
  }
}

// ---------------------------------------------------------- 3-2 bees ----
export function drawBee(moving: boolean): void {
  const f = moving ? Math.abs(Math.sin(V.time * 30)) : Math.abs(Math.sin(V.time * 12)) * 0.6;
  ctx.fillStyle = 'rgba(230,245,255,0.85)';
  ctx.save(); ctx.scale(1, 0.4 + f * 0.6); ctx.beginPath(); ctx.ellipse(-3, -14, 7, 10, -0.4, 0, TAU); ctx.ellipse(5, -14, 7, 10, 0.4, 0, TAU); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 9, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#3a2e3a'; ctx.fillRect(-5, -8, 3.5, 16); ctx.fillRect(2, -8, 3.5, 16);
  ctx.fillStyle = '#3a2e3a'; circle(ctx, 12, -1, 5);
  ctx.fillStyle = '#fff'; circle(ctx, 13.5, -2.5, 1.6);
}
export function drawHive(): void {
  ctx.fillStyle = '#6a4a3a'; ctx.fillRect(-4, -170, 8, 60);
  for (let i = 0; i < 5; i++) { ctx.fillStyle = i % 2 ? '#f0b040' : '#ffc850'; rr(ctx, -40 + i * 4, -110 + i * 18, 80 - i * 8, 20, 10); ctx.fill(); }
  ctx.fillStyle = '#5a3a2a'; ctx.beginPath(); ctx.ellipse(0, -30, 10, 8, 0, 0, TAU); ctx.fill();
}

// ------------------------------------------------------ 3-3 colour mix ----
export const MIX: Record<string, string> = {
  red: '#ff5a6e', yellow: '#ffd23f', blue: '#4aa8ff',
  orange: '#ff9a3c', green: '#5cc85a', purple: '#a874e8',
};
const MIXES: Record<string, string> = { 'red+yellow': 'orange', 'blue+yellow': 'green', 'blue+red': 'purple' };
export function mixOf(a: string, b: string): string | null { return MIXES[[a, b].sort().join('+')] ?? null; }

// What the fairy carries: one paint, or a mix of two.
export class Palette implements Entity {
  z = 1;
  color: string | null = null;
  trail = new Trail(14, -70);
  update(w: World, dt: number): void { this.trail.update(w, dt); }
  add(c: string, w: World): void {
    if (!this.color) { this.trail.reset(w.player.x, w.player.y - 70); this.color = c; return; }
    this.color = mixOf(this.color, c) ?? c;
  }
  draw(): void {
    if (!this.color) return;
    ctx.save(); ctx.translate(this.trail.x, this.trail.y + Math.sin(V.time * 4) * 4); drawDropIcon(1.3, MIX[this.color]); ctx.restore();
  }
  drawLight(): void { if (this.color) glow(this.trail.x, this.trail.y, 46, 'rgba(255,255,255,A)', 0.4); }
}

export class MixPot implements Entity {
  z = 0;
  wasNear = false;
  constructor(public x: number, public color: string | null, public pal: Palette, public y?: number) {}   // null = water to wash
  update(w: World): void {
    const by = this.y ?? w.ground(this.x);
    const near = w.mode === 'play' && playerNear(w, this.x, by - 30, 60);
    if (near && !this.wasNear) {
      if (this.color) { this.pal.add(this.color, w); Sound.magic(); sparkleBurst(this.x, by - 40, 10, [MIX[this.color], '#fff']); }
      else if (this.pal.color) { this.pal.color = null; Sound.splash(); }
    }
    this.wasNear = near;
  }
  draw(w: World): void {
    if (!visible(this.x - 60, this.x + 60)) return;
    const by = this.y ?? w.ground(this.x);
    ctx.fillStyle = this.color ? '#c98a4b' : '#8ab8d8'; rr(ctx, this.x - 24, by - 40, 48, 40, 12); ctx.fill();
    ctx.fillStyle = this.color ? MIX[this.color] : '#cfeaff'; ctx.beginPath(); ctx.ellipse(this.x, by - 38, 20, 6, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(this.x, by - 66 + Math.sin(V.time * 3 + this.x) * 3);
    if (this.color) drawDropIcon(0.9, MIX[this.color]);
    else { ctx.strokeStyle = '#4aa8ff'; ctx.lineWidth = 3; for (const y of [-6, 2]) { ctx.beginPath(); ctx.moveTo(-12, y); ctx.quadraticCurveTo(-6, y - 4, 0, y); ctx.quadraticCurveTo(6, y + 4, 12, y); ctx.stroke(); } }
    ctx.restore();
  }
}

// A pale butterfly that wants a mixed colour on its wings.
export class PaleButterfly implements Entity {
  z = 0;
  done = false;
  noT = 0;
  wasNear = false;
  t = Math.random() * 10;
  constructor(public x: number, public y: number, public want: string, public pal: Palette) {}
  pos() { return { x: this.x + Math.sin(this.t * 0.7) * 40, y: this.y + Math.sin(this.t * 1.3) * 16 }; }
  update(w: World, dt: number): void {
    this.t += dt; this.noT = Math.max(0, this.noT - dt);
    const p = this.pos();
    const near = w.mode === 'play' && playerNear(w, p.x, p.y, 64);
    if (near && !this.wasNear && !this.done && this.pal.color) {
      if (this.pal.color === this.want) { this.done = true; this.pal.color = null; Sound.happy(); Sound.magic(); sparkleBurst(p.x, p.y, 20, [MIX[this.want], '#fff']); }
      else { this.noT = 0.5; Sound.oops(); }
    }
    this.wasNear = near;
  }
  draw(): void {
    const p = this.pos();
    if (!visible(p.x - 60, p.x + 60)) return;
    const f = Math.abs(Math.sin(this.t * (this.done ? 12 : 5))), col = this.done ? MIX[this.want] : '#e8e4f0';
    ctx.save(); ctx.translate(p.x + (this.noT > 0 ? Math.sin(this.noT * 40) * 4 : 0), p.y); ctx.scale(1.8, 1.8);
    ctx.save(); ctx.scale(0.3 + f * 0.7, 1); ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(-9, -6, 10, 8, -0.6, 0, TAU); ctx.ellipse(9, -6, 10, 8, 0.6, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-6, 6, 6, 5, 0.5, 0, TAU); ctx.ellipse(6, 6, 6, 5, -0.5, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; circle(ctx, -12, -8, 2.5); circle(ctx, 12, -8, 2.5);
    ctx.restore();
    ctx.fillStyle = '#5b3a6a'; ctx.fillRect(-1.2, -9, 2.4, 18);
    ctx.restore();
  }
  drawOver(w: World): void {
    if (this.done || !playerNear(w, this.x, this.y, 460)) return;
    const p = this.pos();
    drawBubble(p.x, p.y - 34, 1, 58, () => drawDropIcon(1.3, MIX[this.want]));
  }
}

// ---------------------------------------------------- 3-4 vegetables ----
export const CARROT: Thing = { kind: 'carrot', draw() {
  ctx.fillStyle = '#ff8a3a'; ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(8, -10); ctx.lineTo(0, 20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5cbf5a'; for (const a of [-0.5, 0, 0.5]) { ctx.save(); ctx.translate(0, -10); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, -9, 3, 9, 0, 0, TAU); ctx.fill(); ctx.restore(); }
} };
export const PUMPKIN: Thing = { kind: 'pumpkin', draw() {
  ctx.fillStyle = '#ff9a2a'; for (const [x, r] of [[-10, 12], [10, 12], [0, 14]]) { ctx.beginPath(); ctx.ellipse(x, 4, r * 0.8, 13, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = 'rgba(160,80,20,0.4)'; ctx.lineWidth = 2; for (const x of [-6, 6]) { ctx.beginPath(); ctx.moveTo(x, -8); ctx.lineTo(x, 16); ctx.stroke(); }
  ctx.fillStyle = '#6a8a3a'; ctx.fillRect(-2, -14, 4, 6);
} };
export const PEAS: Thing = { kind: 'peas', draw() {
  ctx.fillStyle = '#5cbf5a'; ctx.beginPath(); ctx.ellipse(0, 0, 20, 8, -0.3, 0, TAU); ctx.fill();
  ctx.fillStyle = '#9be86e'; for (const x of [-10, 0, 10]) circle(ctx, x, -x * 0.3, 4.5);
} };

// A garden bed showing the outline of the vegetable it wants.
export function bedLook(want: Thing, need: number) {
  return (count: number): void => {
    ctx.fillStyle = '#7a5038'; rr(ctx, -70, -10, 140, 22, 10); ctx.fill();
    for (let i = 0; i < need; i++) {
      ctx.save(); ctx.translate(-40 + i * 40, -22);
      if (i < count) want.draw();
      else { ctx.globalAlpha = 0.25; ctx.filter = 'grayscale(1)'; want.draw(); ctx.filter = 'none'; }
      ctx.restore();
    }
  };
}

export function drawRabbit(happy: boolean): void {
  ctx.fillStyle = '#f2ece6';
  ctx.beginPath(); ctx.ellipse(-4, -18, 20, 16, 0, 0, TAU); ctx.fill();
  circle(ctx, 14, -34, 12);
  for (const d of [0, 7]) { ctx.beginPath(); ctx.ellipse(10 + d, -58, 4.5, 14, 0.15 * (d ? 1 : -1), 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#ffc6d6'; for (const d of [0, 7]) { ctx.beginPath(); ctx.ellipse(10 + d, -58, 2, 10, 0.15 * (d ? 1 : -1), 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#ffffff'; circle(ctx, -22, -18, 6);
  ctx.fillStyle = '#2d2438'; circle(ctx, 19, -36, 2.4);
  ctx.fillStyle = '#ff8fb0'; circle(ctx, 25, -31, 2.2);
  ctx.strokeStyle = '#2d2438'; ctx.lineWidth = 1.3; ctx.beginPath();
  if (happy) ctx.arc(21, -28, 2.5, 0.15 * Math.PI, 0.85 * Math.PI); else ctx.arc(21, -25, 2.4, 1.2 * Math.PI, 1.8 * Math.PI);
  ctx.stroke();
}

// --------------------------------------------------------- 3-5 worm ----
function drawWormBody(walk: number): void {
  ctx.fillStyle = '#ff9aa8';
  for (let i = 0; i < 6; i++) circle(ctx, -30 + i * 10, -8 - Math.abs(Math.sin(walk + i * 0.8)) * 6, 8 - Math.abs(i - 3) * 0.4);
  ctx.fillStyle = '#2d2438'; circle(ctx, 24, -14, 2.2);
  ctx.strokeStyle = '#2d2438'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(25, -9, 2.4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
}
export class Worm extends Friend {
  height = 30;
  constructor(x: number, homeX: number) { super(x, 40, homeX); }
  drawMini(): void { ctx.translate(-2, 8); drawWormBody(0); }
  drawBody(_w: World, moving: boolean): void { ctx.scale(1.4, 1.4); drawWormBody(moving ? this.walkT * 6 : V.time * 2); }
}

// A hard lump of dry soil. Touch it → it crumbles and the worm can go on.
export class Clod implements Entity, Blocker {
  z = 1;
  cleared = false;
  t = -1;
  stopX: number;
  constructor(public x: number) { this.stopX = x - 80; }
  target(w: World) { return { x: this.x, y: w.ground(this.x) - 50 }; }
  update(w: World, dt: number): void {
    const gy = w.ground(this.x);
    if (this.t < 0 && w.mode === 'play' && playerNear(w, this.x, gy - 24, 70)) {
      this.t = 0; Sound.thud(); sparkleBurst(this.x, gy - 20, 10, ['#c8a070', '#ffffff']);
      for (let i = 0; i < 10; i++) spawn({ kind: 'dust', x: this.x + (Math.random() - 0.5) * 50, y: gy - 20, vx: (Math.random() - 0.5) * 160, vy: -100 - Math.random() * 80, g: 400, life: 0.8, max: 0.8, size: 5, color: '#a8784a', drag: 1 });
    }
    if (this.t >= 0) { this.t += dt; if (this.t > 0.3) this.cleared = true; }
  }
  draw(w: World): void {
    if (this.t > 0.4 || !visible(this.x - 80, this.x + 80)) return;
    const gy = w.ground(this.x), k = this.t < 0 ? 1 : 1 - this.t * 2;
    if (this.t < 0) touchGlow(this.x, gy - 24, 64);
    ctx.save(); ctx.translate(this.x, gy); ctx.scale(k, k);
    ctx.fillStyle = '#8a6240'; ctx.beginPath(); ctx.moveTo(-44, 2); ctx.lineTo(-34, -36); ctx.lineTo(-4, -50); ctx.lineTo(30, -40); ctx.lineTo(46, 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,20,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, -30); ctx.lineTo(-6, -12); ctx.lineTo(10, -34); ctx.stroke();
    ctx.restore();
  }
  drawIcon(): void { ctx.fillStyle = '#8a6240'; ctx.beginPath(); ctx.moveTo(-20, 14); ctx.lineTo(-14, -6); ctx.lineTo(0, -14); ctx.lineTo(16, -8); ctx.lineTo(20, 14); ctx.closePath(); ctx.fill(); }
}

// A thirsty plant whose roots the worm reaches at the end.
export class ThirstyFlower implements Entity {
  z = -1;
  happy = false;
  constructor(public x: number) {}
  update(): void {}
  draw(w: World): void {
    if (!visible(this.x - 100, this.x + 100)) return;
    const gy = w.ground(this.x), droop = this.happy ? 0 : 0.6;
    ctx.strokeStyle = '#3d9a45'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(this.x, gy); ctx.quadraticCurveTo(this.x, gy - 60, this.x + droop * 40, gy - 110 + droop * 30); ctx.stroke();
    ctx.save(); ctx.translate(this.x + droop * 40, gy - 110 + droop * 30); ctx.rotate(droop);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ctx.fillStyle = this.happy ? '#ffd166' : '#c8b890'; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 18, Math.sin(a) * 18, 12, 6, a, 0, TAU); ctx.fill(); }
    centerDisc(10); drawFace(10, this.happy);
    ctx.restore();
    // roots under the ground
    ctx.strokeStyle = this.happy ? '#a8e0ff' : '#c8a878'; ctx.lineWidth = 3;
    for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(this.x, gy + 4); ctx.quadraticCurveTo(this.x + d * 20, gy + 30, this.x + d * 34, gy + 60); ctx.stroke(); }
  }
}

// ------------------------------------------------------ 3-6 seasons ----
export const SEASONS: (() => void)[] = [
  () => drawBlossom(1.6),
  () => drawSun(1.1),
  () => drawLeafIcon(1.4),
  () => drawSnowflake(1.4),
];

export class SeasonTree implements Entity {
  z = -1;
  stage = 0;      // how many seasons are back in place
  canopy: { x: number; y: number; r: number }[] = [];
  constructor(public x: number) {
    const r = mulberry32(x);
    for (let i = 0; i < 26; i++) this.canopy.push({ x: x + (r() - 0.5) * 360, y: -220 + (r() - 0.5) * 140, r: 44 + r() * 34 });
    this.canopy.sort((a, b) => a.y - b.y);
  }
  update(): void {}
  draw(w: World): void {
    if (!visible(this.x - 260, this.x + 260)) return;
    const gy = w.ground(this.x);
    ctx.fillStyle = '#6a4a3a'; ctx.beginPath(); ctx.moveTo(this.x - 50, gy + 10); ctx.lineTo(this.x - 26, gy - 200); ctx.lineTo(this.x + 26, gy - 200); ctx.lineTo(this.x + 50, gy + 10); ctx.fill();
    const cols = [['#6a6a6a', '#8a8a8a', '#a8a8a8'], ['#d88ab8', '#f2a8cf', '#ffd6e8'], ['#2f8a4f', '#45a85a', '#7fd06e'], ['#d06a36', '#f29c4a', '#ffc46a'], ['#9ab8d0', '#c8dcea', '#ffffff']];
    ctx.save(); ctx.translate(0, gy);
    drawCanopy(this.canopy, cols[Math.min(this.stage, 4)]);
    ctx.restore();
    if (this.stage === 0) { ctx.fillStyle = '#7d6bb8'; ctx.font = '700 40px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', this.x, gy - 230); }
  }
}

// ------------------------------------------------------- 3-7 rain ----
export const RAIN_CLOUD: Thing = { kind: 'cloud', draw: () => drawCloudIcon(1.8, true) };

// A dry patch of flowers that wilts; bring a rain cloud over it.
export function dryPatchLook(count: number): void {
  const wet = count > 0;
  ctx.fillStyle = wet ? '#6a4632' : '#c8a070'; ctx.beginPath(); ctx.ellipse(0, 248, 90, 14, 0, Math.PI, 0); ctx.fill();
  for (let i = -2; i <= 2; i++) {
    const x = i * 32, h = wet ? 60 : 34;
    ctx.strokeStyle = wet ? '#3d9a45' : '#9a9a5a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, 246); ctx.quadraticCurveTo(x + (wet ? 0 : 10), 246 - h / 2, x + (wet ? 0 : 16), 246 - h); ctx.stroke();
    ctx.save(); ctx.translate(x + (wet ? 0 : 16), 246 - h); ctx.fillStyle = wet ? ['#ff8fc7', '#ffd166', '#b9a0ff'][(i + 3) % 3] : '#b8a888';
    for (let k = 0; k < 5; k++) { const a = k * TAU / 5; circle(ctx, Math.cos(a) * 6, Math.sin(a) * 6, 5); }
    ctx.restore();
  }
  if (wet) for (let k = 0; k < 3; k++) { ctx.save(); ctx.translate(-40 + k * 40, -10 + Math.sin(V.time * 2 + k) * 4); drawCloudIcon(1.6, true); ctx.restore(); }
}

// ------------------------------------------------------ 3-8 apples ----
const appleThing = (kind: string, size: number, col: string): Thing => ({ kind, draw() {
  ctx.save(); ctx.scale(size, size);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(-4, 2, 10, 0, TAU); ctx.arc(4, 2, 10, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; circle(ctx, -6, -2, 3);
  ctx.strokeStyle = '#6a4a2a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(1, -13); ctx.stroke();
  ctx.restore();
} });
export const BIG_APPLE = appleThing('big', 1.6, '#e8455a');
export const SMALL_APPLE = appleThing('small', 0.9, '#e8455a');
export const RED_APPLE = appleThing('red', 1.2, '#e8455a');
export const GREEN_APPLE = appleThing('green', 1.2, '#7ed04a');

export function basketLook(icon: Thing) {
  return (count: number): void => {
    ctx.fillStyle = '#b8824a'; ctx.beginPath(); ctx.moveTo(-50, -30); ctx.lineTo(50, -30); ctx.lineTo(38, 8); ctx.lineTo(-38, 8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#8a5a2a'; ctx.lineWidth = 3; for (let x = -40; x <= 40; x += 16) { ctx.beginPath(); ctx.moveTo(x, -28); ctx.lineTo(x * 0.8, 6); ctx.stroke(); }
    for (let i = 0; i < count; i++) { ctx.save(); ctx.translate(-30 + (i % 4) * 20, -36 - Math.floor(i / 4) * 12); ctx.scale(0.6, 0.6); icon.draw(); ctx.restore(); }
    ctx.save(); ctx.translate(0, -70); ctx.fillStyle = 'rgba(255,255,255,0.9)'; circle(ctx, 0, 0, 26); icon.draw(); ctx.restore();
  };
}

// ------------------------------------------------------ 3-9 winter ----
export const BIRD_SEED: Thing = { kind: 'seeds', draw() { ctx.fillStyle = '#c8a070'; for (const [x, y] of [[-8, 2], [0, -4], [8, 2], [-4, 6], [4, 6], [0, 2]]) { ctx.beginPath(); ctx.ellipse(x, y, 4, 2.5, x * 0.1, 0, TAU); ctx.fill(); } } };
export const SNOWBALLS: Thing[] = [3, 2, 1].map(k => ({ kind: `snow${k}`, draw() { ctx.fillStyle = '#ffffff'; circle(ctx, 0, 0, 8 + k * 6); ctx.strokeStyle = '#c8dcea'; ctx.lineWidth = 2; ctx.stroke(); } }));

export function feederLook(count: number): void {
  ctx.fillStyle = '#6a4a3a'; ctx.fillRect(-4, -10, 8, 130);
  ctx.fillStyle = '#c98a4b'; rr(ctx, -40, -26, 80, 18, 6); ctx.fill();
  ctx.fillStyle = '#e8455a'; ctx.beginPath(); ctx.moveTo(-48, -40); ctx.lineTo(0, -70); ctx.lineTo(48, -40); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(-48, -42, 96, 5);
  if (count > 0) {
    ctx.fillStyle = '#c8a070'; for (let i = 0; i < 10; i++) circle(ctx, -30 + i * 6.5, -28, 3);
    for (const [x, c] of [[-22, '#e8455a'], [18, '#6aaee8']] as [number, string][]) {
      ctx.save(); ctx.translate(x, -36 - Math.abs(Math.sin(V.time * 6 + x)) * 3);
      ctx.fillStyle = c; circle(ctx, 0, 0, 9); ctx.fillStyle = '#ff9a3c'; ctx.beginPath(); ctx.moveTo(8, -2); ctx.lineTo(14, 0); ctx.lineTo(8, 2); ctx.fill();
      ctx.fillStyle = '#2d2438'; circle(ctx, 4, -3, 1.6); ctx.restore();
    }
  }
}

export function snowmanLook(count: number): void {
  const rs = [26, 20, 14];
  let y = 0;
  for (let i = 0; i < 3; i++) {
    const r = rs[i];
    y -= r;
    ctx.fillStyle = i < count ? '#ffffff' : 'rgba(255,255,255,0.25)';
    circle(ctx, 0, y, r); ctx.strokeStyle = i < count ? '#c8dcea' : 'rgba(200,220,234,0.6)'; ctx.lineWidth = 2; ctx.setLineDash(i < count ? [] : [5, 5]); ctx.stroke(); ctx.setLineDash([]);
    y -= r - 4;
  }
  if (count >= 3) {
    ctx.fillStyle = '#2d2438'; circle(ctx, -5, y + 14, 2.4); circle(ctx, 5, y + 14, 2.4);
    ctx.fillStyle = '#ff8a3a'; ctx.beginPath(); ctx.moveTo(0, y + 18); ctx.lineTo(14, y + 20); ctx.lineTo(0, y + 22); ctx.fill();
    ctx.fillStyle = '#e8455a'; ctx.fillRect(-14, y + 26, 28, 6);
  }
}

// --------------------------------------------------- 3-10 festival ----
// The big blossom tree for the spring festival: it fills with blossoms as they are brought.
export function festivalTreeLook(canopy: { x: number; y: number; r: number }[], need: number) {
  return (count: number): void => {
    ctx.fillStyle = '#6a4a3a'; ctx.beginPath(); ctx.moveTo(-50, 10); ctx.lineTo(-26, -200); ctx.lineTo(26, -200); ctx.lineTo(50, 10); ctx.fill();
    const k = count / need;
    drawCanopy(canopy, k >= 1 ? ['#e195bd', '#f2b1cf', '#ffe6f0'] : ['#3a8a4f', '#4aa85a', '#7fd06e']);
    const r = mulberry32(7);
    for (let i = 0; i < count * 6; i++) { ctx.save(); ctx.translate((r() - 0.5) * 320, -230 + (r() - 0.5) * 140); drawBlossom(0.9); ctx.restore(); }
  };
}

