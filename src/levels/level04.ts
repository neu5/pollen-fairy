import { Ladybug, RainStopper, Sprout } from '../entities/ladybug';
import type { LevelDef } from '../game/types';

// Level 4: Rainy Day — grow mushroom umbrellas for three wet ladybugs.

export const level04: LevelDef = {
  id: 4,
  name: 'Rainy Day',
  icon: '🌧️',
  theme: 'rain',
  worldW: 3500,
  seed: 404,
  startX: 220,
  winText: 'Everyone is dry. Look, a rainbow!',
  ground: x => 596 - 28 * Math.sin(x * 0.0026 + 0.2) - 14 * Math.sin(x * 0.0064 + 1.7) - 5 * Math.sin(x * 0.016),
  platforms: [
    { type: 'leaf', x: 520, y: 450, w: 150 },        // 0
    { type: 'rock', x: 1150, y: 360, w: 200 },       // 1
    { type: 'leaf', x: 1950, y: 430, w: 150 },       // 2
    { type: 'rock', x: 2250, y: 320, w: 220 },       // 3
    { type: 'leaf', x: 3000, y: 420, w: 150 },       // 4
    // umbrellas (grown by touching sprouts)
    { type: 'mushroom', x: 815, w: 170, h: 150 },    // 5
    { type: 'mushroom', x: 1615, w: 170, h: 150 },   // 6
    { type: 'mushroom', x: 2715, w: 170, h: 150 },   // 7
  ],
  flowers: [
    { x: 380 }, { x: 1050 }, { x: 1450 }, { x: 2050 }, { x: 2550 }, { x: 3250 },
    { p: 0 }, { p: 1, u: 0.3 }, { p: 1, u: 0.75 }, { p: 2 }, { p: 3 }, { p: 4 },
  ],
  setup(w) {
    const s1 = new Sprout(w.platforms[5]), s2 = new Sprout(w.platforms[6]), s3 = new Sprout(w.platforms[7]);
    const bugs = [new Ladybug(700, s1), new Ladybug(1820, s2, '#ff7a3d'), new Ladybug(2560, s3, '#ff5fa0')];
    w.entities.push(s1, s2, s3, ...bugs, new RainStopper(bugs));
  },
};
