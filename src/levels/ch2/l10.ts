import { ClockTower } from '../../entities/clockTower';
import { MoonStage } from '../../entities/night2';
import { Lanterns } from '../../entities/festival';
import type { LevelDef } from '../../game/types';

// 2-10 Moon Festival — set the gate clock to quarter past 7, then everyone dances.

const TOWER_X = 1900, STAGE_X = 2900;

export const l2_10: LevelDef = {
  id: '2-10', name: 'Moon Festival', icon: '🌕', theme: 'night',
  worldW: 3500, seed: 3010, startX: 220,
  ground: x => 600 - 18 * Math.sin(x * 0.0025 + 0.9) - 10 * Math.sin(x * 0.0068),
  platforms: [
    { type: 'rock', x: 700, y: 360, w: 200 },
    { type: 'leaf', x: 1200, y: 420, w: 150 },
    { type: 'mushroom', x: 1500, w: 120, h: 90 },
    { type: 'rock', x: 2300, y: 300, w: 200 },
  ],
  flowers: [{ x: 450 }, { x: 1050 }, { x: 1700 }, { x: 2200 }, { p: 0 }, { p: 1 }, { p: 3 }],
  setup(w) {
    const stage = new MoonStage(STAGE_X);
    const lamps = [new Lanterns(2550, 3250, 230)];
    lamps[0].lit = false;
    w.entities.push(
      stage, ...lamps,
      new ClockTower(TOWER_X, { h: 7, m: 15 }, { h: 6, m: 30 }, () => { stage.open = true; lamps[0].lit = true; }, '#ffd166'),
    );
  },
};
