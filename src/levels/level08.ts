import { LeafPile, Squirrel } from '../entities/squirrel';
import type { LevelDef } from '../game/types';

// Level 8: Autumn Woods — find the squirrel's 5 acorns hidden in leaf piles.

export const level08: LevelDef = {
  id: 8,
  name: 'Autumn Woods',
  icon: '🍂',
  theme: 'autumn',
  worldW: 3600,
  seed: 808,
  startX: 220,
  winText: 'Squirrel has all the acorns!',
  ground: x => 598 - 30 * Math.sin(x * 0.0021 + 1.4) - 16 * Math.sin(x * 0.0058 + 0.3) - 6 * Math.sin(x * 0.016),
  platforms: [
    { type: 'rock', x: 800, y: 400, w: 200 },      // 0
    { type: 'leaf', x: 1300, y: 430, w: 150 },     // 1
    { type: 'rock', x: 1650, y: 300, w: 220 },     // 2
    { type: 'mushroom', x: 2150, w: 130, h: 100 }, // 3
    { type: 'rock', x: 2400, y: 230, w: 220 },     // 4
    { type: 'leaf', x: 3000, y: 420, w: 160 },     // 5
  ],
  flowers: [
    { x: 420 }, { x: 1150 }, { x: 1980 }, { x: 2800 }, { x: 3350 },
    { p: 0, u: 0.25 }, { p: 1 }, { p: 2, u: 0.8 }, { p: 4, u: 0.2 }, { p: 5 },
  ],
  setup(w) {
    const sq = new Squirrel(380);
    const plY = (i: number) => w.platforms[i].y;
    w.entities.push(
      new LeafPile(650, true, sq),
      new LeafPile(900, false, sq, plY(0)),
      new LeafPile(1500, true, sq),
      new LeafPile(1760, true, sq, plY(2)),
      new LeafPile(2650, false, sq),
      new LeafPile(2510, true, sq, plY(4)),
      new LeafPile(3250, true, sq),
      sq,
    );
  },
};
