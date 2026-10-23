import { ctx, V, visible } from '../engine/view';
import { glow, sparkleBurst, spawn } from '../engine/fx';
import { TAU, circle } from '../util';
import { Sound } from '../sound';
import { playerNear, win } from '../game/world';
import { drawBubble } from '../render/hud';
import type { Entity, Platform, World } from '../game/types';

// Level 6 pieces: singing frogs on lily pads and the song game.

const NOTE_ICON = (col: string) => {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(-6, 10, 8, 6, -0.4, 0, TAU); ctx.fill();
  ctx.fillRect(0, -18, 3.5, 28);
  ctx.beginPath(); ctx.moveTo(3.5, -18); ctx.quadraticCurveTo(16, -12, 12, -2); ctx.quadraticCurveTo(12, -10, 3.5, -10); ctx.fill();
};

export class Frog implements Entity {
  z = 0;
  singT = 0;        // >0 while singing
  noT = 0;          // >0 while shaking "no"
  jumpT = -1;
  wasNear = false;
  onTouch: (() => void) | null = null;
  constructor(public pad: Platform, public body: string, public note: number) {
    pad.invisible = true;
  }

  get x() { return this.pad.x + this.pad.w / 2; }
  get y() { return this.pad.y + this.pad.sag; }

  sing(): void {
    this.singT = 0.6;
    Sound.note(this.note);
    for (let i = 0; i < 3; i++) spawn({ x: this.x + 10, y: this.y - 50, vx: 30 + Math.random() * 40, vy: -60 - Math.random() * 40, life: 1, max: 1, size: 5, color: this.body, rot: 0, vr: 1, drag: 1 });
  }

  update(w: World, dt: number): void {
    this.singT = Math.max(0, this.singT - dt);
    this.noT = Math.max(0, this.noT - dt);
    if (this.jumpT >= 0) this.jumpT += dt;
    const near = w.mode === 'play' && playerNear(w, this.x, this.y - 30, 62);
    if (near && !this.wasNear && this.onTouch) this.onTouch();
    this.wasNear = near;
  }

