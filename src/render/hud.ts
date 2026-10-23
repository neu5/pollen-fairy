import { ctx, V, IS_TOUCH, screenSpace } from '../engine/view';
import { glow } from '../engine/fx';
import { TAU, clamp, damp, ease, circle, rr } from '../util';
import type { World } from '../game/types';
import { t } from '../i18n';

const JAR_X = 58, JAR_Y = 62;

export function updateHud(w: World, dt: number): void {
  for (const b of w.hudBits) {
    b.t += dt;
    if (b.t >= b.dur && !b.done) { b.done = true; w.arrived += 0.2; w.jarPulse = 1; }
  }
  w.hudBits = w.hudBits.filter(b => !b.done);
  w.jarFill = damp(w.jarFill, w.total ? w.arrived / w.total : 0, 6, dt);
  w.jarPulse = Math.max(0, w.jarPulse - dt * 2.5);
  const h = w.hints, playing = w.mode === 'play';
  h.walkA = damp(h.walkA, playing && !h.walked ? 1 : 0, 4, dt);
  h.flyA = damp(h.flyA, playing && h.walked && !h.flew ? 1 : 0, 4, dt);
}

export function drawHudBits(w: World): void {
  screenSpace();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const b of w.hudBits) {
    if (b.t < 0) continue;
    const u = ease(clamp(b.t / b.dur, 0, 1)), v = 1 - u;
    const x = v * v * b.sx + 2 * v * u * b.cx + u * u * JAR_X;
    const y = v * v * b.sy + 2 * v * u * b.cy + u * u * JAR_Y;
    glow(x, y, 16, 'rgba(255,220,110,A)', 0.8);
    ctx.fillStyle = '#fff6c0'; circle(ctx, x, y, 3.5);
  }
  ctx.restore();
}

export function drawJar(w: World): void {
  if (w.mode === 'idle' || !w.total) return;
  screenSpace();
  const s = 1 + w.jarPulse * 0.14, fill = clamp(w.jarFill, 0, 1);
  ctx.save(); ctx.translate(JAR_X, JAR_Y); ctx.scale(s, s);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  glow(0, 4, 50, 'rgba(255,220,120,A)', 0.25 + fill * 0.35 + w.jarPulse * 0.3);
  ctx.restore();
  rr(ctx, -24, -24, 48, 54, 15);
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill();
  ctx.save(); ctx.clip();
  const fh = 54 * fill;
  const fg = ctx.createLinearGradient(0, 30 - fh, 0, 30);
  fg.addColorStop(0, '#ffe680'); fg.addColorStop(1, '#ffb43a');
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.moveTo(-26, 30);
  for (let x = -26; x <= 26; x += 4) ctx.lineTo(x, 30 - fh + Math.sin(x * 0.25 + V.time * 3) * (fh > 2 ? 1.6 : 0));
  ctx.lineTo(26, 30); ctx.closePath(); ctx.fill();
  ctx.restore();
  rr(ctx, -24, -24, 48, 54, 15);
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; rr(ctx, -16, -16, 6, 30, 3); ctx.fill();
  ctx.fillStyle = '#c98a4b'; rr(ctx, -19, -33, 38, 11, 5); ctx.fill();
  ctx.fillStyle = '#e5a96a'; rr(ctx, -19, -33, 38, 4, 2); ctx.fill();
  ctx.restore();
  ctx.font = '700 34px "Baloo 2", sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(110,60,140,0.55)';
  const txt = `${w.collected} / ${w.total}`;
  ctx.strokeText(txt, 98, 64); ctx.fillStyle = '#ffffff'; ctx.fillText(txt, 98, 64);
}

// A white thought/speech bubble with a picture inside. (x, y) = tip of the tail.
export function drawBubble(x: number, y: number, a: number, size: number, icon: () => void): void {
  if (a < 0.02) return;
  const bob = Math.sin(V.time * 2.2) * 3, cy = y - size / 2 - 12 + bob;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  ctx.shadowColor = 'rgba(80,50,140,0.25)'; ctx.shadowBlur = 10 * V.scale;
  rr(ctx, x - size / 2, cy - size / 2, size, size, size * 0.36); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.beginPath(); ctx.moveTo(x - 8, cy + size / 2 - 1); ctx.lineTo(x, cy + size / 2 + 11); ctx.lineTo(x + 8, cy + size / 2 - 1); ctx.fill();
  ctx.translate(x, cy);
  icon();
  ctx.restore();
}

function drawKey(x: number, y: number, kw: number, label: string): void {
  ctx.fillStyle = '#c9b8f0'; rr(ctx, x, y + 3, kw, 34, 9); ctx.fill();
  ctx.fillStyle = '#f3ecff'; rr(ctx, x, y, kw, 34, 9); ctx.fill();
  ctx.fillStyle = '#6a4bb0';
  if (label === 'left' || label === 'right') {
    const cx = x + kw / 2, cy = y + 17, s = label === 'left' ? -1 : 1;
    ctx.beginPath(); ctx.moveTo(cx + s * 7, cy); ctx.lineTo(cx - s * 5, cy - 8); ctx.lineTo(cx - s * 5, cy + 8); ctx.closePath(); ctx.fill();
  } else if (label === 'wing') {
    ctx.save(); ctx.translate(x + kw / 2, y + 17); ctx.fillStyle = '#ff8fc7';
    ctx.beginPath(); ctx.ellipse(-6, -3, 6, 5, -0.6, 0, TAU); ctx.ellipse(6, -3, 6, 5, 0.6, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-4, 5, 4, 3, 0.5, 0, TAU); ctx.ellipse(4, 5, 4, 3, -0.5, 0, TAU); ctx.fill();
    ctx.fillStyle = '#6a4bb0'; ctx.fillRect(-1, -7, 2, 15);
    ctx.restore();
  } else {
    ctx.font = '700 15px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, x + kw / 2, y + 18);
  }
}

function drawHintBubble(w: World, a: number, keys: { w: number; label: string }[]): void {
  if (a < 0.02) return;
  const p = w.player, gap = 8, pad = 12;
  const tw = keys.reduce((s, k) => s + k.w, 0) + gap * (keys.length - 1) + pad * 2, th = 54;
  const x = p.x, y = p.y - 150 + Math.sin(V.time * 2) * 3;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  rr(ctx, x - tw / 2, y - th / 2, tw, th, 20); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - 9, y + th / 2 - 1); ctx.lineTo(x, y + th / 2 + 11); ctx.lineTo(x + 9, y + th / 2 - 1); ctx.fill();
  let kx = x - tw / 2 + pad;
  for (const k of keys) { drawKey(kx, y - 19, k.w, k.label); kx += k.w + gap; }
  ctx.restore();
}

export function drawHints(w: World): void {
  drawHintBubble(w, w.hints.walkA, [{ w: 40, label: 'left' }, { w: 40, label: 'right' }]);
  drawHintBubble(w, w.hints.flyA, IS_TOUCH ? [{ w: 52, label: 'wing' }] : [{ w: 92, label: t('key.space') }, { w: 40, label: 'wing' }]);
}
