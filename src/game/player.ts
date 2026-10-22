import { ctx, V } from '../engine/view';
import { input } from '../engine/input';
import { glow, spawn, sparkleBurst } from '../engine/fx';
import { TAU, clamp, damp, mod, pick, circle } from '../util';
import { Sound } from '../sound';
import { flowerHead } from './world';
import type { Flower, World } from './types';

function visit(w: World, f: Flower, hp: { x: number; y: number }): void {
  f.visited = true; f.openV += 5; f.wiggle = 1;
  w.collected++;
  Sound.collect(w.collected);
  sparkleBurst(hp.x, hp.y);
  const sx = hp.x - V.camX, sy = hp.y - V.camY;
  for (let i = 0; i < 5; i++) {
    w.hudBits.push({ sx, sy, cx: sx + (Math.random() - 0.5) * 240, cy: sy - 120 - Math.random() * 160, t: -i * 0.07, dur: 0.85 + Math.random() * 0.25 });
  }
}

function landFx(w: World, v: number): void {
  if (v < 220) return;
  const p = w.player;
  p.sqV += Math.min(v, 400) * 0.006;
  Sound.land();
  for (let i = 0; i < 8; i++) {
    const s = i < 4 ? -1 : 1;
    spawn({ kind: 'dust', x: p.x + s * 6, y: p.y - 2, vx: s * (40 + Math.random() * 60), vy: -20 - Math.random() * 30, life: 0.6, max: 0.6, size: 4 + Math.random() * 3, color: 'rgba(255,255,255,0.8)', drag: 3 });
  }
}

export function updatePlayer(w: World, dt: number): void {
  const p = w.player;
  if (p.frozen) {
    p.x = damp(p.x, w.finaleSpot.x, 1.6, dt);
    p.y = damp(p.y, w.finaleSpot.y + Math.sin(V.time * 2) * 8, 1.6, dt);
    p.face = 1; p.flying = true; p.grounded = false; p.energy = 1;
    p.wingT += dt * 14;
    return;
  }
  const control = w.mode === 'play';
  const dir = control ? (input.right ? 1 : 0) - (input.left ? 1 : 0) : 0;
  if (dir) p.face = dir;
  p.vx = damp(p.vx, dir * (p.grounded ? 200 : 240), p.grounded ? 9 : 3.5, dt);

  const fly = control && input.fly;
  if (fly && !p.flyHeld && p.grounded) {
    p.vy = -340; p.grounded = false; p.on = null; p.sqV -= 1.2;
    w.hints.flew = true;
    Sound.whoosh();
  }
  if (!p.grounded && fly) {
    if (p.energy > 0) {
      if (p.vy > -230) p.vy = Math.max(-230, p.vy - 1700 * dt);
      p.energy = Math.max(0, p.energy - dt / 2.6);
    } else {
      p.vy = Math.min(65, p.vy + 600 * dt); // out of wing-power: gentle glide
    }
    p.flying = true;
  } else {
    p.vy += 1000 * dt;
    p.flying = false;
  }
  if (p.vy > 380) p.vy = 380;
  p.flyHeld = fly;

  const prevY = p.y, wasGrounded = p.grounded, prevOn = p.on, landV = p.vy;
  p.x += p.vx * dt; p.y += p.vy * dt;
  if (p.x < 30) { p.x = 30; p.vx = 0; }
  if (p.x > w.worldW - 30) { p.x = w.worldW - 30; p.vx = 0; }
  if (p.y < -330) { p.y = -330; if (p.vy < 0) p.vy = 0; }

  p.grounded = false; p.on = null;
  let bounced = false;
  if (p.vy >= 0) {
    for (const pl of w.platforms) {
      if (pl.hidden || p.x < pl.x + pl.pad || p.x > pl.x + pl.w - pl.pad) continue;
      const top = pl.y + pl.sag;
      if (prevOn === pl || (prevY <= top + 4 && p.y >= top)) {
        p.y = top;
        if (pl.type === 'mushroom') {
          p.vy = -780; pl.sagV += 300; p.sqV += 2.2; bounced = true;
          Sound.boing();
          for (let i = 0; i < 10; i++) spawn({ x: p.x + (Math.random() - 0.5) * 50, y: top, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 80, life: 0.8, max: 0.8, size: 3, color: '#ffffff', drag: 2 });
        } else {
          if (prevOn !== pl) { pl.sagV += Math.min(landV, 400) * 0.5; landFx(w, landV); }
          p.vy = 0; p.grounded = true; p.on = pl;
        }
        break;
      }
    }
  }
  if (!p.on && !bounced) {
    const gy = w.ground(p.x);
    if (p.y >= gy || (wasGrounded && !prevOn && p.vy >= 0 && p.y > gy - 14)) {
      if (!wasGrounded) landFx(w, landV);
      p.y = gy; p.vy = 0; p.grounded = true;
    }
  }

  if (p.grounded) p.energy = Math.min(1, p.energy + dt * 1.5);
  if (p.grounded && Math.abs(p.vx) > 15) p.walkT += dt * Math.abs(p.vx) / 22;
  p.wingT += dt * (p.flying ? (p.energy > 0 ? 22 : 9) : p.grounded ? 2.5 : 8);
  if (Math.abs(p.x - w.def.startX) > 130) w.hints.walked = true;

  if (p.flying && p.energy > 0 && Math.random() < 0.7) {
    spawn({ x: p.x - p.face * (14 + Math.random() * 20), y: p.y - 50 + (Math.random() - 0.5) * 30, vx: -p.face * 20, vy: 25, life: 0.9, max: 0.9, size: 2 + Math.random() * 2.5, color: pick(Math.random, ['#fff3a8', '#ffc4ec', '#ffffff']), rot: Math.random() * TAU, vr: 2 });
  }

  if (!control) return;
  const cx = p.x, cy = p.y - 45;
  for (const f of w.flowers) {
    if (f.visited || Math.abs(f.x - cx) > 120) continue;
    const hp = flowerHead(f, V.time);
    const dx = hp.x - cx, dy = hp.y - cy;
    if (dx * dx + dy * dy < 58 * 58) visit(w, f, hp);
  }
}

