import { ctx, V, visible } from '../engine/view';
import { sparkleBurst, spawn } from '../engine/fx';
import { TAU, circle, ease, lerp, clamp } from '../util';
import { Sound } from '../sound';
import { playerNear, fadeTheme, win } from '../game/world';
import { drawBubble } from '../render/hud';
import { drawMushroomShape } from '../render/terrain';
import { touchGlow } from './friend';
import type { Entity, Platform, World } from '../game/types';

// Level 4 pieces: tiny mushroom sprouts that grow into umbrellas, wet ladybugs.

export class Sprout implements Entity {
  z = -1;
  grow = 0;
  touched = false;
  constructor(public pl: Platform) { pl.hidden = true; }

  get x() { return this.pl.x + this.pl.w / 2; }
  get grown() { return this.grow >= 1; }

  update(w: World, dt: number): void {
    const gy = w.ground(this.x);
    if (!this.touched && w.mode === 'play' && playerNear(w, this.x, gy - 30, 70)) {
      this.touched = true; Sound.magic();
      sparkleBurst(this.x, gy - 30, 18);
    }
    if (this.touched && this.grow < 1) {
      this.grow = Math.min(1, this.grow + dt * 0.9);
      if (this.grow >= 1) { this.pl.hidden = false; this.pl.sagV += 200; Sound.boing(); }
    }
  }

  draw(w: World): void {
    if (this.grown || !visible(this.x - 120, this.x + 120)) return;
    const gy = w.ground(this.x), e = ease(this.grow);
    const width = lerp(44, this.pl.w, e), top = lerp(gy - 34, this.pl.y, e);
    if (!this.touched) touchGlow(this.x, gy - 24, 70);
    const wob = this.touched ? Math.sin(this.grow * 30) * 6 * (1 - this.grow) : 0;
    drawMushroomShape(this.x, gy, top + wob, width, 0, this.pl.col!, this.pl.spots ?? [], this.grow > 0.6);
  }

  drawIcon(): void {
    drawMushroomShape(0, 22, -22, 52, 0, this.pl.col!, this.pl.spots ?? [], false);
  }
}

export class Ladybug implements Entity {
  z = 0;
  x: number;
  face = 1;
  dry = false;
  happyT = 0;
  bubbleA = 0;
  t = Math.random() * 10;

  constructor(public home: number, public shelter: Sprout, public hue = '#ff4d5e') { this.x = home; }

  update(w: World, dt: number): void {
    this.t += dt;
    this.happyT = Math.max(0, this.happyT - dt);
    const near = w.mode === 'play' && playerNear(w, this.x, w.ground(this.x) - 30, 420);
    this.bubbleA += ((!this.dry && !this.shelter.grown && near ? 1 : 0) - this.bubbleA) * Math.min(1, dt * 5);
    let target = this.home + Math.sin(this.t * 0.5) * 50;
    if (this.shelter.grown) target = this.shelter.x + (this.home < this.shelter.x ? -14 : 14);
    const d = target - this.x;
    if (Math.abs(d) > 1) { this.x += Math.sign(d) * Math.min(Math.abs(d), (this.shelter.grown ? 70 : 25) * dt); this.face = Math.sign(d); }
    else if (this.shelter.grown && !this.dry) {
      this.dry = true; this.happyT = 1.5; Sound.happy();
      sparkleBurst(this.x, w.ground(this.x) - 30, 12, ['#ff8fc7', '#fff3a8']);
    }
    if (!this.dry && w.theme.weather === 'rain' && Math.random() < 0.06) {
      spawn({ kind: 'drop', x: this.x + (Math.random() - 0.5) * 30, y: w.ground(this.x) - 40, vx: (Math.random() - 0.5) * 40, vy: 40, g: 500, life: 0.5, max: 0.5, color: '#dff3ff', drag: 0.5 });
    }
  }

  draw(w: World): void {
    if (!visible(this.x - 60, this.x + 60)) return;
    const gy = w.ground(this.x), t = V.time;
    const shiver = this.dry ? 0 : Math.sin(t * 40) * 0.8;
    const hop = this.happyT > 0 ? Math.abs(Math.sin(this.happyT * 9)) * 12 : 0;
    ctx.save(); ctx.translate(this.x + shiver, gy - hop); ctx.scale(this.face * 1.25, 1.25);
    ctx.strokeStyle = '#2d2a44'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    const step = Math.sin(t * 12) * 2;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-10 + i * 10, -6); ctx.lineTo(-12 + i * 10 + (i % 2 ? step : -step), 0); ctx.stroke(); }
    // shell
    const g = ctx.createRadialGradient(-6, -24, 2, 0, -14, 26);
    g.addColorStop(0, '#ff9aa2'); g.addColorStop(0.5, this.hue); g.addColorStop(1, '#c7303f');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(-2, -8, 22, 18, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2d2a44'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-2, -26); ctx.lineTo(-2, -8); ctx.stroke();
    ctx.fillStyle = '#2d2a44';
    for (const [dx, dy, r] of [[-12, -16, 3.5], [-8, -22, 2.5], [6, -18, 3.5], [10, -12, 2.5], [-14, -10, 2.5]]) circle(ctx, dx, dy, r);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-10, -21, 5, 2.5, -0.5, 0, TAU); ctx.fill();
    // head
    ctx.fillStyle = '#2d2a44'; circle(ctx, 22, -10, 10);
    ctx.strokeStyle = '#2d2a44'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(24, -18); ctx.quadraticCurveTo(28, -28, 34, -28); ctx.moveTo(20, -19); ctx.quadraticCurveTo(22, -30, 27, -32); ctx.stroke();
    ctx.fillStyle = '#fff'; circle(ctx, 22, -12, 3.2); circle(ctx, 28, -12, 3);
    ctx.fillStyle = '#2d2a44'; circle(ctx, 23, -12, 1.6); circle(ctx, 28.6, -12, 1.5);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.3; ctx.beginPath();
    if (this.dry) ctx.arc(25, -7, 2.6, 0.15 * Math.PI, 0.85 * Math.PI); else ctx.arc(25, -4.5, 2.4, 1.2 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  drawOver(w: World): void {
    if (this.bubbleA < 0.02) return;
    const gy = w.ground(this.x);
    drawBubble(this.x, gy - 58, this.bubbleA, 70, () => this.shelter.drawIcon());
    const bob = Math.abs(Math.sin(V.time * 4)) * 12, sx = this.shelter.x, sy = gy - 60;
    if (Math.abs(sx - this.x) < 30) return;
    ctx.save(); ctx.globalAlpha = this.bubbleA;
    ctx.fillStyle = '#ffd84a'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(sx - 14, sy - 30 - bob); ctx.lineTo(sx + 14, sy - 30 - bob); ctx.lineTo(sx, sy - 10 - bob); ctx.closePath(); ctx.stroke(); ctx.fill();
    ctx.restore();
  }
}

// When every ladybug is dry the rain stops, the sun comes out, and the level is won.
export class RainStopper implements Entity {
  z = 0;
  done = false;
  constructor(public bugs: Ladybug[]) {}
  update(w: World, dt: number): void {
    if (this.done || w.mode !== 'play' || !this.bugs.every(b => b.dry)) return;
    if (fadeTheme(w, 'meadow', dt, 3.5)) {
      this.done = true;
      const p = w.player;
      win(w, { x: clamp(p.x, 200, w.worldW - 200), y: w.ground(p.x) - 180 });
    }
  }
  draw(): void {}
}
