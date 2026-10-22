import type { World } from '../game/types';

// Makes something trail behind the fairy, like a duckling.
export class Trail {
  private pts: { x: number; y: number }[] = [];
  x = 0;
  y = 0;
  constructor(public delay = 22, public offY = -60) {}

  reset(x: number, y: number): void { this.pts = []; this.x = x; this.y = y; }

  update(w: World, dt: number): void {
    const p = w.player;
    this.pts.push({ x: p.x - p.face * 30, y: p.y + this.offY });
    if (this.pts.length > this.delay) this.pts.shift();
    const t = this.pts[0];
    const k = 1 - Math.exp(-6 * dt);
    this.x += (t.x - this.x) * k;
    this.y += (t.y - this.y) * k;
  }
}
