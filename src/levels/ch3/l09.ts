import { DropSpot, Hand, Pickup } from '../../entities/carry';
import { BIRD_SEED, SNOWBALLS, feederLook, snowmanLook } from '../../entities/garden';
import { win } from '../../game/world';
import type { Entity, LevelDef } from '../../game/types';

// 3-9 Snowy Feeders — fill 3 bird feeders, then build a snowman: big, middle, small.

export const l3_09: LevelDef = {
  id: '3-9', name: 'Snowy Feeders', icon: '⛄', theme: 'winter',
  worldW: 3400, seed: 3909, startX: 220,
  ground: x => 598 - 24 * Math.sin(x * 0.0024 + 0.5) - 12 * Math.sin(x * 0.0062 + 1.7) - 5 * Math.sin(x * 0.016),
  platforms: [
    { type: 'rock', x: 700, y: 360, w: 200 },
    { type: 'leaf', x: 1250, y: 420, w: 150 },
    { type: 'rock', x: 2200, y: 300, w: 200 },
    { type: 'mushroom', x: 2700, w: 120, h: 90 },
  ],
  flowers: [{ x: 420 }, { x: 1100 }, { x: 1900 }, { x: 3200 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const hand = new Hand(), P = w.platforms;
    const g = (x: number) => w.ground(x);
    // each feeder takes one bag of seeds
    const feeders = [900, 1550, 2000].map(x => new DropSpot(x, g(x) - 120, ['seeds'], hand, feederLook));
    feeders.forEach(f => { f.onDrop = () => { f.accepts = []; }; });
    const snowman = new DropSpot(3000, g(3000) + 4, ['snow3'], hand, snowmanLook, null, c => { snowman.accepts = c < 3 ? [`snow${3 - c}`] : []; });
    const ups = [
      new Pickup(520, g(520) - 24, BIRD_SEED, hand), new Pickup(P[0].x + 100, P[0].y - 24, BIRD_SEED, hand), new Pickup(P[1].x + 75, P[1].y - 24, BIRD_SEED, hand),
      // snowballs lie in a mixed order
      new Pickup(2550, g(2550) - 20, SNOWBALLS[2], hand), new Pickup(P[2].x + 100, P[2].y - 30, SNOWBALLS[0], hand), new Pickup(3250, g(3250) - 26, SNOWBALLS[1], hand),
    ];
    const check: Entity = { z: 0, draw() {}, update(ww) { if (feeders.every(f => f.count > 0) && snowman.count >= 3 && ww.mode === 'play') win(ww, { x: 2850, y: ww.ground(2850) - 200 }); } };
    w.entities.push(...feeders, snowman, ...ups, hand, check);
  },
};
