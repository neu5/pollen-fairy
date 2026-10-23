import { DropSpot, Hand, Pickup, type Thing } from '../../entities/carry';
import { drawBlossom, festivalTreeLook } from '../../entities/garden';
import { mulberry32 } from '../../util';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 3-10 Spring Festival — bring 5 blossoms to the big tree and it bursts into flower.

const BLOSSOM: Thing = { kind: 'blossom', draw: () => drawBlossom(1.5) };
const TREE_X = 2400;

export const l3_10: LevelDef = {
  id: '3-10', name: 'Spring Festival', icon: '🌸', theme: 'spring',
  worldW: 3300, seed: 4010, startX: 220,
  ground: x => 598 - 24 * Math.sin(x * 0.0024 + 0.5) - 12 * Math.sin(x * 0.0062 + 1.7) - 5 * Math.sin(x * 0.016),
  platforms: [
    { type: 'leaf', x: 600, y: 430, w: 150 },
    { type: 'rock', x: 950, y: 320, w: 200 },
    { type: 'rock', x: 1500, y: 230, w: 220 },
    { type: 'mushroom', x: 1950, w: 120, h: 90 },
    { type: 'leaf', x: 2900, y: 420, w: 150 },
  ],
  flowers: [{ x: 420 }, { x: 1300 }, { x: 1800 }, { x: 2800 }, { p: 1 }, { p: 2 }, { p: 4 }],
  setup(w) {
    const hand = new Hand(), P = w.platforms, r = mulberry32(TREE_X);
    const canopy = Array.from({ length: 28 }, () => ({ x: (r() - 0.5) * 380, y: -230 + (r() - 0.5) * 150, r: 46 + r() * 34 }));
    const tree = new DropSpot(TREE_X, w.ground(TREE_X), ['blossom'], hand, festivalTreeLook(canopy, 5), () => drawBlossom(1.6), c => {
      if (c >= 5) win(w, { x: TREE_X - 200, y: w.ground(TREE_X) - 260 });
    });
    w.entities.push(
      tree,
      new Pickup(P[0].x + 75, P[0].y - 26, BLOSSOM, hand), new Pickup(P[1].x + 100, P[1].y - 26, BLOSSOM, hand),
      new Pickup(P[2].x + 110, P[2].y - 26, BLOSSOM, hand), new Pickup(2050, 300, BLOSSOM, hand),
      new Pickup(P[4].x + 75, P[4].y - 26, BLOSSOM, hand),
      hand,
    );
  },
};
