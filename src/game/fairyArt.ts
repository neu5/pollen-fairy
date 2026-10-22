import { ctx, V } from '../engine/view';
import { TAU, circle, shade } from '../util';
import type { Look } from './look';

// Draws the fairy with any look. Origin = feet, facing right, about 95 tall.

export interface Pose {
  wing: number;          // wing open amount 0.3..1
  legA: [number, number]; // back / front leg angle
  armA: number;
  flutter: number;       // skirt flutter
  blink: boolean;
  aw: number;            // antenna wobble
  glowing: boolean;
  energy: number;
  t: number;             // time, for hair sway
}

export function idlePose(t: number): Pose {
  return {
    wing: 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 2.5)), legA: [0, 0], armA: 0.15, flutter: 0,
    blink: t % 4.2 < 0.13, aw: Math.sin(t * 3) * 1.5, glowing: false, energy: 1, t,
  };
}

// ---------------------------------------------------------------- wings ----
const WING_UP = new Path2D('M0 0 C-6 -34 -44 -64 -60 -44 C-70 -28 -44 -6 0 0Z');
const WING_LO = new Path2D('M0 2 C-28 4 -50 24 -38 40 C-26 50 -6 26 0 2Z');
const DRAGON_UP = new Path2D('M0 0 C-14 -16 -54 -36 -72 -30 C-80 -26 -60 -10 0 0Z');
const DRAGON_LO = new Path2D('M0 3 C-16 2 -56 6 -70 16 C-76 22 -50 20 0 3Z');
const PETAL_UP = new Path2D('M0 0 C-4 -26 -30 -52 -48 -44 C-62 -36 -42 -10 0 0Z');
const PETAL_LO = new Path2D('M0 2 C-18 6 -36 22 -30 34 C-22 44 -6 22 0 2Z');

function wingShapes(style: Look['wings']): [Path2D, Path2D] {
  if (style === 'dragonfly') return [DRAGON_UP, DRAGON_LO];
  if (style === 'petal') return [PETAL_UP, PETAL_LO];
  return [WING_UP, WING_LO];
}

function wingFill(style: Look['wings'], far: boolean): CanvasGradient {
  switch (style) {
    case 'monarch': {
      const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 66);
      g.addColorStop(0, far ? '#d86a1a' : '#ff8a1a'); g.addColorStop(0.7, far ? '#e8901e' : '#ffb340'); g.addColorStop(1, '#ffd070');
      return g;
    }
    case 'dragonfly': {
      const g = ctx.createLinearGradient(0, -20, -70, 10);
      g.addColorStop(0, far ? 'rgba(120,200,230,0.55)' : 'rgba(170,240,255,0.7)');
      g.addColorStop(0.5, far ? 'rgba(160,170,240,0.4)' : 'rgba(200,210,255,0.55)');
      g.addColorStop(1, 'rgba(230,255,240,0.5)');
      return g;
    }
    case 'petal': {
      const g = ctx.createRadialGradient(-20, -20, 4, -20, -10, 60);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, far ? '#c4a8f0' : '#e2ccff'); g.addColorStop(1, far ? '#9a78e0' : '#b48cff');
      return g;
    }
    case 'rainbow': {
      const g = ctx.createLinearGradient(-10, -60, -40, 44);
      ['#ff6b8a', '#ffa45a', '#ffe066', '#7ee08a', '#6cc4ff', '#b48cff'].forEach((c, i) => g.addColorStop(i / 5, far ? shade(c, -0.15) : c));
      return g;
    }
    default: {
      const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 66);
      if (far) { g.addColorStop(0, '#d9609f'); g.addColorStop(0.55, '#ec90bd'); g.addColorStop(1, '#f2bb7c'); }
      else { g.addColorStop(0, '#ff6fb5'); g.addColorStop(0.45, '#ffa0d2'); g.addColorStop(0.85, '#ffd28a'); g.addColorStop(1, '#fff0b0'); }
      return g;
    }
  }
}

