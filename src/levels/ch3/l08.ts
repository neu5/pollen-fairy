import { DropSpot, Hand, Pickup } from '../../entities/carry';
import { BIG_APPLE, GREEN_APPLE, RED_APPLE, SMALL_APPLE, basketLook } from '../../entities/garden';
import { win } from '../../game/world';
import type { Entity, LevelDef } from '../../game/types';

// 3-8 Apple Sorting — first big and small apples, then red and green ones.

export const l3_08: LevelDef = {
  id: '3-8', name: 'Apple Sorting', icon: '🍎', theme: 'autumn',
  worldW: 3400, seed: 3808, startX: 220,
  ground: x => 598 - 24 * Math.sin(x * 0.0024 + 0.5) - 12 * Math.sin(x * 0.0062 + 1.7) - 5 * Math.sin(x * 0.016),
  platforms: [
    { type: 'rock', x: 700, y: 360, w: 200 },
    { type: 'leaf', x: 2100, y: 420, w: 150 },
    { type: 'rock', x: 2600, y: 320, w: 200 },
  ],
  flowers: [{ x: 420 }, { x: 1300 }, { x: 1900 }, { x: 3200 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const hand = new Hand(), P = w.platforms;
    const g = (x: number) => w.ground(x) - 30;
    const baskets = [
      new DropSpot(1450, g(1450) + 20, ['big'], hand, basketLook(BIG_APPLE)),
      new DropSpot(1650, g(1650) + 20, ['small'], hand, basketLook(SMALL_APPLE)),
      new DropSpot(2900, g(2900) + 20, ['red'], hand, basketLook(RED_APPLE)),
      new DropSpot(3100, g(3100) + 20, ['green'], hand, basketLook(GREEN_APPLE)),
    ];
    const ups = [
      new Pickup(480, g(480), BIG_APPLE, hand), new Pickup(P[0].x + 60, P[0].y - 30, SMALL_APPLE, hand),
      new Pickup(P[0].x + 150, P[0].y - 30, BIG_APPLE, hand), new Pickup(1100, g(1100), SMALL_APPLE, hand),
      new Pickup(2000, g(2000), RED_APPLE, hand), new Pickup(P[1].x + 75, P[1].y - 30, GREEN_APPLE, hand),
      new Pickup(P[2].x + 60, P[2].y - 30, RED_APPLE, hand), new Pickup(P[2].x + 150, P[2].y - 30, GREEN_APPLE, hand),
    ];
    const total = ups.length;
    const check: Entity = { z: 0, draw() {}, update(ww) { if (baskets.reduce((s, b) => s + b.count, 0) >= total && ww.mode === 'play') win(ww, { x: 2300, y: ww.ground(2300) - 200 }); } };
    w.entities.push(...baskets, ...ups, hand, check);
  },
};
