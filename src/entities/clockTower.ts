import { ctx, V, visible } from '../engine/view';
import { glow, sparkleBurst } from '../engine/fx';
import { TAU, circle, rr } from '../util';
import { playerNear } from '../game/world';
import { openClock, fmt, type ClockTime } from '../ui/clock';
import { drawBubble } from '../render/hud';
import { touchGlow } from './friend';
import type { Entity, World } from '../game/types';

// A little tower with a big clock. Touch the clock → the clock puzzle opens.

export function drawClockFace(x: number, y: number, r: number, c: ClockTime, lit = false): void {
  ctx.fillStyle = lit ? '#fff6cc' : '#fff8e8'; circle(ctx, x, y, r);
  ctx.strokeStyle = '#c98a4b'; ctx.lineWidth = r * 0.12; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.fillStyle = '#6a4bb0';
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; circle(ctx, x + Math.sin(a) * r * 0.78, y - Math.cos(a) * r * 0.78, r * (i % 3 ? 0.04 : 0.08)); }
  const ha = ((c.h % 12) + c.m / 60) * Math.PI / 6, ma = c.m * Math.PI / 30;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#5b3a8c'; ctx.lineWidth = r * 0.12;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ha) * r * 0.45, y - Math.cos(ha) * r * 0.45); ctx.stroke();
  ctx.strokeStyle = '#ff6fa8'; ctx.lineWidth = r * 0.08;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(ma) * r * 0.72, y - Math.cos(ma) * r * 0.72); ctx.stroke();
  ctx.fillStyle = '#ffcf3a'; circle(ctx, x, y, r * 0.1);
}

export class ClockTower implements Entity {
  z = -1;
  shown: ClockTime;
  solved = false;
  locked = false;            // true until the level says the clock may be used
  lighthouse = false;        // draw a red and white lighthouse instead of a tower
  wasNear = false;
  bubbleA = 0;
  constructor(public x: number, public target: ClockTime, start: ClockTime, public onSolved: (w: World) => void, public roof = '#ec9fc6') {
    this.shown = start;
  }
  face(w: World) { return { x: this.x, y: w.ground(this.x) - 250, r: 46 }; }

  update(w: World, dt: number): void {
    const f = this.face(w);
    const near = w.mode === 'play' && !this.solved && !this.locked && playerNear(w, f.x, f.y, 90);
    if (near && !this.wasNear) {
      openClock(this.target, this.shown, () => {
        this.solved = true; this.shown = this.target;
        sparkleBurst(f.x, f.y, 30, ['#fff3a8', '#ffd166', '#ffffff']);
        this.onSolved(w);
      });
      // move the fairy a little away so closing the window does not open it again at once
      w.player.x -= 60;
    }
    this.wasNear = near;
    const far = w.mode === 'play' && !this.solved && !this.locked && Math.abs(w.player.x - this.x) < 520;
    this.bubbleA += ((far ? 1 : 0) - this.bubbleA) * Math.min(1, dt * 4);
  }

  draw(w: World): void {
    if (!visible(this.x - 140, this.x + 140)) return;
    const gy = w.ground(this.x), f = this.face(w);
    if (this.lighthouse) this.drawLighthouse(gy);
    else {
      // tower
      const g = ctx.createLinearGradient(this.x - 60, 0, this.x + 60, 0);
      g.addColorStop(0, '#c4b8e0'); g.addColorStop(1, '#ece6fa');
      ctx.fillStyle = g; rr(ctx, this.x - 60, gy - 320, 120, 330, 10); ctx.fill();
      ctx.fillStyle = 'rgba(80,60,130,0.15)';
      for (let y = gy - 300; y < gy; y += 30) for (let x = this.x - 52 + ((y / 30) % 2) * 15; x < this.x + 50; x += 30) rr(ctx, x, y, 24, 22, 4), ctx.fill();
      ctx.fillStyle = this.roof;
      ctx.beginPath(); ctx.moveTo(this.x - 76, gy - 316); ctx.lineTo(this.x, gy - 410); ctx.lineTo(this.x + 76, gy - 316); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#8a5236';
      ctx.beginPath(); ctx.moveTo(this.x - 24, gy + 2); ctx.lineTo(this.x - 24, gy - 44); ctx.arc(this.x, gy - 44, 24, Math.PI, 0); ctx.lineTo(this.x + 24, gy + 2); ctx.fill();
    }
    if (!this.solved && !this.locked) touchGlow(f.x, f.y, 80);
    drawClockFace(f.x, f.y, f.r, this.shown, this.solved);
  }

  private drawLighthouse(gy: number): void {
    for (let i = 0; i < 6; i++) {
      const y0 = gy - i * 60, y1 = y0 - 60, w0 = 70 - i * 6, w1 = 70 - (i + 1) * 6;
      ctx.fillStyle = i % 2 ? '#ffffff' : '#e8455a';
      ctx.beginPath(); ctx.moveTo(this.x - w0, y0); ctx.lineTo(this.x - w1, y1); ctx.lineTo(this.x + w1, y1); ctx.lineTo(this.x + w0, y0); ctx.closePath(); ctx.fill();
    }
    ctx.fillStyle = '#3a3a4a'; ctx.fillRect(this.x - 40, gy - 372, 80, 12);
    ctx.fillStyle = this.solved ? '#fff4a8' : '#8ab0c8'; ctx.fillRect(this.x - 30, gy - 420, 60, 48);
    ctx.fillStyle = '#e8455a'; ctx.beginPath(); ctx.moveTo(this.x - 40, gy - 420); ctx.lineTo(this.x, gy - 460); ctx.lineTo(this.x + 40, gy - 420); ctx.closePath(); ctx.fill();
  }

  drawLight(w: World): void {
    const f = this.face(w);
    if (this.lighthouse && this.solved) {
      const gy = w.ground(this.x), a = Math.sin(V.time * 1.2) * 0.6;
      const g = ctx.createLinearGradient(this.x, 0, this.x + Math.cos(a) * 700, 0);
      g.addColorStop(0, 'rgba(255,250,200,0.5)'); g.addColorStop(1, 'rgba(255,250,200,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(this.x, gy - 396);
      ctx.lineTo(this.x + Math.cos(a) * 700, gy - 396 + Math.sin(a) * 700 - 80); ctx.lineTo(this.x + Math.cos(a) * 700, gy - 396 + Math.sin(a) * 700 + 80); ctx.closePath(); ctx.fill();
      glow(this.x, gy - 396, 120, 'rgba(255,250,200,A)', 0.7);
    }
    glow(f.x, f.y, this.solved ? 140 : 80, 'rgba(255,230,150,A)', this.solved ? 0.5 : 0.25);
  }

  drawOver(w: World): void {
    if (this.bubbleA < 0.02) return;
    const f = this.face(w);
    drawBubble(f.x, f.y - f.r - 70, this.bubbleA, 92, () => {
      ctx.fillStyle = '#5b3a8c'; ctx.font = '700 30px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(fmt(this.target), 0, 4);
    });
  }
}
