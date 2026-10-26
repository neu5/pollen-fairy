import { ctx } from '../../engine/view';
import { DropSpot, Hand, Pickup } from '../../entities/carry';
import { LOGS, damLook, drawBeaver } from '../../entities/sea';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 4-3 Beaver Dam — bring the logs to the dam: biggest first, smallest last.

const DAM_X = 2600;

export const l4_03: LevelDef = {
  id: '4-3', name: 'Beaver Dam', icon: '🦫', theme: 'pond',
  worldW: 3100, seed: 4303, startX: 220,
  ground: x => 598 - 22 * Math.sin(x * 0.0025 + 0.6) - 10 * Math.sin(x * 0.0064 + 1.5) - 4 * Math.sin(x * 0.017),
  platforms: [
    { type: 'rock', x: 800, y: 340, w: 200 },
    { type: 'leaf', x: 1400, y: 420, w: 150 },
    { type: 'rock', x: 1850, y: 290, w: 200 },
  ],
  flowers: [{ x: 420 }, { x: 1200 }, { x: 1700 }, { x: 2900 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const hand = new Hand(), P = w.platforms;
    const dam = new DropSpot(DAM_X, w.ground(DAM_X), ['log4'], hand, c => {
      damLook(c);
      ctx.save(); ctx.translate(110, 0); ctx.scale(1.3, 1.3); drawBeaver(c >= 4); ctx.restore();
    }, null, c => {
      dam.accepts = c < 4 ? [`log${4 - c}`] : [];
      if (c >= 4) win(w, { x: DAM_X - 200, y: w.ground(DAM_X) - 200 });
    });
    // logs lie in a mixed order
    const g = (x: number) => w.ground(x) - 20;
    w.entities.push(
      dam,
      new Pickup(600, g(600), LOGS[2], hand), new Pickup(P[0].x + 100, P[0].y - 20, LOGS[0], hand),
      new Pickup(P[1].x + 75, P[1].y - 20, LOGS[3], hand), new Pickup(P[2].x + 100, P[2].y - 20, LOGS[1], hand),
      hand,
    );
  },
};
