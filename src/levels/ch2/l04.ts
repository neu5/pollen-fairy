import { AppleTree, makeHedgehog } from '../../entities/night2';
import type { LevelDef } from '../../game/types';

// 2-4 Hedgehog's Apples — shake the trees, find 5 apples for Hedgehog's supper.

export const l2_04: LevelDef = {
  id: '2-4', name: "Hedgehog's Apples", icon: '🦔', theme: 'dusk',
  worldW: 3600, seed: 2404, startX: 220,
  ground: x => 598 - 26 * Math.sin(x * 0.0023 + 0.4) - 12 * Math.sin(x * 0.0061 + 1.8),
  platforms: [
    { type: 'leaf', x: 820, y: 440, w: 150 },
    { type: 'rock', x: 1500, y: 330, w: 200 },
    { type: 'mushroom', x: 2150, w: 120, h: 90 },
    { type: 'rock', x: 2800, y: 320, w: 200 },
  ],
  flowers: [{ x: 420 }, { x: 1150 }, { x: 1850 }, { x: 2500 }, { x: 3300 }, { p: 0 }, { p: 1 }, { p: 3 }],
  setup(w) {
    const h = makeHedgehog(360);
    w.entities.push(
      new AppleTree(620, true, h), new AppleTree(1050, false, h), new AppleTree(1350, true, h),
      new AppleTree(1950, true, h), new AppleTree(2400, false, h), new AppleTree(2650, true, h), new AppleTree(3200, true, h),
      h,
    );
  },
};
