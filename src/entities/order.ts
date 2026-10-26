import { ctx, visible } from '../engine/view';
import { glow, sparkleBurst } from '../engine/fx';
import { Sound } from '../sound';
import { playerNear } from '../game/world';
import type { Entity, World } from '../game/types';

// Touch things in the right order (numbers 1…10, seasons, moon shapes…).
// A wrong one just wiggles; the kid keeps going from where they are.

export interface OrderItem {
  x: number; y: number;
  draw(lit: boolean, wiggle: number, next: boolean): void; // drawn around (0,0)
}

export class OrderGame implements Entity {
  z = 0;
  got = 0;
  wiggle: number[];
  wasNear: boolean[];
  doneT = -1;
  lines = false;               // draw lines between lit items (dot-to-dot)
  lineColor = 'rgba(255,240,180,0.9)';
  onTop = false;               // draw above the night darkness (for pictures that must stay clear)
  constructor(public items: OrderItem[], public onDone: (w: World) => void, public r = 60) {
    this.wiggle = items.map(() => 0);
    this.wasNear = items.map(() => false);
  }
  get complete() { return this.got >= this.items.length; }

  update(w: World, dt: number): void {
    this.wiggle = this.wiggle.map(v => Math.max(0, v - dt));
    if (this.doneT >= 0) { this.doneT += dt; return; }
    this.items.forEach((it, i) => {
      const near = w.mode === 'play' && playerNear(w, it.x, it.y, this.r);
      if (near && !this.wasNear[i] && i >= this.got) {
        if (i === this.got) {
          this.got++;
          Sound.note(Math.min(9, this.got - 1));
          sparkleBurst(it.x, it.y, 12);
          if (this.complete) { this.doneT = 0; Sound.magic(); this.onDone(w); }
        } else { this.wiggle[i] = 0.5; Sound.oops(); }
      }
      this.wasNear[i] = near;
    });
  }

  draw(): void { if (!this.onTop) this.paint(); }
  drawOver(): void { if (this.onTop) this.paint(); }

  private paint(): void {
    if (this.lines && this.got > 1) {
      ctx.strokeStyle = this.lineColor; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i < this.got; i++) { const it = this.items[i]; if (i) ctx.lineTo(it.x, it.y); else ctx.moveTo(it.x, it.y); }
      if (this.complete) ctx.closePath();
      ctx.stroke();
    }
    this.items.forEach((it, i) => {
      if (!visible(it.x - 80, it.x + 80)) return;
      ctx.save(); ctx.translate(it.x, it.y);
      it.draw(i < this.got, this.wiggle[i], i === this.got);
      ctx.restore();
    });
  }

  drawLight(): void {
    this.items.forEach((it, i) => {
      if (!visible(it.x - 150, it.x + 150)) return;
      glow(it.x, it.y, i < this.got ? 110 : 50, 'rgba(210,255,150,A)', i < this.got ? 0.45 : 0.15);
    });
  }
}

// Shared look: a round number badge (used by glow-worms, stars…).
export function numberBadge(n: number, lit: boolean, r = 16): void {
  ctx.fillStyle = lit ? '#fff3a8' : 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = lit ? '#f0a838' : '#a99cc6'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#5b3a8c'; ctx.font = `700 ${r * 1.25}px "Baloo 2", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(n), 0, r * 0.08);
}
