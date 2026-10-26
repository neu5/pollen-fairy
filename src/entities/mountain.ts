import { ctx, V, visible, screenSpace } from '../engine/view';
import { glow, sparkleBurst, star } from '../engine/fx';
import { TAU, circle, clamp, ease, rr } from '../util';
import { Sound } from '../sound';
import { playerNear } from '../game/world';
import { drawBubble } from '../render/hud';
import { openNumbers, type AskPart } from '../ui/numbers';
import { Friend, touchGlow, type Blocker } from './friend';
import type { OrderItem } from './order';
import type { Entity, World } from '../game/types';

// Chapter 5 pieces: goat and sign posts, number questions, the balance scale, cloud shapes,
// snowflakes, moon phases, the balloon, star pictures.

// ----------------------------------------------------------------- goat ----
function drawGoat(walk: number, happy: boolean): void {
  ctx.fillStyle = '#f4f0ea';
  ctx.beginPath(); ctx.ellipse(-4, -26, 26, 15, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#5a4a44'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
  for (const [x, ph] of [[-20, 0], [-10, 1], [6, 2], [14, 3]] as [number, number][]) { ctx.beginPath(); ctx.moveTo(x, -16); ctx.lineTo(x + Math.sin(walk + ph) * 4, 0); ctx.stroke(); }
  ctx.fillStyle = '#f4f0ea'; ctx.beginPath(); ctx.ellipse(24, -42, 11, 13, 0.4, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#a8907a'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(18, -56, 8, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.fillStyle = '#e8dccc'; ctx.beginPath(); ctx.moveTo(28, -32); ctx.lineTo(32, -20); ctx.lineTo(24, -30); ctx.fill();
  ctx.fillStyle = '#2d2438'; circle(ctx, 28, -45, 2.3);
  ctx.fillStyle = '#ffb3c6'; circle(ctx, 33, -37, 2.4);
  if (happy) { ctx.fillStyle = 'rgba(255,130,150,0.5)'; circle(ctx, 24, -38, 3); }
}

export class Goat extends Friend {
  height = 64;
  constructor(x: number, homeX: number) { super(x, 60, homeX); }
  drawMini(): void { ctx.translate(-6, 18); ctx.scale(0.6, 0.6); drawGoat(0, true); }
  drawBody(_w: World, moving: boolean): void { ctx.scale(1.3, 1.3); drawGoat(moving ? this.walkT * 12 : 0, this.state !== 'wait'); }
}

export type Dir = 'left' | 'up' | 'right';
const DIRS: Dir[] = ['left', 'up', 'right'];
export function drawArrow(d: Dir, s = 1, col = '#5b3a8c'): void {
  ctx.save(); ctx.scale(s, s); ctx.rotate(d === 'left' ? Math.PI : d === 'up' ? -Math.PI / 2 : 0);
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-16, -6); ctx.lineTo(2, -6); ctx.lineTo(2, -15); ctx.lineTo(18, 0); ctx.lineTo(2, 15); ctx.lineTo(2, 6); ctx.lineTo(-16, 6); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// A sign post with an arrow. Touch it to turn the arrow. It must point the way Goat wants.
export class SignPost implements Entity, Blocker {
  z = 1;
  dir: Dir;
  wasNear = false;
  spinT = 0;
  stopX: number;
  constructor(public x: number, public want: Dir, start: Dir) { this.dir = start; this.stopX = x - 90; }
  get cleared() { return this.dir === this.want; }
  target(w: World) { return { x: this.x, y: w.ground(this.x) - 130 }; }
  update(w: World, dt: number): void {
    this.spinT = Math.max(0, this.spinT - dt);
    const near = w.mode === 'play' && playerNear(w, this.x, w.ground(this.x) - 110, 70);
    if (near && !this.wasNear) {
      this.dir = DIRS[(DIRS.indexOf(this.dir) + 1) % 3]; this.spinT = 0.3; Sound.tick();
      if (this.cleared) { Sound.happy(); sparkleBurst(this.x, w.ground(this.x) - 110, 12); }
    }
    this.wasNear = near;
  }
  draw(w: World): void {
    if (!visible(this.x - 80, this.x + 80)) return;
    const gy = w.ground(this.x);
    ctx.fillStyle = '#8a5a3a'; ctx.fillRect(this.x - 5, gy - 110, 10, 112);
    ctx.fillStyle = this.cleared ? '#c8f5c8' : '#fff4cc'; rr(ctx, this.x - 40, gy - 140, 80, 52, 12); ctx.fill();
    ctx.strokeStyle = '#8a5a3a'; ctx.lineWidth = 4; ctx.stroke();
    ctx.save(); ctx.translate(this.x, gy - 114); ctx.scale(1, 1 - Math.sin(this.spinT / 0.3 * Math.PI) * 0.6); drawArrow(this.dir, 1.2); ctx.restore();
    if (!this.cleared) touchGlow(this.x, gy - 114, 70);
  }
  drawIcon(): void { drawArrow(this.want, 1.1, '#e8455a'); }
}

// ------------------------------------------------------- number question ----
// Something you touch to answer a counting question (fire, balloon, a star picture…).
export class NumberAsk implements Entity {
  z = -1;
  solved = false;
  wasNear = false;
  locked = false;
  constructor(
    public x: number, public y: number, public ask: AskPart[], public answer: number,
    public look: (solved: boolean) => void, public onSolved: (w: World) => void, public r = 90,
  ) {}
  update(w: World): void {
    const near = w.mode === 'play' && !this.solved && !this.locked && playerNear(w, this.x, this.y, this.r);
    if (near && !this.wasNear) {
      openNumbers(this.ask, this.answer, () => { this.solved = true; sparkleBurst(this.x, this.y, 24); this.onSolved(w); });
      w.player.x -= 70;
    }
    this.wasNear = near;
  }
  draw(): void {
    if (!visible(this.x - 200, this.x + 200)) return;
    if (!this.solved && !this.locked) touchGlow(this.x, this.y, this.r);
    ctx.save(); ctx.translate(this.x, this.y); this.look(this.solved); ctx.restore();
  }
  drawOver(w: World): void {
    if (this.solved || this.locked || !playerNear(w, this.x, this.y, 600)) return;
    drawBubble(this.x, this.y - this.r - 20, 1, 60, () => { ctx.fillStyle = '#5b3a8c'; ctx.font = '700 40px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 4); });
  }
}

export function campfireLook(logs: number, lit: boolean): void {
  for (let i = 0; i < logs; i++) {
    ctx.save(); ctx.translate(-26 + (i % 3) * 26, -8 - Math.floor(i / 3) * 14); ctx.rotate((i % 2 ? 0.3 : -0.3));
    ctx.fillStyle = '#9a6a42'; rr(ctx, -20, -6, 40, 12, 6); ctx.fill(); ctx.restore();
  }
  if (lit) {
    for (const [dx, h, c] of [[-12, 50, '#ff9a3c'], [8, 64, '#ffcf3a'], [0, 40, '#ff6b5a']] as [number, number, string][]) {
      const f = Math.sin(V.time * 10 + dx) * 4;
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(dx - 14, -14); ctx.quadraticCurveTo(dx - 10 + f, -14 - h * 0.6, dx + f, -14 - h); ctx.quadraticCurveTo(dx + 10 + f, -14 - h * 0.6, dx + 14, -14); ctx.fill();
    }
  }
}

// ---------------------------------------------------------------- scale ----
export interface Stone { w: number; x: number; y: number; on: boolean }

// A balance bridge: put stones on the right pan until it weighs the same as the left one.
export class Scale implements Entity {
  z = 0;
  right: number[] = [];
  holding: Stone | null = null;
  wasNearR = false;
  tilt = 0;
  done = false;
  constructor(public x: number, public left: number, public stones: Stone[], public onDone: (w: World) => void) {}
  get rightW() { return this.right.reduce((s, v) => s + v, 0); }
  pans(w: World) {
    const gy = w.ground(this.x), t = this.tilt * 30;
    return { l: { x: this.x - 150, y: gy - 110 + t }, r: { x: this.x + 150, y: gy - 110 - t } };
  }
  update(w: World, dt: number): void {
    const diff = clamp((this.rightW - this.left) / 3, -1, 1);
    this.tilt += (-diff - this.tilt) * Math.min(1, dt * 4);
    if (this.done) return;
    // pick up a stone lying around
    if (!this.holding) for (const s of this.stones) if (!s.on && playerNear(w, s.x, s.y, 50)) { this.holding = s; s.on = true; Sound.happy(); }
    const pans = this.pans(w);
    const nearR = w.mode === 'play' && playerNear(w, pans.r.x, pans.r.y - 20, 80);
    if (nearR && !this.wasNearR) {
      if (this.holding) { this.right.push(this.holding.w); this.holding = null; Sound.thud(); }
      else if (this.right.length) {           // take the last stone back off
        const wgt = this.right.pop()!, s = this.stones.find(k => k.on && k.w === wgt && !this.isHeld(k));
        if (s) { this.holding = s; Sound.tick(); }
      }
      if (this.rightW === this.left && !this.holding) { this.done = true; Sound.magic(); sparkleBurst(this.x, w.ground(this.x) - 120, 26); this.onDone(w); }
    }
    this.wasNearR = nearR;
  }
  private isHeld(s: Stone) { return s === this.holding; }
  private drawStone(x: number, y: number, wgt: number): void {
    const r = 10 + wgt * 5;
    ctx.fillStyle = '#9a96a8'; ctx.beginPath(); ctx.ellipse(x, y - r * 0.8, r, r * 0.8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < wgt; i++) circle(ctx, x - (wgt - 1) * 5 + i * 10, y - r * 0.8, 3.2);
  }
  draw(w: World): void {
    if (!visible(this.x - 300, this.x + 300)) return;
    const gy = w.ground(this.x), pans = this.pans(w);
    ctx.fillStyle = '#8a5a3a'; ctx.fillRect(this.x - 8, gy - 120, 16, 122);
    ctx.strokeStyle = '#6a4a3a'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(pans.l.x, pans.l.y - 50); ctx.lineTo(pans.r.x, pans.r.y - 50); ctx.stroke();
    for (const [pn, items] of [[pans.l, [this.left]], [pans.r, this.right]] as [{ x: number; y: number }, number[]][]) {
      ctx.strokeStyle = '#6a4a3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(pn.x - 40, pn.y); ctx.lineTo(pn.x, pn.y - 50); ctx.lineTo(pn.x + 40, pn.y); ctx.stroke();
      ctx.fillStyle = '#c98a4b'; ctx.beginPath(); ctx.ellipse(pn.x, pn.y, 50, 10, 0, 0, TAU); ctx.fill();
      let ox = -(items.length - 1) * 18;
      for (const wg of items) { this.drawStone(pn.x + ox, pn.y - 4, wg); ox += 36; }
    }
    for (const s of this.stones) if (!s.on) { if (!this.holding) touchGlow(s.x, s.y - 12, 40); this.drawStone(s.x, s.y, s.w); }
    if (this.holding) this.drawStone(w.player.x, w.player.y - 70, this.holding.w);
    if (!this.done && this.holding) touchGlow(pans.r.x, pans.r.y - 20, 70);
  }
}

// --------------------------------------------------------- cloud shapes ----
export type Shape = 'circle' | 'heart' | 'star' | 'square' | 'triangle';
export function drawShape(sh: Shape, r: number, col: string): void {
  ctx.fillStyle = col;
  ctx.beginPath();
  if (sh === 'circle') ctx.arc(0, 0, r, 0, TAU);
  else if (sh === 'square') rr(ctx, -r * 0.85, -r * 0.85, r * 1.7, r * 1.7, r * 0.2);
  else if (sh === 'triangle') { ctx.moveTo(0, -r); ctx.lineTo(r, r * 0.8); ctx.lineTo(-r, r * 0.8); ctx.closePath(); }
  else if (sh === 'heart') { ctx.moveTo(0, r * 0.9); ctx.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.6, -r * 1.2, 0, -r * 0.4); ctx.bezierCurveTo(r * 0.6, -r * 1.2, r * 1.4, -r * 0.1, 0, r * 0.9); }
  if (sh === 'star') { star(0, 0, r * 1.1, -Math.PI / 2); return; }
  ctx.fill();
}

// Eagle shows a shape; touch the cloud with the same shape. Three rounds.
export class ShapeQuiz implements Entity {
  z = 0;
  round = 0;
  wasNear: boolean[] = [];
  noT: number[] = [];
  doneT = -1;
  constructor(public eagle: { x: number; y: number }, public rounds: { want: Shape; clouds: { x: number; y: number; shape: Shape }[] }[], public onDone: (w: World) => void) {}
  update(w: World, dt: number): void {
    if (this.doneT >= 0) { this.doneT += dt; return; }
    const r = this.rounds[this.round];
    r.clouds.forEach((c, i) => {
      this.noT[i] = Math.max(0, (this.noT[i] ?? 0) - dt);
      const near = w.mode === 'play' && playerNear(w, c.x, c.y, 70);
      if (near && !this.wasNear[i]) {
        if (c.shape === r.want) {
          Sound.happy(); sparkleBurst(c.x, c.y, 18);
          this.round++; this.wasNear = [];
          if (this.round >= this.rounds.length) { this.doneT = 0; Sound.magic(); this.onDone(w); }
          return;
        }
        this.noT[i] = 0.5; Sound.oops();
      }
      this.wasNear[i] = near;
    });
  }
  draw(): void {
    // eagle on a rock
    const e = this.eagle;
    ctx.save(); ctx.translate(e.x, e.y); drawEagle(1.4, this.doneT >= 0 ? Math.abs(Math.sin(V.time * 10)) : 0); ctx.restore();
    if (this.doneT >= 0) return;
    const r = this.rounds[this.round];
    r.clouds.forEach((c, i) => {
      if (!visible(c.x - 100, c.x + 100)) return;
      ctx.save(); ctx.translate(c.x + (this.noT[i] > 0 ? Math.sin(this.noT[i] * 40) * 4 : 0), c.y + Math.sin(V.time * 1.4 + i) * 5);
      ctx.fillStyle = '#ffffff'; for (const [x, y, rr2] of [[-34, 6, 26], [0, -8, 34], [34, 6, 26], [0, 14, 26]]) circle(ctx, x, y, rr2);
      drawShape(c.shape, 20, '#8ab8e8');
      ctx.restore();
    });
  }
  drawOver(w: World): void {
    if (this.doneT >= 0 || !playerNear(w, this.eagle.x, this.eagle.y, 900)) return;
    drawBubble(this.eagle.x, this.eagle.y - 80, 1, 74, () => drawShape(this.rounds[this.round].want, 22, '#ff8fc7'));
  }
}

export function drawEagle(s: number, flap: number): void {
  ctx.save(); ctx.scale(s, s);
  ctx.fillStyle = '#7a5a3a';
  for (const d of [-1, 1]) { ctx.save(); ctx.translate(d * 14, -26); ctx.rotate(d * (0.5 + flap)); ctx.beginPath(); ctx.ellipse(d * 14, 0, 22, 9, 0, 0, TAU); ctx.fill(); ctx.restore(); }
  ctx.beginPath(); ctx.ellipse(0, -24, 16, 22, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff'; circle(ctx, 0, -50, 13);
  ctx.fillStyle = '#ffc040'; ctx.beginPath(); ctx.moveTo(8, -52); ctx.quadraticCurveTo(20, -50, 16, -42); ctx.lineTo(8, -46); ctx.fill();
  ctx.fillStyle = '#2d2438'; circle(ctx, 5, -53, 2.4);
  ctx.strokeStyle = '#ffc040'; ctx.lineWidth = 3; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(d * 6, -4); ctx.lineTo(d * 8, 2); ctx.stroke(); }
  ctx.restore();
}

// ----------------------------------------------------------- snowflakes ----
// Snowflakes to catch. A counter at the top shows how many.
export class Flakes implements Entity {
  z = 1;
  got = 0;
  taken: boolean[];
  constructor(public pts: { x: number; y: number }[], public need: number, public onDone: (w: World) => void) { this.taken = pts.map(() => false); }
  update(w: World): void {
    if (this.got >= this.need) return;
    this.pts.forEach((p, i) => {
      if (this.taken[i] || w.mode !== 'play') return;
      if (playerNear(w, p.x, p.y + Math.sin(V.time * 2 + i) * 8, 50)) {
        this.taken[i] = true; this.got++; Sound.note(Math.min(9, this.got - 1)); sparkleBurst(p.x, p.y, 10, ['#ffffff', '#cfe8ff']);
        if (this.got >= this.need) this.onDone(w);
      }
    });
  }
  draw(): void {
    this.pts.forEach((p, i) => {
      if (this.taken[i] || !visible(p.x - 40, p.x + 40)) return;
      ctx.save(); ctx.translate(p.x, p.y + Math.sin(V.time * 2 + i) * 8); ctx.rotate(V.time * 0.8 + i);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (let k = 0; k < 6; k++) { ctx.save(); ctx.rotate(k * Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -20); ctx.moveTo(0, -12); ctx.lineTo(-6, -17); ctx.moveTo(0, -12); ctx.lineTo(6, -17); ctx.stroke(); ctx.restore(); }
      ctx.restore();
    });
  }
  drawLight(): void { this.pts.forEach((p, i) => { if (!this.taken[i] && visible(p.x - 60, p.x + 60)) glow(p.x, p.y, 50, 'rgba(220,240,255,A)', 0.5); }); }
  drawOver(w: World): void {
    if (w.mode === 'idle') return;
    screenSpace();
    const cx = V.viewW / 2, y = 52;
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; rr(ctx, cx - 90, y - 26, 180, 52, 26); ctx.fill();
    ctx.fillStyle = '#5b3a8c'; ctx.font = '700 34px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`❄ ${this.got} / ${this.need}`, cx, y + 2);
  }
}

// ----------------------------------------------------------- moon phases ----
// 0 = new moon … 4 = full moon.
export function drawMoonPhase(k: number, r: number): void {
  ctx.fillStyle = '#3a3a6a'; circle(ctx, 0, 0, r);
  if (k === 0) { ctx.strokeStyle = '#8a8ab8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); return; }
  ctx.fillStyle = '#fff4c8';
  if (k === 4) { circle(ctx, 0, 0, r); return; }
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
  ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
  const bulge = [0, -0.6, 0, 0.6][k] * r;   // crescent, half, gibbous
  ctx.ellipse(0, 0, Math.abs(bulge), r, 0, Math.PI / 2, -Math.PI / 2, bulge > 0);
  ctx.fill(); ctx.restore();
}

export function moonItems(pts: { x: number; y: number }[]): OrderItem[] {
  return pts.map((p, i) => ({
    x: p.x, y: p.y,
    draw(lit, wiggle, next) {
      ctx.save(); ctx.translate(wiggle > 0 ? Math.sin(wiggle * 40) * 4 : 0, 0);
      ctx.fillStyle = lit ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.85)'; circle(ctx, 0, 0, 38);
      ctx.globalAlpha = lit ? 0.5 : 1; drawMoonPhase(i, 26); ctx.restore();
      if (next && !lit) touchGlow(0, 0, 56);
    },
  }));
}

// -------------------------------------------------------------- balloon ----
export function balloonLook(lift: number) {
  return (solved: boolean): void => {
    const up = solved ? -ease(clamp(lift, 0, 1)) * 600 : Math.sin(V.time * 1.5) * 4;
    ctx.save(); ctx.translate(0, up);
    const cols = ['#ff6b8a', '#ffd166', '#6cc4ff', '#7ee08a'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = cols[i]; ctx.beginPath();
      ctx.ellipse(-36 + i * 24, -150, 14, 70, 0, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = '#8a5a3a'; ctx.lineWidth = 2;
    for (const x of [-30, 30]) { ctx.beginPath(); ctx.moveTo(x * 1.4, -100); ctx.lineTo(x, -40); ctx.stroke(); }
    ctx.fillStyle = '#b8824a'; rr(ctx, -36, -40, 72, 40, 8); ctx.fill();
    ctx.restore();
  };
}

// -------------------------------------------------------- star pictures ----
export function starPatchLook(n: number) {
  return (solved: boolean): void => {
    ctx.fillStyle = 'rgba(30,30,80,0.75)'; rr(ctx, -80, -70, 160, 140, 24); ctx.fill();
    ctx.strokeStyle = solved ? '#ffd166' : 'rgba(255,255,255,0.6)'; ctx.lineWidth = 4; ctx.stroke();
    for (let i = 0; i < n; i++) {
      const a = i * 2.39996, d = 14 + (i % 4) * 14;
      ctx.fillStyle = '#fff3a8'; star(Math.cos(a) * d, Math.sin(a) * d * 0.8, 9, -Math.PI / 2);
    }
    if (solved) { ctx.fillStyle = '#ffd166'; ctx.font = '700 36px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(n), 0, 104); }
  };
}

// ----------------------------------------------------- festival of friends ----
// Everyone from the other chapters cheering along the way to the castle.
export class FriendsParade implements Entity {
  z = -1;
  constructor(public spots: { x: number; draw: () => void }[]) {}
  update(): void {}
  draw(w: World): void {
    for (const [i, s] of this.spots.entries()) {
      if (!visible(s.x - 80, s.x + 80)) continue;
      const near = Math.abs(w.player.x - s.x) < 260, hop = near ? Math.abs(Math.sin(V.time * 8 + i)) * 14 : 0;
      ctx.save(); ctx.translate(s.x, w.ground(s.x) - hop); s.draw(); ctx.restore();
    }
  }
}

