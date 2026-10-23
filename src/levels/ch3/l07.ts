import { DropSpot, Hand, Pickup } from '../../entities/carry';
import { RAIN_CLOUD, dryPatchLook } from '../../entities/garden';
import { Countdown } from '../../entities/timer';
import { win } from '../../game/world';
import type { Entity, LevelDef } from '../../game/types';

// 3-7 Thirsty Field — carry rain clouds over the 3 dry patches before time runs out (60 s).

export const l3_07: LevelDef = {
  id: '3-7', name: 'Thirsty Field', icon: '☁️', theme: 'summer',
  worldW: 3000, seed: 3707, startX: 220,
  ground: x => 598 - 24 * Math.sin(x * 0.0024 + 0.5) - 12 * Math.sin(x * 0.0062 + 1.7) - 5 * Math.sin(x * 0.016),
  platforms: [
    { type: 'mushroom', x: 700, w: 120, h: 90 },
    { type: 'rock', x: 1300, y: 300, w: 200 },
    { type: 'rock', x: 2200, y: 260, w: 200 },
  ],
  flowers: [{ x: 420 }, { x: 1150 }, { x: 1950 }, { x: 2800 }, { p: 1 }, { p: 2 }],
  setup(w) {
    const hand = new Hand();
    const patches = [1000, 1750, 2500].map(x => new DropSpot(x, w.ground(x) - 250, ['cloud'], hand, dryPatchLook));
    const clouds = [new Pickup(560, 160, RAIN_CLOUD, hand), new Pickup(1400, 120, RAIN_CLOUD, hand), new Pickup(2300, 110, RAIN_CLOUD, hand)];
    const done = () => patches.every(p => p.count > 0);
    const check: Entity = { z: 0, draw() {}, update(ww) { if (done() && ww.mode === 'play') win(ww, { x: ww.player.x, y: ww.ground(ww.player.x) - 200 }); } };
    w.entities.push(...patches, ...clouds, hand, check, new Countdown(60, true, done));
  },
};
