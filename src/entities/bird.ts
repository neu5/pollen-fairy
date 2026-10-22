import { ctx, V, visible } from '../engine/view';
import { sparkleBurst, spawn } from '../engine/fx';
import { TAU, circle, clamp, ease, lerp, mulberry32 } from '../util';
import { Sound } from '../sound';
import { playerNear, win } from '../game/world';
import { drawBubble } from '../render/hud';
import { drawCanopy } from '../render/terrain';
import { Trail } from './follow';
import type { Entity, Platform, World } from '../game/types';

// Level 5 pieces: wind that lifts the fairy, a baby bird that follows, a nest high in a tree.

export class Updraft implements Entity {
  z = 1;
  fluff: { u: number; y: number; ph: number; sp: number }[] = [];
  constructor(public x: number, public top: number, public width = 120) {
    const r = mulberry32(Math.round(x));
    for (let i = 0; i < 26; i++) this.fluff.push({ u: r() - 0.5, y: r(), ph: r() * TAU, sp: 0.25 + r() * 0.2 });
  }

  update(w: World, dt: number): void {
    const p = w.player;
    if (w.mode === 'play' && Math.abs(p.x - this.x) < this.width / 2 && p.y > this.top) {
      p.vy = Math.max(-320, p.vy - 1500 * dt);
      p.energy = 1;
      if (Math.random() < 0.3) spawn({ x: p.x + (Math.random() - 0.5) * 30, y: p.y - 20, vx: 0, vy: -80, life: 0.7, max: 0.7, size: 3, color: '#ffffff', drag: 1 });
    }
  }

  draw(w: World): void {
    if (!visible(this.x - 100, this.x + 100)) return;
    const gy = w.ground(this.x), h = gy - this.top, t = V.time;
    const g = ctx.createLinearGradient(0, this.top, 0, gy);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.3, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(255,255,255,0.25)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x - this.width / 2, this.top, this.width, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const y = gy - ((t * 120 + i * h / 4) % h);
      ctx.beginPath();
      ctx.moveTo(this.x - 30, y); ctx.quadraticCurveTo(this.x, y - 16, this.x + 30, y - 4);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (const f of this.fluff) {
      const y = gy - ((f.y + t * f.sp) % 1) * h, x = this.x + f.u * this.width + Math.sin(t * 2 + f.ph) * 10;
      circle(ctx, x, y, 2.4);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1;
      for (let k = 0; k < 5; k++) { const a = k * TAU / 5 + f.ph; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 5, y + Math.sin(a) * 5); ctx.stroke(); }
    }
    // dandelion clump at the base
    for (let i = -2; i <= 2; i++) {
      const sx = this.x + i * 16, sh = 34 + (2 - Math.abs(i)) * 10;
      ctx.strokeStyle = '#7da23c'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(sx, gy + 2); ctx.quadraticCurveTo(sx + Math.sin(t * 2 + i) * 4, gy - sh / 2, sx, gy - sh); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; circle(ctx, sx, gy - sh, 8);
    }
  }
}