function drawWing(look: Look, ax: number, ay: number, open: number, far: boolean, pose: Pose): void {
  const style = look.wings, [up, lo] = wingShapes(style);
  ctx.save(); ctx.translate(ax, ay); ctx.rotate(far ? -0.22 : 0.04); ctx.scale(open, 1);
  ctx.globalAlpha = (far ? 0.75 : 0.93) * (0.65 + 0.35 * pose.energy);
  if (pose.glowing && !far) { ctx.shadowColor = 'rgba(255,190,240,0.95)'; ctx.shadowBlur = 18 * V.scale; }
  ctx.fillStyle = wingFill(style, far); ctx.fill(up); ctx.fill(lo);
  ctx.shadowBlur = 0;
  if (!far) {
    if (style === 'monarch') {
      ctx.strokeStyle = '#3a2438'; ctx.lineWidth = 3; ctx.stroke(up); ctx.stroke(lo);
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-28, -30, -52, -44); ctx.moveTo(-6, -4); ctx.quadraticCurveTo(-30, -14, -56, -26); ctx.moveTo(0, 2); ctx.quadraticCurveTo(-24, 18, -36, 36); ctx.stroke();
      ctx.fillStyle = '#ffffff';
      for (const [x, y] of [[-56, -40], [-50, -50], [-62, -32], [-40, 40], [-34, 44]]) circle(ctx, x, y, 2);
    } else if (style === 'dragonfly') {
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.4; ctx.stroke(up); ctx.stroke(lo);
      ctx.strokeStyle = 'rgba(120,170,220,0.5)'; ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let i = 1; i < 5; i++) { ctx.moveTo(-i * 13, -i * 4.5); ctx.lineTo(-i * 13 - 5, -i * 6 + 3); ctx.moveTo(-i * 13, i * 1.5 + 2); ctx.lineTo(-i * 13 - 5, i * 2.6 + 6); }
      ctx.stroke();
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.6; ctx.stroke(up); ctx.stroke(lo);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-28, -30, -48, -42); ctx.moveTo(0, 2); ctx.quadraticCurveTo(-22, 16, -32, 32); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      if (style === 'petal') for (const [x, y] of [[-30, -36], [-40, -30], [-22, 22], [-14, -20]]) circle(ctx, x, y, 1.8);
      else { circle(ctx, -50, -40, 4); circle(ctx, -40, -50, 2.5); circle(ctx, -58, -30, 2); circle(ctx, -32, 34, 3); }
    }
  }
  ctx.restore();
}

// ----------------------------------------------------------------- hair ----
const HX = 2, HY = -58;

function frontCap(c: string): void {
  ctx.fillStyle = c; ctx.beginPath();
  ctx.arc(HX - 1, HY - 1, 16.5, Math.PI * 0.95, Math.PI * 1.9);
  ctx.quadraticCurveTo(HX + 8, HY - 6, HX + 2, HY - 9);
  ctx.quadraticCurveTo(HX - 4, HY - 4, HX - 15, HY + 2);
  ctx.closePath(); ctx.fill();
}

function flowerClip(x: number, y: number, col = '#ff8fc7'): void {
  ctx.fillStyle = col;
  for (let k = 0; k < 5; k++) circle(ctx, x + Math.cos(k * 1.2566) * 3.6, y + Math.sin(k * 1.2566) * 3.6, 2.8);
  ctx.fillStyle = '#ffe27a'; circle(ctx, x, y, 2);
}

function bow(x: number, y: number, col: string): void {
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 7, y - 5); ctx.lineTo(x - 7, y + 5); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 7, y - 5); ctx.lineTo(x + 7, y + 5); ctx.closePath(); ctx.fill();
  circle(ctx, x, y, 2.4);
}

function hairBack(look: Look, t: number): void {
  const c = look.hairColor, sway = Math.sin(t * 2.2) * 2;
  ctx.fillStyle = c;
  switch (look.hair) {
    case 'bun':
      circle(ctx, HX - 3, HY - 1, 17.5); circle(ctx, HX - 15, HY - 12, 8.5);
      ctx.beginPath(); ctx.ellipse(HX - 14, HY + 8, 6, 11, 0.3, 0, TAU); ctx.fill();
      break;
    case 'pigtails':
      circle(ctx, HX - 3, HY - 1, 17);
      for (const [x, y, r] of [[HX - 18, HY + 6, 0.5], [HX + 10, HY + 9, -0.3]] as [number, number, number][]) {
        ctx.fillStyle = x < HX ? c : shade(c, -0.12);
        ctx.beginPath(); ctx.ellipse(x + sway * 0.5, y + 6, 6.5, 13, r + sway * 0.03, 0, TAU); ctx.fill();
      }
      break;
    case 'long':
      ctx.beginPath();
      ctx.moveTo(HX - 18, HY - 4);
      ctx.quadraticCurveTo(HX - 24, HY + 20, HX - 20 + sway, HY + 38);
      ctx.quadraticCurveTo(HX - 12 + sway, HY + 44, HX - 6 + sway, HY + 36);
      ctx.quadraticCurveTo(HX - 2, HY + 44, HX + 4 + sway, HY + 34);
      ctx.quadraticCurveTo(HX + 10, HY + 16, HX + 12, HY - 6);
      ctx.closePath(); ctx.fill();
      circle(ctx, HX - 3, HY - 1, 17.5);
      break;
    case 'bob':
      ctx.beginPath(); ctx.arc(HX - 2, HY - 1, 18.5, Math.PI * 0.85, Math.PI * 2.15); ctx.lineTo(HX + 15, HY + 11); ctx.lineTo(HX - 19, HY + 11); ctx.closePath(); ctx.fill();
      break;
    case 'curly':
      for (let i = 0; i < 12; i++) {
        const a = Math.PI * 0.55 + i / 11 * Math.PI * 1.4;
        circle(ctx, HX - 2 + Math.cos(a) * 17, HY - 1 + Math.sin(a) * 17, 7.5);
      }
      circle(ctx, HX - 3, HY - 1, 17);
      break;
  }
}

