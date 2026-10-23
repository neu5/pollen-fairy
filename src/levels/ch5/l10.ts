import { ctx } from '../../engine/view';
import { RainbowBridge, SkyCastle, Lanterns } from '../../entities/festival';
import { FriendsParade, drawEagle } from '../../entities/mountain';
import { drawOwl, drawBadger } from '../../entities/nightFriends';
import { drawHedgehog, drawFox } from '../../entities/night2';
import { drawRabbit, drawBee } from '../../entities/garden';
import { drawDuck, drawOtter, drawBeaver } from '../../entities/sea';
import type { LevelDef } from '../../game/types';

// 5-10 Festival of Friends — everyone you helped is waiting. Ride the rainbow to the Sky Castle.

const s = (k: number, f: () => void) => () => { ctx.scale(k, k); f(); };

export const l5_10: LevelDef = {
  id: '5-10', name: 'Festival of Friends', icon: '🏰', theme: 'sky',
  worldW: 4200, seed: 6010, startX: 220,
  ground: x => 600 - 12 * Math.sin(x * 0.003 + 0.2),
  platforms: [{ type: 'mushroom', x: 900, w: 120, h: 90 }, { type: 'rock', x: 1700, y: 330, w: 200 }],
  flowers: [{ x: 500 }, { x: 1300 }, { x: 2100 }, { x: 2900 }, { p: 1 }],
  setup(w) {
    const bridge = new RainbowBridge(3150, w.ground(3150) - 6, 3780, 230);
    bridge.stripes = 6;   // already built: today it is a party
    const parade = new FriendsParade([
      { x: 600, draw: s(1.3, () => drawOwl(1, { glasses: true })) },
      { x: 850, draw: s(1.1, () => drawBadger(1, false)) },
      { x: 1100, draw: s(1.3, () => drawHedgehog(0)) },
      { x: 1350, draw: s(1.2, () => drawFox(1, true)) },
      { x: 1600, draw: s(1.4, () => drawRabbit(true)) },
      { x: 1900, draw: () => { ctx.translate(0, -60); drawBee(true); } },
      { x: 2150, draw: s(1.5, () => drawDuck(1, false)) },
      { x: 2400, draw: s(1.3, () => drawOtter(true)) },
      { x: 2650, draw: s(1.2, () => drawBeaver(true)) },
      { x: 2900, draw: s(1.2, () => drawEagle(1, 0)) },
    ]);
    w.entities.push(new Lanterns(400, 3000, 230), new SkyCastle(3900, 230), parade, bridge);
  },
};
