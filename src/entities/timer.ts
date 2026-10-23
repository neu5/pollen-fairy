import { ctx, V, screenSpace } from '../engine/view';
import { clamp, rr } from '../util';
import { Sound } from '../sound';
import type { Entity, World } from '../game/types';

// A gentle sand timer at the top of the screen. When it runs out the level starts again.
export class Countdown implements Entity {
  z = 0;
  left: number;
  running: boolean;
  private tickAt = 10;
  constructor(public seconds: number, autoStart = true, public done: (w: World) => boolean = () => false) {
    this.left = seconds;
    this.running = autoStart;
  }
  start(): void { this.running = true; }

  update(w: World, dt: number): void {
    if (!this.running || w.mode !== 'play') return;
    if (this.done(w)) { this.running = false; return; }
    this.left = Math.max(0, this.left - dt);
    if (this.left < this.tickAt && this.left > 0) { this.tickAt = Math.floor(this.left); Sound.tick(); }
    if (this.left <= 0) { this.running = false; w.failed = true; }
  }

  draw(): void {}

  drawOver(w: World): void {
    if (w.mode === 'idle' || (!this.running && this.left === this.seconds)) return;
    screenSpace();
    const u = clamp(this.left / this.seconds, 0, 1), bw = Math.min(360, V.viewW * 0.4), x = V.viewW / 2 - bw / 2, y = 104;
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; rr(ctx, x - 44, y - 18, bw + 60, 36, 18); ctx.fill();
    ctx.font = '26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⏳', x - 24, y + 1);
    ctx.fillStyle = '#e9e0fb'; rr(ctx, x, y - 8, bw, 16, 8); ctx.fill();
    ctx.fillStyle = u > 0.3 ? '#8fe388' : u > 0.12 ? '#ffd166' : '#ff9aa2';
    if (u > 0.01) { rr(ctx, x, y - 8, bw * u, 16, 8); ctx.fill(); }
  }
}
