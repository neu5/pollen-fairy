import { ctx } from '../../engine/view';
import { DropSpot, Hand, Pickup, type Thing } from '../../entities/carry';
import { NumberAsk, campfireLook } from '../../entities/mountain';
import { drawFox } from '../../entities/night2';
import { rr } from '../../util';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 5-2 Cold Fox — bring logs for Fox's fire: 3 from the left and 2 from the right.
// Then count them all: 3 + 2 = ?

const FIRE_X = 1700;
const LOG: Thing = { kind: 'log', draw() { ctx.fillStyle = '#9a6a42'; rr(ctx, -22, -7, 44, 14, 7); ctx.fill(); ctx.fillStyle = '#d8a870'; ctx.beginPath(); ctx.ellipse(20, 0, 5, 7, 0, 0, Math.PI * 2); ctx.fill(); } };

export const l5_02: LevelDef = {
  id: '5-2', name: 'Cold Fox', icon: '🔥', theme: 'peak',
  worldW: 3400, seed: 5202, startX: 220,
  ground: x => 600 - 40 * Math.sin(x * 0.0019 + 0.6) - 16 * Math.sin(x * 0.0055 + 1.4) - 6 * Math.sin(x * 0.015),
  platforms: [
    { type: 'rock', x: 600, y: 360, w: 200 },
    { type: 'rock', x: 2300, y: 330, w: 200 },
    { type: 'leaf', x: 2800, y: 420, w: 150 },
  ],
  flowers: [{ x: 450 }, { x: 1100 }, { x: 2100 }, { x: 3200 }, { p: 0 }, { p: 1 }],
  setup(w) {
    const hand = new Hand(), P = w.platforms, g = (x: number) => w.ground(x) - 20;
    let lit = false;
    const fire = new DropSpot(FIRE_X, w.ground(FIRE_X), ['log'], hand, c => {
      campfireLook(c, lit);
      ctx.save(); ctx.translate(110, 0); ctx.scale(-1.2, 1.2); drawFox(1.1, lit); ctx.restore();
    }, () => LOG.draw(), c => { if (c >= 5) { fire.accepts = []; ask.locked = false; } });
    const ask = new NumberAsk(FIRE_X, w.ground(FIRE_X) - 60, [{ icon: '🪵', n: 3 }, '+', { icon: '🪵', n: 2 }, '= ?'], 5, () => {}, ww => {
      lit = true; win(ww, { x: FIRE_X - 200, y: ww.ground(FIRE_X) - 200 });
    }, 80);
    ask.locked = true;
    w.entities.push(
      fire, ask,
      new Pickup(450, g(450), LOG, hand), new Pickup(P[0].x + 100, P[0].y - 20, LOG, hand), new Pickup(1150, g(1150), LOG, hand),
      new Pickup(P[1].x + 100, P[1].y - 20, LOG, hand), new Pickup(P[2].x + 75, P[2].y - 20, LOG, hand),
      hand,
    );
  },
};
