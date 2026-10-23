import { GreatFlower } from '../entities/greatFlower';
import type { LevelDef } from '../game/types';

// Level 1: Sleepy Meadow — learn to walk and fly, wake the flowers.

const TREE_X = 3480;

export const level01: LevelDef = {
  id: '1-1',
  name: 'Sleepy Meadow',
  icon: '🌼',
  theme: 'meadow',
  worldW: 6400,
  seed: 777,
  startX: 200,
  hints: true,
  tree: TREE_X,
  winText: 'The Great Flower is blooming!',
  ground: x => 598 - 34 * Math.sin(x * 0.0021 + 0.6) - 20 * Math.sin(x * 0.0053 + 2.1) - 8 * Math.sin(x * 0.0131 + 0.4),
  platforms: [
    { type: 'leaf', x: 760, y: 470, w: 150 },          // 0
    { type: 'leaf', x: 1010, y: 395, w: 150 },         // 1
    { type: 'rock', x: 1250, y: 320, w: 200 },         // 2
    { type: 'mushroom', x: 1640, w: 130, h: 95 },      // 3
    { type: 'rock', x: 1820, y: 215, w: 240 },         // 4
    { type: 'rock', x: 2240, y: 430, w: 180 },         // 5
    { type: 'rock', x: 2500, y: 330, w: 180 },         // 6
    { type: 'rock', x: 2770, y: 235, w: 200 },         // 7
    { type: 'leaf', x: 3020, y: 370, w: 160 },         // 8
    { type: 'branch', x: 3250, y: 450, w: 230 },       // 9
    { type: 'branch', x: 3480, y: 330, w: 230 },       // 10
    { type: 'branch', x: 3270, y: 205, w: 210 },       // 11
    { type: 'mushroom', x: 3880, w: 120, h: 80 },      // 12
    { type: 'mushroom', x: 4150, w: 140, h: 110 },     // 13
    { type: 'rock', x: 4360, y: 150, w: 320 },         // 14
    { type: 'leaf', x: 4820, y: 420, w: 150 },         // 15
    { type: 'rock', x: 5100, y: 320, w: 200 },         // 16
    { type: 'mushroom', x: 5480, w: 130, h: 90 },      // 17
  ],
  flowers: [
    { x: 330 }, { x: 560 }, { x: 1180 }, { x: 1480 }, { x: 2080 }, { x: 2640 }, { x: 3120 },
    { x: 3760 }, { x: 4060 }, { x: 4620 }, { x: 5000 }, { x: 5380 }, { x: 5800 },
    { p: 0 }, { p: 1 }, { p: 2 }, { p: 4, u: 0.3 }, { p: 4, u: 0.72 },
    { p: 5 }, { p: 6 }, { p: 7 }, { p: 8 },
    { p: 9, u: 0.35 }, { p: 10, u: 0.65 }, { p: 11, u: 0.4 },
    { p: 14, u: 0.2 }, { p: 14, u: 0.5 }, { p: 14, u: 0.8 }, { p: 15 }, { p: 16 },
  ],
  setup(w) {
    w.entities.push(new GreatFlower(6120));
  },
};
