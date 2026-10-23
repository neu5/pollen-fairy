import type { Entity, World } from '../game/types';

// Run something a little later in game time (stops while the game is paused).
export class Later implements Entity {
  z = 0;
  private fired = false;
  constructor(public sec: number, public fn: (w: World) => void) {}
  update(w: World, dt: number): void {
    if (this.fired) return;
    this.sec -= dt;
    if (this.sec <= 0) { this.fired = true; this.fn(w); }
  }
  draw(): void {}
}
