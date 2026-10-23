import { DropSpot, Hand, Pickup } from '../../entities/carry';
import { SHELLS, crabLook } from '../../entities/sea';
import { win } from '../../game/world';
import type { Entity, LevelDef } from '../../game/types';

// 4-8 Hermit Crabs — give each crab a shell that fits: small, middle, big.

export const l4_08: LevelDef = {
  id: '4-8', name: 'Hermit Crabs', icon: '🦀', theme: 'beach',
  worldW: 3000, seed: 4808, startX: 220,
  ground: x => 598 - 22 * Math.sin(x * 0.0025 + 0.6) - 10 * Math.sin(x * 0.0064 + 1.5) - 4 * Math.sin(x * 0.017),
  platforms: [
    { type: 'rock', x: 900, y: 340, w: 200 },
    { type: 'leaf', x: 1500, y: 420, w: 150 },
    { type: 'rock', x: 2050, y: 300, w: 200 },
  ],
  flowers: [{ x: 420 }, { x: 1300 }, { x: 1900 }, { x: 2800 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const hand = new Hand(), P = w.platforms;
    const crabs = [1, 2, 3].map(k => new DropSpot(2350 + k * 140, w.ground(2350 + k * 140), [`shell${k}`], hand, c => crabLook(k)(c), () => SHELLS[k - 1].draw(), d => { if (d) crabs[k - 1].accepts = []; }));
    const g = (x: number) => w.ground(x) - 22;
    const check: Entity = { z: 0, draw() {}, update(ww) { if (crabs.every(c => c.count > 0) && ww.mode === 'play') win(ww, { x: 2630, y: ww.ground(2630) - 200 }); } };
    w.entities.push(
      ...crabs,
      new Pickup(P[0].x + 100, P[0].y - 22, SHELLS[2], hand), new Pickup(1250, g(1250), SHELLS[0], hand), new Pickup(P[2].x + 100, P[2].y - 22, SHELLS[1], hand),
      hand, check,
    );
  },
};
