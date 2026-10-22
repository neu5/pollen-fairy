import { ctx, V, layer, visible, mainCtx, setCtx, offscreen } from '../engine/view';
import { drawParticles, drawConfetti, glow } from '../engine/fx';
import { getBackdrop } from './backdrop';
import { drawBigTree, drawTreeLight, drawPlayBushes, drawGround, drawDecor, drawPlatforms, drawFlowers, drawFlowerLights } from './terrain';
import { drawHudBits, drawJar, drawHints } from './hud';
import { drawFairy, drawShadow, drawFairyLight } from '../game/player';
import type { World } from '../game/types';
import { nightAmount } from '../game/world';

// Draws one frame of a world: backdrop → play layer → foreground → tint → lights → HUD.
// At night the play layer is drawn on its own canvas and darkened there, so the sky
// (already a night sky) and the moon stay as they are.

export function renderWorld(w: World): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  const back = getBackdrop(w.theme);
  back.drawBack(w.rainbowA);
  const next = w.nextTheme ? getBackdrop(w.nextTheme) : null;
  if (next && w.themeMix > 0) {
    // crossfade the whole backdrop: draw it into the frame with alpha
    ctx.save(); ctx.globalAlpha = w.themeMix;
    next.drawBack(w.rainbowA);
    ctx.restore();
  }
  const playBack = next && w.themeMix > 0.5 ? next : back;

  const night = nightAmount(w);
  const tintCol = w.theme.tint ?? w.nextTheme?.tint;
  const tinted = night > 0.001 && !!tintCol;
  if (tinted) {
    const a = offscreen(0);
    a.setTransform(1, 0, 0, 1, 0, 0);
    a.clearRect(0, 0, a.canvas.width, a.canvas.height);
    setCtx(a);
  }

  layer(1, 1);
  drawBigTree(w);
  drawPlayBushes(w, playBack);
  drawGround(w);
  drawPlatforms(w);
  drawDecor(w);
  for (const e of w.entities) if (e.z < 0) { layer(1, 1); e.draw(w); }
  layer(1, 1);
  drawShadow(w);
  drawFlowers(w);
  for (const e of w.entities) if (e.z === 0) { layer(1, 1); e.draw(w); }
  layer(1, 1);
  drawFairy(w);
  for (const e of w.entities) if (e.z > 0) { layer(1, 1); e.draw(w); }
  layer(1, 1);
  drawParticles();

  playBack.drawFront();

  if (tinted) {
    // darken the world canvas: multiply with the tint, keep only where something was drawn
    const a = ctx, b = offscreen(1), wpx = a.canvas.width, hpx = a.canvas.height;
    b.setTransform(1, 0, 0, 1, 0, 0);
    b.clearRect(0, 0, wpx, hpx);
    b.drawImage(a.canvas, 0, 0);
    a.setTransform(1, 0, 0, 1, 0, 0);
    a.globalCompositeOperation = 'multiply';
    a.globalAlpha = night;
    a.fillStyle = tintCol!;
    a.fillRect(0, 0, wpx, hpx);
    a.globalAlpha = 1;
    a.globalCompositeOperation = 'destination-in';
    a.drawImage(b.canvas, 0, 0);
    a.globalCompositeOperation = 'source-over';
    setCtx(mainCtx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(a.canvas, 0, 0);
  }
  layer(1, 1);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (night > 0.001) {
    drawTreeLight(w); drawFlowerLights(w, night);
    for (const pl of w.platforms) {
      if (pl.type !== 'mushroom' || pl.hidden || !visible(pl.x - 100, pl.x + pl.w + 100)) continue;
      glow(pl.x + pl.w / 2, pl.y + pl.w * 0.2, pl.w * 0.9, 'rgba(255,170,220,A)', 0.4 * night);
    }
  }
  drawFairyLight(w, night);
  for (const e of w.entities) if (e.drawLight) { ctx.save(); e.drawLight(w); ctx.restore(); }
  ctx.restore();
  playBack.drawAtmos();

  for (const e of w.entities) if (e.drawOver) { layer(1, 1); e.drawOver(w); }
  layer(1, 1);
  if (w.mode === 'play') drawHints(w);
  drawHudBits(w);
  drawConfetti();
  drawJar(w);
}

