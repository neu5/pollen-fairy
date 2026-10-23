import { Mouse, glowWorms, orderBlocker } from '../../entities/night2';
import { MushroomHouse } from '../../entities/obstacles';
import { numberBadge } from '../../entities/order';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 2-5 Glow-worm Path — light the glow-worms from 1 to 10 so Mouse can find the way home.

const ground = (x: number) => 600 - 22 * Math.sin(x * 0.0024 + 1.6) - 12 * Math.sin(x * 0.0066 + 0.5);

export const l2_05: LevelDef = {
  id: '2-5', name: 'Glow-worm Path', icon: '🐛', theme: 'night',
  worldW: 3500, seed: 2505, startX: 220, ground,
  platforms: [
    { type: 'rock', x: 700, y: 380, w: 180 },
    { type: 'leaf', x: 1300, y: 420, w: 150 },
    { type: 'rock', x: 1900, y: 300, w: 200 },
    { type: 'mushroom', x: 2500, w: 120, h: 90 },
  ],
  flowers: [{ x: 500 }, { x: 1100 }, { x: 1700 }, { x: 2300 }, { x: 3000 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const at = (x: number, up = 0) => ({ x, y: ground(x) - 40 - up });
    const game = glowWorms([
      at(560), at(790, 230), at(1000), at(1380, 190), at(1200),
      at(1700), at(2000, 330), at(2260), at(2700), at(2560, 180),
    ]);
    const mouse = new Mouse(380, 3150);
    mouse.blockers = [orderBlocker(game, 420, () => numberBadge(1, false, 16))];
    mouse.onHome = ww => win(ww, { x: 3000, y: ww.ground(3000) - 170 });
    w.entities.push(new MushroomHouse(3240, { cap: '#b48cff', cap2: '#8762e0', spot: '#fff4c2' }), game, mouse);
  },
};
