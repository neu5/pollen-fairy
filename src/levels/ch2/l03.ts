import { ClockTower } from '../../entities/clockTower';
import { Lanterns } from '../../entities/festival';
import { win } from '../../game/world';
import { Later } from '../../entities/later';
import type { LevelDef } from '../../game/types';

// 2-3 Clock Tower — set the big clock to 8 o'clock and the firefly lamps turn on.

const TOWER_X = 2200;

export const l2_03: LevelDef = {
  id: '2-3',
  name: 'Clock Tower',
  icon: '🕗',
  theme: 'night',
  worldW: 3000,
  seed: 2303,
  startX: 220,
  ground: x => 596 - 18 * Math.sin(x * 0.0026 + 1.2) - 10 * Math.sin(x * 0.007),
  platforms: [
    { type: 'leaf', x: 620, y: 440, w: 150 },       // 0
    { type: 'rock', x: 950, y: 330, w: 200 },       // 1
    { type: 'mushroom', x: 1400, w: 120, h: 90 },   // 2
    { type: 'rock', x: 1650, y: 280, w: 200 },      // 3
  ],
  flowers: [
    { x: 420 }, { x: 860 }, { x: 1250 }, { x: 1900 }, { x: 2650 },
    { p: 0 }, { p: 1, u: 0.3 }, { p: 1, u: 0.75 }, { p: 3 },
  ],
  setup(w) {
    const lamps = [new Lanterns(400, 1150, 220), new Lanterns(1250, 2000, 230), new Lanterns(2400, 2900, 230)];
    for (const l of lamps) l.lit = false;
    w.entities.push(
      ...lamps,
      new ClockTower(TOWER_X, { h: 8, m: 0 }, { h: 5, m: 0 }, ww => {
        lamps.forEach(l => { l.lit = true; });
        ww.entities.push(new Later(1.4, w2 => win(w2, { x: TOWER_X - 200, y: w2.ground(TOWER_X) - 200 })));
      }),
    );
  },
};
