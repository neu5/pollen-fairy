import { ctx, V, visible, screenSpace } from '../engine/view';
import { glow, sparkleBurst, spawn, star } from '../engine/fx';
import { TAU, circle, clamp, ease, mulberry32, sprite, drawSprite, type Sprite } from '../util';
import { Sound } from '../sound';
import { playerNear, win } from '../game/world';
import { drawCastle, CASTLE_PAL } from '../art';
import type { Entity, World } from '../game/types';

// Level 10 pieces: colour stars, a rainbow bridge that builds itself, the sky castle, lanterns.

export const RAINBOW = ['#ff6b8a', '#ffa45a', '#ffe066', '#7ee08a', '#6cc4ff', '#b48cff'];

function bez(t: number, a: number, c: number, b: number): number { return (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b; }

export class RainbowBridge implements Entity {
  z = -1;
  stripes = 0;
  rideT = -1;
  constructor(public x0: number, public y0: number, public x1: number, public y1: number) {}

  get built() { return this.stripes >= RAINBOW.length; }
  point(t: number, off = 0) {
    const cx = (this.x0 + this.x1) / 2, cy = Math.min(this.y0, this.y1) - 260;
    const x = bez(t, this.x0, cx, this.x1), y = bez(t, this.y0, cy, this.y1);
    // normal for stripe offset
    const dx = 2 * (1 - t) * (cx - this.x0) + 2 * t * (this.x1 - cx), dy = 2 * (1 - t) * (cy - this.y0) + 2 * t * (this.y1 - cy);
    const l = Math.hypot(dx, dy) || 1;
    return { x: x - dy / l * off, y: y + dx / l * off };
  }

  add(): void {
    this.stripes++;
    Sound.magic();
    if (this.built) { Sound.finale(); sparkleBurst(this.x0, this.y0 - 40, 30, RAINBOW); }
  }

  update(w: World, dt: number): void {
    const p = w.player;
    if (this.built && this.rideT < 0 && w.mode === 'play' && playerNear(w, this.x0, this.y0 - 30, 110)) { this.rideT = 0; Sound.whoosh(); }
    if (this.rideT >= 0 && w.mode === 'play') {
      this.rideT += dt;
      const u = ease(clamp(this.rideT / 3.2, 0, 1)), pt = this.point(u, -10);
      p.x = pt.x; p.y = pt.y; p.vx = 0; p.vy = 0; p.face = 1; p.flying = true;
      if (Math.random() < 0.8) spawn({ x: p.x - 20, y: p.y - 30 + (Math.random() - 0.5) * 30, vx: -40, vy: 20, life: 1, max: 1, size: 4, color: RAINBOW[Math.floor(Math.random() * 6)], rot: Math.random() * TAU, vr: 3 });
      if (u >= 1) win(w, { x: this.x1 + 40, y: this.y1 - 80 });
    }
  }

  draw(): void {
    if (!visible(this.x0 - 100, this.x1 + 100)) return;
    ctx.lineCap = 'round';
    for (let i = 0; i < RAINBOW.length; i++) {
      const off = (i - 2.5) * 14, built = i < this.stripes;
      ctx.strokeStyle = built ? RAINBOW[i] : 'rgba(255,255,255,0.35)';
      ctx.lineWidth = built ? 14 : 3;
      ctx.setLineDash(built ? [] : [10, 14]);
      ctx.beginPath();
      for (let k = 0; k <= 40; k++) { const p = this.point(k / 40, off); if (k) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    // fluffy clouds at both ends
    for (const [x, y] of [[this.x0, this.y0], [this.x1, this.y1]]) {
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      for (let k = -2; k <= 2; k++) circle(ctx, x + k * 22, y + 4 - (2 - Math.abs(k)) * 8, 26 - Math.abs(k) * 4);
    }
  }

  drawLight(): void {
    if (!this.stripes) return;
    const mid = this.point(0.5);
    glow(mid.x, mid.y, 300, 'rgba(255,240,255,A)', 0.12 * this.stripes / 6);
  }

  drawOver(w: World): void {
    if (w.mode === 'idle') return;
    // star tally at the top of the screen
    screenSpace();
    const n = RAINBOW.length, cx = V.viewW / 2, y = 52;
    ctx.fillStyle = 'rgba(255,255,255,0.78)';
    ctx.beginPath(); ctx.ellipse(cx, y, n * 22 + 16, 28, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < n; i++) {
      ctx.globalAlpha = i < this.stripes ? 1 : 0.28;
      ctx.fillStyle = RAINBOW[i];
      star(cx + (i - (n - 1) / 2) * 40, y, 15, -Math.PI / 2);
    }
    ctx.globalAlpha = 1;
  }
}

export class ColourStar implements Entity {
  z = 0;
  t = -1;      // flight time after being touched
  constructor(public x: number, public y: number, public i: number, public bridge: RainbowBridge) {}
  update(w: World, dt: number): void {
    if (this.t < 0) {
      if (w.mode === 'play' && playerNear(w, this.x, this.y, 60)) {
        this.t = 0; Sound.happy();
        sparkleBurst(this.x, this.y, 18, [RAINBOW[this.i], '#ffffff']);
      }
    } else if (this.t < 1.4) {
      this.t += dt;
      if (this.t >= 1.4) { this.bridge.add(); sparkleBurst(this.bridge.x0, this.bridge.y0 - 40, 16, [RAINBOW[this.i], '#ffffff']); }
    }
  }
  pos() {
    if (this.t < 0) return { x: this.x, y: this.y + Math.sin(V.time * 2 + this.i) * 8 };
    const u = ease(clamp(this.t / 1.4, 0, 1));
    return { x: this.x + (this.bridge.x0 - this.x) * u, y: this.y + (this.bridge.y0 - 40 - this.y) * u - Math.sin(u * Math.PI) * 220 };
  }
  draw(): void {
    if (this.t >= 1.4) return;
    const p = this.pos();
    if (!visible(p.x - 60, p.x + 60) && this.t < 0) return;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.sin(V.time * 1.5 + this.i) * 0.2 + Math.max(0, this.t) * 8);
    ctx.fillStyle = '#ffffff'; star(0, 0, 30, -Math.PI / 2);
    ctx.fillStyle = RAINBOW[this.i]; star(0, 0, 25, -Math.PI / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; circle(ctx, -5, -6, 5);
    ctx.fillStyle = '#4a2a4a'; circle(ctx, -6, 2, 2.2); circle(ctx, 6, 2, 2.2);
    ctx.strokeStyle = '#4a2a4a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 5, 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.restore();
  }
  drawLight(): void {
    if (this.t >= 1.4) return;
    const p = this.pos(), c = parseInt(RAINBOW[this.i].slice(1), 16);
    glow(p.x, p.y, 90, `rgba(${c >> 16},${(c >> 8) & 255},${c & 255},A)`, 0.45 + 0.15 * Math.sin(V.time * 3 + this.i));
  }
}

export class SkyCastle implements Entity {
  z = -1;
  img: Sprite;
  constructor(public x: number, public y: number) {
    this.img = sprite(300, 290, 1.2, 0, g => drawCastle(g, 300, 290, CASTLE_PAL));
  }
  update(): void {}
  draw(): void {
    if (!visible(this.x - 300, this.x + 300)) return;
    const bob = Math.sin(V.time * 0.8) * 4;
    drawSprite(ctx, this.img, this.x, this.y + 10 + bob, 1.15);
    ctx.fillStyle = 'rgba(255,240,250,0.97)';
    for (let k = -4; k <= 4; k++) circle(ctx, this.x + k * 42, this.y + 20 + bob + Math.abs(k) * 4, 40 - Math.abs(k) * 3);
    ctx.fillStyle = 'rgba(255,200,230,0.6)';
    for (let k = -3; k <= 3; k++) circle(ctx, this.x + k * 44, this.y + 46 + bob, 26);
  }
  drawLight(): void { glow(this.x, this.y - 120, 260, 'rgba(255,240,200,A)', 0.25); }
}

export class Lanterns implements Entity {
  z = -1;
  pts: { x: number; c: string; ph: number }[] = [];
  constructor(public x0: number, public x1: number, public y: number) {
    const r = mulberry32(x0);
    for (let x = x0 + 30; x < x1; x += 60) this.pts.push({ x, c: RAINBOW[Math.floor(r() * 6)], ph: r() * TAU });
  }
  sag(x: number): number { const u = (x - this.x0) / (this.x1 - this.x0); return this.y + Math.sin(u * Math.PI) * 50; }
  update(): void {}
  draw(w: World): void {
    if (!visible(this.x0 - 50, this.x1 + 50)) return;
    for (const px of [this.x0, this.x1]) {
      ctx.fillStyle = '#8d5d43'; ctx.fillRect(px - 5, this.y - 10, 10, w.ground(px) - this.y + 14);
      ctx.fillStyle = '#ffd76a'; circle(ctx, px, this.y - 12, 7);
    }
    ctx.strokeStyle = 'rgba(90,60,80,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = this.x0; x <= this.x1; x += 20) { if (x === this.x0) ctx.moveTo(x, this.sag(x)); else ctx.lineTo(x, this.sag(x)); }
    ctx.stroke();
    for (const l of this.pts) {
      const y = this.sag(l.x) + 4, sw = Math.sin(V.time * 1.5 + l.ph) * 0.12;
      ctx.save(); ctx.translate(l.x, y); ctx.rotate(sw);
      ctx.fillStyle = l.c; ctx.beginPath(); ctx.ellipse(0, 16, 12, 15, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(-4, 12, 3, 7, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#7a4a3a'; ctx.fillRect(-6, 0, 12, 4); ctx.fillRect(-5, 30, 10, 3);
      ctx.restore();
    }
  }
  drawLight(): void {
    for (const l of this.pts) if (visible(l.x - 60, l.x + 60)) glow(l.x, this.sag(l.x) + 20, 50, 'rgba(255,220,160,A)', 0.35);
  }
}