function drawChick(flap: number, happy: boolean): void {
  ctx.fillStyle = '#ffd95a'; circle(ctx, 0, 0, 16);
  ctx.fillStyle = '#fff1a8'; ctx.beginPath(); ctx.ellipse(3, 5, 9, 8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffc94a';
  ctx.save(); ctx.translate(-8, 0); ctx.rotate(-0.4 - flap * 0.8); ctx.beginPath(); ctx.ellipse(-4, 0, 9, 5, 0, 0, TAU); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#ff9a3c'; ctx.beginPath(); ctx.moveTo(14, -3); ctx.lineTo(23, 0); ctx.lineTo(14, 3); ctx.fill();
  ctx.fillStyle = '#3b2550'; circle(ctx, 8, -5, 2.6); ctx.fillStyle = '#fff'; circle(ctx, 9, -6, 0.9);
  ctx.fillStyle = 'rgba(255,130,150,0.55)'; circle(ctx, 9, 2, 2.5);
  ctx.strokeStyle = '#ffc94a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-2, -15); ctx.quadraticCurveTo(0, -22, 4, -20); ctx.stroke();
  if (!happy) { ctx.fillStyle = '#9fd8ff'; circle(ctx, 6, 3 + (V.time * 20 % 8), 1.6); }
}

export class Nest implements Entity {
  z = -1;
  canopy: { x: number; y: number; r: number }[] = [];
  constructor(public x: number, public y: number, public branch: Platform) {
    const r = mulberry32(Math.round(x));
    for (let i = 0; i < 34; i++) this.canopy.push({ x: x + 150 + (r() - 0.5) * 380, y: y - 140 + (r() - 0.5) * 160, r: 50 + r() * 40 });
    this.canopy.sort((a, b) => a.y - b.y);
  }
  update(): void {}
  draw(w: World): void {
    if (!visible(this.x - 300, this.x + 400)) return;
    const tx = this.x + 150, gy = w.ground(tx);
    const g = ctx.createLinearGradient(tx - 50, 0, tx + 50, 0);
    g.addColorStop(0, '#6e4636'); g.addColorStop(1, '#b8825c');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(tx - 90, gy + 20); ctx.quadraticCurveTo(tx - 44, gy - 20, tx - 40, gy - 140);
    ctx.lineTo(tx - 32, this.y - 200); ctx.lineTo(tx + 32, this.y - 200); ctx.lineTo(tx + 40, gy - 140);
    ctx.quadraticCurveTo(tx + 44, gy - 20, tx + 92, gy + 20); ctx.closePath(); ctx.fill();
    drawCanopy(this.canopy);
    // branch holding the nest
    const b = this.branch;
    ctx.fillStyle = '#8d5d43';
    ctx.beginPath(); ctx.moveTo(tx, b.y - 8); ctx.quadraticCurveTo((tx + b.x) / 2, b.y - 4, b.x - 10, b.y); ctx.lineTo(b.x - 10, b.y + 12); ctx.quadraticCurveTo((tx + b.x) / 2, b.y + 14, tx, b.y + 30); ctx.fill();
    ctx.strokeStyle = '#6cc552'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tx, b.y - 4); ctx.lineTo(b.x - 4, b.y + 2); ctx.stroke();
    // nest
    ctx.fillStyle = '#a8763f';
    ctx.beginPath(); ctx.ellipse(this.x, this.y, 44, 18, 0, 0, Math.PI); ctx.fill();
    ctx.strokeStyle = '#8a5a2c'; ctx.lineWidth = 3;
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(this.x + i * 11 - 8, this.y + 2); ctx.lineTo(this.x + i * 11 + 8, this.y + 12); ctx.stroke(); }
    ctx.fillStyle = '#c99a5a'; ctx.beginPath(); ctx.ellipse(this.x, this.y, 44, 8, 0, 0, TAU); ctx.fill();
  }
}

export class BabyBird implements Entity {
  z = 1;
  state: 'lost' | 'follow' | 'home' = 'lost';
  trail = new Trail(24, -78);
  x: number;
  y = 0;
  homeT = 0;
  bubbleA = 0;
  chirpT = 1;
  constructor(public startX: number, public nest: Nest) { this.x = startX; }

