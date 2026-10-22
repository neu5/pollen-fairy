import { ctx, V, visible } from '../engine/view';
import { glow, sparkleBurst, spawn } from '../engine/fx';
import { TAU, circle, mod } from '../util';
import { Sound } from '../sound';
import { playerNear, win } from '../game/world';
import { Friend, touchGlow, type Blocker } from './friend';
import type { Entity, World } from '../game/types';

// Level 9 pieces: crystals that light up the dark, a mole family that walks only where it's bright.

const CRYSTAL_COLS = [['#7ae0ff', '#3aa8d8'], ['#ff9fe0', '#d860b0'], ['#c3aaff', '#8a6ae0']];

function drawCrystal(lit: number, col: string[], s = 1): void {
  ctx.save(); ctx.scale(s, s);
  const shards: [number, number, number, number][] = [[-14, 0, 12, 46], [4, 0, 15, 64], [20, 0, 10, 38]];
  for (const [x, y, w, h] of shards) {
    const g = ctx.createLinearGradient(x - w, y - h, x + w, y);
    g.addColorStop(0, lit > 0.5 ? '#ffffff' : '#8a88a8');
    g.addColorStop(1, lit > 0.5 ? col[1] : '#4a4868');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.lineTo(x - w / 2, y - h * 0.75); ctx.lineTo(x, y - h); ctx.lineTo(x + w / 2, y - h * 0.75); ctx.lineTo(x + w / 2, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lit > 0.5 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(x - w / 2 + 2, y - 2); ctx.lineTo(x - w / 2 + 2, y - h * 0.72); ctx.lineTo(x, y - h + 4); ctx.lineTo(x - 1, y - 2); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

export class Crystal implements Entity, Blocker {
  z = 0;
  cleared = false;
  lit = 0;
  stopX: number;
  col: string[];
  constructor(public x: number, public y: number | null, public moleStop: number, i: number) {
    this.stopX = moleStop;
    this.col = CRYSTAL_COLS[i % CRYSTAL_COLS.length];
  }
  baseY(w: World) { return this.y ?? w.ground(this.x); }
  target(w: World) { return { x: this.x, y: this.baseY(w) - 40 }; }

  update(w: World, dt: number): void {
    if (this.cleared) { this.lit = Math.min(1, this.lit + dt * 2); return; }
    if (w.mode === 'play' && playerNear(w, this.x, this.baseY(w) - 30, 70)) {
      this.cleared = true; Sound.magic();
      sparkleBurst(this.x, this.baseY(w) - 40, 24, [this.col[0], '#ffffff']);
    }
  }

  draw(w: World): void {
    if (!visible(this.x - 100, this.x + 100)) return;
    const by = this.baseY(w);
    if (!this.cleared) touchGlow(this.x, by - 30, 60);
    ctx.save(); ctx.translate(this.x, by + 4);
    drawCrystal(this.lit, this.col, 1.3);
    ctx.restore();
  }

  drawLight(w: World): void {
    if (!visible(this.x - 400, this.x + 400)) return;
    const by = this.baseY(w);
    const c = this.col[0], n = parseInt(c.slice(1), 16), rgb = `${n >> 16},${(n >> 8) & 255},${n & 255}`;
    if (this.lit > 0) {
      const flick = 0.9 + 0.1 * Math.sin(V.time * 3 + this.x);
      glow(this.x, by - 40, 320 * this.lit, `rgba(${rgb},A)`, 0.45 * this.lit * flick);
      glow(this.x, by - 40, 90, 'rgba(255,255,255,A)', 0.5 * this.lit);
      if (Math.random() < 0.08) spawn({ x: this.x + (Math.random() - 0.5) * 50, y: by - 60, vx: 0, vy: -20, life: 1.2, max: 1.2, size: 3, color: c, rot: 0, vr: 2 });
    } else {
      glow(this.x, by - 30, 60, `rgba(${rgb},A)`, 0.15 + 0.1 * Math.sin(V.time * 2 + this.x));
    }
  }

  drawIcon(): void {
    ctx.save(); ctx.translate(-2, 20); drawCrystal(1, this.col, 0.6); ctx.restore();
  }
}

function drawMole(s: number, walk: number, happy: boolean): void {
  ctx.save(); ctx.scale(s, s);
  ctx.fillStyle = '#b8968a';
  ctx.beginPath(); ctx.ellipse(0, -18, 26, 19, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#d8bcb0'; ctx.beginPath(); ctx.ellipse(6, -14, 14, 10, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffb3c6';
  for (const [x, ph] of [[-12, 0], [12, Math.PI]] as [number, number][]) { ctx.beginPath(); ctx.ellipse(x + Math.sin(walk + ph) * 3, -1, 7, 4, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#ff8fb0'; circle(ctx, 27, -18, 5);
  ctx.strokeStyle = '#3b2550'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(16, -24, 2.5, happy ? 1.15 * Math.PI : 0.15 * Math.PI, happy ? 1.85 * Math.PI : 0.85 * Math.PI); ctx.stroke();
  ctx.fillStyle = 'rgba(255,130,160,0.5)'; circle(ctx, 18, -14, 3);
  ctx.restore();
}

// Mama mole and two babies walk together. They only go where the crystals shine.
export class MoleFamily extends Friend {
  height = 60;
  constructor(x: number, homeX: number) { super(x, 45, homeX); }
  drawMini(): void { ctx.translate(-4, 12); drawMole(0.7, 0, true); }
  drawBody(_w: World, moving: boolean): void {
    const walk = moving ? this.walkT * 10 : 0, happy = this.state !== 'wait';
    const bob = (k: number) => moving ? Math.abs(Math.sin(walk + k)) * -3 : 0;
    ctx.save(); ctx.translate(-110, bob(2)); drawMole(0.65, walk + 2, happy); ctx.restore();
    ctx.save(); ctx.translate(-62, bob(1)); drawMole(0.7, walk + 1, happy); ctx.restore();
    ctx.save(); ctx.translate(0, bob(0)); drawMole(1.15, walk, happy); ctx.restore();
  }
}

// A bright way out at the end of the cave.
export class CaveExit implements Entity {
  z = -1;
  constructor(public x: number) {}
  update(): void {}
  draw(w: World): void {
    if (!visible(this.x - 300, this.x + 300)) return;
    const gy = w.ground(this.x);
    const g = ctx.createRadialGradient(this.x, gy - 120, 20, this.x, gy - 120, 200);
    g.addColorStop(0, '#fffbe6'); g.addColorStop(0.5, '#cdeefc'); g.addColorStop(1, 'rgba(160,220,250,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(this.x - 130, gy + 4); ctx.lineTo(this.x - 130, gy - 140); ctx.arc(this.x, gy - 140, 130, Math.PI, 0); ctx.lineTo(this.x + 130, gy + 4); ctx.fill();
    ctx.fillStyle = '#6fcf55';
    for (let i = -5; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(this.x + i * 22 - 5, gy + 2); ctx.lineTo(this.x + i * 22, gy - 16 - (i % 2) * 8); ctx.lineTo(this.x + i * 22 + 5, gy + 2); ctx.fill(); }
  }
  drawLight(w: World): void {
    const gy = w.ground(this.x);
    glow(this.x, gy - 140, 420, 'rgba(255,250,220,A)', 0.55);
    for (let i = 0; i < 4; i++) {
      const a = mod(V.time * 0.2 + i * 0.25, 1);
      glow(this.x - 60 + i * 40, gy - 60 - a * 200, 14, 'rgba(255,255,230,A)', Math.sin(a * Math.PI) * 0.6);
    }
  }
}

export function moleWin(moles: MoleFamily): void {
  moles.onHome = w => win(w, { x: moles.homeX - 160, y: w.ground(moles.homeX) - 170 });
}
