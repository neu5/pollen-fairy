import { OrderGame } from '../../entities/order';
import { FishSchool, ringItems } from '../../entities/sea';
import { Countdown } from '../../entities/timer';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 4-6 Fish School — swim through the 8 rings to lead the fish to the reef (60 s).

export const l4_06: LevelDef = {
  id: '4-6', name: 'Fish School', icon: '🐟', theme: 'sea',
  worldW: 3400, seed: 4606, startX: 220, swim: true,
  ground: x => 610 - 30 * Math.sin(x * 0.002 + 0.4) - 12 * Math.sin(x * 0.006),
  platforms: [{ type: 'rock', x: 1500, y: 360, w: 200 }],
  flowers: [{ x: 600 }, { x: 1300 }, { x: 2100 }, { x: 2900 }, { p: 0 }],
  setup(w) {
    const pts = [[500, 400], [850, 250], [1200, 420], [1550, 220], [1900, 380], [2250, 180], [2600, 360], [2950, 260]].map(([x, y]) => ({ x, y }));
    const game = new OrderGame(ringItems(pts), ww => win(ww, { x: 3050, y: 260 }), 56);
    w.entities.push(game, new FishSchool(5), new Countdown(60, true, () => game.complete));
  },
};
