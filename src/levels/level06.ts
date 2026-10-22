import { clamp, lerp } from '../util';
import { Frog, FrogChoir } from '../entities/frogs';
import { River } from '../entities/obstacles';
import { GreatFlower } from '../entities/greatFlower';
import type { LevelDef } from '../game/types';

// Level 6: Frog Pond — listen to the frogs' song and sing it back by touching them.

const PA = 1180, PB = 2480, SURFACE = 620;
const sstep = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export const level06: LevelDef = {
  id: 6,
  name: 'Frog Pond',
  icon: '🐸',
  theme: 'pond',
  worldW: 3200,
  seed: 606,
  startX: 220,
  winText: 'What a lovely frog song!',
  noDecorIn: [[PA - 10, PB + 10]],
  ground(x) {
    let y = 596 - 22 * Math.sin(x * 0.0027 + 0.9) - 10 * Math.sin(x * 0.007);
    y = lerp(y, 592, sstep(PA - 200, PA, x) * (1 - sstep(PB, PB + 200, x)));
    return y + sstep(PA, PA + 80, x) * (1 - sstep(PB - 80, PB, x)) * 52;
  },
  platforms: [
    { type: 'leaf', x: 560, y: 450, w: 150 },          // 0
    { type: 'rock', x: 850, y: 360, w: 180 },          // 1
    { type: 'leaf', x: 1400 - 55, y: 612, w: 110 },    // 2: frog pads
    { type: 'leaf', x: 1780 - 55, y: 612, w: 110 },    // 3
    { type: 'leaf', x: 2160 - 55, y: 612, w: 110 },    // 4
    { type: 'rock', x: 1600, y: 330, w: 160 },         // 5
    { type: 'rock', x: 2000, y: 300, w: 160 },         // 6
  ],
  flowers: [
    { x: 400 }, { x: 760 }, { x: 1080 }, { x: 2620 }, { x: 2880 },
    { p: 0 }, { p: 1, u: 0.3 }, { p: 1, u: 0.75 }, { p: 5 }, { p: 6 },
  ],
  setup(w) {
    const frogs = [
      new Frog(w.platforms[2], '#6fcf55', 0),
      new Frog(w.platforms[3], '#b48cff', 2),
      new Frog(w.platforms[4], '#5ec8ff', 4),
    ];
    const lotus = new GreatFlower(2760, ['#ff8fc7', '#ffb3d6', '#fff0f6', '#ffd6ea']);
    lotus.locked = true;
    w.entities.push(lotus, ...frogs, new River(PA, PB, SURFACE), new FrogChoir(frogs, 1300, { x: 2610, y: w.ground(2760) - 190 }));
  },
};
