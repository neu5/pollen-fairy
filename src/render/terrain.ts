import { ctx, V, visible } from '../engine/view';
import { glow, star, leafShape } from '../engine/fx';
import { TAU, clamp, mod, circle, rr, drawSprite } from '../util';
import { flowerHead } from '../game/world';
import type { Flower, Platform, World } from '../game/types';
import type { Backdrop } from './backdrop';

// The play layer: ground, decorations, platforms and flowers.

export function drawBigTree(w: World): void {
  const t = w.tree;
  if (!t) return;
  const x = t.x;
  if (!visible(x - 460, x + 460)) return;
  const gy = w.ground(x), time = V.time;
  const g = ctx.createLinearGradient(x - 90, 0, x + 90, 0);
  g.addColorStop(0, '#6e4636'); g.addColorStop(0.55, '#8d5d43'); g.addColorStop(1, '#b8825c');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - 150, gy + 24);
  ctx.quadraticCurveTo(x - 72, gy - 10, x - 66, gy - 150);
  ctx.bezierCurveTo(x - 60, gy - 320, x - 80, -100, x - 70, -420);
  ctx.lineTo(x + 70, -420);
  ctx.bezierCurveTo(x + 80, -100, x + 60, gy - 320, x + 66, gy - 150);
  ctx.quadraticCurveTo(x + 72, gy - 10, x + 155, gy + 24);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(70,40,30,0.3)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (const b of t.bark) {
    ctx.beginPath(); ctx.moveTo(x + b.dx, gy - 90);
    ctx.bezierCurveTo(x + b.dx + 10, gy - 260, x + b.dx - 12, 100, x + b.dx * 0.8, -300);
    ctx.stroke();
  }
  // round fairy door
  const dw = 48, dh = 80, dy = gy - 2;
  ctx.fillStyle = '#5a3426';
  ctx.beginPath(); ctx.moveTo(x - dw / 2 - 6, dy); ctx.lineTo(x - dw / 2 - 6, dy - dh + dw / 2); ctx.arc(x, dy - dh + dw / 2, dw / 2 + 6, Math.PI, 0); ctx.lineTo(x + dw / 2 + 6, dy); ctx.fill();
  ctx.fillStyle = '#9a5e3c';
  ctx.beginPath(); ctx.moveTo(x - dw / 2, dy); ctx.lineTo(x - dw / 2, dy - dh + dw / 2); ctx.arc(x, dy - dh + dw / 2, dw / 2, Math.PI, 0); ctx.lineTo(x + dw / 2, dy); ctx.fill();
  ctx.strokeStyle = 'rgba(60,30,20,0.35)'; ctx.lineWidth = 2;
  for (const ox of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(x + ox, dy); ctx.lineTo(x + ox, dy - dh + 8); ctx.stroke(); }
  ctx.fillStyle = '#ffd76a'; circle(ctx, x + 14, dy - 36, 3.5);
  // glowing window + lantern
  const wx = x + 18, wy = gy - 160;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glow(wx, wy, 50, 'rgba(255,214,120,A)', 0.5);
  glow(x - 44, gy - 78, 40, 'rgba(255,214,120,A)', 0.55 + 0.1 * Math.sin(time * 3));
  ctx.restore();
  ctx.fillStyle = '#ffe39a'; circle(ctx, wx, wy, 14);
  ctx.strokeStyle = '#5a3426'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(wx, wy, 14, 0, TAU); ctx.stroke();
  ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(wx - 14, wy); ctx.lineTo(wx + 14, wy); ctx.moveTo(wx, wy - 14); ctx.lineTo(wx, wy + 14); ctx.stroke();
  ctx.strokeStyle = '#4a2c20'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 44, gy - 108); ctx.lineTo(x - 44, gy - 90); ctx.stroke();
  ctx.fillStyle = '#ffcf6a'; rr(ctx, x - 51, gy - 90, 14, 20, 5); ctx.fill();
  ctx.fillStyle = '#7a4a2a'; ctx.fillRect(x - 53, gy - 92, 18, 4);
  const cols = ['#2f8a4f', '#45a85a', '#7fd06e'];
  ctx.fillStyle = cols[0]; for (const b of t.canopy) circle(ctx, b.x, b.y + b.r * 0.18, b.r);
  ctx.fillStyle = cols[1]; for (const b of t.canopy) circle(ctx, b.x + b.r * 0.06, b.y - b.r * 0.04, b.r * 0.84);
  ctx.fillStyle = cols[2]; for (const b of t.canopy) if (b.y < -150) circle(ctx, b.x + b.r * 0.25, b.y - b.r * 0.3, b.r * 0.42);
}

