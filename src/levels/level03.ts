import { Beetle, BigStone, Hourglass } from '../entities/beetle';
import type { LevelDef } from '../game/types';

// Level 3: Night Garden — find the hourglass, wait for morning, the beetle moves the stone.

export const level03: LevelDef = {
  id: '1-3',
  name: 'Night Garden',
  icon: '🌙',
  theme: 'night',
  worldW: 3900,
  seed: 303,
  startX: 220,
  winText: 'Good morning, Beetle!',
  ground: x => 596 - 30 * Math.sin(x * 0.0022 + 1.1) - 16 * Math.sin(x * 0.0057 + 0.4) - 6 * Math.sin(x * 0.014),
  platforms: [
    { type: 'mushroom', x: 700, w: 120, h: 90 },    // 0
    { type: 'rock', x: 950, y: 400, w: 180 },       // 1
    { type: 'rock', x: 1350, y: 300, w: 200 },      // 2
    { type: 'mushroom', x: 1750, w: 130, h: 100 },  // 3
    { type: 'leaf', x: 1950, y: 420, w: 160 },      // 4
    { type: 'rock', x: 2300, y: 340, w: 200 },      // 5
    { type: 'rock', x: 3150, y: 300, w: 220 },      // 6: the hourglass rock
  ],
  flowers: [
    { x: 420 }, { x: 640 }, { x: 1180 }, { x: 1600 }, { x: 2150 }, { x: 2600 }, { x: 3550 },
    { p: 1 }, { p: 2, u: 0.3 }, { p: 2, u: 0.75 }, { p: 4 }, { p: 5 },
  ],
  setup(w) {
    const clock = new Hourglass(w.platforms[6], 0.5);
    const stone = new BigStone(3020);
    w.entities.push(stone, new Beetle(2780, stone, clock), clock);
  },
};
