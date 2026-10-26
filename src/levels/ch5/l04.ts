import { ShapeQuiz } from '../../entities/mountain';
import { Later } from '../../entities/later';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 5-4 Cloud Shapes — Eagle shows a shape. Fly to the cloud with the same shape. Three times.

export const l5_04: LevelDef = {
  id: '5-4', name: 'Cloud Shapes', icon: '☁️', theme: 'sky',
  worldW: 2800, seed: 5404, startX: 220,
  ground: x => 600 - 14 * Math.sin(x * 0.003 + 0.5),
  platforms: [
    { type: 'mushroom', x: 700, w: 120, h: 90 },
    { type: 'rock', x: 1300, y: 320, w: 220 },
    { type: 'mushroom', x: 2000, w: 120, h: 100 },
  ],
  flowers: [{ x: 450 }, { x: 1100 }, { x: 1800 }, { x: 2500 }, { p: 1 }],
  setup(w) {
    const eagle = { x: 1410, y: 320 };
    w.entities.push(new ShapeQuiz(eagle, [
      { want: 'heart', clouds: [{ x: 700, y: 200, shape: 'circle' }, { x: 1050, y: 140, shape: 'heart' }, { x: 1800, y: 180, shape: 'star' }] },
      { want: 'star', clouds: [{ x: 900, y: 170, shape: 'star' }, { x: 1700, y: 130, shape: 'square' }, { x: 2200, y: 200, shape: 'heart' }] },
      { want: 'triangle', clouds: [{ x: 800, y: 210, shape: 'circle' }, { x: 2000, y: 150, shape: 'triangle' }, { x: 2400, y: 220, shape: 'square' }] },
    ], ww => ww.entities.push(new Later(1.5, w2 => win(w2, { x: eagle.x, y: eagle.y - 150 })))));
  },
};
