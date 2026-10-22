import { Brush, ColourReturn, GreyFlower, PaintPot } from '../entities/paint';
import type { LevelDef } from '../game/types';

// Level 7: Grey Garden — carry the right paint to each grey flower to bring the colours back.

export const level07: LevelDef = {
  id: 7,
  name: 'Grey Garden',
  icon: '🎨',
  theme: 'grey',
  worldW: 3200,
  seed: 707,
  startX: 220,
  winText: 'All the colours are back!',
  ground: x => 596 - 26 * Math.sin(x * 0.0023 + 0.5) - 12 * Math.sin(x * 0.0066 + 2.2) - 5 * Math.sin(x * 0.017),
  platforms: [
    { type: 'rock', x: 1220, y: 380, w: 200 },     // 0: yellow pot
    { type: 'leaf', x: 1750, y: 440, w: 150 },     // 1
    { type: 'leaf', x: 2050, y: 360, w: 170 },     // 2: blue pot
    { type: 'mushroom', x: 2620, w: 120, h: 90 },  // 3
  ],
  flowers: [
    { x: 360 }, { x: 1050 }, { x: 1500 }, { x: 2350 }, { x: 3000 },
    { p: 0, u: 0.2 }, { p: 1 }, { p: 2, u: 0.2 },
  ],
  setup(w) {
    const brush = new Brush();
    const plY = (i: number) => w.platforms[i].y;
    const pots = [
      new PaintPot(560, 'red', brush),
      new PaintPot(1360, 'yellow', brush, plY(0)),
      new PaintPot(2150, 'blue', brush, plY(2)),
    ];
    const flowers = [
      new GreyFlower(820, 'red', brush),
      new GreyFlower(1620, 'yellow', brush, 140),
      new GreyFlower(1940, 'red', brush, 110),
      new GreyFlower(2480, 'blue', brush, 130),
      new GreyFlower(2860, 'yellow', brush, 120),
    ];
    w.entities.push(...pots, ...flowers, brush, new ColourReturn(flowers));
  },
};
