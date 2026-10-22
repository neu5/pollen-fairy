import { ctx, V, visible } from '../engine/view';
import { glow, sparkleBurst, spawn } from '../engine/fx';
import { TAU, circle, clamp, rr } from '../util';
import { Sound } from '../sound';
import { playerNear, fadeTheme, win } from '../game/world';
import { drawBubble } from '../render/hud';
import { drawFace, centerDisc } from '../render/terrain';
import { Trail } from './follow';
import { touchGlow } from './friend';
import type { Entity, World } from '../game/types';

// Level 7 pieces: paint pots, a paint drop that follows the fairy, grey flowers that want colour.

export const PAINT: Record<string, string> = { red: '#ff5a6e', yellow: '#ffd23f', blue: '#4aa8ff' };

export function drawDrop(col: string, s = 1): void {
  ctx.save(); ctx.scale(s, s);
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, -18); ctx.bezierCurveTo(10, -6, 14, 2, 12, 8); ctx.arc(0, 8, 12, 0, Math.PI); ctx.bezierCurveTo(-14, 2, -10, -6, 0, -18); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(-4, 4, 3, 5, 0.3, 0, TAU); ctx.fill();
  ctx.restore();
}

// Shared state: which colour the fairy is carrying.
export class Brush implements Entity {
  z = 1;
  color: string | null = null;
  trail = new Trail(14, -70);
  update(w: World, dt: number): void { this.trail.update(w, dt); }
  take(col: string, w: World): void {
    if (!this.color) this.trail.reset(w.player.x, w.player.y - 70);
    this.color = col;
  }
  draw(): void {
    if (!this.color) return;
    ctx.save(); ctx.translate(this.trail.x, this.trail.y + Math.sin(V.time * 4) * 4);
    drawDrop(PAINT[this.color], 1.1);
    ctx.restore();
  }
  drawLight(): void {
    if (this.color) glow(this.trail.x, this.trail.y, 50, 'rgba(255,255,255,A)', 0.4);
  }
}

export class PaintPot implements Entity {
  z = 0;
  wasNear = false;
  constructor(public x: number, public color: string, public brush: Brush, public y?: number) {}
  baseY(w: World) { return this.y ?? w.ground(this.x); }
  update(w: World): void {
    const near = w.mode === 'play' && playerNear(w, this.x, this.baseY(w) - 30, 60);
    if (near && !this.wasNear && this.brush.color !== this.color) {
      this.brush.take(this.color, w);
      Sound.magic();
      sparkleBurst(this.x, this.baseY(w) - 40, 14, [PAINT[this.color], '#ffffff']);
    }
    this.wasNear = near;
  }
  draw(w: World): void {
    if (!visible(this.x - 60, this.x + 60)) return;
    const y = this.baseY(w), col = PAINT[this.color];
    touchGlow(this.x, y - 30, 60);
    ctx.fillStyle = '#c98a4b'; rr(ctx, this.x - 26, y - 44, 52, 44, 12); ctx.fill();
    ctx.fillStyle = '#e5a96a'; rr(ctx, this.x - 26, y - 44, 52, 10, 5); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(this.x, y - 42, 22, 7, 0, 0, TAU); ctx.fill();
    // drip
    ctx.beginPath(); ctx.moveTo(this.x + 10, y - 42); ctx.lineTo(this.x + 16, y - 42); ctx.lineTo(this.x + 16, y - 26); ctx.arc(this.x + 13, y - 26, 3, 0, Math.PI); ctx.fill();
    ctx.save(); ctx.translate(this.x, y - 74 + Math.sin(V.time * 3) * 4); drawDrop(col, 0.8); ctx.restore();
  }
}

export class GreyFlower implements Entity {
  z = 0;
  painted = 0;     // 0..1 colour amount
  done = false;
  noT = 0;
  wasNear = false;
  bubbleA = 0;
  constructor(public x: number, public want: string, public brush: Brush, public h = 120) {}

