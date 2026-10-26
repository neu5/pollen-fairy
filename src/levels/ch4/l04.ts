import { ctx } from '../../engine/view';
import { DropSpot, Hand, Pickup } from '../../entities/carry';
import { FLOATERS, SINKERS, drawOtter, raftLook } from '../../entities/sea';
import { drawDropIcon } from '../../entities/garden';
import { spawn } from '../../engine/fx';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 4-4 Sink or Float — put only the things that float on Otter's raft.
// Things that sink can go in the pond (they plop to the bottom).

const RAFT_X = 2350;

export const l4_04: LevelDef = {
  id: '4-4', name: 'Sink or Float', icon: '🛶', theme: 'pond',
  worldW: 3000, seed: 4404, startX: 220,
  ground: x => 598 - 22 * Math.sin(x * 0.0025 + 0.6) - 10 * Math.sin(x * 0.0064 + 1.5) - 4 * Math.sin(x * 0.017),
  platforms: [
    { type: 'rock', x: 700, y: 360, w: 200 },
    { type: 'leaf', x: 1200, y: 420, w: 150 },
    { type: 'rock', x: 1600, y: 300, w: 200 },
  ],
  flowers: [{ x: 420 }, { x: 1000 }, { x: 1450 }, { x: 2800 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const hand = new Hand(), P = w.platforms;
    const raft = new DropSpot(RAFT_X, w.ground(RAFT_X) - 10, ['float'], hand, c => {
      raftLook(4)(c);
      ctx.save(); ctx.translate(120, 10); ctx.scale(1.4, 1.4); drawOtter(c >= 4); ctx.restore();
    }, () => FLOATERS[0].draw(), c => { if (c >= 4) win(w, { x: RAFT_X - 180, y: w.ground(RAFT_X) - 200 }); });
    const pond = new DropSpot(1950, w.ground(1950) - 10, ['sink'], hand, () => {
      ctx.fillStyle = 'rgba(110,190,240,0.85)'; ctx.beginPath(); ctx.ellipse(0, 6, 70, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(0, -40); ctx.globalAlpha = 0.8; drawDropIcon(1.2); ctx.restore();
    }, null, () => { for (let i = 0; i < 10; i++) spawn({ kind: 'drop', x: 1950 + (Math.random() - 0.5) * 40, y: w.ground(1950) - 10, vx: (Math.random() - 0.5) * 140, vy: -160 - Math.random() * 120, g: 600, life: 0.8, max: 0.8, color: '#e0f6ff', drag: 0.5 }); });
    const g = (x: number) => w.ground(x) - 22;
    w.entities.push(
      raft, pond,
      new Pickup(500, g(500), FLOATERS[0], hand), new Pickup(600, g(600), SINKERS[0], hand),
      new Pickup(P[0].x + 100, P[0].y - 22, FLOATERS[1], hand), new Pickup(1050, g(1050), SINKERS[1], hand),
      new Pickup(P[1].x + 75, P[1].y - 22, FLOATERS[2], hand), new Pickup(P[2].x + 60, P[2].y - 22, SINKERS[2], hand),
      new Pickup(P[2].x + 150, P[2].y - 22, FLOATERS[3], hand),
      hand,
    );
  },
};
