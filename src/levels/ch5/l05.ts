import { Flakes } from '../../entities/mountain';
import { Countdown } from '../../entities/timer';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 5-5 Snowflake Race — catch 10 snowflakes before the time runs out (60 s).

export const l5_05: LevelDef = {
  id: '5-5', name: 'Snowflake Race', icon: '❄️', theme: 'peak',
  worldW: 3200, seed: 5505, startX: 220,
  ground: x => 600 - 40 * Math.sin(x * 0.0019 + 0.6) - 16 * Math.sin(x * 0.0055 + 1.4) - 6 * Math.sin(x * 0.015),
  platforms: [
    { type: 'rock', x: 900, y: 320, w: 200 },
    { type: 'mushroom', x: 1500, w: 120, h: 90 },
    { type: 'rock', x: 2100, y: 260, w: 200 },
  ],
  flowers: [{ x: 600 }, { x: 1300 }, { x: 1900 }, { x: 2800 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const pts = [[450, 420], [700, 300], [1000, 220], [1250, 400], [1550, 280], [1800, 180], [2200, 180], [2450, 380], [2700, 250], [2950, 420], [1650, 440], [2350, 300]].map(([x, y]) => ({ x, y }));
    const flakes = new Flakes(pts, 10, ww => win(ww, { x: ww.player.x, y: ww.player.y - 120 }));
    w.entities.push(flakes, new Countdown(60, true, () => flakes.got >= 10));
  },
};
