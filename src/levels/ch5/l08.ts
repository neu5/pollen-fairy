import { ClockTower } from '../../entities/clockTower';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 5-8 Mountain Clock — set three clocks: 3 o'clock, half past 6, quarter to 10.

export const l5_08: LevelDef = {
  id: '5-8', name: 'Mountain Clock', icon: '🕰️', theme: 'mountain',
  worldW: 3400, seed: 5808, startX: 220,
  ground: x => 600 - 40 * Math.sin(x * 0.0019 + 0.6) - 16 * Math.sin(x * 0.0055 + 1.4) - 6 * Math.sin(x * 0.015),
  platforms: [
    { type: 'rock', x: 600, y: 340, w: 200 },
    { type: 'leaf', x: 1500, y: 420, w: 150 },
    { type: 'rock', x: 2400, y: 300, w: 200 },
  ],
  flowers: [{ x: 450 }, { x: 1300 }, { x: 2200 }, { x: 3200 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const towers = [
      new ClockTower(1050, { h: 3, m: 0 }, { h: 12, m: 0 }, () => { towers[1].locked = false; }, '#9b8cff'),
      new ClockTower(1950, { h: 6, m: 30 }, { h: 5, m: 0 }, () => { towers[2].locked = false; }, '#6cc4ff'),
      new ClockTower(2850, { h: 9, m: 45 }, { h: 9, m: 0 }, ww => win(ww, { x: 2650, y: ww.ground(2650) - 220 }), '#ffd166'),
    ];
    towers[1].locked = towers[2].locked = true;
    w.entities.push(...towers);
  },
};
