import { ctx, V, visible, screenSpace } from '../engine/view';
import { glow, sparkleBurst } from '../engine/fx';
import { TAU, circle, clamp, ease, mulberry32, pick } from '../util';
import { Sound } from '../sound';
import { playerNear, win } from '../game/world';
import { drawBubble } from '../render/hud';
import { leafBurst } from './obstacles';
import type { Entity, World } from '../game/types';

// Level 8 pieces: leaf piles hiding acorns and a squirrel who follows you to collect them.

export function drawAcorn(s = 1): void {
  ctx.save(); ctx.scale(s, s);
  ctx.fillStyle = '#c9803e'; ctx.beginPath(); ctx.ellipse(0, 4, 10, 12, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-3, 4, 2.5, 5, 0.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.ellipse(0, -5, 12, 7, 0, Math.PI, 0); ctx.lineTo(12, -3); ctx.lineTo(-12, -3); ctx.fill();
  ctx.strokeStyle = '#7a4a2a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(2, -16); ctx.stroke();
  ctx.restore();
}

interface Flying { x0: number; y0: number; t: number }

export class Squirrel implements Entity {
  z = 0;
  x: number;
  y = 0;
  face = 1;
  got = 0;
  hopT = 0;
  happyT = 0;
  flying: Flying[] = [];
  bubbleA = 1;
  constructor(x: number, public need = 5) { this.x = x; }

  give(x: number, y: number): void { this.flying.push({ x0: x, y0: y, t: 0 }); }

  update(w: World, dt: number): void {
    const p = w.player;
    // hop along behind the fairy
    const target = p.x - p.face * 90, d = target - this.x;
    if (Math.abs(d) > 30 && w.mode === 'play') { this.x += Math.sign(d) * Math.min(Math.abs(d), 260 * dt); this.face = Math.sign(d); this.hopT += dt; }
    this.y = w.ground(this.x);
    this.happyT = Math.max(0, this.happyT - dt);
    for (const f of this.flying) {
      f.t += dt;
      if (f.t >= 1) {
        this.got++; this.happyT = 1; Sound.happy();
        sparkleBurst(this.x, this.y - 50, 10, ['#ffd166', '#c9803e']);
        if (this.got >= this.need && w.mode === 'play') win(w, { x: clamp(p.x, 200, w.worldW - 200), y: w.ground(p.x) - 180 });
      }
    }
    this.flying = this.flying.filter(f => f.t < 1);
    this.bubbleA += ((this.got === 0 && this.flying.length === 0 && w.mode === 'play' ? 1 : 0) - this.bubbleA) * Math.min(1, dt * 4);
  }

  draw(w: World): void {
    const hop = this.happyT > 0 ? Math.abs(Math.sin(this.happyT * 10)) * 18 : Math.abs(Math.sin(this.hopT * 9)) * 10 * (Math.abs(w.player.x - this.face * 90 - this.x) > 30 ? 1 : 0);
    if (visible(this.x - 80, this.x + 80)) {
      ctx.save(); ctx.translate(this.x, this.y - hop); ctx.scale(this.face * 1.3, 1.3);
      // tail
      ctx.fillStyle = '#d07a3a';
      ctx.beginPath(); ctx.moveTo(-10, -10); ctx.bezierCurveTo(-46, -10, -50, -60, -26, -66); ctx.bezierCurveTo(-8, -70, -6, -48, -20, -44); ctx.bezierCurveTo(-30, -40, -26, -24, -6, -20); ctx.fill();
      ctx.fillStyle = '#f0a860'; ctx.beginPath(); ctx.ellipse(-30, -52, 8, 12, -0.4, 0, TAU); ctx.fill();
      // body
      ctx.fillStyle = '#d98a48'; ctx.beginPath(); ctx.ellipse(0, -18, 15, 18, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fbe0bc'; ctx.beginPath(); ctx.ellipse(5, -14, 8, 12, 0, 0, TAU); ctx.fill();
      // head
      ctx.fillStyle = '#d98a48'; circle(ctx, 8, -40, 13);
      ctx.beginPath(); ctx.moveTo(0, -48); ctx.lineTo(2, -62); ctx.lineTo(9, -51); ctx.fill();
      ctx.fillStyle = '#fbe0bc'; ctx.beginPath(); ctx.ellipse(14, -36, 6, 5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#3b2550'; circle(ctx, 12, -43, 2.6); circle(ctx, 20, -36, 2);
      ctx.fillStyle = '#fff'; circle(ctx, 13, -44, 0.9);
      ctx.fillStyle = 'rgba(255,120,140,0.5)'; circle(ctx, 16, -36, 2.4);
      // paws / feet
      ctx.fillStyle = '#b86a32'; ctx.beginPath(); ctx.ellipse(6, 0, 8, 3.5, 0, 0, TAU); ctx.fill();
      if (this.got > 0) { ctx.save(); ctx.translate(14, -22); drawAcorn(0.6); ctx.restore(); }
      ctx.restore();
    }
    // acorns flying to the squirrel
    for (const f of this.flying) {
      const u = ease(f.t), x = f.x0 + (this.x - f.x0) * u, y = f.y0 + (this.y - 40 - f.y0) * u - Math.sin(u * Math.PI) * 160;
      ctx.save(); ctx.translate(x, y); ctx.rotate(f.t * 10); drawAcorn(1.2); ctx.restore();
    }
  }

  drawOver(w: World): void {
    if (this.bubbleA > 0.02) drawBubble(this.x, this.y - 90, this.bubbleA, 64, () => drawAcorn(1.6));
    // acorn tally at the top of the screen
    if (w.mode === 'idle') return;
    screenSpace();
    const n = this.need, cx = V.viewW / 2, y = 52;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath(); ctx.ellipse(cx, y, n * 22 + 14, 28, 0, 0, TAU); ctx.fill();
    for (let i = 0; i < n; i++) {
      ctx.save(); ctx.translate(cx + (i - (n - 1) / 2) * 42, y);
      ctx.globalAlpha = i < this.got ? 1 : 0.25;
      drawAcorn(1.3);
      ctx.restore();
    }
  }
}

export class LeafPile implements Entity {
  z = 1;
  open = false;
  t = 0;
  leaves: { dx: number; dy: number; r: number; a: number; c: string }[] = [];
  constructor(public x: number, public acorn: boolean, public squirrel: Squirrel, public y?: number) {
    const r = mulberry32(Math.round(x * 7));
    for (let i = 0; i < 30; i++) {
      const u = r() * 2 - 1;
      this.leaves.push({ dx: u * 60, dy: -(1 - u * u) * 40 * r(), r: 7 + r() * 5, a: r() * TAU, c: pick(r, ['#f29c4a', '#ea7050', '#ecc040', '#d4553e', '#c9803e']) });
    }
  }
  baseY(w: World) { return this.y ?? w.ground(this.x); }

  update(w: World, dt: number): void {
    if (this.open) { this.t += dt; return; }
    const by = this.baseY(w);
    if (w.mode === 'play' && playerNear(w, this.x, by - 20, 70)) {
      this.open = true; Sound.rustle();
      leafBurst(this.x, by - 20, 18, ['#f29c4a', '#ea7050', '#ecc040', '#d4553e']);
      if (this.acorn) { Sound.magic(); sparkleBurst(this.x, by - 30, 14); this.squirrel.give(this.x, by - 30); }
    }
  }

  draw(w: World): void {
    if (!visible(this.x - 90, this.x + 90)) return;
    const by = this.baseY(w), k = this.open ? Math.max(0, 1 - this.t * 2) : 1;
    if (k <= 0) return;
    ctx.save(); ctx.translate(this.x, by + 4); ctx.scale(1, k);
    for (const l of this.leaves) {
      ctx.save(); ctx.translate(l.dx, l.dy); ctx.rotate(l.a + Math.sin(V.time * 2 + l.a) * 0.05);
      ctx.fillStyle = l.c; ctx.beginPath(); ctx.ellipse(0, 0, l.r, l.r * 0.55, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  drawLight(w: World): void {
    if (this.open) return;
    glow(this.x, this.baseY(w) - 20, 80, 'rgba(255,230,150,A)', 0.2 + 0.15 * Math.sin(V.time * 3 + this.x));
  }
}
