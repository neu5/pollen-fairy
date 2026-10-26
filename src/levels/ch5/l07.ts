import { NumberAsk, balloonLook } from '../../entities/mountain';
import { Later } from '../../entities/later';
import { win } from '../../game/world';
import type { Entity, LevelDef } from '../../game/types';

// 5-7 Balloon Ride — count the sand bags (4 + 3) to make the balloon float, then ride up high.

const BALLOON_X = 2300;

export const l5_07: LevelDef = {
  id: '5-7', name: 'Balloon Ride', icon: '🎈', theme: 'mountain',
  worldW: 2900, seed: 5707, startX: 220,
  ground: x => 600 - 40 * Math.sin(x * 0.0019 + 0.6) - 16 * Math.sin(x * 0.0055 + 1.4) - 6 * Math.sin(x * 0.015),
  platforms: [
    { type: 'rock', x: 800, y: 330, w: 200 },
    { type: 'leaf', x: 1400, y: 420, w: 150 },
  ],
  flowers: [{ x: 500 }, { x: 1200 }, { x: 1900 }, { x: 2700 }, { p: 0 }, { p: 1 }],
  setup(w) {
    let lift = 0, flying = false;
    const ask = new NumberAsk(BALLOON_X, w.ground(BALLOON_X) - 20, [{ icon: '💰', n: 4 }, '+', { icon: '💰', n: 3 }, '= ?'], 7,
      solved => balloonLook(lift)(solved),
      ww => { flying = true; ww.entities.push(new Later(2.2, w2 => win(w2, { x: BALLOON_X, y: w2.ground(BALLOON_X) - 560 }))); }, 90);
    const rise: Entity = { z: 0, draw() {}, update(_ww, dt) { if (flying) lift = Math.min(1, lift + dt * 0.4); } };
    w.entities.push(ask, rise);
  },
};
