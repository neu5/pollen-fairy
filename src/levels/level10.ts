import { ColourStar, Lanterns, RainbowBridge, SkyCastle } from '../entities/festival';
import { Snail } from '../entities/snail';
import { MoleFamily } from '../entities/cave';
import type { LevelDef } from '../game/types';

// Level 10: Rainbow Festival — find six colour stars, build the rainbow, ride it to the sky castle.

const ground = (x: number) => 598 - 28 * Math.sin(x * 0.0022 + 0.2) - 14 * Math.sin(x * 0.0061 + 1.3) - 5 * Math.sin(x * 0.017);

export const level10: LevelDef = {
  id: '1-10',
  name: 'Rainbow Festival',
  icon: '🌈',
  theme: 'sunset',
  worldW: 4300,
  seed: 1010,
  startX: 220,
  winText: 'Welcome to the Sky Castle!',
  ground,
  platforms: [
    { type: 'rock', x: 1000, y: 300, w: 220 },     // 0
    { type: 'mushroom', x: 1450, w: 130, h: 100 }, // 1
    { type: 'rock', x: 1900, y: 220, w: 240 },     // 2
    { type: 'leaf', x: 2350, y: 430, w: 150 },     // 3
    { type: 'rock', x: 2650, y: 330, w: 200 },     // 4
  ],
  flowers: [
    { x: 420 }, { x: 860 }, { x: 1350 }, { x: 1750 }, { x: 2250 }, { x: 3000 },
    { p: 0, u: 0.2 }, { p: 2, u: 0.8 }, { p: 3 }, { p: 4, u: 0.8 },
  ],
  setup(w) {
    const bridge = new RainbowBridge(3250, ground(3250) - 6, 3880, 230);
    const stars = [
      new ColourStar(620, 440, 0, bridge),
      new ColourStar(1110, 240, 1, bridge),
      new ColourStar(1515, 300, 2, bridge),
      new ColourStar(2020, 150, 3, bridge),
      new ColourStar(2420, 360, 4, bridge),
      new ColourStar(2750, 260, 5, bridge),
    ];
    // friends from earlier levels came to the party
    const snail = new Snail(3020, 3020);
    const moles = new MoleFamily(3180, 3180);
    snail.badge = false; moles.badge = false;
    w.entities.push(
      new Lanterns(300, 1000, 230), new Lanterns(2900, 3200, 250),
      new SkyCastle(3980, 230), bridge, snail, moles, ...stars,
    );
  },
};
