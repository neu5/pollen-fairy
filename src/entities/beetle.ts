import { ctx, V, visible } from '../engine/view';
import { glow, sparkleBurst, spawn } from '../engine/fx';
import { TAU, clamp, ease, circle, rr } from '../util';
import { Sound } from '../sound';
import { playerNear, fadeTheme, win, nightAmount } from '../game/world';
import { drawBubble } from '../render/hud';
import { drawZ } from '../render/terrain';
import { touchGlow } from './friend';
import type { Entity, Platform, World } from '../game/types';

// Level 3 pieces: a magic hourglass that turns night into day, a sleepy beetle and a big stone.

export function drawHourglassIcon(sand: number, flip = 0): void {
  ctx.save(); ctx.rotate(flip * Math.PI);
  ctx.fillStyle = '#b07a55'; rr(ctx, -16, -24, 32, 6, 3); ctx.fill(); rr(ctx, -16, 18, 32, 6, 3); ctx.fill();
  ctx.fillStyle = 'rgba(220,240,255,0.85)';
  ctx.beginPath(); ctx.moveTo(-12, -18); ctx.lineTo(12, -18); ctx.lineTo(2, 0); ctx.lineTo(12, 18); ctx.lineTo(-12, 18); ctx.lineTo(-2, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffcf5a';
  const top = 1 - sand;
  if (top > 0.02) { ctx.beginPath(); ctx.moveTo(-10 * top, -2 - 14 * top); ctx.lineTo(10 * top, -2 - 14 * top); ctx.lineTo(1, -1); ctx.lineTo(-1, -1); ctx.closePath(); ctx.fill(); }
  if (sand > 0.02) { ctx.beginPath(); ctx.moveTo(-11, 17); ctx.lineTo(11, 17); ctx.lineTo(4 * (1 - sand) + 2, 17 - 14 * sand); ctx.lineTo(-4 * (1 - sand) - 2, 17 - 14 * sand); ctx.closePath(); ctx.fill(); }
  ctx.restore();
}

export class Hourglass implements Entity {
  z = 0;
  t = -1;            // time since flipped
  done = false;
  constructor(public on: Platform, public u = 0.5, public dur = 6) {}

  pos() { return { x: this.on.x + this.on.w * this.u, y: this.on.y + this.on.sag - 34 }; }

  update(w: World, dt: number): void {
    const p = this.pos();
    if (this.t < 0 && w.mode === 'play' && playerNear(w, p.x, p.y, 70)) {
      this.t = 0; Sound.magic();
      sparkleBurst(p.x, p.y, 20, ['#fff3a8', '#ffd166', '#c3aaff']);
    }
    if (this.t >= 0 && !this.done) {
      const before = Math.floor(this.t * 2);
      this.t += dt;
      if (Math.floor(this.t * 2) !== before) Sound.tick();
      if (this.t > 0.6) this.done = fadeTheme(w, 'morning', dt, this.dur);
    }
  }

  draw(): void {
    const p = this.pos();
    if (!visible(p.x - 80, p.x + 80)) return;
    if (this.t < 0) touchGlow(p.x, p.y, 70);
    const flip = this.t < 0 ? 0 : ease(clamp(this.t / 0.6, 0, 1));
    const sand = this.t < 0.6 ? 0 : clamp((this.t - 0.6) / this.dur, 0, 1);
    ctx.save(); ctx.translate(p.x, p.y + Math.sin(V.time * 2) * 3); ctx.scale(1.5, 1.5);
    drawHourglassIcon(flip < 1 ? 1 : sand, flip);
    if (this.t >= 0.6 && sand < 1) { ctx.fillStyle = '#ffcf5a'; ctx.fillRect(-0.8, -1, 1.6, 17 - 14 * sand); }
    ctx.restore();
  }

  drawLight(w: World): void {
    const p = this.pos();
    glow(p.x, p.y, 90, 'rgba(255,220,140,A)', 0.5 * Math.max(0.3, nightAmount(w)));
  }
}

export class BigStone implements Entity {
  z = 0;
  pushed = 0;        // 0..1 how far it rolled away
  constructor(public x: number) {}
  update(): void {}
  draw(w: World): void {
    const x = this.x + this.pushed * 260, k = 1 - this.pushed * 0.5, a = 1 - clamp((this.pushed - 0.7) / 0.3, 0, 1);
    if (a <= 0 || !visible(x - 120, x + 120)) return;
    const gy = w.ground(x), r = 78 * k;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, gy - r + 8 - this.pushed * 60); ctx.rotate(this.pushed * 4);
    const g = ctx.createRadialGradient(-r * 0.3, -r * 0.4, r * 0.2, 0, 0, r * 1.1);
    g.addColorStop(0, '#d2cae6'); g.addColorStop(1, '#7f709f');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.05, r, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#5fb84f'; ctx.beginPath(); ctx.ellipse(-r * 0.15, -r * 0.82, r * 0.55, r * 0.2, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(70,50,110,0.35)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(r * 0.2, -r * 0.5); ctx.lineTo(r * 0.45, 0); ctx.lineTo(r * 0.25, r * 0.4); ctx.stroke();
    ctx.restore();
  }
}

