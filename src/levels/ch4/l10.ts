import { OrderGame } from '../../entities/order';
import { coralItems, FishSchool } from '../../entities/sea';
import { RAINBOW } from '../../entities/festival';
import { Later } from '../../entities/later';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 4-10 Coral Party — light the coral in rainbow order: red, orange, yellow, green, blue, purple.

const ground = (x: number) => 610 - 26 * Math.sin(x * 0.0022 + 1) - 10 * Math.sin(x * 0.006);

export const l4_10: LevelDef = {
  id: '4-10', name: 'Coral Party', icon: '🐠', theme: 'sea',
  worldW: 3200, seed: 5010, startX: 220, swim: true, ground,
  platforms: [{ type: 'rock', x: 1400, y: 380, w: 200 }],
  flowers: [{ x: 500 }, { x: 1100 }, { x: 1900 }, { x: 2800 }, { p: 0 }],
  setup(w) {
    // mixed places, so the kid has to find each colour
    const xs = [1700, 700, 2500, 1100, 2900, 2100];
    const game = new OrderGame(coralItems(xs.map(x => ({ x, y: ground(x) - 40 })), RAINBOW), ww => {
      ww.entities.push(new Later(2, w2 => win(w2, { x: 1800, y: 300 })));
    }, 70);
    w.entities.push(game, new FishSchool(4));
  },
};
