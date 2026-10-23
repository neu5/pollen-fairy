import { ctx, V, visible } from '../engine/view';
import { glow, sparkleBurst } from '../engine/fx';
import { Sound } from '../sound';
import { playerNear } from '../game/world';
import { drawBubble } from '../render/hud';
import { Trail } from './follow';
import { touchGlow } from './friend';
import type { Entity, World } from '../game/types';

// Carry one thing at a time: touch it to pick it up, touch the right place to drop it.
// A wrong place gives a little "no" and you keep holding the thing.

export interface Thing { kind: string; draw(): void } // drawn around (0,0), about 40 px

export class Hand implements Entity {
  z = 1;
  holding: Thing | null = null;
  trail = new Trail(14, -72);
  update(w: World, dt: number): void { this.trail.update(w, dt); }
  take(t: Thing, w: World): void {
    if (!this.holding) this.trail.reset(w.player.x, w.player.y - 72);
    this.holding = t;
  }
  draw(): void {
    if (!this.holding) return;
    ctx.save(); ctx.translate(this.trail.x, this.trail.y + Math.sin(V.time * 4) * 4);
    this.holding.draw();
    ctx.restore();
  }
  drawLight(): void { if (this.holding) glow(this.trail.x, this.trail.y, 46, 'rgba(255,255,255,A)', 0.35); }
}

// Something lying in the world that can be picked up.
export class Pickup implements Entity {
  z = 0;
  taken = false;
  wasNear = false;
  constructor(public x: number, public y: number, public thing: Thing, public hand: Hand) {}
  update(w: World): void {
    if (this.taken) return;
    const near = w.mode === 'play' && playerNear(w, this.x, this.y, 60);
    if (near && !this.wasNear && !this.hand.holding) {
      this.taken = true; this.hand.take(this.thing, w);
      Sound.happy(); sparkleBurst(this.x, this.y, 10);
    }
    this.wasNear = near;
  }
  draw(): void {
    if (this.taken || !visible(this.x - 60, this.x + 60)) return;
    if (!this.hand.holding) touchGlow(this.x, this.y, 46);
    ctx.save(); ctx.translate(this.x, this.y + Math.sin(V.time * 2 + this.x) * 2); this.thing.draw(); ctx.restore();
  }
}

// A place that takes certain things (a bed, a heap, a bin…).
export class DropSpot implements Entity {
  z = -1;
  count = 0;
  noT = 0;
  wasNear = false;
  bubbleA = 0;
  constructor(
    public x: number, public y: number, public accepts: string[], public hand: Hand,
    public look: (count: number, noT: number) => void,
    public icon: (() => void) | null = null,
    public onDrop: (count: number, w: World) => void = () => {},
  ) {}
  update(w: World, dt: number): void {
    this.noT = Math.max(0, this.noT - dt);
    const near = w.mode === 'play' && playerNear(w, this.x, this.y, 80);
    const h = this.hand.holding;
    if (near && !this.wasNear && h) {
      if (this.accepts.includes(h.kind)) {
        this.hand.holding = null; this.count++;
        Sound.magic(); sparkleBurst(this.x, this.y, 14);
        this.onDrop(this.count, w);
      } else { this.noT = 0.5; Sound.oops(); }
    }
    this.wasNear = near;
    const want = !!h && this.accepts.includes(h.kind);
    this.bubbleA += ((want && w.mode === 'play' ? 1 : 0) - this.bubbleA) * Math.min(1, dt * 4);
  }
  draw(): void {
    if (!visible(this.x - 140, this.x + 140)) return;
    if (this.bubbleA > 0.5) touchGlow(this.x, this.y, 80);
    ctx.save(); ctx.translate(this.x + (this.noT > 0 ? Math.sin(this.noT * 40) * 4 : 0), this.y);
    this.look(this.count, this.noT);
    ctx.restore();
  }
  drawOver(): void {
    if (!this.icon || this.bubbleA < 0.02) return;
    drawBubble(this.x, this.y - 70, this.bubbleA, 60, this.icon);
  }
}