export class Beetle implements Entity {
  z = 0;
  state: 'sleep' | 'wake' | 'walk' | 'push' | 'happy' = 'sleep';
  t = 0;
  bubbleA = 0;
  constructor(public x: number, public stone: BigStone, public clock: Hourglass) {}

  update(w: World, dt: number): void {
    this.t += dt;
    const night = nightAmount(w);
    const near = w.mode === 'play' && playerNear(w, this.x, w.ground(this.x) - 40, 260);
    this.bubbleA += ((this.state === 'sleep' && near && this.clock.t < 0 ? 1 : 0) - this.bubbleA) * Math.min(1, dt * 5);
    if (w.mode !== 'play') return;
    switch (this.state) {
      case 'sleep':
        if (night < 0.15) { this.state = 'wake'; this.t = 0; Sound.happy(); }
        break;
      case 'wake':
        if (this.t > 1.6) { this.state = 'walk'; this.t = 0; }
        break;
      case 'walk': {
        const stop = this.stone.x - 112;
        this.x = Math.min(stop, this.x + 60 * dt);
        if (this.x >= stop) { this.state = 'push'; this.t = 0; Sound.thud(); }
        break;
      }
      case 'push':
        this.stone.pushed = clamp(this.t / 2.2, 0, 1);
        this.x = this.stone.x - 112 + ease(clamp(this.t / 2.2, 0, 1)) * 120;
        if (Math.random() < 0.3) spawn({ kind: 'dust', x: this.x + 30, y: w.ground(this.x), vx: -40, vy: -20, life: 0.6, max: 0.6, size: 5, color: 'rgba(255,255,255,0.7)', drag: 2 });
        if (this.t > 2.4) {
          this.state = 'happy'; this.t = 0;
          sparkleBurst(this.x, w.ground(this.x) - 60, 18);
          win(w, { x: this.x - 140, y: w.ground(this.x) - 170 });
        }
        break;
    }
  }