  head(w: World) { return { x: this.x + Math.sin(V.time * 1.1 + this.x) * 4, y: w.ground(this.x) - this.h }; }

  update(w: World, dt: number): void {
    const hd = this.head(w);
    if (this.done) this.painted = Math.min(1, this.painted + dt * 1.5);
    this.noT = Math.max(0, this.noT - dt);
    const near = w.mode === 'play' && playerNear(w, hd.x, hd.y, 70);
    if (near && !this.wasNear && !this.done) {
      if (this.brush.color === this.want) {
        this.done = true; this.brush.color = null;
        Sound.happy(); Sound.magic();
        sparkleBurst(hd.x, hd.y, 22, [PAINT[this.want], '#ffffff', '#fff3a8']);
      } else if (this.brush.color) { this.noT = 0.5; Sound.oops(); }
    }
    this.wasNear = near;
    this.bubbleA += ((!this.done && w.mode === 'play' && playerNear(w, hd.x, hd.y, 420) ? 1 : 0) - this.bubbleA) * Math.min(1, dt * 5);
    if (this.done && Math.random() < 0.05) spawn({ x: hd.x + (Math.random() - 0.5) * 60, y: hd.y, vx: 0, vy: -30, life: 1, max: 1, size: 3, color: PAINT[this.want], rot: 0, vr: 2 });
  }

  draw(w: World): void {
    if (!visible(this.x - 100, this.x + 100)) return;
    const gy = w.ground(this.x), hd = this.head(w), p = clamp(this.painted, 0, 1);
    const shake = this.noT > 0 ? Math.sin(this.noT * 40) * 4 : 0;
    ctx.strokeStyle = p > 0.5 ? '#3d9a45' : '#8a958c'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(this.x, gy); ctx.quadraticCurveTo(this.x - 10, gy - this.h / 2, hd.x, hd.y); ctx.stroke();
    ctx.save(); ctx.translate(hd.x + shake, hd.y);
    const col = PAINT[this.want], grey = '#b9b7c4';
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < 10; i++) {
        const a = (i + pass * 0.5) / 10 * TAU, L = 30 + (pass ? 0 : 6);
        ctx.fillStyle = pass ? grey : '#a3a1b0';
        ctx.beginPath(); ctx.ellipse(Math.cos(a) * (14 + L / 2), Math.sin(a) * (14 + L / 2), L / 2, 9, a, 0, TAU); ctx.fill();
        if (p > 0) {
          ctx.globalAlpha = p; ctx.fillStyle = pass ? col : 'rgba(0,0,0,0.12)';
          ctx.beginPath(); ctx.ellipse(Math.cos(a) * (14 + L / 2), Math.sin(a) * (14 + L / 2), L / 2, 9, a, 0, TAU); ctx.fill();
          if (pass === 0) { ctx.fillStyle = col; ctx.globalAlpha = p * 0.8; ctx.fill(); }
          ctx.globalAlpha = 1;
        }
      }
    }
    if (p > 0.3) { centerDisc(14); } else { ctx.fillStyle = '#d6d4de'; circle(ctx, 0, 0, 14); }
    drawFace(14, p > 0.5);
    ctx.restore();
  }

  drawOver(w: World): void {
    if (this.bubbleA < 0.02) return;
    const hd = this.head(w);
    drawBubble(hd.x, hd.y - 50, this.bubbleA, 64, () => drawDrop(PAINT[this.want], 1.1));
  }
}

// When all grey flowers have colour, colour flows back into the whole garden.
export class ColourReturn implements Entity {
  z = 0;
  won = false;
  constructor(public flowers: GreyFlower[]) {}
  update(w: World, dt: number): void {
    if (this.won || w.mode !== 'play' || !this.flowers.every(f => f.done)) return;
    if (fadeTheme(w, 'meadow', dt, 3)) {
      this.won = true;
      win(w, { x: clamp(w.player.x, 200, w.worldW - 200), y: w.ground(w.player.x) - 180 });
    }
  }
  draw(): void {}
}
