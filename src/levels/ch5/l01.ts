import { Goat, SignPost } from '../../entities/mountain';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 5-1 Goat Path — turn each sign so its arrow points the way Goat wants to go.

export const l5_01: LevelDef = {
  id: '5-1', name: 'Goat Path', icon: '🐐', theme: 'mountain',
  worldW: 3400, seed: 5101, startX: 220,
  ground: x => 600 - 40 * Math.sin(x * 0.0019 + 0.6) - 16 * Math.sin(x * 0.0055 + 1.4) - 6 * Math.sin(x * 0.015),
  platforms: [
    { type: 'rock', x: 800, y: 340, w: 200 },
    { type: 'rock', x: 1600, y: 280, w: 200 },
    { type: 'leaf', x: 2300, y: 420, w: 150 },
  ],
  flowers: [{ x: 500 }, { x: 1300 }, { x: 2000 }, { x: 2800 }, { p: 0 }, { p: 1 }],
  setup(w) {
    const signs = [new SignPost(900, 'right', 'left'), new SignPost(1700, 'up', 'right'), new SignPost(2500, 'right', 'up'), new SignPost(2900, 'left', 'up')];
    const goat = new Goat(380, 3100);
    goat.blockers = signs;
    goat.onHome = ww => win(ww, { x: 2950, y: ww.ground(2950) - 200 });
    w.entities.push(...signs, goat);
  },
};