  draw(w: World): void {
    if (!visible(this.x - 200, this.x + 200)) return;
    const gy = w.ground(this.x), t = V.time;
    const asleep = this.state === 'sleep';
    const breathe = asleep ? Math.sin(t * 1.6) * 2 : 0;
    const hop = this.state === 'happy' || (this.state === 'wake' && this.t > 0.8) ? Math.abs(Math.sin(t * 8)) * 10 : 0;
    const walk = this.state === 'walk' || this.state === 'push' ? Math.sin(t * 14) : 0;
    ctx.save(); ctx.translate(this.x, gy - hop); ctx.scale(1.3, 1.3);
    // legs
    ctx.strokeStyle = '#2d2a44'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const lx = -24 + i * 24, sw = walk * (i % 2 ? 1 : -1) * 6;
      ctx.beginPath(); ctx.moveTo(lx, -14); ctx.lineTo(lx + sw - 4, 0); ctx.stroke();
    }
    // shell
    const g = ctx.createRadialGradient(-10, -50, 6, 0, -30, 54);
    g.addColorStop(0, '#9ff0d8'); g.addColorStop(0.5, '#3fb5a8'); g.addColorStop(1, '#2a6f9a');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(-6, -32 + breathe, 46, 30 + breathe * 0.5, 0, Math.PI, 0); ctx.lineTo(40, -12); ctx.lineTo(-52, -12); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(20,40,70,0.4)'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-6, -62 + breathe); ctx.lineTo(-6, -12); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-22, -46 + breathe, 12, 5, -0.4, 0, TAU); ctx.fill();
    for (const [sx, sy] of [[-28, -26], [14, -30], [-16, -40]]) { ctx.fillStyle = 'rgba(20,50,80,0.35)'; circle(ctx, sx, sy + breathe, 4); }
    // head
    ctx.fillStyle = '#2d2a44'; circle(ctx, 44, -24, 17);
    ctx.strokeStyle = '#2d2a44'; ctx.lineWidth = 3;
    const ant = asleep ? 0.4 : Math.sin(t * 3) * 0.15;
    ctx.beginPath(); ctx.moveTo(48, -38); ctx.quadraticCurveTo(54, -58 + ant * 20, 66, -60 + ant * 30); ctx.moveTo(40, -38); ctx.quadraticCurveTo(42, -60 + ant * 20, 52, -66 + ant * 30); ctx.stroke();
    ctx.fillStyle = '#ffd84a'; circle(ctx, 66, -60 + ant * 30, 3.5); circle(ctx, 52, -66 + ant * 30, 3.5);
    // face
    ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineWidth = 2;
    if (asleep || (this.state === 'wake' && this.t < 0.8)) {
      ctx.beginPath(); ctx.arc(46, -27, 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(55, -27, 3.5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    } else {
      circle(ctx, 46, -28, 4.5); circle(ctx, 55, -28, 4);
      ctx.fillStyle = '#2d2a44'; circle(ctx, 47.5, -28, 2.2); circle(ctx, 56, -28, 2);
      ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(51, -18, 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,130,170,0.6)'; circle(ctx, 58, -18, 3);
    ctx.restore();
    if (asleep) drawZ(this.x + 60, gy - 80, 0, 18);
    if (asleep) drawZ(this.x + 70, gy - 90, 0.5, 14);
  }

  drawOver(w: World): void {
    const gy = w.ground(this.x), t = V.time;
    if (this.bubbleA > 0.02) {
      drawBubble(this.x, gy - 112, this.bubbleA, 78, () => {
        // hourglass + little sun: "turn the time to morning"
        ctx.save(); ctx.translate(-12, 0); drawHourglassIcon(0); ctx.restore();
        ctx.fillStyle = '#ffcf3a'; circle(ctx, 18, -8, 8);
        ctx.strokeStyle = '#ffcf3a'; ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + t; ctx.beginPath(); ctx.moveTo(18 + Math.cos(a) * 11, -8 + Math.sin(a) * 11); ctx.lineTo(18 + Math.cos(a) * 15, -8 + Math.sin(a) * 15); ctx.stroke(); }
      });
      const c = this.clock.pos(), bob = Math.abs(Math.sin(V.time * 4)) * 12;
      ctx.save(); ctx.globalAlpha = this.bubbleA;
      ctx.fillStyle = '#ffd84a'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      const ay = c.y - 80 - bob;
      ctx.beginPath(); ctx.moveTo(c.x - 14, ay); ctx.lineTo(c.x + 14, ay); ctx.lineTo(c.x, ay + 20); ctx.closePath(); ctx.stroke(); ctx.fill();
      ctx.restore();
    }
  }
}
