import { FoxDen, HidingCub } from '../../entities/night2';
import { Countdown } from '../../entities/timer';
import type { LevelDef } from '../../game/types';

// 2-8 Fox Cubs — find the 4 hiding fox cubs before the moon goes down (90 seconds).

const DEN_X = 380;

export const l2_08: LevelDef = {
  id: '2-8', name: 'Fox Cubs', icon: '🦊', theme: 'night',
  worldW: 3400, seed: 2808, startX: 600,
  ground: x => 600 - 24 * Math.sin(x * 0.0022 + 1.2) - 12 * Math.sin(x * 0.0058 + 0.3),
  platforms: [
    { type: 'rock', x: 1200, y: 340, w: 200 },
    { type: 'mushroom', x: 1800, w: 120, h: 90 },
    { type: 'rock', x: 2300, y: 260, w: 220 },
    { type: 'leaf', x: 2850, y: 430, w: 150 },
  ],
  flowers: [{ x: 900 }, { x: 1500 }, { x: 2100 }, { x: 2700 }, { x: 3200 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const P = w.platforms;
    const cubs = [
      new HidingCub(1000, DEN_X),
      new HidingCub(P[0].x + 110, DEN_X, P[0].y),
      new HidingCub(P[2].x + 120, DEN_X, P[2].y),
      new HidingCub(3150, DEN_X),
    ];
    const den = new FoxDen(DEN_X, cubs);
    w.entities.push(den, ...cubs, new Countdown(90, true, () => den.done));
  },
};