// Round leafy tree top, lit from the upper right.
export function drawCanopy(blobs: { x: number; y: number; r: number }[], cols = ['#2f8a4f', '#45a85a', '#7fd06e']): void {
  ctx.fillStyle = cols[0]; for (const b of blobs) circle(ctx, b.x, b.y + b.r * 0.18, b.r);
  ctx.fillStyle = cols[1]; for (const b of blobs) circle(ctx, b.x + b.r * 0.06, b.y - b.r * 0.04, b.r * 0.84);
  const top = blobs.length ? blobs[Math.floor(blobs.length * 0.6)].y : 0;
  ctx.fillStyle = cols[2]; for (const b of blobs) if (b.y < top) circle(ctx, b.x + b.r * 0.25, b.y - b.r * 0.3, b.r * 0.42);
}

export function drawTreeLight(w: World): void {
  const t = w.tree;
  if (!t || !visible(t.x - 200, t.x + 200)) return;
  const gy = w.ground(t.x);
  glow(t.x + 18, gy - 160, 90, 'rgba(255,214,120,A)', 0.5);
  glow(t.x - 44, gy - 78, 80, 'rgba(255,214,120,A)', 0.55 + 0.1 * Math.sin(V.time * 3));
}

export function drawPlayBushes(w: World, b: Backdrop): void {
  for (const pb of w.playBushes) {
    if (!visible(pb.x - 150, pb.x + 150)) continue;
    const s = pb.fern ? b.art.fern[pb.i % 2] : b.art.playBush[pb.i % 4];
    drawSprite(ctx, s, pb.x, w.ground(pb.x) + 18, pb.k);
  }
}

