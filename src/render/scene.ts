import { ctx, V, layer, screenSpace, visible } from '../engine/view';
import { drawParticles, drawConfetti, glow } from '../engine/fx';
import { getBackdrop } from './backdrop';
import { drawBigTree, drawTreeLight, drawPlayBushes, drawGround, drawDecor, drawPlatforms, drawFlowers, drawFlowerLights } from './terrain';
import { drawHudBits, drawJar, drawHints } from './hud';
import { drawFairy, drawShadow, drawFairyLight } from '../game/player';
import type { World } from '../game/types';
import { nightAmount } from '../game/world';

// Draws one frame of a world: backdrop → play layer → foreground → tint → lights → HUD.

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

  // night / rain tint over everything, then lights on top
  const night = nightAmount(w);
  const tintCol = w.theme.tint ?? w.nextTheme?.tint;
  if (night > 0.001 && tintCol) {
    screenSpace();
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = night;
    ctx.fillStyle = tintCol;
    ctx.fillRect(0, 0, V.viewW, V.viewH);
    ctx.restore();
  }
  if (night > 0.001) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    (w.nextTheme && w.themeMix > 0.5 ? getBackdrop(w.nextTheme) : back).drawSkyLight(night);
    ctx.restore();
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

  for (const e of w.entities) if (e.drawOver) { layer(1, 1); e.drawOver(w); }
  layer(1, 1);
  if (w.mode === 'play') drawHints(w);
  drawHudBits(w);
  drawConfetti();
  drawJar(w);
}

