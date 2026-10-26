import { NumberAsk, starPatchLook } from '../../entities/mountain';
import { win } from '../../game/world';
import type { Entity, LevelDef } from '../../game/types';

// 5-9 Star Count — count the stars in each picture and touch the right number.

export const l5_09: LevelDef = {
  id: '5-9', name: 'Star Count', icon: '✨', theme: 'night',
  worldW: 3000, seed: 5909, startX: 220,
  ground: x => 600 - 40 * Math.sin(x * 0.0019 + 0.6) - 16 * Math.sin(x * 0.0055 + 1.4) - 6 * Math.sin(x * 0.015),
  platforms: [
    { type: 'rock', x: 800, y: 330, w: 200 },
    { type: 'rock', x: 1500, y: 260, w: 220 },
    { type: 'rock', x: 2200, y: 320, w: 200 },
  ],
  flowers: [{ x: 500 }, { x: 1300 }, { x: 2000 }, { x: 2800 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const ns = [4, 7, 9];
    const asks = ns.map((n, i) => new NumberAsk(900 + i * 700, 160, ['?'], n, starPatchLook(n), () => {}, 80));
    const check: Entity = { z: 0, draw() {}, update(ww) { if (asks.every(a => a.solved) && ww.mode === 'play') win(ww, { x: 1600, y: 300 }); } };
    w.entities.push(...asks, check);
  },
};
