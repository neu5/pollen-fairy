import { BeachJunk, Turtles } from '../../entities/sea';
import { Countdown } from '../../entities/timer';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 4-9 Baby Turtles — clear the beach so the baby turtles reach the sea (90 s).

export const l4_09: LevelDef = {
  id: '4-9', name: 'Baby Turtles', icon: '🐢', theme: 'beach',
  worldW: 3200, seed: 4909, startX: 420,
  ground: x => 598 - 22 * Math.sin(x * 0.0025 + 0.6) - 10 * Math.sin(x * 0.0064 + 1.5) - 4 * Math.sin(x * 0.017),
  platforms: [
    { type: 'rock', x: 1000, y: 340, w: 200 },
    { type: 'leaf', x: 1800, y: 420, w: 150 },
    { type: 'rock', x: 2400, y: 300, w: 200 },
  ],
  flowers: [{ x: 700 }, { x: 1500 }, { x: 2200 }, { x: 2900 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const junk = [new BeachJunk(900, 'bucket'), new BeachJunk(1600, 'castle'), new BeachJunk(2300, 'net')];
    const t = new Turtles(320, 2950);
    t.blockers = junk;
    let home = false;
    t.onHome = ww => { home = true; win(ww, { x: 2850, y: ww.ground(2850) - 180 }); };
    w.entities.push(...junk, t, new Countdown(90, true, () => home));
  },
};