  draw(): void {
    if (!visible(this.x - 120, this.x + 120)) return;
    const x = this.x, y = this.y;
    // lily pad
    ctx.fillStyle = '#3f9a52';
    ctx.beginPath(); ctx.ellipse(x, y + 4, this.pad.w / 2 + 8, 14, 0, 0.25, TAU - 0.25); ctx.lineTo(x, y + 4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#5cbf5a';
    ctx.beginPath(); ctx.ellipse(x, y + 1, this.pad.w / 2, 11, 0, 0.25, TAU - 0.25); ctx.lineTo(x, y + 1); ctx.closePath(); ctx.fill();
    // frog
    const hop = this.jumpT >= 0 ? Math.abs(Math.sin(this.jumpT * 6)) * 40 : this.singT > 0 ? Math.sin(this.singT * 10) * 4 : 0;
    const shake = this.noT > 0 ? Math.sin(this.noT * 40) * 4 : 0;
    ctx.save(); ctx.translate(x + shake, y - hop); ctx.scale(1.25, 1.25);
    ctx.fillStyle = this.body;
    ctx.beginPath(); ctx.ellipse(0, -18, 28, 20, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-20, -4, 10, 6, 0, 0, TAU); ctx.ellipse(20, -4, 10, 6, 0, 0, TAU); ctx.fill();
    // throat
    const sac = this.singT > 0 ? 1 + Math.sin(this.singT * 20) * 0.25 + 0.4 : 1;
    ctx.fillStyle = '#fff3c8'; ctx.beginPath(); ctx.ellipse(0, -10, 14 * sac, 8 * sac, 0, 0, TAU); ctx.fill();
    // eyes
    for (const s of [-1, 1]) {
      ctx.fillStyle = this.body; circle(ctx, s * 12, -36, 10);
      ctx.fillStyle = '#fff'; circle(ctx, s * 12, -37, 7);
      ctx.fillStyle = '#2d2a44'; circle(ctx, s * 12 + 1, -36, 3.6);
      ctx.fillStyle = '#fff'; circle(ctx, s * 12 + 2.5, -38, 1.3);
    }
    ctx.strokeStyle = '#2d2a44'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath();
    if (this.singT > 0) { ctx.fillStyle = '#c2557a'; ctx.ellipse(0, -21, 6, 4, 0, 0, TAU); ctx.fill(); }
    else { ctx.arc(0, -26, 9, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,130,160,0.5)'; circle(ctx, -18, -20, 3.5); circle(ctx, 18, -20, 3.5);
    ctx.restore();
  }

  drawLight(): void {
    if (this.singT > 0) glow(this.x, this.y - 30, 110, 'rgba(255,240,150,A)', this.singT * 1.2);
  }
}

// Plays a short song, then waits for the fairy to touch the frogs in the same order.
// Anything that can take part in the "listen and repeat" game.
export interface Singer { x: number; y: number; noT: number; jumpT: number; onTouch: (() => void) | null; sing(): void }

export class FrogChoir implements Entity {
  z = 0;
  rounds = [[0, 2], [1, 0, 2], [2, 1, 0]];
  round = 0;
  state: 'wait' | 'show' | 'listen' | 'done' = 'wait';
  t = 0;
  step = 0;
  got = 0;
  bubbleA = 0;

  constructor(public frogs: Singer[], public startX: number, public winSpot: { x: number; y: number }, rounds?: number[][]) {
    if (rounds) this.rounds = rounds;
    frogs.forEach((f, i) => { f.onTouch = () => this.touched(i); });
  }

  private touched(i: number): void {
    const f = this.frogs[i];
    if (this.state !== 'listen') { f.sing(); return; }
    const want = this.rounds[this.round][this.got];
    if (i === want) {
      f.sing(); this.got++;
      if (this.got >= this.rounds[this.round].length) {
        this.round++;
        sparkleBurst(f.x, f.y - 40, 16);
        if (this.round >= this.rounds.length) { this.state = 'done'; this.t = 0; Sound.magic(); }
        else { this.state = 'show'; this.t = -1.4; this.step = 0; Sound.happy(); }
      }
    } else {
      f.noT = 0.5; Sound.oops();
      this.state = 'show'; this.t = -1; this.step = 0;   // gently play it again
    }
  }

  update(w: World, dt: number): void {
    this.t += dt;
    const near = w.player.x > this.startX;
    this.bubbleA += ((this.state === 'wait' && w.mode === 'play' && Math.abs(w.player.x - this.startX) < 500 ? 1 : 0) - this.bubbleA) * Math.min(1, dt * 5);
    switch (this.state) {
      case 'wait':
        if (near && w.mode === 'play') { this.state = 'show'; this.t = -0.6; this.step = 0; }
        break;
      case 'show': {
        const song = this.rounds[this.round];
        if (this.t >= this.step * 0.8 && this.step < song.length) { this.frogs[song[this.step]].sing(); this.step++; }
        if (this.t > song.length * 0.8 + 0.2) { this.state = 'listen'; this.got = 0; }
        break;
      }
      case 'done':
        this.frogs.forEach((f, i) => { if (this.t > i * 0.25 && f.jumpT < 0) { f.jumpT = 0; f.sing(); } });
        if (this.t > 1.6 && w.mode === 'play') win(w, this.winSpot);
        break;
    }
  }

  draw(): void {}

  drawOver(): void {
    const mid = this.frogs[1];
    if (this.bubbleA > 0.02) {
      drawBubble(mid.x, mid.y - 80, this.bubbleA, 70, () => { ctx.save(); ctx.translate(-8, 0); NOTE_ICON('#6a4bb0'); ctx.restore(); ctx.save(); ctx.translate(12, -4); ctx.scale(0.7, 0.7); NOTE_ICON('#ff8fc7'); ctx.restore(); });
    }
    if (this.state === 'show' || this.state === 'listen') {
      // progress dots: one per note in this song
      const song = this.rounds[this.round], n = song.length, x0 = mid.x - (n - 1) * 14, y = mid.y - 120;
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath(); ctx.ellipse(mid.x, y, n * 14 + 14, 18, 0, 0, TAU); ctx.fill();
      for (let i = 0; i < n; i++) {
        const lit = this.state === 'listen' ? i < this.got : i < this.step;
        ctx.fillStyle = lit ? '#ffcf3a' : '#d9cbf6';
        circle(ctx, x0 + i * 28, y, 8);
      }
      if (this.state === 'listen') {
        // little ear: "your turn"
        ctx.fillStyle = '#6a4bb0';
        ctx.font = '700 18px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('♪', mid.x + n * 14 + 34, y + Math.sin(V.time * 5) * 3);
      }
      ctx.restore();
    }
  }
}
