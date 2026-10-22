import { clamp, lerp } from '../util';
import { win } from '../game/world';
import { Snail } from '../entities/snail';
import { TallGrass, SleepyRock, River, LeafBridge, MushroomHouse } from '../entities/obstacles';
import type { LevelDef } from '../game/types';

// Level 2: Snail's Slow Trip — clear the way so the snail can get home.

const RA = 2600, RB = 2900, SURFACE = 620;
const sstep = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export const level02: LevelDef = {
  id: 2,
  name: "Snail's Slow Trip",
  icon: '🐌',
  theme: 'morning',
  worldW: 4300,
  seed: 202,
  startX: 220,
  winText: 'Snail is home, safe and happy!',
  noDecorIn: [[RA - 10, RB + 10]],
  ground(x) {
    let y = 594 - 24 * Math.sin(x * 0.0024 + 0.3) - 14 * Math.sin(x * 0.0061 + 1.2) - 6 * Math.sin(x * 0.015);
    y = lerp(y, 592, sstep(2380, 2520, x) * (1 - sstep(2980, 3120, x)));
    return y + sstep(RA, RA + 50, x) * (1 - sstep(RB - 50, RB, x)) * 56;
  },
  platforms: [
    { type: 'rock', x: 1300, y: 400, w: 180 },     // 0
    { type: 'leaf', x: 2100, y: 440, w: 150 },     // 1
    { type: 'rock', x: 3250, y: 380, w: 200 },     // 2
    { type: 'mushroom', x: 3500, w: 120, h: 90 },  // 3
    { type: 'leaf', x: 2560, y: 590, w: 380 },     // 4: the bridge (hidden until the leaf falls)
  ],
  flowers: [
    { x: 300 }, { x: 700 }, { x: 900 }, { x: 1520 }, { x: 1700 }, { x: 2240 },
    { x: 3150 }, { x: 3440 }, { x: 3700 },
    { p: 0, u: 0.3 }, { p: 0, u: 0.75 }, { p: 1 }, { p: 2 },
  ],
  setup(w) {
    const grass = new TallGrass(1050);
    const rock = new SleepyRock(1880);
    const bridge = new LeafBridge(w.platforms[4], 2470, 330);
    const snail = new Snail(380, 3830);
    snail.blockers = [grass, rock, bridge];
    snail.onHome = ww => win(ww, { x: 3760, y: ww.ground(3760) - 170 });
    w.entities.push(new MushroomHouse(3920), bridge, new River(RA, RB, SURFACE), grass, rock, snail);
  },
};
