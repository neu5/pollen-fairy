import { Hand, Pickup } from '../../entities/carry';
import { SEED, SeedPatch, SkyHelper } from '../../entities/garden';
import type { LevelDef } from '../../game/types';

// 3-1 Little Seed — plant a seed, bring rain, bring sun: it grows into a flower.

export const l3_01: LevelDef = {
  id: '3-1', name: 'Little Seed', icon: '🌱', theme: 'spring',
  worldW: 3000, seed: 3101, startX: 220,
  ground: x => 598 - 24 * Math.sin(x * 0.0024 + 0.5) - 12 * Math.sin(x * 0.0062 + 1.7) - 5 * Math.sin(x * 0.016),
  platforms: [
    { type: 'leaf', x: 600, y: 430, w: 150 },
    { type: 'rock', x: 1000, y: 320, w: 200 },
    { type: 'rock', x: 2050, y: 250, w: 200 },
    { type: 'mushroom', x: 2500, w: 120, h: 90 },
  ],
  flowers: [{ x: 420 }, { x: 900 }, { x: 1300 }, { x: 2300 }, { x: 2800 }, { p: 0 }, { p: 1 }, { p: 2 }],
  setup(w) {
    const hand = new Hand();
    const patch = new SeedPatch(1600, hand);
    w.entities.push(
      patch,
      new Pickup(1100, w.platforms[1].y - 30, SEED, hand),
      new SkyHelper(1250, 140, 'rain', patch),
      new SkyHelper(2150, 120, 'sun', patch),
      hand,
    );
  },
};