function hairFront(look: Look): void {
  const c = shade(look.hairColor, 0.1);
  switch (look.hair) {
    case 'bun':
      frontCap(c); flowerClip(HX - 15, HY - 13);
      break;
    case 'pigtails':
      frontCap(c); bow(HX - 16, HY + 1, '#ff6fa8');
      break;
    case 'long':
      frontCap(c);
      ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(HX - 1, HY - 1, 16, Math.PI * 1.15, Math.PI * 1.75); ctx.stroke();
      break;
    case 'bob':
      ctx.fillStyle = c; ctx.beginPath();
      ctx.arc(HX - 1, HY - 1, 17, Math.PI * 0.95, Math.PI * 1.95);
      ctx.lineTo(HX + 14, HY - 6); ctx.lineTo(HX - 6, HY - 7); ctx.lineTo(HX - 16, HY + 4);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.ellipse(HX + 9, HY - 10, 4, 2, -0.4, 0, TAU); ctx.fill();
      break;
    case 'curly':
      ctx.fillStyle = c;
      for (let i = 0; i < 5; i++) circle(ctx, HX - 10 + i * 5.5, HY - 13 + Math.abs(i - 2) * 1.5, 5.5);
      flowerClip(HX - 14, HY - 14, '#ffd166');
      break;
  }
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(HX - 2, HY - 13, 7, 2.5, -0.2, 0, TAU); ctx.fill();
}

// ---------------------------------------------------------------- dress ----
function drawDress(look: Look, flutter: number): void {
  const c = look.dressColor, d = shade(c, -0.22);
  const g = ctx.createLinearGradient(0, -46, 0, -6);
  g.addColorStop(0, c); g.addColorStop(1, d);
  ctx.fillStyle = g;
  switch (look.dress) {
    case 'petal':
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
      break;
    case 'tutu': {
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(-6, -44); ctx.lineTo(6, -44); ctx.lineTo(7, -30); ctx.lineTo(-7, -30); ctx.closePath(); ctx.fill();
      for (const [y, rx, col] of [[-27, 18, d], [-29, 15, c]] as [number, number, string][]) {
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(0, y + flutter * 0.4, rx, 6, 0, 0, TAU); ctx.fill();
        for (let i = -3; i <= 3; i++) circle(ctx, i * rx / 3.4, y + 5 + flutter * 0.4, 3.4);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      for (const [x, y] of [[-9, -29], [-2, -26], [6, -29], [11, -26]]) circle(ctx, x, y, 1.3);
      break;
    }
    case 'gown':
      ctx.beginPath(); ctx.moveTo(-6, -44); ctx.lineTo(6, -44);
      ctx.quadraticCurveTo(8, -26, 17, -5 + flutter);
      for (let i = 0; i < 4; i++) { const x0 = 17 - i * 8.5; ctx.quadraticCurveTo(x0 - 4, -1, x0 - 8.5, -5 + (i % 2 ? flutter : -flutter)); }
      ctx.quadraticCurveTo(-8, -26, -6, -44);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-6.5, -38, 13, 4);
      ctx.fillStyle = shade(c, 0.4); circle(ctx, 4, -36, 3);
      break;
    case 'leaf':
      ctx.beginPath(); ctx.moveTo(-6, -44); ctx.lineTo(6, -44); ctx.lineTo(8, -32); ctx.lineTo(-8, -32); ctx.closePath(); ctx.fill();
      for (const [x, a] of [[-7, 0.5], [7, -0.5], [0, 0]] as [number, number][]) {
        ctx.save(); ctx.translate(x, -33); ctx.rotate(a + flutter * 0.04);
        ctx.fillStyle = x === 0 ? c : d;
        ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-7, 9, 0, 19); ctx.quadraticCurveTo(7, 9, 6, 0); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, 1); ctx.lineTo(0, 16); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = '#8a5a3a'; ctx.fillRect(-7, -35, 14, 2.5);
      break;
  }
}

