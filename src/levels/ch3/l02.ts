import { Home, Wanderer } from '../../entities/flock';
import { drawBee, drawHive } from '../../entities/garden';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 3-2 Busy Bees — 6 bees got lost. Lead them home to the hive.

const HIVE_X = 2900;

export const l3_02: LevelDef = {
  id: '3-2', name: 'Busy Bees', icon: '🐝', theme: 'summer',
  worldW: 3300, seed: 3202, startX: 220,
  ground: x => 598 - 24 * Math.sin(x * 0.0024 + 0.5) - 12 * Math.sin(x * 0.0062 + 1.7) - 5 * Math.sin(x * 0.016),
  platforms: [
    { type: 'leaf', x: 700, y: 430, w: 150 },
    { type: 'rock', x: 1100, y: 320, w: 200 },
    { type: 'mushroom', x: 1550, w: 120, h: 90 },
    { type: 'rock', x: 1900, y: 240, w: 220 },
    { type: 'leaf', x: 2400, y: 400, w: 150 },
  ],
  flowers: [{ x: 420 }, { x: 950 }, { x: 1400 }, { x: 1800 }, { x: 2250 }, { x: 2700 }, { p: 1 }, { p: 3 }],
  setup(w) {
    const P = w.platforms;
    const hive = new Home(HIVE_X, w.ground(HIVE_X) - 90, () => drawHive(), () => drawBee(false), ww => win(ww, { x: HIVE_X - 170, y: ww.ground(HIVE_X) - 190 }));
    const spots = [
      { x: 560, y: w.ground(560) - 80 }, { x: P[0].x + 75, y: P[0].y - 50 }, { x: P[1].x + 100, y: P[1].y - 60 },
      { x: 1700, y: 200 }, { x: P[3].x + 110, y: P[3].y - 60 }, { x: P[4].x + 75, y: P[4].y - 50 },
    ];
    const bees = spots.map((p, i) => new Wanderer(p.x, p.y, 10 + i * 9, hive, drawBee));
    w.entities.push(hive, ...bees);
  },
};
