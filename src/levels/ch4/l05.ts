import { OrderGame } from '../../entities/order';
import { Stream, waterCycleItems } from '../../entities/sea';
import { Later } from '../../entities/later';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 4-5 Water Circle — the sun warms the sea, water rises, a cloud forms, rain falls on the hill.
// Touch them in that order; then a stream runs back down to the sea.

const ground = (x: number) => x > 1900 ? 600 - (x - 1900) * 0.18 - 20 * Math.sin(x * 0.004) : 598 - 10 * Math.sin(x * 0.006);

export const l4_05: LevelDef = {
  id: '4-5', name: 'Water Circle', icon: '💧', theme: 'beach',
  worldW: 3200, seed: 4505, startX: 220, ground,
  platforms: [
    { type: 'rock', x: 900, y: 320, w: 200 },
    { type: 'rock', x: 1500, y: 220, w: 220 },
    { type: 'rock', x: 2300, y: 200, w: 200 },
  ],
  flowers: [{ x: 500 }, { x: 1300 }, { x: 2200 }, { x: 2900 }, { p: 0 }, { p: 1 }],
  setup(w) {
    const stream = new Stream(2900, 700);
    const game = new OrderGame(waterCycleItems([{ x: 1000, y: 160 }, { x: 650, y: 430 }, { x: 1600, y: 130 }, { x: 2650, y: 260 }]), ww => {
      stream.on = true;
      ww.entities.push(new Later(2.5, w2 => win(w2, { x: 1700, y: w2.ground(1700) - 200 })));
    }, 64);
    game.lines = true; game.lineColor = 'rgba(255,255,255,0.7)';
    w.entities.push(stream, game);
  },
};
