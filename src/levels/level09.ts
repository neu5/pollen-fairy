import { CaveExit, Crystal, MoleFamily, moleWin } from '../entities/cave';
import type { LevelDef } from '../game/types';

// Level 9: Crystal Cave — light the crystals so the mole family can find the way out.

export const level09: LevelDef = {
  id: '1-9',
  name: 'Crystal Cave',
  icon: '💎',
  theme: 'cave',
  worldW: 3800,
  seed: 909,
  startX: 260,
  winText: 'The moles found the sunshine!',
  ground: x => 600 - 22 * Math.sin(x * 0.0025 + 0.8) - 14 * Math.sin(x * 0.0071 + 1.9) - 6 * Math.sin(x * 0.019),
  platforms: [
    { type: 'rock', x: 1150, y: 380, w: 200 },      // 0: crystal
    { type: 'mushroom', x: 1600, w: 120, h: 90 },   // 1
    { type: 'rock', x: 2200, y: 300, w: 200 },      // 2: crystal
    { type: 'leaf', x: 2650, y: 430, w: 150 },      // 3
    { type: 'mushroom', x: 3150, w: 130, h: 100 },  // 4
  ],
  flowers: [
    { x: 520 }, { x: 950 }, { x: 1450 }, { x: 1950 }, { x: 2500 }, { x: 3000 },
    { p: 0, u: 0.2 }, { p: 2, u: 0.8 }, { p: 3 },
  ],
  setup(w) {
    const crystals = [
      new Crystal(700, null, 560, 0),
      new Crystal(1250, w.platforms[0].y, 1080, 1),
      new Crystal(1850, null, 1700, 2),
      new Crystal(2300, w.platforms[2].y, 2160, 0),
      new Crystal(2900, null, 2760, 1),
    ];
    const moles = new MoleFamily(300, 3380);
    moles.blockers = crystals;
    moleWin(moles);
    w.entities.push(new CaveExit(3560), ...crystals, moles);
  },
};