function supportY(w: World, x: number, y: number): number {
  let best = w.ground(x);
  for (const pl of w.platforms) {
    if (!pl.hidden && x > pl.x && x < pl.x + pl.w) {
      const t = pl.y + pl.sag;
      if (t >= y - 2 && t < best) best = t;
    }
  }
  return best;
}

export function drawShadow(w: World): void {
  const p = w.player, sy = supportY(w, p.x, p.y), k = clamp(1 - (sy - p.y) / 380, 0, 1);
  if (k <= 0.02) return;
  ctx.fillStyle = `rgba(40,30,70,${0.22 * k})`;
  ctx.beginPath(); ctx.ellipse(p.x, sy + 2, 22 * (0.5 + 0.5 * k), 6 * (0.5 + 0.5 * k), 0, 0, TAU); ctx.fill();
}

const WING_UP = new Path2D('M0 0 C-6 -34 -44 -64 -60 -44 C-70 -28 -44 -6 0 0Z');
const WING_LO = new Path2D('M0 2 C-28 4 -50 24 -38 40 C-26 50 -6 26 0 2Z');

function drawWing(ax: number, ay: number, open: number, far: boolean, energy: number, glowing: boolean): void {
  ctx.save(); ctx.translate(ax, ay); ctx.rotate(far ? -0.22 : 0.04); ctx.scale(open, 1);
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 66);
  if (far) { g.addColorStop(0, '#d9609f'); g.addColorStop(0.55, '#ec90bd'); g.addColorStop(1, '#f2bb7c'); }
  else { g.addColorStop(0, '#ff6fb5'); g.addColorStop(0.45, '#ffa0d2'); g.addColorStop(0.85, '#ffd28a'); g.addColorStop(1, '#fff0b0'); }
  ctx.globalAlpha = (far ? 0.75 : 0.93) * (0.65 + 0.35 * energy);
  if (glowing && !far) { ctx.shadowColor = 'rgba(255,190,240,0.95)'; ctx.shadowBlur = 18 * V.scale; }
  ctx.fillStyle = g; ctx.fill(WING_UP); ctx.fill(WING_LO);
  ctx.shadowBlur = 0;
  if (!far) {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.6;
    ctx.stroke(WING_UP); ctx.stroke(WING_LO);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-28, -30, -52, -44); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-30, -14, -56, -26); ctx.moveTo(0, 2); ctx.quadraticCurveTo(-24, 18, -36, 36); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    circle(ctx, -50, -40, 4); circle(ctx, -40, -50, 2.5); circle(ctx, -58, -30, 2); circle(ctx, -32, 34, 3);
  }
  ctx.restore();
}

