import { starPicture } from '../../entities/night2';
import { Later } from '../../entities/later';
import { win } from '../../game/world';
import type { LevelDef } from '../../game/types';

// 2-6 Star Picture — join the stars 1 → 8. They make an owl in the sky.

export const l2_06: LevelDef = {
  id: '2-6', name: 'Star Picture', icon: '⭐', theme: 'night',
  worldW: 2800, seed: 2606, startX: 220,
  ground: x => 600 - 18 * Math.sin(x * 0.003 + 0.2) - 8 * Math.sin(x * 0.008),
  platforms: [
    { type: 'mushroom', x: 600, w: 120, h: 90 },
    { type: 'rock', x: 900, y: 330, w: 200 },
    { type: 'rock', x: 1350, y: 200, w: 260 },
    { type: 'rock', x: 1850, y: 300, w: 200 },
    { type: 'mushroom', x: 2250, w: 130, h: 100 },
  ],
  flowers: [{ x: 420 }, { x: 1200 }, { x: 1700 }, { x: 2500 }, { p: 1 }, { p: 2, u: 0.3 }, { p: 2, u: 0.75 }, { p: 3 }],
  setup(w) {
    // an owl shape: ears, head, body
    const cx = 1480, cy = 10;
    const pts = [
      { x: cx - 150, y: cy - 60 }, { x: cx - 80, y: cy + 10 }, { x: cx, y: cy - 10 }, { x: cx + 80, y: cy + 10 },
      { x: cx + 150, y: cy - 60 }, { x: cx + 130, y: cy + 160 }, { x: cx, y: cy + 230 }, { x: cx - 130, y: cy + 160 },
    ];
    w.entities.push(starPicture(pts, ww => { ww.entities.push(new Later(2, w2 => win(w2, { x: cx, y: cy + 120 }))); }));
  },
};
