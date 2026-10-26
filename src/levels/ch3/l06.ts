import { OrderGame } from '../../entities/order';
import { SEASONS, SeasonTree } from '../../entities/garden';
import { touchGlow } from '../../entities/friend';
import { Later } from '../../entities/later';
import { win } from '../../game/world';
import { ctx } from '../../engine/view';
import type { LevelDef } from '../../game/types';

// 3-6 Season Tree — touch the seasons in order: spring, summer, autumn, winter.

const ground = (x: number) => 598 - 20 * Math.sin(x * 0.0026 + 0.3) - 10 * Math.sin(x * 0.007 + 1);

export const l3_06: LevelDef = {
  id: '3-6', name: 'Season Tree', icon: '🌳', theme: 'spring',
  worldW: 2800, seed: 3606, startX: 220, ground,
  platforms: [
    { type: 'rock', x: 700, y: 340, w: 200 },
    { type: 'leaf', x: 1900, y: 420, w: 150 },
    { type: 'rock', x: 2200, y: 280, w: 200 },
  ],
  flowers: [{ x: 420 }, { x: 1100 }, { x: 1700 }, { x: 2600 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const tree = new SeasonTree(1400);
    // places are mixed up on purpose: the kid has to think about the order
    const spots = [{ x: 2300, y: 210 }, { x: 800, y: 270 }, { x: 1980, y: 360 }, { x: 560, y: ground(560) - 60 }];
    const game = new OrderGame(spots.map((p, i) => ({
      x: p.x, y: p.y,
      draw(lit, wiggle, next) {
        ctx.save(); ctx.translate(wiggle > 0 ? Math.sin(wiggle * 40) * 4 : 0, 0);
        ctx.fillStyle = lit ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)'; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = lit ? 0.35 : 1; SEASONS[i](); ctx.restore();
        if (next && !lit) touchGlow(0, 0, 54);
      },
    })), ww => ww.entities.push(new Later(1.6, w2 => win(w2, { x: 1400, y: w2.ground(1400) - 200 }))), 60);
    const sync = { z: 0, draw() {}, update() { tree.stage = game.got; } };
    w.entities.push(tree, game, sync);
  },
};
