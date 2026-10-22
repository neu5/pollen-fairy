import { BabyBird, MamaBird, Nest, Updraft } from '../entities/bird';
import type { LevelDef } from '../game/types';

// Level 5: Windy Hill — bring the baby bird back up to its nest. Wind lifts you high.

const NEST_X = 3180, NEST_Y = 70;

export const level05: LevelDef = {
  id: 5,
  name: 'Windy Hill',
  icon: '🐦',
  theme: 'windy',
  worldW: 3700,
  seed: 505,
  startX: 220,
  winText: 'Baby bird is home with Mama!',
  ground: x => 600 - 40 * Math.sin(x * 0.0018 + 0.4) - 18 * Math.sin(x * 0.0052 + 2) - 6 * Math.sin(x * 0.015),
  platforms: [
    { type: 'leaf', x: 900, y: 440, w: 150 },        // 0
    { type: 'rock', x: 1580, y: 240, w: 220 },       // 1 (top of first wind)
    { type: 'rock', x: 2050, y: 330, w: 180 },       // 2
    { type: 'rock', x: 2480, y: 160, w: 220 },       // 3 (top of second wind)
    { type: 'branch', x: NEST_X - 60, y: NEST_Y + 10, w: 200 }, // 4: nest branch (drawn by the nest)
  ],
  flowers: [
    { x: 420 }, { x: 760 }, { x: 1250 }, { x: 1900 }, { x: 2300 }, { x: 2800 },
    { p: 0 }, { p: 1, u: 0.3 }, { p: 1, u: 0.75 }, { p: 2 }, { p: 3, u: 0.3 }, { p: 3, u: 0.75 },
  ],
  setup(w) {
    const branch = w.platforms[4];
    branch.invisible = true;
    const nest = new Nest(NEST_X, NEST_Y, branch);
    const baby = new BabyBird(620, nest);
    w.entities.push(
      nest,
      new Updraft(1460, 200), new Updraft(2380, 110), new Updraft(2980, -60, 140),
      new MamaBird(nest, baby), baby,
    );
  },
};
