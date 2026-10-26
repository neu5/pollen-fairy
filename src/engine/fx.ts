import { ctx, V, screenSpace } from './view';
import { TAU, clamp, circle, pick } from '../util';

// Shared drawing helpers + particles + confetti.

export function star(x: number, y: number, r: number, rot: number): void {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = rot + i * Math.PI / 4, rr = i % 2 ? r * 0.32 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
}

// All glows are dimmed by this much, so they never hide the fairy, flowers or friends.
export const GLOW = 0.5;

// color must contain 'A' where the alpha goes, e.g. 'rgba(255,220,120,A)'
export function glow(x: number, y: number, r: number, color: string, a: number): void {
  a *= GLOW;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color.replace('A', String(a))); g.addColorStop(1, color.replace('A', '0'));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

export function leafShape(x: number, y: number, len: number, wid: number, ang: number, col: string): void {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.5, -wid, len, 0);
  ctx.quadraticCurveTo(len * 0.5, wid, 0, 0);
  ctx.fill(); ctx.restore();
}

export interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; max: number; size: number;
  color: string; kind: 'spark' | 'dust' | 'leaf' | 'drop'; g: number; rot: number; vr: number; drag: number;
}
interface Confetti { x: number; y: number; vy: number; rot: number; vr: number; size: number; sway: number; col: string }

export const fx = { particles: [] as Particle[], confetti: [] as Confetti[] };

export function spawn(o: Partial<Particle>): void {
  fx.particles.push({
    x: 0, y: 0, vx: 0, vy: 0, life: 1, max: 1, size: 3, color: '#fff', kind: 'spark', g: 0, rot: 0, vr: 0, drag: 1, ...o,
  });
}

export function sparkleBurst(x: number, y: number, n = 16, colors = ['#fff3a8', '#ffd166']): void {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU, sp = 60 + Math.random() * 90;
    spawn({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, life: 0.9, max: 0.9, size: 3 + Math.random() * 3, color: colors[i % colors.length], drag: 2.5, rot: Math.random() * TAU, vr: 3 });
  }
}

export function spawnConfetti(): void {
  fx.confetti.push({
    x: Math.random() * V.viewW, y: -20, vy: 50 + Math.random() * 70, rot: Math.random() * TAU,
    vr: (Math.random() - 0.5) * 4, size: 6 + Math.random() * 6, sway: Math.random() * TAU,
    col: pick(Math.random, ['#ff8fc7', '#ffd166', '#c3aaff', '#86dcff', '#ffffff', '#ffa585']),
  });
}

export function clearFx(): void {
  fx.particles = []; fx.confetti = [];
}

export function updateFx(dt: number): void {
  for (const q of fx.particles) {
    q.life -= dt;
    const dr = Math.exp(-q.drag * dt);
    q.vx *= dr; q.vy *= dr;
    q.vy += q.g * dt;
    q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
  }
  fx.particles = fx.particles.filter(q => q.life > 0);
  for (const c of fx.confetti) { c.y += c.vy * dt; c.rot += c.vr * dt; c.sway += dt * 1.5; c.x += Math.sin(c.sway) * 30 * dt; }
  fx.confetti = fx.confetti.filter(c => c.y < V.viewH + 30);
}

export function drawParticles(): void {
  for (const q of fx.particles) {
    const a = clamp(q.life / q.max, 0, 1);
    if (q.kind === 'dust') {
      ctx.globalAlpha = a * 0.8; ctx.fillStyle = q.color;
      circle(ctx, q.x, q.y, q.size * (1.4 - a * 0.6));
    } else if (q.kind === 'leaf') {
      ctx.globalAlpha = Math.min(1, a * 2); ctx.fillStyle = q.color;
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.scale(1, Math.abs(Math.cos(q.rot * 1.7)) * 0.7 + 0.3);
      ctx.beginPath(); ctx.ellipse(0, 0, q.size, q.size * 0.5, 0, 0, TAU); ctx.fill(); ctx.restore();
    } else if (q.kind === 'drop') {
      ctx.globalAlpha = a; ctx.strokeStyle = q.color; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - q.vx * 0.02, q.y - q.vy * 0.02); ctx.stroke();
    }
  }
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const q of fx.particles) {
    if (q.kind !== 'spark') continue;
    const a = clamp(q.life / q.max, 0, 1);
    ctx.globalAlpha = a; ctx.fillStyle = q.color;
    star(q.x, q.y, q.size * (0.6 + 0.4 * a), q.rot);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

export function drawConfetti(): void {
  screenSpace();
  for (const c of fx.confetti) {
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.scale(1, Math.abs(Math.cos(c.rot * 1.3)) * 0.8 + 0.2);
    ctx.fillStyle = c.col; ctx.beginPath(); ctx.ellipse(0, 0, c.size, c.size * 0.55, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
}