  update(w: World, dt: number): void {
    const near = w.mode === 'play' && playerNear(w, this.x, this.y, 380);
    this.bubbleA += ((this.state === 'lost' && near ? 1 : 0) - this.bubbleA) * Math.min(1, dt * 5);
    this.chirpT -= dt;
    if (this.state === 'lost') {
      this.y = w.ground(this.x) - 16 - Math.abs(Math.sin(V.time * 3)) * 10;
      if (this.chirpT < 0 && near) { Sound.tick(); this.chirpT = 1.5; }
      if (w.mode === 'play' && playerNear(w, this.x, this.y, 60)) {
        this.state = 'follow'; this.trail.reset(this.x, this.y);
        Sound.happy(); sparkleBurst(this.x, this.y, 12, ['#fff3a8', '#ffd95a']);
      }
    } else if (this.state === 'follow') {
      this.trail.update(w, dt);
      this.x = this.trail.x; this.y = this.trail.y;
      if (w.mode === 'play' && Math.hypot(this.x - this.nest.x, this.y - this.nest.y) < 110) {
        this.state = 'home'; this.homeT = 0; Sound.happy(); Sound.magic();
      }
    } else {
      this.homeT += dt;
      const u = ease(clamp(this.homeT / 1, 0, 1));
      this.x = lerp(this.x, this.nest.x, u); this.y = lerp(this.y, this.nest.y - 14, u);
      if (this.homeT > 1 && w.mode === 'play') {
        sparkleBurst(this.nest.x, this.nest.y - 20, 22);
        win(w, { x: this.nest.x - 150, y: this.nest.y - 60 });
      }
    }
  }

  draw(w: World): void {
    if (!visible(this.x - 60, this.x + 60)) return;
    const flap = Math.abs(Math.sin(V.time * (this.state === 'follow' ? 16 : 5)));
    const face = this.state === 'follow' ? Math.sign(w.player.x - this.x) || 1 : 1;
    ctx.save(); ctx.translate(this.x, this.y); ctx.scale(face * 1.3, 1.3);
    drawChick(flap, this.state !== 'lost');
    ctx.restore();
  }

  drawOver(): void {
    if (this.bubbleA < 0.02) return;
    drawBubble(this.x, this.y - 26, this.bubbleA, 72, () => {
      ctx.fillStyle = '#a8763f'; ctx.beginPath(); ctx.ellipse(0, 6, 24, 11, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#c99a5a'; ctx.beginPath(); ctx.ellipse(0, 6, 24, 5, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#7ab8e8'; ctx.beginPath(); ctx.ellipse(0, -8, 14, 11, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ff9a3c'; ctx.beginPath(); ctx.moveTo(12, -10); ctx.lineTo(19, -7); ctx.lineTo(12, -5); ctx.fill();
      ctx.fillStyle = '#3b2550'; circle(ctx, 6, -10, 1.8);
    });
  }
}

// Mama bird circles the nest until the baby is back.
export class MamaBird implements Entity {
  z = 0;
  constructor(public nest: Nest, public baby: BabyBird) {}
  update(): void {}
  draw(): void {
    const t = V.time, home = this.baby.state === 'home';
    const x = home ? this.nest.x + 30 : this.nest.x + Math.cos(t * 0.8) * 120;
    const y = home ? this.nest.y - 26 : this.nest.y - 120 + Math.sin(t * 1.6) * 30;
    if (!visible(x - 60, x + 60)) return;
    const face = home ? -1 : (Math.sin(t * 0.8) < 0 ? 1 : -1);
    const flap = home ? 0.2 : Math.abs(Math.sin(t * 10));
    ctx.save(); ctx.translate(x, y); ctx.scale(face * 1.9, 1.9);
    ctx.fillStyle = '#6aaee8'; circle(ctx, 0, 0, 16);
    ctx.fillStyle = '#d9efff'; ctx.beginPath(); ctx.ellipse(4, 5, 9, 8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#4a8fd0';
    ctx.save(); ctx.translate(-6, -2); ctx.rotate(-0.5 - flap * 1.1); ctx.beginPath(); ctx.ellipse(-6, 0, 12, 6, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#ff9a3c'; ctx.beginPath(); ctx.moveTo(14, -3); ctx.lineTo(23, 0); ctx.lineTo(14, 3); ctx.fill();
    ctx.fillStyle = '#3b2550'; circle(ctx, 8, -5, 2.4); ctx.fillStyle = '#fff'; circle(ctx, 9, -6, 0.8);
    ctx.restore();
  }
}
