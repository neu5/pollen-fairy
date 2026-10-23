import { ctx, V, visible } from '../engine/view';
import { sparkleBurst } from '../engine/fx';
import { Sound } from '../sound';
import { playerNear } from '../game/world';
import { drawBubble } from '../render/hud';
import { Trail } from './follow';
import type { Entity, World } from '../game/types';

// Little lost friends (bees, ducklings…): touch one and it follows you;
// come close to their home and they go in. When all are home, onFull runs.

export class Home implements Entity {
  z = -1;
  members: Wanderer[] = [];
  private fired = false;
  constructor(
    public x: number, public y: number,
    public look: (home: number, total: number) => void,
    public icon: () => void,
    public onFull: (w: World) => void,
    public reach = 170,
  ) {}
  get count() { return this.members.filter(m => m.state === 'home').length; }
  get full() { return this.members.length > 0 && this.count === this.members.length; }
  seat(i: number) { return { x: this.x - 40 + (i % 4) * 26, y: this.y - 30 - Math.floor(i / 4) * 24 }; }
  update(w: World): void {
    if (!this.fired && this.full && w.mode === 'play') { this.fired = true; Sound.magic(); this.onFull(w); }
  }
  draw(): void {
    if (!visible(this.x - 220, this.x + 220)) return;
    ctx.save(); ctx.translate(this.x, this.y); this.look(this.count, this.members.length); ctx.restore();
  }
  drawOver(w: World): void {
    if (this.full || w.mode !== 'play' || Math.abs(w.player.x - this.x) > 650) return;
    const n = this.members.length, home = this.count;
    drawBubble(this.x, this.y - 110, 1, Math.max(80, Math.min(4, n) * 28 + 24), () => {
      for (let i = 0; i < n; i++) {
        ctx.save(); ctx.translate((Math.min(4, n) - 1) * -13 + (i % 4) * 26, (Math.ceil(n / 4) - 1) * -12 + Math.floor(i / 4) * 24);
        ctx.globalAlpha = i < home ? 1 : 0.3; ctx.scale(0.5, 0.5); this.icon(); ctx.restore();
      }
    });
  }
}

export class Wanderer implements Entity {
  z = 1;
  state: 'lost' | 'follow' | 'home' = 'lost';
  trail: Trail;
  x: number; y: number;
  face = 1;
  private seatAt = { x: 0, y: 0 };
  constructor(x: number, y: number, delay: number, public home: Home, public look: (moving: boolean) => void, public flies = true) {
    this.x = x; this.y = y; this.trail = new Trail(delay, flies ? -64 : 0);
    home.members.push(this);
  }
  update(w: World, dt: number): void {
    if (this.state === 'lost') {
      if (w.mode === 'play' && playerNear(w, this.x, this.y - 20, 60)) {
        this.state = 'follow'; this.trail.reset(this.x, this.y); Sound.happy(); sparkleBurst(this.x, this.y - 20, 10);
      }
    } else if (this.state === 'follow') {
      const ox = this.x;
      this.trail.update(w, dt);
      this.x = this.trail.x;
      this.y = this.flies ? this.trail.y + 20 : w.ground(this.x);
      if (Math.abs(this.x - ox) > 0.3) this.face = this.x > ox ? 1 : -1;
      if (playerNear(w, this.home.x, this.home.y - 30, this.home.reach)) {
        this.state = 'home'; this.seatAt = this.home.seat(this.home.count); Sound.happy();
      }
    } else {
      this.x += (this.seatAt.x - this.x) * Math.min(1, dt * 4);
      this.y += (this.seatAt.y - this.y) * Math.min(1, dt * 4);
    }
  }
  draw(): void {
    if (!visible(this.x - 50, this.x + 50)) return;
    const bob = this.state === 'lost' ? Math.sin(V.time * 3 + this.x) * 3 : 0;
    ctx.save(); ctx.translate(this.x, this.y + bob); ctx.scale(this.face, 1);
    this.look(this.state === 'follow');
    ctx.restore();
  }
}
