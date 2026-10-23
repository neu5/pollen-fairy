import { ctx } from '../../engine/view';
import { DropSpot, Hand, Pickup } from '../../entities/carry';
import { CARROT, PEAS, PUMPKIN, bedLook, drawRabbit } from '../../entities/garden';
import { win } from '../../game/world';
import type { Entity, LevelDef, World } from '../../game/types';

// 3-4 Rabbit's Garden — put each vegetable in the bed that shows its shape.

// Rabbit waits by the beds and cheers when every bed is full.
class Rabbit implements Entity {
  z = -1;
  constructor(public x: number, public beds: DropSpot[]) {}
  get done() { return this.beds.every(b => b.count >= 2); }
  update(w: World): void { if (this.done && w.mode === 'play') win(w, { x: 1550, y: w.ground(1550) - 200 }); }
  draw(w: World): void { ctx.save(); ctx.translate(this.x, w.ground(this.x)); ctx.scale(1.4, 1.4); drawRabbit(this.done); ctx.restore(); }
}

export const l3_04: LevelDef = {
  id: '3-4', name: "Rabbit's Garden", icon: '🥕', theme: 'summer',
  worldW: 3200, seed: 3404, startX: 220,
  ground: x => 598 - 24 * Math.sin(x * 0.0024 + 0.5) - 12 * Math.sin(x * 0.0062 + 1.7) - 5 * Math.sin(x * 0.016),
  platforms: [
    { type: 'rock', x: 600, y: 360, w: 200 },
    { type: 'leaf', x: 2300, y: 420, w: 150 },
    { type: 'rock', x: 2650, y: 300, w: 200 },
  ],
  flowers: [{ x: 420 }, { x: 1000 }, { x: 2100 }, { x: 3000 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const hand = new Hand(), P = w.platforms;
    const g = (x: number) => w.ground(x) - 26;
    const beds = [
      new DropSpot(1250, g(1250), ['carrot'], hand, bedLook(CARROT, 2), () => CARROT.draw()),
      new DropSpot(1550, g(1550), ['pumpkin'], hand, bedLook(PUMPKIN, 2), () => PUMPKIN.draw()),
      new DropSpot(1850, g(1850), ['peas'], hand, bedLook(PEAS, 2), () => PEAS.draw()),
    ];
    const ups = [
      new Pickup(520, g(520), CARROT, hand), new Pickup(P[0].x + 100, P[0].y - 26, PUMPKIN, hand),
      new Pickup(900, g(900), PEAS, hand), new Pickup(2150, g(2150), CARROT, hand),
      new Pickup(P[1].x + 75, P[1].y - 26, PEAS, hand), new Pickup(P[2].x + 100, P[2].y - 26, PUMPKIN, hand),
    ];
    w.entities.push(new Rabbit(1050, beds), ...beds, ...ups, hand);
  },
};
