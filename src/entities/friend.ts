import { ctx, V } from '../engine/view';
import { glow, spawn } from '../engine/fx';
import { TAU, clamp, damp, circle } from '../util';
import { drawBubble } from '../render/hud';
import { Sound } from '../sound';
import type { Entity, World } from '../game/types';

// Something that stops a friend until the fairy fixes it.
export interface Blocker {
  stopX: number;               // friend waits here
  cleared: boolean;
  drawIcon(): void;            // picture shown in the friend's bubble (drawn around 0,0, ~50px)
  target(w: World): { x: number; y: number }; // where the fairy should go
}

// A friend that walks right along the ground, waits at blockers and goes home.
export abstract class Friend implements Entity {
  z = 0;
  face = 1;
  y = 0;
  state: 'walk' | 'wait' | 'home' = 'walk';
  waitA = 0;
  happyT = 0;
  walkT = 0;
  blockers: Blocker[] = [];
  badge = true;                // show a badge at the screen edge when out of view
  private waitingOn: Blocker | null = null;
  private arrived = false;
  abstract height: number;

  constructor(public x: number, public speed: number, public homeX: number) {}

  abstract drawBody(w: World, moving: boolean): void;
  abstract drawMini(): void;
  onHome(_w: World): void {}

  // Friends walk on the ground, or on bridges (leaf platforms without a stalk).
  surfaceY(w: World, x: number): number {
    for (const pl of w.platforms) {
      if (!pl.hidden && pl.stem === false && x > pl.x - 10 && x < pl.x + pl.w + 10) return pl.y + pl.sag;
    }
    return w.ground(x);
  }

  update(w: World, dt: number): void {
    this.y = this.surfaceY(w, this.x);
    this.happyT = Math.max(0, this.happyT - dt);
    if (w.mode !== 'play') { this.waitA = damp(this.waitA, 0, 5, dt); return; }
    const blocker = this.blockers.find(b => !b.cleared && b.stopX >= this.x - 1) ?? null;
    if (this.waitingOn && this.waitingOn.cleared) {
      this.happyT = 1.4; Sound.happy();
      for (let i = 0; i < 6; i++) spawn({ x: this.x + (Math.random() - 0.5) * 40, y: this.y - this.height, vx: (Math.random() - 0.5) * 60, vy: -60 - Math.random() * 50, life: 1.2, max: 1.2, size: 5, color: '#ff8fc7', rot: Math.random() * TAU, vr: 1, drag: 1 });
      this.waitingOn = null;
    }
    const limit = blocker ? blocker.stopX : this.homeX;
    if (this.x < limit - 0.5 && this.happyT < 0.8) {
      this.x = Math.min(limit, this.x + this.speed * dt);
      this.walkT += dt;
      this.state = 'walk';
    } else if (this.x >= limit - 0.5) {
      this.state = blocker ? 'wait' : 'home';
      if (blocker) this.waitingOn = blocker;
    }
    if (this.state === 'home' && !this.arrived) { this.arrived = true; this.onHome(w); }
    this.waitA = damp(this.waitA, this.state === 'wait' ? 1 : 0, 5, dt);
  }

  draw(w: World): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.face, 1);
    this.drawBody(w, this.state === 'walk' && w.mode === 'play');
    ctx.restore();
    this.drawOffscreen(w);
  }

  drawOver(w: World): void {
    if (this.waitA > 0.02 && this.waitingOn) {
      const b = this.waitingOn;
      drawBubble(this.x, this.y - this.height - 6, this.waitA, 70, () => b.drawIcon());
      // bouncing arrow over the thing to touch
      const t = b.target(w), bob = Math.abs(Math.sin(V.time * 4)) * 12;
      ctx.save(); ctx.globalAlpha = this.waitA;
      ctx.fillStyle = '#ffd84a'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      ctx.beginPath();
      const ay = t.y - 70 - bob;
      ctx.moveTo(t.x - 14, ay); ctx.lineTo(t.x + 14, ay); ctx.lineTo(t.x, ay + 20); ctx.closePath();
      ctx.stroke(); ctx.fill();
      ctx.restore();
    }
  }

  // Little badge at the screen edge when the friend is out of view.
  private drawOffscreen(w: World): void {
    if (!this.badge) return;
    const l = V.camX + 50, r = V.camX + V.viewW - 50;
    if (this.x > l - 40 && this.x < r + 40) return;
    const left = this.x < l, x = left ? l : r, y = clamp(this.y - 40, V.camY + 120, V.camY + V.viewH - 80);
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; circle(ctx, x, y, 30);
    ctx.fillStyle = '#ffd84a';
    const s = left ? -1 : 1;
    ctx.beginPath(); ctx.moveTo(x + s * 42, y); ctx.lineTo(x + s * 30, y - 10); ctx.lineTo(x + s * 30, y + 10); ctx.fill();
    ctx.translate(x, y);
    this.drawMini();
    ctx.restore();
    void w;
  }
}

// Shared glow for a thing waiting to be touched.
export function touchGlow(x: number, y: number, r: number): void {
  const pulse = 0.5 + 0.5 * Math.sin(V.time * 3);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glow(x, y, r + pulse * 10, 'rgba(255,230,140,A)', 0.35 + 0.25 * pulse);
  ctx.restore();
}
