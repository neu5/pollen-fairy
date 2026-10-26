import { Clod, ThirstyFlower, Worm } from '../../entities/garden';
import { Later } from '../../entities/later';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 3-5 Worm Tunnels — break the hard dry soil so Worm can dig to the thirsty flower's roots.

export const l3_05: LevelDef = {
  id: '3-5', name: 'Worm Tunnels', icon: '🪱', theme: 'spring',
  worldW: 3200, seed: 3505, startX: 220,
  ground: x => 598 - 24 * Math.sin(x * 0.0024 + 0.5) - 12 * Math.sin(x * 0.0062 + 1.7) - 5 * Math.sin(x * 0.016),
  platforms: [
    { type: 'leaf', x: 800, y: 430, w: 150 },
    { type: 'rock', x: 1500, y: 320, w: 200 },
    { type: 'mushroom', x: 2300, w: 120, h: 90 },
  ],
  flowers: [{ x: 600 }, { x: 1300 }, { x: 2000 }, { x: 2600 }, { p: 0 }, { p: 1 }],
  setup(w) {
    const clods = [new Clod(900), new Clod(1700), new Clod(2450)];
    const flower = new ThirstyFlower(2950);
    const worm = new Worm(380, 2900);
    worm.blockers = clods;
    worm.onHome = ww => { flower.happy = true; ww.entities.push(new Later(1.2, w2 => win(w2, { x: 2800, y: w2.ground(2800) - 190 }))); };
    w.entities.push(flower, ...clods, worm);
  },
};
