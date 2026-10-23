import { Hand, Pickup } from '../../entities/carry';
import { FeatherTrail, GLASSES, OwlTree } from '../../entities/nightFriends';
import type { LevelDef } from '../../game/types';

// 2-1 Owl's Glasses — follow the feathers, find the glasses, bring them back to Owl.

export const l2_01: LevelDef = {
  id: '2-1',
  name: "Owl's Glasses",
  icon: '👓',
  theme: 'dusk',
  worldW: 3600,
  seed: 2101,
  startX: 220,
  ground: x => 598 - 28 * Math.sin(x * 0.0024 + 0.9) - 14 * Math.sin(x * 0.0063 + 0.2) - 5 * Math.sin(x * 0.017),
  platforms: [
    { type: 'leaf', x: 900, y: 450, w: 150 },       // 0
    { type: 'rock', x: 1250, y: 350, w: 200 },      // 1
    { type: 'mushroom', x: 1650, w: 120, h: 90 },   // 2
    { type: 'rock', x: 1880, y: 230, w: 220 },      // 3: glasses here
    { type: 'leaf', x: 2450, y: 420, w: 150 },      // 4
  ],
  flowers: [
    { x: 420 }, { x: 760 }, { x: 1150 }, { x: 1560 }, { x: 2250 }, { x: 2800 },
    { p: 0 }, { p: 1, u: 0.3 }, { p: 1, u: 0.75 }, { p: 3, u: 0.2 }, { p: 4 },
  ],
  setup(w) {
    const hand = new Hand();
    const rock = w.platforms[3];
    w.entities.push(
      new OwlTree(3200, 300, hand),
      new FeatherTrail([{ x: 700 }, { x: 980, y: 446 }, { x: 1340, y: 346 }, { x: 1500 }, { x: 1700, y: w.ground(1710) - 92 }, { x: 1930, y: rock.y - 2 }]),
      new Pickup(2040, rock.y - 30, GLASSES, hand),
      hand,
    );
  },
};
