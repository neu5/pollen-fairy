import { Scale } from '../../entities/mountain';
import { Later } from '../../entities/later';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 5-3 Balance Bridge — the left side weighs 5. Put stones on the right until both sides are the same.
// (Touch the right pan with empty hands to take a stone back off.)

const SCALE_X = 1800;

export const l5_03: LevelDef = {
  id: '5-3', name: 'Balance Bridge', icon: '⚖️', theme: 'mountain',
  worldW: 3000, seed: 5303, startX: 220,
  ground: x => 598 - 18 * Math.sin(x * 0.0024 + 0.6) - 8 * Math.sin(x * 0.006),
  platforms: [
    { type: 'rock', x: 700, y: 340, w: 200 },
    { type: 'leaf', x: 1200, y: 420, w: 150 },
    { type: 'rock', x: 2350, y: 300, w: 200 },
  ],
  flowers: [{ x: 450 }, { x: 1050 }, { x: 2200 }, { x: 2800 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const P = w.platforms, g = (x: number) => w.ground(x);
    const stones = [
      { w: 1, x: 520, y: g(520), on: false }, { w: 3, x: P[0].x + 100, y: P[0].y, on: false },
      { w: 2, x: P[1].x + 75, y: P[1].y, on: false }, { w: 1, x: 2150, y: g(2150), on: false }, { w: 2, x: P[2].x + 100, y: P[2].y, on: false },
    ];
    w.entities.push(new Scale(SCALE_X, 5, stones, ww => ww.entities.push(new Later(1.5, w2 => win(w2, { x: SCALE_X, y: w2.ground(SCALE_X) - 260 })))));
  },
};