export function drawGround(w: World): void {
  const t = w.theme;
  const x0 = Math.floor((V.camX - 40) / 16) * 16, x1 = V.camX + V.viewW + 40, bottom = V.camY + V.viewH + 40;
  const surf = (off: number) => {
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 16) ctx.lineTo(x, w.ground(x) + off);
  };
  ctx.beginPath(); ctx.moveTo(x0, bottom);
  for (let x = x0; x <= x1; x += 16) ctx.lineTo(x, w.ground(x) + 4);
  ctx.lineTo(x1, bottom); ctx.closePath();
  const g = ctx.createLinearGradient(0, 540, 0, 760);
  g.addColorStop(0, t.dirt[0]); g.addColorStop(0.5, t.dirt[1]); g.addColorStop(1, t.dirt[2]);
  ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = 'rgba(80,45,40,0.35)';
  for (const pb of w.pebbles) {
    if (pb.x < x0 || pb.x > x1) continue;
    ctx.beginPath(); ctx.ellipse(pb.x, w.ground(pb.x) + 16 + pb.d, pb.rx, pb.ry, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,220,180,0.18)';
  for (const pb of w.pebbles) {
    if (pb.x < x0 || pb.x > x1) continue;
    ctx.beginPath(); ctx.ellipse(pb.x + 1, w.ground(pb.x) + 14 + pb.d, pb.rx * 0.5, pb.ry * 0.4, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = t.grass[0];
  for (let x = Math.floor((V.camX - 40) / 14) * 14; x <= x1; x += 14) { ctx.beginPath(); ctx.arc(x, w.ground(x) + 12, 8 + Math.sin(x * 1.7) * 2, 0, Math.PI); ctx.fill(); }
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  surf(4); ctx.lineWidth = 18; ctx.strokeStyle = t.grass[1]; ctx.stroke();
  surf(-2); ctx.lineWidth = 6; ctx.strokeStyle = t.grass[2]; ctx.stroke();
}

export function drawDecor(w: World): void {
  const l = V.camX - 30, r = V.camX + V.viewW + 30, time = V.time;
  for (const d of w.decor) {
    if (d.x < l || d.x > r) continue;
    const gy = w.ground(d.x) + 1, s = d.s;
    switch (d.type) {
      case 'tuft': {
        const sw = Math.sin(time * 1.6 + d.ph) * 2.5 * s;
        ctx.fillStyle = d.dark ? (w.theme.tuft?.[0] ?? '#3f9f45') : (w.theme.tuft?.[1] ?? '#6fcf55');
        for (let i = -2; i <= 2; i++) {
          const bx = d.x + i * 3 * s, bh = (15 - Math.abs(i) * 3) * s;
          ctx.beginPath(); ctx.moveTo(bx - 2 * s, gy + 2);
          ctx.quadraticCurveTo(bx + sw * 0.4 + i, gy - bh * 0.6, bx + sw + i * 2.5, gy - bh);
          ctx.quadraticCurveTo(bx + sw * 0.4 + i + 1, gy - bh * 0.5, bx + 2 * s, gy + 2);
          ctx.fill();
        }
        break;
      }
      case 'wild': {
        const sw = Math.sin(time * 1.3 + d.ph) * 2, hh = 12 * s + 6;
        ctx.strokeStyle = '#3f9f45'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(d.x, gy + 2); ctx.quadraticCurveTo(d.x, gy - hh * 0.5, d.x + sw, gy - hh); ctx.stroke();
        ctx.fillStyle = d.col;
        for (let k = 0; k < 5; k++) circle(ctx, d.x + sw + Math.cos(k * 1.2566 + d.ph) * 2.6 * s, gy - hh + Math.sin(k * 1.2566 + d.ph) * 2.6 * s, 2 * s);
        ctx.fillStyle = '#ffe27a'; circle(ctx, d.x + sw, gy - hh, 1.3 * s);
        break;
      }
      case 'stone':
        ctx.fillStyle = '#a99fc0'; ctx.beginPath(); ctx.ellipse(d.x, gy + 3, 9 * s, 6 * s, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#d4cce6'; ctx.beginPath(); ctx.ellipse(d.x + 2 * s, gy - 1 * s, 4 * s, 2.2 * s, 0, 0, TAU); ctx.fill();
        break;
      case 'clover':
        ctx.fillStyle = '#4caf50';
        for (let k = 0; k < 3; k++) circle(ctx, d.x + Math.cos(k * 2.09 - 1.57) * 3.5 * s, gy - 6 * s + Math.sin(k * 2.09 - 1.57) * 3.5 * s, 3.4 * s);
        break;
      case 'shroom':
        ctx.fillStyle = '#fff1dc'; ctx.fillRect(d.x - 1.8 * s, gy - 9 * s, 3.6 * s, 10 * s);
        ctx.fillStyle = '#ff6b7f'; ctx.beginPath(); ctx.ellipse(d.x, gy - 8 * s, 7 * s, 6 * s, 0, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#fff'; circle(ctx, d.x - 2 * s, gy - 11 * s, 1.2 * s); circle(ctx, d.x + 3 * s, gy - 10 * s, 1 * s);
        break;
    }
  }
}

function drawRock(pl: Platform): void {
  const x = pl.x, y = pl.y + pl.sag, w = pl.w, d = w * 0.42 + 26, time = V.time;
  const body = new Path2D();
  body.moveTo(x - 4, y + 6);
  body.bezierCurveTo(x + w * 0.04, y + d * 0.55, x + w * 0.3, y + d * 0.85, x + w * 0.5, y + d);
  body.bezierCurveTo(x + w * 0.68, y + d * 0.8, x + w * 0.95, y + d * 0.5, x + w + 4, y + 6);
  body.closePath();
  const g = ctx.createLinearGradient(x, y, x + w, y + d);
  g.addColorStop(0, '#9c86c4'); g.addColorStop(0.5, '#b9a3dc'); g.addColorStop(1, '#d9c8f2');
  ctx.fillStyle = g; ctx.fill(body);
  const sh = ctx.createLinearGradient(0, y, 0, y + d);
  sh.addColorStop(0, 'rgba(80,60,130,0)'); sh.addColorStop(1, 'rgba(80,60,130,0.45)');
  ctx.fillStyle = sh; ctx.fill(body);
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x + w * 0.62, y + 10); ctx.lineTo(x + w * 0.56, y + d * 0.55); ctx.lineTo(x + w * 0.5, y + d - 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + w * 0.25, y + 12); ctx.lineTo(x + w * 0.32, y + d * 0.45); ctx.stroke();
  for (const v of pl.vines ?? []) {
    const vx = x + v.u * w, sw = Math.sin(time * 1.1 + v.ph) * 5;
    ctx.strokeStyle = '#3f9a52'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(vx, y + 8); ctx.quadraticCurveTo(vx + sw * 0.5, y + 8 + v.len * 0.5, vx + sw, y + 8 + v.len); ctx.stroke();
    for (let k = 1; k <= 3; k++) {
      const s = k % 2 ? 1 : -1;
      ctx.fillStyle = '#5cbb5c';
      ctx.beginPath(); ctx.ellipse(vx + sw * k / 3 + s * 5, y + 8 + v.len * k / 3, 5, 2.6, s * 0.6, 0, TAU); ctx.fill();
    }
  }
  ctx.fillStyle = '#45a847';
  for (let gx = x; gx <= x + w; gx += 12) { ctx.beginPath(); ctx.arc(gx, y + 9, 7, 0, Math.PI); ctx.fill(); }
  ctx.fillStyle = '#52b84a'; rr(ctx, x - 8, y - 5, w + 16, 16, 8); ctx.fill();
  ctx.fillStyle = '#8fe36a'; rr(ctx, x - 4, y - 6, w + 8, 6, 3); ctx.fill();
  for (const t of pl.tufts ?? []) {
    const tx = x + t.u * w, s = t.s;
    if (t.wild) {
      ctx.fillStyle = t.col;
      for (let k = 0; k < 5; k++) circle(ctx, tx + Math.cos(k * 1.2566) * 2.4 * s, y - 9 * s + Math.sin(k * 1.2566) * 2.4 * s, 2 * s);
      ctx.fillStyle = '#ffe27a'; circle(ctx, tx, y - 9 * s, 1.3 * s);
    } else {
      ctx.fillStyle = '#6fcf55';
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(tx + i * 3 - 2, y); ctx.lineTo(tx + i * 4, y - (10 - Math.abs(i) * 3) * s); ctx.lineTo(tx + i * 3 + 2, y); ctx.fill(); }
    }
  }
}

function drawLeafPlat(pl: Platform, w: World): void {
  const x = pl.x, y = pl.y + pl.sag, pw = pl.w, cx = x + pw * 0.45, gy = w.ground(cx);
  if (pl.stem !== false) {
    ctx.strokeStyle = '#3e9a47'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 24, gy + 6);
    ctx.bezierCurveTo(cx - 60, gy - (gy - y) * 0.4, cx + 30, y + 60, cx, y + 8); ctx.stroke();
  }
  drawLeafBlade(x, y, pw);
}

export function drawLeafBlade(x: number, y: number, pw: number): void {
  const g = ctx.createLinearGradient(0, y - 12, 0, y + 18);
  g.addColorStop(0, '#9be86e'); g.addColorStop(1, '#3fa548');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x - 10, y + 2);
  ctx.quadraticCurveTo(x + pw * 0.45, y - 8, x + pw + 18, y - 14);
  ctx.quadraticCurveTo(x + pw * 0.62, y + 26, x - 10, y + 2);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x - 4, y + 3); ctx.quadraticCurveTo(x + pw * 0.5, y + 3, x + pw + 12, y - 12); ctx.stroke();
  ctx.lineWidth = 1.4;
  for (let i = 1; i < 6; i++) {
    const u = i / 6, vx = x + u * pw, vy = y + 3 - u * u * 11;
    ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + 14, vy + 8 - u * 4); ctx.stroke();
  }
}