// ---------------------------------------------------------------- shoes ----
function drawLegAndShoe(look: Look, a: number, back: boolean): void {
  const s = back ? -1 : 1, hx = s * 2.5, fx = hx + Math.sin(a) * 16, fy = -17 + Math.cos(a) * 16;
  const skin = back ? shade(look.skin, -0.08) : look.skin;
  const sc = back ? shade(look.shoeColor, -0.15) : look.shoeColor;
  ctx.lineCap = 'round'; ctx.lineWidth = 3.6; ctx.strokeStyle = skin;
  ctx.beginPath(); ctx.moveTo(hx, -17); ctx.lineTo(fx, fy); ctx.stroke();
  switch (look.shoes) {
    case 'boots':
      ctx.strokeStyle = sc; ctx.lineWidth = 5.5;
      ctx.beginPath(); ctx.moveTo(hx + Math.sin(a) * 9, -17 + Math.cos(a) * 9); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.fillStyle = sc; ctx.beginPath(); ctx.ellipse(fx + 2.5, fy + 0.5, 5, 3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(fx - 2.5 + Math.sin(a) * -7, fy - 7, 5, 1.5);
      break;
    case 'flowers':
      ctx.fillStyle = sc; ctx.beginPath(); ctx.ellipse(fx + 2, fy, 4.2, 2.8, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffffff';
      for (let k = 0; k < 5; k++) circle(ctx, fx + 3 + Math.cos(k * 1.2566) * 2, fy - 2.5 + Math.sin(k * 1.2566) * 2, 1.4);
      ctx.fillStyle = '#ffd166'; circle(ctx, fx + 3, fy - 2.5, 1.1);
      break;
    case 'sneakers':
      ctx.fillStyle = sc; ctx.beginPath(); ctx.ellipse(fx + 2, fy - 0.5, 4.6, 3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = look.shoeColor === '#ffffff' ? '#d8d0e8' : '#ffffff';
      ctx.fillRect(fx - 2.6, fy + 1.4, 9.4, 1.8);
      circle(ctx, fx + 2.5, fy - 2, 1);
      break;
    default:
      ctx.fillStyle = sc; ctx.beginPath(); ctx.ellipse(fx + 2, fy, 4.2, 2.8, 0, 0, TAU); ctx.fill();
  }
}

// ----------------------------------------------------------------- body ----
export function drawFigure(look: Look, pose: Pose): void {
  drawWing(look, -6, -47, pose.wing * 0.9, true, pose);
  drawWing(look, -2, -44, pose.wing, false, pose);
  hairBack(look, pose.t);
  drawLegAndShoe(look, pose.legA[0], true);
  drawLegAndShoe(look, pose.legA[1], false);
  drawDress(look, pose.flutter);
  // arm
  const sx = 1, sy = -41, hx2 = sx + Math.sin(pose.armA) * 12, hy2 = sy + Math.cos(pose.armA) * 12;
  ctx.strokeStyle = look.skin; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx2, hy2); ctx.stroke();
  // head
  ctx.fillStyle = look.skin; circle(ctx, HX, HY, 15);
  hairFront(look);
  // face
  const dark = shade(look.skin, -0.75);
  for (const ex of [HX + 1.5, HX + 8.8]) {
    if (pose.blink) {
      ctx.strokeStyle = dark; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ex, HY + 1, 2.4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    } else {
      ctx.fillStyle = '#3b2550'; ctx.beginPath(); ctx.ellipse(ex, HY + 1, 2.4, 3.2, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#fff'; circle(ctx, ex + 0.8, HY - 0.4, 1);
    }
  }
  ctx.fillStyle = 'rgba(255,120,150,0.5)'; circle(ctx, HX + 11.5, HY + 6, 2.8); circle(ctx, HX - 2.5, HY + 6, 2.8);
  ctx.strokeStyle = '#c2557a'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(HX + 5.2, HY + 6, 2.6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // antennae
  const aw = pose.aw;
  ctx.strokeStyle = '#6b4aa0'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(HX - 2, HY - 15); ctx.quadraticCurveTo(HX - 2, HY - 26, HX + 5 + aw, HY - 31);
  ctx.moveTo(HX + 4, HY - 14); ctx.quadraticCurveTo(HX + 7, HY - 24, HX + 14 + aw, HY - 27); ctx.stroke();
  ctx.fillStyle = '#ffe27a'; circle(ctx, HX + 5 + aw, HY - 31, 2.6); circle(ctx, HX + 14 + aw, HY - 27, 2.6);
}
