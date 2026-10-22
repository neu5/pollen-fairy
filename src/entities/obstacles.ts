import { ctx, V, visible } from '../engine/view';
import { glow, spawn, sparkleBurst } from '../engine/fx';
import { TAU, clamp, ease, lerp, circle, rr, mulberry32, pick } from '../util';
import { Sound } from '../sound';
import { playerNear } from '../game/world';
import { drawLeafBlade, drawMushroomShape, drawZ, drawCanopy } from '../render/terrain';
import { touchGlow, type Blocker } from './friend';
import type { Entity, Platform, World } from '../game/types';

// Reusable things in the world that block friends or decorate a level.

export function leafBurst(x: number, y: number, n: number, colors: string[]): void {
  for (let i = 0; i < n; i++) {
    spawn({ kind: 'leaf', x: x + (Math.random() - 0.5) * 40, y: y + (Math.random() - 0.5) * 40, vx: (Math.random() - 0.5) * 200, vy: -80 - Math.random() * 120, g: 160, life: 1.6, max: 1.6, size: 6 + Math.random() * 4, color: pick(Math.random, colors), rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 8, drag: 1.2 });
  }
}

// A wall of tall grass. Touch → it parts.
export class TallGrass implements Entity, Blocker {
  z = 1;
  cleared = false;
  part = 0;
  touched = false;
  stopX: number;
  blades: { dx: number; h: number; lean: number; ph: number; col: string }[] = [];

  constructor(public x: number) {
    this.stopX = x - 130;
    const r = mulberry32(Math.round(x));
    for (let i = 0; i < 26; i++) {
      this.blades.push({ dx: (r() - 0.5) * 90, h: 110 + r() * 70, lean: (r() - 0.5) * 0.3, ph: r() * TAU, col: pick(r, ['#3f9f45', '#52b84a', '#6fcf55', '#2f8a40']) });
    }
    this.blades.sort((a, b) => b.h - a.h);
  }

  target(w: World) { return { x: this.x, y: w.ground(this.x) - 150 }; }

  update(w: World, dt: number): void {
    const gy = w.ground(this.x);
    if (!this.touched && w.mode === 'play' && playerNear(w, this.x, gy - 70, 85)) {
      this.touched = true;
      Sound.rustle();
      sparkleBurst(this.x, gy - 90);
      leafBurst(this.x, gy - 80, 10, ['#52b84a', '#8fe36a', '#3f9f45']);
    }
    if (this.touched) {
      this.part = Math.min(1, this.part + dt * 1.1);
      if (this.part > 0.6) this.cleared = true;
    }
  }

  draw(w: World): void {
    if (!visible(this.x - 150, this.x + 150)) return;
    const gy = w.ground(this.x) + 4, p = ease(this.part);
    if (!this.touched) touchGlow(this.x, gy - 100, 110);
    for (const b of this.blades) {
      const side = b.dx < 0 ? -1 : 1;
      const a = b.lean + Math.sin(V.time * 1.4 + b.ph) * 0.05 + side * p * 1.25;
      const h = b.h * (1 - p * 0.45);
      const x0 = this.x + b.dx + side * p * 30;
      const tx = x0 + Math.sin(a) * h, ty = gy - Math.cos(a) * h;
      ctx.fillStyle = b.col;
      ctx.beginPath(); ctx.moveTo(x0 - 6, gy);
      ctx.quadraticCurveTo(x0 + Math.sin(a) * h * 0.4, gy - h * 0.55, tx, ty);
      ctx.quadraticCurveTo(x0 + Math.sin(a) * h * 0.4 + 4, gy - h * 0.5, x0 + 6, gy);
      ctx.fill();
    }
  }

  drawIcon(): void {
    for (let i = -2; i <= 2; i++) {
      ctx.fillStyle = i % 2 ? '#3f9f45' : '#6fcf55';
      ctx.beginPath(); ctx.moveTo(i * 7 - 4, 20); ctx.quadraticCurveTo(i * 7, -4, i * 9, -22 + Math.abs(i) * 4); ctx.quadraticCurveTo(i * 7 + 2, 0, i * 7 + 4, 20); ctx.fill();
    }
  }
}

// A sleepy rock on the path. Touch → it wakes up and hops away into the bushes.
export class SleepyRock implements Entity, Blocker {
  z = 0;
  cleared = false;
  t = -1;
  stopX: number;
  r = 56;

  constructor(public x: number) { this.stopX = x - this.r - 110; }

  target(w: World) { return { x: this.x, y: w.ground(this.x) - this.r * 2 }; }

  update(w: World, dt: number): void {
    const gy = w.ground(this.x);
    if (this.t < 0 && w.mode === 'play' && playerNear(w, this.x, gy - this.r, this.r + 40)) {
      this.t = 0; Sound.thud(); Sound.happy();
      sparkleBurst(this.x, gy - this.r * 1.5);
    }
    if (this.t >= 0) {
      this.t += dt;
      if (this.t > 0.9) this.cleared = true;
    }
  }

