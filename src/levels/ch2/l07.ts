import { ClockTower } from '../../entities/clockTower';
import { Owlet, OwlSchool } from '../../entities/night2';
import { Later } from '../../entities/later';
import { win } from '../../game/world';
import type { Entity, LevelDef } from '../../game/types';

// 2-7 Owl School — bring the 3 owlets to school, then set the clock to half past 7.

const SCHOOL_X = 2300, TOWER_X = 2850;

export const l2_07: LevelDef = {
  id: '2-7', name: 'Owl School', icon: '🦉', theme: 'dusk',
  worldW: 3300, seed: 2707, startX: 220,
  ground: x => 598 - 22 * Math.sin(x * 0.0026 + 0.7) - 12 * Math.sin(x * 0.0064 + 2),
  platforms: [
    { type: 'rock', x: 650, y: 360, w: 180 },
    { type: 'leaf', x: 1150, y: 420, w: 150 },
    { type: 'rock', x: 1550, y: 280, w: 200 },
    { type: 'branch', x: SCHOOL_X - 110, y: 380, w: 214 },
  ],
  flowers: [{ x: 450 }, { x: 1000 }, { x: 1400 }, { x: 2000 }, { x: 3100 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const P = w.platforms;
    P[3].invisible = true;
    const school = new OwlSchool(SCHOOL_X, P[3].y);
    const owlets = [
      new Owlet(P[0].x + 90, P[0].y, 18, school),
      new Owlet(P[1].x + 75, P[1].y, 30, school),
      new Owlet(P[2].x + 100, P[2].y, 42, school),
    ];
    const tower = new ClockTower(TOWER_X, { h: 7, m: 30 }, { h: 6, m: 0 }, ww => {
      ww.entities.push(new Later(1.4, w2 => win(w2, { x: SCHOOL_X, y: P[3].y - 150 })));
    }, '#9b8cff');
    tower.locked = true;
    const unlock: Entity = { z: 0, draw() {}, update() { if (school.full) tower.locked = false; } };
    w.entities.push(school, tower, unlock, ...owlets);
  },
};