export function fairyBob(w: World): number {
  const p = w.player, t = V.time;
  const moving = p.grounded && Math.abs(p.vx) > 20;
  return p.grounded ? (moving ? -Math.abs(Math.sin(p.walkT)) * 3 : Math.sin(t * 2) * 0.8) : Math.sin(t * 3.2) * 3;
}

export function drawFairy(w: World): void {
  const p = w.player, time = V.time;
  const moving = p.grounded && Math.abs(p.vx) > 20;
  const bob = fairyBob(w);
  const glowing = p.flying && p.energy > 0;
  if (glowing || w.mode === 'finale') {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(p.x, p.y - 45 + bob, 70, 'rgba(255,200,240,A)', 0.25);
    ctx.restore();
  }
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  ctx.scale(p.face * (1 + p.sq * 0.5), 1 - p.sq);
  ctx.rotate(clamp(Math.abs(p.vx) / 240, 0, 1) * (p.grounded ? 0.05 : 0.14));

  const open = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(p.wingT));
  drawWing(-6, -47, open * 0.9, true, p.energy, glowing);
  drawWing(-2, -44, open, false, p.energy, glowing);

  // legs
  const swing = moving ? Math.sin(p.walkT) * 0.6 : 0;
  ctx.lineCap = 'round'; ctx.lineWidth = 3.6;
  for (const s of [-1, 1]) {
    const a = p.grounded ? swing * s : -0.35 + s * 0.12;
    const hx = s * 2.5, fx = hx + Math.sin(a) * 16, fy = -17 + Math.cos(a) * 16;
    ctx.strokeStyle = s < 0 ? '#f2bfa0' : '#ffd2b5';
    ctx.beginPath(); ctx.moveTo(hx, -17); ctx.lineTo(fx, fy); ctx.stroke();
    ctx.fillStyle = s < 0 ? '#e8558f' : '#ff6fa8';
    ctx.beginPath(); ctx.ellipse(fx + 2, fy, 4.2, 2.8, 0, 0, TAU); ctx.fill();
  }
  // petal dress
  const flutter = p.grounded ? 0 : Math.sin(time * 14) * 1.5;
  const dg = ctx.createLinearGradient(0, -46, 0, -14);
  dg.addColorStop(0, '#6fe0c0'); dg.addColorStop(1, '#3fb79c');
  ctx.fillStyle = dg;
  ctx.beginPath(); ctx.moveTo(-6, -44); ctx.lineTo(6, -44);
  ctx.quadraticCurveTo(8, -34, 15, -17 + flutter);
  ctx.quadraticCurveTo(11, -10, 6, -15);
  ctx.quadraticCurveTo(1.5, -9, -3, -15);
  ctx.quadraticCurveTo(-9, -10, -14, -17 - flutter);
  ctx.quadraticCurveTo(-8, -34, -6, -44);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(1, -34); ctx.quadraticCurveTo(3, -24, 6, -16); ctx.moveTo(-3, -34); ctx.quadraticCurveTo(-5, -24, -3, -16); ctx.stroke();
  ctx.fillStyle = '#ffd166'; ctx.fillRect(-6.5, -37, 13, 3);
  // arm
  const armA = p.grounded ? (moving ? -Math.sin(p.walkT) * 0.5 : 0.15) : -0.7 + Math.sin(time * 6) * 0.15;
  const sx = 1, sy = -41, hx2 = sx + Math.sin(armA) * 12, hy2 = sy + Math.cos(armA) * 12;
  ctx.strokeStyle = '#ffd2b5'; ctx.lineWidth = 3.2;
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx2, hy2); ctx.stroke();
  // head
  const hx = 2, hy = -58;
  ctx.fillStyle = '#8a56d1'; circle(ctx, hx - 3, hy - 1, 17.5); circle(ctx, hx - 15, hy - 12, 8.5);
  ctx.beginPath(); ctx.ellipse(hx - 14, hy + 8, 6, 11, 0.3, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffe2cc'; circle(ctx, hx, hy, 15);
  ctx.fillStyle = '#9a63e0'; ctx.beginPath();
  ctx.arc(hx - 1, hy - 1, 16.5, Math.PI * 0.95, Math.PI * 1.9);
  ctx.quadraticCurveTo(hx + 8, hy - 6, hx + 2, hy - 9);
  ctx.quadraticCurveTo(hx - 4, hy - 4, hx - 15, hy + 2);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(hx - 2, hy - 13, 7, 2.5, -0.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ff8fc7';
  for (let k = 0; k < 5; k++) circle(ctx, hx - 15 + Math.cos(k * 1.2566) * 3.6, hy - 13 + Math.sin(k * 1.2566) * 3.6, 2.8);
  ctx.fillStyle = '#ffe27a'; circle(ctx, hx - 15, hy - 13, 2);
  // face
  const blink = mod(time, 4.2) < 0.13;
  for (const ex of [hx + 1.5, hx + 8.8]) {
    if (blink) {
      ctx.strokeStyle = '#3b2550'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ex, hy + 1, 2.4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    } else {
      ctx.fillStyle = '#3b2550'; ctx.beginPath(); ctx.ellipse(ex, hy + 1, 2.4, 3.2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; circle(ctx, ex + 0.8, hy - 0.4, 1);
    }
  }
  ctx.fillStyle = 'rgba(255,130,160,0.55)'; circle(ctx, hx + 11.5, hy + 6, 2.8); circle(ctx, hx - 2.5, hy + 6, 2.8);
  ctx.strokeStyle = '#c2557a'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(hx + 5.2, hy + 6, 2.6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // antennae
  ctx.strokeStyle = '#6b4aa0'; ctx.lineWidth = 1.6;
  const aw = Math.sin(time * 3) * 1.5;
  ctx.beginPath(); ctx.moveTo(hx - 2, hy - 15); ctx.quadraticCurveTo(hx - 2, hy - 26, hx + 5 + aw, hy - 31);
  ctx.moveTo(hx + 4, hy - 14); ctx.quadraticCurveTo(hx + 7, hy - 24, hx + 14 + aw, hy - 27); ctx.stroke();
  ctx.fillStyle = '#ffe27a'; circle(ctx, hx + 5 + aw, hy - 31, 2.6); circle(ctx, hx + 14 + aw, hy - 27, 2.6);
  ctx.restore();

  // wing-power pips
  if (w.mode === 'play' && p.energy < 0.999) {
    const n = 5, e = p.energy * n;
    for (let i = 0; i < n; i++) {
      const fill = clamp(e - i, 0, 1), x = p.x - 16 + i * 8, y = p.y + bob - 106;
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; circle(ctx, x, y, 2.8);
      if (fill > 0) {
        ctx.save(); ctx.globalAlpha = fill; ctx.globalCompositeOperation = 'lighter';
        glow(x, y, 9, 'rgba(255,220,120,A)', 0.9);
        ctx.restore();
        ctx.globalAlpha = fill; ctx.fillStyle = '#ffd84a'; circle(ctx, x, y, 2.8); ctx.globalAlpha = 1;
      }
    }
  }
}

// Additive lights for the fairy (drawn on top of a night tint). night = 0..1 darkness.
export function drawFairyLight(w: World, night: number): void {
  const p = w.player, bob = fairyBob(w);
  if (night > 0) glow(p.x, p.y - 45 + bob, 130, 'rgba(255,210,240,A)', 0.4 * night);
  const aw = Math.sin(V.time * 3) * 1.5, sx = p.face;
  for (const [ax, ay] of [[7 + aw, -89], [16 + aw, -85]]) glow(p.x + ax * sx, p.y + ay + bob, 9, 'rgba(255,230,140,A)', 0.9);
}
