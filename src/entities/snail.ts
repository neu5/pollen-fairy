import { ctx, V } from '../engine/view';
import { TAU, circle, mod } from '../util';
import { Friend } from './friend';
import type { World } from '../game/types';

function drawShell(r: number): void {
  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#ffd3a8'); g.addColorStop(0.6, '#ff9fb0'); g.addColorStop(1, '#e8789a');
  ctx.fillStyle = g; circle(ctx, 0, 0, r);
  ctx.strokeStyle = '#d0587f'; ctx.lineWidth = r * 0.12; ctx.lineCap = 'round';
  ctx.beginPath();
  for (let a = 0; a < TAU * 2.4; a += 0.15) {
    const rr = r * 0.85 * (1 - a / (TAU * 2.6));
    const px = Math.cos(a + 2) * rr, py = Math.sin(a + 2) * rr;
    if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.ellipse(-r * 0.35, -r * 0.5, r * 0.28, r * 0.14, -0.6, 0, TAU); ctx.fill();
}

export class Snail extends Friend {
  height = 70;
  constructor(x: number, homeX: number) { super(x, 38, homeX); }

  drawMini(): void {
    ctx.save(); ctx.scale(0.55, 0.55); drawShell(30); ctx.restore();
  }

  drawBody(w: World, moving: boolean): void {
    const t = V.time, crawl = moving ? Math.sin(this.walkT * 5) : 0;
    const stretch = 1 + crawl * 0.06, happy = this.happyT > 0 ? Math.abs(Math.sin(this.happyT * 9)) * 6 : 0;
    ctx.save(); ctx.translate(0, -happy);
    // body
    ctx.save(); ctx.scale(stretch, 1);
    const bg = ctx.createLinearGradient(0, -40, 0, 0);
    bg.addColorStop(0, '#e6f6b0'); bg.addColorStop(1, '#b9d97a');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.moveTo(-44, 0);
    ctx.quadraticCurveTo(-46, -10, -28, -14);
    ctx.lineTo(16, -16);
    ctx.quadraticCurveTo(26, -18, 26, -32);
    ctx.quadraticCurveTo(28, -50, 40, -48);
    ctx.quadraticCurveTo(52, -46, 50, -30);
    ctx.quadraticCurveTo(48, -12, 46, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(150,180,90,0.5)'; ctx.fillRect(-42, -3, 88, 3);
    ctx.restore();
    // eye stalks
    const look = this.state === 'wait' ? 4 : 0, wob = Math.sin(t * 2) * 2;
    ctx.strokeStyle = '#c6e08c'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    const eyes: [number, number][] = [[34 + wob, -72], [48 + wob * 0.6, -70]];
    for (const [ex, ey] of eyes) { ctx.beginPath(); ctx.moveTo(40, -44); ctx.quadraticCurveTo(ex - 2, ey + 14, ex, ey); ctx.stroke(); }
    const blink = mod(t + this.x * 0.01, 3.7) < 0.12;
    for (const [ex, ey] of eyes) {
      ctx.fillStyle = '#fff'; circle(ctx, ex, ey, 6);
      if (blink) { ctx.strokeStyle = '#3b2550'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(ex - 4, ey); ctx.lineTo(ex + 4, ey); ctx.stroke(); }
      else { ctx.fillStyle = '#3b2550'; circle(ctx, ex + 1.5 + look * 0.3, ey + 0.5, 3); ctx.fillStyle = '#fff'; circle(ctx, ex + 2.5, ey - 1, 1); }
    }
    // face
    ctx.fillStyle = 'rgba(255,130,150,0.55)'; circle(ctx, 46, -33, 3.5);
    ctx.strokeStyle = '#6b4a3a'; ctx.lineWidth = 1.8;
    ctx.beginPath();
    if (this.state === 'wait') ctx.arc(42, -26, 3, 1.2 * Math.PI, 1.8 * Math.PI);
    else ctx.arc(42, -32, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    // shell
    ctx.save(); ctx.translate(-10, -38 + crawl * 1.5); ctx.rotate(crawl * 0.03);
    drawShell(30);
    ctx.restore();
    ctx.restore();
    void w;
  }
}
