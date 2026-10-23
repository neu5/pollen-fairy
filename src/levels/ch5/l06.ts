import { ctx } from '../../engine/view';
import { OrderGame } from '../../entities/order';
import { moonItems } from '../../entities/mountain';
import { drawOwl } from '../../entities/nightFriends';
import { Later } from '../../entities/later';
import { win } from '../../game/world';
import type { Entity, LevelDef } from '../../game/types';

// 5-6 Moon Phases — help Owl: touch the moons from the thin new moon to the full moon.

const OWL_X = 2550;

export const l5_06: LevelDef = {
  id: '5-6', name: 'Moon Phases', icon: '🌙', theme: 'night',
  worldW: 3000, seed: 5606, startX: 220,
  ground: x => 600 - 40 * Math.sin(x * 0.0019 + 0.6) - 16 * Math.sin(x * 0.0055 + 1.4) - 6 * Math.sin(x * 0.015),
  platforms: [
    { type: 'rock', x: 700, y: 320, w: 200 },
    { type: 'rock', x: 1400, y: 240, w: 220 },
    { type: 'leaf', x: 2000, y: 420, w: 150 },
  ],
  flowers: [{ x: 500 }, { x: 1200 }, { x: 1800 }, { x: 2800 }, { p: 0 }, { p: 1 }],
  setup(w) {
    // mixed places, so the kid looks at the shapes, not just left to right
    const spots = [{ x: 1500, y: 150 }, { x: 600, y: 220 }, { x: 2100, y: 330 }, { x: 1000, y: 170 }, { x: 1900, y: 120 }];
    const game = new OrderGame(moonItems(spots), ww => ww.entities.push(new Later(1.5, w2 => win(w2, { x: OWL_X - 160, y: w2.ground(OWL_X) - 200 }))), 60);
    game.onTop = true;
    const owl: Entity = { z: -1, update() {}, draw(ww) { ctx.save(); ctx.translate(OWL_X, ww.ground(OWL_X)); drawOwl(1.5, { glasses: true, flap: game.complete ? 0.6 : 0 }); ctx.restore(); } };
    w.entities.push(owl, game);
  },
};