  private body(eyesOpen: boolean): void {
    const r = this.r;
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.2, 0, 0, r * 1.1);
    g.addColorStop(0, '#d8d0ec'); g.addColorStop(1, '#8e7fb3');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(0, 0, r * 1.1, r, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#6cc552';
    ctx.beginPath(); ctx.ellipse(-r * 0.2, -r * 0.82, r * 0.6, r * 0.22, -0.15, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(80,60,130,0.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(r * 0.6, -r * 0.3); ctx.lineTo(r * 0.35, r * 0.1); ctx.lineTo(r * 0.55, r * 0.4); ctx.stroke();
    ctx.strokeStyle = '#4a3a6a'; ctx.fillStyle = '#4a3a6a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (const s of [-1, 1]) {
      if (eyesOpen) { circle(ctx, s * r * 0.32, -r * 0.05, 5); ctx.fillStyle = '#fff'; circle(ctx, s * r * 0.32 + 2, -r * 0.05 - 2, 1.8); ctx.fillStyle = '#4a3a6a'; }
      else { ctx.beginPath(); ctx.arc(s * r * 0.32, -r * 0.1, 7, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
    }
    ctx.fillStyle = 'rgba(255,130,160,0.5)'; circle(ctx, -r * 0.55, r * 0.15, 6); circle(ctx, r * 0.55, r * 0.15, 6);
    ctx.beginPath(); ctx.strokeStyle = '#4a3a6a';
    if (eyesOpen) { ctx.arc(0, r * 0.15, 8, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
    else { ctx.fillStyle = '#4a3a6a'; ctx.ellipse(0, r * 0.3, 3, 4, 0, 0, TAU); ctx.fill(); }
  }

  draw(w: World): void {
    if (!visible(this.x - 300, this.x + 500)) return;
    const gy = w.ground(this.x);
    if (this.t < 0) {
      touchGlow(this.x, gy - this.r, this.r + 50);
      ctx.save(); ctx.translate(this.x, gy - this.r + 6 + Math.sin(V.time * 1.5) * 1.5);
      this.body(false); ctx.restore();
      drawZ(this.x + 40, gy - this.r * 2, 0.3, 16);
      return;
    }
    // hop, hop, away into the back
    const u = clamp(this.t / 2.2, 0, 1), hop = Math.abs(Math.sin(this.t * 7)) * 70 * (1 - u * 0.5);
    const k = 1 - u * 0.6, a = 1 - clamp((this.t - 1.8) / 0.6, 0, 1);
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.translate(this.x + u * 380, gy - this.r * k + 6 - hop - u * 90);
    ctx.scale(k, k);
    this.body(true);
    ctx.restore();
  }

  drawIcon(): void {
    ctx.save(); ctx.scale(0.36, 0.36); this.body(false); ctx.restore();
  }
}

// A river with shallow water. Fairy can wade; friends cannot.
export class River implements Entity {
  z = 1;
  wasIn = false;
  constructor(public a: number, public b: number, public surface: number) {}

  update(w: World): void {
    const p = w.player;
    const inside = p.x > this.a && p.x < this.b && p.y > this.surface;
    if (inside && !this.wasIn) {
      Sound.splash();
      for (let i = 0; i < 12; i++) spawn({ kind: 'drop', x: p.x + (Math.random() - 0.5) * 30, y: this.surface, vx: (Math.random() - 0.5) * 160, vy: -120 - Math.random() * 160, g: 600, life: 0.8, max: 0.8, color: '#e0f6ff', drag: 0.5 });
    }
    this.wasIn = inside;
  }

  draw(w: World): void {
    if (!visible(this.a - 40, this.b + 40)) return;
    let xa = this.a, xb = this.b;
    while (xa > this.a - 80 && w.ground(xa) > this.surface) xa -= 4;
    while (xb < this.b + 80 && w.ground(xb) > this.surface) xb += 4;
    const bottom = V.camY + V.viewH + 40, t = V.time;
    const g = ctx.createLinearGradient(0, this.surface, 0, this.surface + 120);
    g.addColorStop(0, 'rgba(140,215,250,0.85)'); g.addColorStop(1, 'rgba(60,130,210,0.92)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(xa, bottom);
    for (let x = xa; x <= xb; x += 10) ctx.lineTo(x, this.surface + Math.sin(x * 0.05 + t * 2) * 2.5);
    ctx.lineTo(xb, bottom); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const x = xa + ((i * 67 + t * 30) % (xb - xa - 40)) + 20, y = this.surface + 18 + (i % 3) * 16;
      ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.quadraticCurveTo(x, y - 4, x + 14, y); ctx.stroke();
    }
  }
}

// A big leaf resting on a branch. Touch → it falls down and becomes a bridge.
export class LeafBridge implements Entity, Blocker {
  z = -1;
  cleared = false;
  t = -1;
  stopX: number;
  canopy: { x: number; y: number; r: number }[] = [];

  constructor(public bridge: Platform, public treeX: number, public restY: number) {
    bridge.hidden = true;
    bridge.stem = false;
    this.stopX = bridge.x - 60;
    const r = mulberry32(treeX);
    for (let i = 0; i < 26; i++) this.canopy.push({ x: treeX + (r() - 0.5) * 300, y: restY - 190 + (r() - 0.5) * 120, r: 40 + r() * 34 });
    this.canopy.sort((a, b) => a.y - b.y);
  }

  restX(): number { return this.bridge.x + this.bridge.w / 2; }
  target() { return { x: this.restX(), y: this.restY }; }

  update(w: World, dt: number): void {
    if (this.t < 0 && w.mode === 'play' && playerNear(w, this.restX(), this.restY - 10, 110)) {
      this.t = 0; Sound.rustle(); Sound.magic();
      sparkleBurst(this.restX(), this.restY);
    }
    if (this.t >= 0 && !this.cleared) {
      this.t += dt;
      if (this.t >= 2.4) {
        this.cleared = true;
        this.bridge.hidden = false;
        this.bridge.sagV += 220;
        Sound.thud(); Sound.splash();
        sparkleBurst(this.restX(), this.bridge.y, 20);
      }
    }
  }

  draw(w: World): void {
    if (!visible(this.treeX - 300, this.bridge.x + this.bridge.w + 200)) return;
    const gy = w.ground(this.treeX), tx = this.treeX, by = this.restY + 14;
    // tree with a long branch over the river
    const g = ctx.createLinearGradient(tx - 40, 0, tx + 40, 0);
    g.addColorStop(0, '#6e4636'); g.addColorStop(1, '#b07a55');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(tx - 70, gy + 20); ctx.quadraticCurveTo(tx - 34, gy - 20, tx - 30, gy - 120);
    ctx.lineTo(tx - 26, by - 140); ctx.lineTo(tx + 26, by - 140); ctx.lineTo(tx + 30, gy - 120);
    ctx.quadraticCurveTo(tx + 34, gy - 20, tx + 72, gy + 20); ctx.closePath(); ctx.fill();
    const ex = this.bridge.x + this.bridge.w + 40;
    ctx.fillStyle = '#8d5d43';
    ctx.beginPath(); ctx.moveTo(tx, by - 16); ctx.quadraticCurveTo((tx + ex) / 2, by - 30, ex, by - 8);
    ctx.lineTo(ex, by + 2); ctx.quadraticCurveTo((tx + ex) / 2, by - 6, tx, by + 22); ctx.closePath(); ctx.fill();
    drawCanopy(this.canopy);
    if (this.cleared) return;
    const u = this.t < 0 ? 0 : ease(clamp(this.t / 2.4, 0, 1));
    const cx = this.restX(), y = lerp(this.restY, this.bridge.y, u);
    const rot = this.t < 0 ? 0 : Math.sin(this.t * 4) * (1 - u) * 0.35;
    if (this.t < 0) touchGlow(cx, this.restY, 130);
    ctx.save(); ctx.translate(cx, y); ctx.rotate(rot); ctx.scale(1, lerp(2.4, 1, u));
    drawLeafBlade(-this.bridge.w / 2, 0, this.bridge.w);
    ctx.restore();
  }

  drawIcon(): void {
    ctx.save(); ctx.scale(0.42, 0.42); drawLeafBlade(-60, -10, 110); ctx.restore();
    ctx.strokeStyle = '#4aaee8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (const y of [8, 17]) { ctx.beginPath(); ctx.moveTo(-22, y); ctx.quadraticCurveTo(-11, y - 5, 0, y); ctx.quadraticCurveTo(11, y + 5, 22, y); ctx.stroke(); }
  }
}

// A cosy mushroom house where a friend lives.
export class MushroomHouse implements Entity {
  z = -1;
  spots = [{ u: -0.55, v: 0.5, r: 9 }, { u: 0.1, v: 0.8, r: 11 }, { u: 0.6, v: 0.45, r: 8 }];
  constructor(public x: number, public col = { cap: '#ff6b7f', cap2: '#d9456f', spot: '#ffffff' }) {}
  update(): void {}
  draw(w: World): void {
    if (!visible(this.x - 200, this.x + 200)) return;
    const gy = w.ground(this.x);
    drawMushroomShape(this.x, gy, gy - 230, 260, 0, this.col, this.spots, false);
    // door + window
    ctx.fillStyle = '#8a5236';
    ctx.beginPath(); ctx.moveTo(this.x - 18, gy + 2); ctx.lineTo(this.x - 18, gy - 34); ctx.arc(this.x, gy - 34, 18, Math.PI, 0); ctx.lineTo(this.x + 18, gy + 2); ctx.fill();
    ctx.fillStyle = '#ffd76a'; circle(ctx, this.x + 9, gy - 22, 2.5);
    ctx.fillStyle = '#ffe39a'; circle(ctx, this.x + 8, gy - 92, 10);
    ctx.strokeStyle = '#8a5236'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(this.x + 8, gy - 92, 10, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#c98a4b'; rr(ctx, this.x - 34, gy - 6, 68, 8, 4); ctx.fill();
  }
  drawLight(w: World): void {
    const gy = w.ground(this.x);
    glow(this.x + 8, gy - 92, 60, 'rgba(255,214,120,A)', 0.5);
  }
}
