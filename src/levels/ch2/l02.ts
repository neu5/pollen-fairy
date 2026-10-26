import { DropSpot, Hand, Pickup } from '../../entities/carry';
import { Den, MOSS, OLD_LEAVES } from '../../entities/nightFriends';
import type { LevelDef } from '../../game/types';

// 2-2 Badger's Den — take the old leaves out, bring soft moss in, then Badger can sleep.

const DEN_X = 1900, HEAP_X = 2700;

export const l2_02: LevelDef = {
  id: '2-2',
  name: "Badger's Den",
  icon: '🦡',
  theme: 'night',
  worldW: 3300,
  seed: 2202,
  startX: 220,
  ground: x => 598 - 20 * Math.sin(x * 0.0021 + 0.3) - 12 * Math.sin(x * 0.0059 + 1.4),
  platforms: [
    { type: 'rock', x: 520, y: 400, w: 180 },       // 0: moss
    { type: 'leaf', x: 900, y: 360, w: 150 },       // 1: moss
    { type: 'rock', x: 1200, y: 260, w: 200 },      // 2: moss
    { type: 'mushroom', x: 2350, w: 120, h: 90 },   // 3
    { type: 'rock', x: 2950, y: 340, w: 180 },      // 4
  ],
  flowers: [
    { x: 400 }, { x: 1100 }, { x: 1500 }, { x: 2300 }, { x: 3150 },
    { p: 0, u: 0.2 }, { p: 2, u: 0.8 }, { p: 4 },
  ],
  setup(w) {
    const hand = new Hand();
    const den = new Den(DEN_X, { moss: 3, out: 3 }, HEAP_X, hand);
    const P = w.platforms;
    const look = () => {};
    w.entities.push(
      den,
      new DropSpot(DEN_X, w.ground(DEN_X) - 30, ['moss'], hand, look, () => MOSS.draw(), () => { den.moss++; }),
      new DropSpot(HEAP_X, w.ground(HEAP_X) - 20, ['old'], hand, look, () => OLD_LEAVES.draw(), () => { den.out++; }),
      new Pickup(DEN_X - 110, w.ground(DEN_X - 110) - 20, OLD_LEAVES, hand),
      new Pickup(DEN_X + 10, w.ground(DEN_X + 10) - 50, OLD_LEAVES, hand),
      new Pickup(DEN_X + 120, w.ground(DEN_X + 120) - 20, OLD_LEAVES, hand),
      new Pickup(P[0].x + 90, P[0].y - 24, MOSS, hand),
      new Pickup(P[1].x + 75, P[1].y - 24, MOSS, hand),
      new Pickup(P[2].x + 100, P[2].y - 24, MOSS, hand),
      hand,
    );
  },
};
