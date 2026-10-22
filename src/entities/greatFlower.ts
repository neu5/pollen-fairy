import { ctx, V, visible } from '../engine/view';
import { glow, leafShape, spawn } from '../engine/fx';
import { TAU, clamp, ease, lerp, pick } from '../util';
import { centerDisc, drawFace, drawZ } from '../render/terrain';
import { win } from '../game/world';
import type { Entity, World } from '../game/types';

// The big sleeping bud at the end of a level. Touch it → it blooms → level done.
export class GreatFlower implements Entity {
  z = -1;
  open = 0;
  constructor(public x: number, public petals = ['#ff6fae', '#ff94c4', '#ffb0d6', '#ffd2e8']) {}

  head(w: World) {
    const by = w.ground(this.x), h = 230, sway = Math.sin(V.time * 0.8) * 0.025;
    return { x: this.x + Math.sin(sway) * h, y: by - Math.cos(sway) * h, by, sway };
  }

  update(w: World, dt: number): void {
    if (w.mode === 'play' && Math.abs(w.player.x - this.x) < 100) {
      win(w, { x: this.x - 150, y: w.ground(this.x) - 190 });
    }
    if (w.mode === 'finale') {
      this.open = ease(clamp((w.finaleT - 0.4) / 2.4, 0, 1));
      const hd = this.head(w);
      if (w.finaleT > 0.6 && w.finaleT < 4.5 && Math.random() < 0.5) {
        const a = Math.random() * TAU, sp = 80 + Math.random() * 140;
        spawn({ x: hd.x, y: hd.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.2, max: 1.2, size: 3 + Math.random() * 4, color: pick(Math.random, ['#fff3a8', '#ffd166', '#ffffff', '#ffc4ec']), drag: 1.5, rot: Math.random() * TAU, vr: 3 });
      }
    }
    void dt;
  }

  draw(w: World): void {
    if (!visible(this.x - 320, this.x + 320)) return;
    const { x: hx, y: hy, by, sway } = this.head(w), o = this.open, x = this.x, h = 230;
    leafShape(x, by - 40, 95, 28, -0.5, '#4fb04f');
    leafShape(x, by - 80, 82, 25, Math.PI + 0.55, '#45a548');
    leafShape(x, by - 140, 60, 18, -0.8, '#5cc05a');
    ctx.strokeStyle = '#3a9844'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, by + 4); ctx.quadraticCurveTo(x - 18, by - h * 0.5, hx, hy); ctx.stroke();
    const pulse = 0.5 + 0.5 * Math.sin(V.time * 1.8);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(hx, hy, 120 + o * 130 + pulse * 15, 'rgba(255,230,150,A)', 0.45 + 0.2 * pulse);
    ctx.restore();
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(sway);
    ctx.globalAlpha = 1 - o * 0.6;
    for (const s of [-1, 1]) leafShape(0, 6, 40, 12, -Math.PI / 2 + s * 0.5, '#4cb04f');
    ctx.globalAlpha = 1;
    const rings = [
      { n: 12, L: 76, W: 26, c: this.petals[0], c2: this.petals[1], off: 0 },
      { n: 10, L: 54, W: 20, c: this.petals[2], c2: this.petals[3], off: 0.3 },
    ];
    for (const rg of rings) {
      for (let i = 0; i < rg.n; i++) {
        const full = -Math.PI / 2 + (i / rg.n - 0.5) * TAU + rg.off;
        const closed = -Math.PI / 2 + (i / (rg.n - 1) - 0.5) * 0.7;
        const a = lerp(closed, full, o), L = rg.L * (0.7 + 0.3 * o), d = 8 + L * 0.5;
        ctx.fillStyle = i % 2 ? rg.c : rg.c2;
        ctx.beginPath(); ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d, L / 2, rg.W * (0.55 + 0.45 * o) / 2, a, 0, TAU); ctx.fill();
      }
    }
    if (o > 0.05) {
      ctx.save(); ctx.scale(o, o);
      centerDisc(24); drawFace(24, o > 0.6);
      ctx.restore();
    }
    ctx.restore();
    if (o < 0.05) drawZ(hx + 40, hy - 60, 0, 18);
  }

  drawLight(w: World): void {
    if (!visible(this.x - 320, this.x + 320)) return;
    const { x, y } = this.head(w);
    glow(x, y, 160, 'rgba(255,230,150,A)', 0.4);
  }
}
