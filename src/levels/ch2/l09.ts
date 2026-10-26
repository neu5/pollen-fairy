import { MOTH_COLS, MOTH_ROUNDS, MothLantern } from '../../entities/night2';
import { FrogChoir } from '../../entities/frogs';
import type { LevelDef } from '../../game/types';

// 2-9 Moth Lanterns — watch which lanterns the moths visit, then light them in the same order.

const ground = (x: number) => 600 - 16 * Math.sin(x * 0.0028 + 0.4) - 8 * Math.sin(x * 0.007);

export const l2_09: LevelDef = {
  id: '2-9', name: 'Moth Lanterns', icon: '🦋', theme: 'night',
  worldW: 3000, seed: 2909, startX: 220, ground,
  platforms: [
    { type: 'leaf', x: 600, y: 440, w: 150 },
    { type: 'rock', x: 950, y: 340, w: 180 },
    { type: 'mushroom', x: 2550, w: 120, h: 90 },
  ],
  flowers: [{ x: 420 }, { x: 800 }, { x: 1250 }, { x: 2400 }, { x: 2800 }, { p: 0 }, { p: 1 }],
  setup(w) {
    const xs = [1450, 1700, 1950, 2200];
    const lamps = xs.map((x, i) => new MothLantern(x, ground(x) - 170, MOTH_COLS[i], [2, 4, 5, 7][i]));
    w.entities.push(...lamps, new FrogChoir(lamps, 1300, { x: 1825, y: ground(1825) - 260 }, MOTH_ROUNDS));
  },
};
