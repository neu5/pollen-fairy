import { DropSpot, Hand, Pickup } from '../../entities/carry';
import { BOTTLE, JAR, PAPER, binLook } from '../../entities/sea';
import { win } from '../../game/world';
import type { Entity, LevelDef } from '../../game/types';

// 4-2 River Clean-up — pick up the rubbish and put it in the right bin.
// Paper → blue, plastic → yellow, glass → green.

export const l4_02: LevelDef = {
  id: '4-2', name: 'River Clean-up', icon: '♻️', theme: 'pond',
  worldW: 3200, seed: 4202, startX: 220,
  ground: x => 598 - 22 * Math.sin(x * 0.0025 + 0.6) - 10 * Math.sin(x * 0.0064 + 1.5) - 4 * Math.sin(x * 0.017),
  platforms: [
    { type: 'rock', x: 900, y: 340, w: 200 },
    { type: 'leaf', x: 1500, y: 420, w: 150 },
    { type: 'rock', x: 2200, y: 300, w: 200 },
  ],
  flowers: [{ x: 420 }, { x: 1300 }, { x: 2000 }, { x: 2800 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const hand = new Hand(), P = w.platforms;
    const g = (x: number) => w.ground(x) - 22;
    const bins = [
      new DropSpot(2750, w.ground(2750), ['paper'], hand, binLook('paper', PAPER), () => PAPER.draw()),
      new DropSpot(2880, w.ground(2880), ['plastic'], hand, binLook('plastic', BOTTLE), () => BOTTLE.draw()),
      new DropSpot(3010, w.ground(3010), ['glass'], hand, binLook('glass', JAR), () => JAR.draw()),
    ];
    const ups = [
      new Pickup(600, g(600), BOTTLE, hand), new Pickup(P[0].x + 100, P[0].y - 22, PAPER, hand),
      new Pickup(1300, g(1300), JAR, hand), new Pickup(P[1].x + 75, P[1].y - 22, BOTTLE, hand),
      new Pickup(1900, g(1900), PAPER, hand), new Pickup(P[2].x + 100, P[2].y - 22, JAR, hand),
    ];
    const check: Entity = { z: 0, draw() {}, update(ww) { if (bins.reduce((s, b) => s + b.count, 0) >= ups.length && ww.mode === 'play') win(ww, { x: 2880, y: ww.ground(2880) - 220 }); } };
    w.entities.push(...bins, ...ups, hand, check);
  },
};