export function drawMushroomShape(cx: number, gy: number, top: number, width: number, sag: number, col: { cap: string; cap2: string; spot: string }, spots: { u: number; v: number; r: number }[], face = true): void {
  const sq = clamp(sag / 50, -0.25, 0.35);
  const capW = width * 0.5 * (1 + sq * 0.6), capH = width * 0.36 * (1 - sq);
  top += sag * 0.35;
  const rim = top + capH, sw = width * 0.15;
  const sg = ctx.createLinearGradient(cx - sw, 0, cx + sw, 0);
  sg.addColorStop(0, '#efd6ba'); sg.addColorStop(0.6, '#fff6e6'); sg.addColorStop(1, '#ffeed8');
  ctx.fillStyle = sg; ctx.beginPath();
  ctx.moveTo(cx - sw * 1.25, gy + 8);
  ctx.quadraticCurveTo(cx - sw * 0.8, (gy + rim) / 2, cx - sw * 0.9, rim - 2);
  ctx.lineTo(cx + sw * 0.9, rim - 2);
  ctx.quadraticCurveTo(cx + sw * 0.8, (gy + rim) / 2, cx + sw * 1.25, gy + 8);
  ctx.closePath(); ctx.fill();
  if (face && gy - rim > 30) {
    const fy = rim + (gy - rim) * 0.42;
    ctx.fillStyle = '#5a3a3a'; circle(ctx, cx - 5, fy, 2.2); circle(ctx, cx + 5, fy, 2.2);
    ctx.strokeStyle = '#5a3a3a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(cx, fy + 3, 3.5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.fillStyle = 'rgba(255,130,150,0.5)'; circle(ctx, cx - 9, fy + 4, 2.6); circle(ctx, cx + 9, fy + 4, 2.6);
  }
  ctx.fillStyle = '#f2cdb8';
  ctx.beginPath(); ctx.ellipse(cx, rim, capW * 0.94, capH * 0.22, 0, 0, TAU); ctx.fill();
  const cg = ctx.createLinearGradient(cx - capW, top, cx + capW, rim);
  cg.addColorStop(0, col.cap2); cg.addColorStop(0.6, col.cap); cg.addColorStop(1, col.cap);
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.ellipse(cx, rim, capW, capH, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = col.spot;
  for (const s of spots) {
    const u = clamp(s.u, -0.85, 0.85);
    const sx = cx + u * capW, sy = rim - capH * Math.sqrt(1 - u * u) * s.v, sr = s.r * capW / 60;
    ctx.beginPath(); ctx.ellipse(sx, sy, sr, sr * 0.8, 0, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.ellipse(cx + capW * 0.35, top + capH * 0.35, capW * 0.22, capH * 0.15, -0.5, 0, TAU); ctx.fill();
}

function drawBranch(pl: Platform, w: World): void {
  const tx = w.tree ? w.tree.x : pl.x;
  const y = pl.y + pl.sag, left = pl.side === 'left';
  const ax = tx + (left ? -30 : 30), ex = left ? pl.x - 10 : pl.x + pl.w + 10, dir = left ? -1 : 1;
  const mx = (ax + ex) / 2;
  const g = ctx.createLinearGradient(0, y - 4, 0, y + 30);
  g.addColorStop(0, '#b47e58'); g.addColorStop(1, '#6e4634');
  ctx.fillStyle = g; ctx.beginPath();
  ctx.moveTo(ax, y - 6);
  ctx.quadraticCurveTo(mx, y - 1, ex, y + 1);
  ctx.quadraticCurveTo(ex + dir * 8, y + 7, ex, y + 13);
  ctx.quadraticCurveTo(mx, y + 20, ax, y + 36);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#6cc552'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(ax, y - 3); ctx.quadraticCurveTo(mx, y + 1, ex - dir * 6, y + 2); ctx.stroke();
  for (const b of pl.leaves ?? []) { ctx.fillStyle = b.c; circle(ctx, ex + b.dx * dir, y + b.dy, b.r); }
}

export function drawPlatforms(w: World): void {
  for (const pl of w.platforms) {
    if (pl.hidden || pl.invisible || !visible(pl.x - 80, pl.x + pl.w + 80)) continue;
    if (pl.type === 'rock') drawRock(pl);
    else if (pl.type === 'leaf') drawLeafPlat(pl, w);
    else if (pl.type === 'mushroom') drawMushroomShape(pl.x + pl.w / 2, w.ground(pl.x + pl.w / 2), pl.y, pl.w, pl.sag, pl.col!, pl.spots ?? []);
    else drawBranch(pl, w);
  }
}

export function drawFace(r: number, awake: boolean): void {
  const ex = r * 0.38, ey = -r * 0.08;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#6b3a2a'; ctx.lineWidth = Math.max(1, r * 0.13);
  if (awake) {
    ctx.fillStyle = '#4a2a2a';
    for (const s of [-1, 1]) circle(ctx, s * ex, ey, r * 0.15);
    ctx.fillStyle = '#fff';
    for (const s of [-1, 1]) circle(ctx, s * ex + r * 0.05, ey - r * 0.06, r * 0.06);
    ctx.beginPath(); ctx.arc(0, r * 0.12, r * 0.32, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.fillStyle = 'rgba(255,120,150,0.5)';
    for (const s of [-1, 1]) circle(ctx, s * r * 0.62, r * 0.24, r * 0.17);
  } else {
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * ex, ey - r * 0.06, r * 0.16, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
    ctx.fillStyle = '#8a4a3a'; ctx.beginPath(); ctx.ellipse(0, r * 0.36, r * 0.09, r * 0.11, 0, 0, TAU); ctx.fill();
  }
}

export function centerDisc(r: number): void {
  ctx.fillStyle = '#ffd34d'; circle(ctx, 0, 0, r);
  ctx.strokeStyle = '#f2a33a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; circle(ctx, r * 0.3, -r * 0.35, r * 0.3);
}

function drawBloom(f: Flower): void {
  const o = f.open, c = f.col, awake = f.visited;
  switch (f.type) {
    case 'daisy': {
      const n = 11, L = 8 + 14 * o, W = 3.4 + 1.6 * o;
      for (let pass = 0; pass < 2; pass++) {
        ctx.fillStyle = pass ? c.p : c.d;
        for (let i = 0; i < n; i++) {
          const a = (i + (pass ? 0 : 0.5)) / n * TAU + f.phase, d = 6 + L * 0.5;
          ctx.beginPath(); ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d, L / 2, W, a, 0, TAU); ctx.fill();
        }
      }
      centerDisc(8); drawFace(8, awake);
      break;
    }
    case 'cosmos': {
      const n = 5, pr = 6 + 5 * o, d = 5 + 7 * o;
      ctx.fillStyle = c.d; for (let i = 0; i < n; i++) { const a = i / n * TAU - Math.PI / 2; circle(ctx, Math.cos(a) * d * 1.05, Math.sin(a) * d * 1.05 + 1, pr); }
      ctx.fillStyle = c.p; for (let i = 0; i < n; i++) { const a = i / n * TAU - Math.PI / 2; circle(ctx, Math.cos(a) * d, Math.sin(a) * d, pr * 0.92); }
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < n; i++) { const a = i / n * TAU - Math.PI / 2; circle(ctx, Math.cos(a) * d + pr * 0.25, Math.sin(a) * d - pr * 0.3, pr * 0.35); }
      centerDisc(7.5); drawFace(7.5, awake);
      break;
    }
    case 'puff': {
      ctx.fillStyle = c.d; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; circle(ctx, Math.cos(a) * (9 + 5 * o), Math.sin(a) * (9 + 5 * o), 6 + 3 * o); }
      ctx.fillStyle = c.p; for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + 0.4; circle(ctx, Math.cos(a) * (5 + 3 * o), Math.sin(a) * (5 + 3 * o), 5.5 + 2 * o); }
      centerDisc(6.5); drawFace(6.5, awake);
      break;
    }
    default: { // tulip
      const sp = 0.2 + 0.5 * o;
      ctx.fillStyle = c.d;
      for (const s of [-1, 1]) {
        ctx.save(); ctx.rotate(s * sp);
        ctx.beginPath(); ctx.moveTo(0, 6);
        ctx.bezierCurveTo(s * 14, 2, s * 12, -16, s * 2, -22);
        ctx.bezierCurveTo(-s * 2, -14, -s * 2, 0, 0, 6);
        ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = c.p; ctx.beginPath(); ctx.moveTo(0, 8);
      ctx.bezierCurveTo(13, 4, 12, -14, 0, -20 + (1 - o) * 4);
      ctx.bezierCurveTo(-12, -14, -13, 4, 0, 8); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(4, -8, 3, 7, 0.2, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(0, -4); drawFace(7, awake); ctx.restore();
    }
  }
}

// Little floating "z" for anything asleep.
export function drawZ(x: number, y: number, phase: number, size = 12): void {
  const zt = mod(V.time * 0.45 + phase, 1);
  ctx.save();
  ctx.globalAlpha = Math.sin(zt * Math.PI) * 0.75;
  ctx.fillStyle = '#7d6bb8';
  ctx.font = `700 ${size + zt * size * 0.5}px "Baloo 2", sans-serif`;
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('z', x + zt * size, y - zt * size * 2);
  ctx.restore();
}

function drawFlower(f: Flower): void {
  const time = V.time;
  const hp = flowerHead(f, time), by = hp.by, sway = hp.sway;
  ctx.strokeStyle = '#3d9a45'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(f.x, by);
  ctx.quadraticCurveTo(f.x - Math.sin(sway) * f.h * 0.3, by - f.h * 0.55, hp.x, hp.y); ctx.stroke();
  leafShape(f.x, by - f.h * 0.28, 18, 6, -0.6 + sway, '#4cb04f');
  leafShape(f.x, by - f.h * 0.4, 15, 5, Math.PI + 0.6 + sway, '#45a548');
  if (!f.visited) {
    const pr = 0.5 + 0.5 * Math.sin(time * 2.2 + f.phase);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(hp.x, hp.y, 44 + 8 * pr, 'rgba(255,224,120,A)', 0.4 + 0.2 * pr);
    ctx.restore();
  }
  const droop = clamp((1 - f.open) / 0.55, 0, 1) * 0.3 * f.dside;
  ctx.save(); ctx.translate(hp.x, hp.y); ctx.rotate(sway * 1.4 + droop); ctx.scale(f.size, f.size);
  drawBloom(f);
  ctx.restore();
  if (!f.visited) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#ffe680';
    for (let i = 0; i < 3; i++) {
      const a = time * 1.6 + f.phase + i * TAU / 3;
      star(hp.x + Math.cos(a) * 26, hp.y + Math.sin(a) * 14, 3.2, time * 2 + i);
    }
    ctx.restore();
    drawZ(hp.x + 14, hp.y - 20, f.phase);
  }
}

export function drawFlowers(w: World): void {
  for (const f of w.flowers) if (visible(f.x - 80, f.x + 80)) drawFlower(f);
}

export function drawFlowerLights(w: World, night: number): void {
  for (const f of w.flowers) {
    if (f.visited || !visible(f.x - 80, f.x + 80)) continue;
    const hp = flowerHead(f, V.time);
    glow(hp.x, hp.y, 60, 'rgba(255,224,120,A)', 0.35 * night);
  }
}
