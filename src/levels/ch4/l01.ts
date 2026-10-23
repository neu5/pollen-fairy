import { ctx } from '../../engine/view';
import { Home, Wanderer } from '../../entities/flock';
import { River } from '../../entities/obstacles';
import { drawDuck } from '../../entities/sea';
import { clamp, lerp } from '../../util';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 4-1 Duckling Line — lead the 4 ducklings across the river to Mama Duck.

const RA = 1500, RB = 2200;
const sstep = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export const l4_01: LevelDef = {
  id: '4-1', name: 'Duckling Line', icon: '🦆', theme: 'pond',
  worldW: 3200, seed: 4101, startX: 220, noDecorIn: [[RA - 10, RB + 10]],
  ground(x) {
    const y = lerp(596 - 20 * Math.sin(x * 0.0026 + 0.4) - 8 * Math.sin(x * 0.007), 592, sstep(RA - 200, RA, x) * (1 - sstep(RB, RB + 200, x)));
    return y + sstep(RA, RA + 80, x) * (1 - sstep(RB - 80, RB, x)) * 50;
  },
  platforms: [
    { type: 'leaf', x: 700, y: 430, w: 150 },
    { type: 'rock', x: 1100, y: 330, w: 200 },
    { type: 'rock', x: 2450, y: 320, w: 200 },
  ],
  flowers: [{ x: 420 }, { x: 950 }, { x: 2400 }, { x: 2800 }, { p: 0 }, { p: 1 }, { p: 2 }],
  setup(w) {
    const mama = new Home(2900, w.ground(2900), () => { ctx.save(); ctx.translate(40, 0); drawDuck(1.8, false); ctx.restore(); }, () => drawDuck(1, false),
      ww => win(ww, { x: 2750, y: ww.ground(2750) - 190 }), 190);
    const spots = [500, 850, 1250, 1350];
    const ducks = spots.map((x, i) => new Wanderer(x, w.ground(x), 12 + i * 10, mama, m => drawDuck(1, m), false));
    w.entities.push(mama, new River(RA, RB, 620), ...ducks);
  },
};
