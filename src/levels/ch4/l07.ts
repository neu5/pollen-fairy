import { ClockTower } from '../../entities/clockTower';
import { Later } from '../../entities/later';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 4-7 Lighthouse — set the lighthouse clock to quarter to 9 so the lamp shines for the boats.

const TOWER_X = 2500;

export const l4_07: LevelDef = {
  id: '4-7', name: 'Lighthouse', icon: '🗼', theme: 'dusk',
  worldW: 3000, seed: 4707, startX: 220,
  ground: x => 598 - 22 * Math.sin(x * 0.0025 + 0.6) - 10 * Math.sin(x * 0.0064 + 1.5) - 4 * Math.sin(x * 0.017),
  platforms: [
    { type: 'leaf', x: 700, y: 430, w: 150 },
    { type: 'rock', x: 1100, y: 320, w: 200 },
    { type: 'rock', x: 1700, y: 260, w: 200 },
  ],
  flowers: [{ x: 420 }, { x: 950 }, { x: 1500 }, { x: 2100 }, { p: 0 }, { p: 1 }, { p: 2 }],
  setup(w) {
    const tower = new ClockTower(TOWER_X, { h: 8, m: 45 }, { h: 7, m: 0 }, ww => {
      ww.entities.push(new Later(2, w2 => win(w2, { x: TOWER_X - 220, y: w2.ground(TOWER_X) - 220 })));
    });
    tower.lighthouse = true;
    w.entities.push(tower);
  },
};
