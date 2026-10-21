import { TAU, mulberry32, pick } from './util';

// Scene 1: "Sleepy Meadow". All gameplay geometry lives here.

export const WORLD_W = 6400;
export const TREE_X = 3480;   // the big fairy-house tree
export const GREAT_X = 6120;  // the Great Flower at the end

export function groundY(x) {
  return 598 - 34 * Math.sin(x * 0.0021 + 0.6) - 20 * Math.sin(x * 0.0053 + 2.1) - 8 * Math.sin(x * 0.0131 + 0.4);
}

// y = top surface. Mushrooms are given a height above ground instead.
export const PLATFORM_DEFS = [
  { type: 'leaf', x: 760, y: 470, w: 150 },          // 0
  { type: 'leaf', x: 1010, y: 395, w: 150 },         // 1
  { type: 'rock', x: 1250, y: 320, w: 200 },         // 2
  { type: 'mushroom', x: 1640, w: 130, h: 95 },      // 3
  { type: 'rock', x: 1820, y: 215, w: 240 },         // 4
  { type: 'rock', x: 2240, y: 430, w: 180 },         // 5
  { type: 'rock', x: 2500, y: 330, w: 180 },         // 6
  { type: 'rock', x: 2770, y: 235, w: 200 },         // 7
  { type: 'leaf', x: 3020, y: 370, w: 160 },         // 8
  { type: 'branch', x: 3250, y: 450, w: 230 },       // 9
  { type: 'branch', x: 3480, y: 330, w: 230 },       // 10
  { type: 'branch', x: 3270, y: 205, w: 210 },       // 11
  { type: 'mushroom', x: 3880, w: 120, h: 80 },      // 12
  { type: 'mushroom', x: 4150, w: 140, h: 110 },     // 13
  { type: 'rock', x: 4360, y: 150, w: 320 },         // 14
  { type: 'leaf', x: 4820, y: 420, w: 150 },         // 15
  { type: 'rock', x: 5100, y: 320, w: 200 },         // 16
  { type: 'mushroom', x: 5480, w: 130, h: 90 },      // 17
];

export const FLOWER_DEFS = [
  { x: 330 }, { x: 560 }, { x: 1180 }, { x: 1480 }, { x: 2080 }, { x: 2640 }, { x: 3120 },
  { x: 3760 }, { x: 4060 }, { x: 4620 }, { x: 5000 }, { x: 5380 }, { x: 5800 },
  { p: 0, u: 0.5 }, { p: 1, u: 0.5 }, { p: 2, u: 0.5 }, { p: 4, u: 0.3 }, { p: 4, u: 0.72 },
  { p: 5, u: 0.5 }, { p: 6, u: 0.5 }, { p: 7, u: 0.5 }, { p: 8, u: 0.5 },
  { p: 9, u: 0.35 }, { p: 10, u: 0.65 }, { p: 11, u: 0.4 },
  { p: 14, u: 0.2 }, { p: 14, u: 0.5 }, { p: 14, u: 0.8 }, { p: 15, u: 0.5 }, { p: 16, u: 0.5 },
];

export const FLOWER_COLORS = [
  { p: '#ff8fc7', d: '#e8609f' },
  { p: '#ffd166', d: '#f0a838' },
  { p: '#c3aaff', d: '#9776f0' },
  { p: '#86dcff', d: '#4aaee8' },
  { p: '#ffa585', d: '#f2735a' },
  { p: '#ffffff', d: '#e6dcf5' },
];
export const FLOWER_TYPES = ['daisy', 'cosmos', 'tulip', 'puff'];
export const MUSHROOM_COLORS = [
  { cap: '#ff6b7f', cap2: '#d9456f', spot: '#ffffff' },
  { cap: '#b48cff', cap2: '#8762e0', spot: '#fff4c2' },
  { cap: '#ff9f5a', cap2: '#e2703c', spot: '#ffffff' },
  { cap: '#5ec8ff', cap2: '#3592dc', spot: '#ffffff' },
];
export const WILD_COLORS = ['#ff9fd0', '#ffffff', '#ffe27a', '#c9b3ff', '#9fe0ff'];

export function buildLevel() {
  const r = mulberry32(777);

  const platforms: any[] = PLATFORM_DEFS.map((d, i) => {
    const pl: any = Object.assign({ sag: 0, sagV: 0, pad: 4 }, d);
    if (pl.type === 'mushroom') {
      pl.y = groundY(pl.x + pl.w / 2) - pl.h;
      pl.col = MUSHROOM_COLORS[i % MUSHROOM_COLORS.length];
      pl.pad = pl.w * 0.12;
      pl.spots = [];
      for (let k = 0; k < 6; k++) pl.spots.push({ u: (k / 5 - 0.5) * 1.4 + (r() - 0.5) * 0.15, v: 0.3 + r() * 0.55, r: 5 + r() * 4 });
    }
    if (pl.type === 'rock') {
      pl.vines = [];
      const n = 2 + Math.floor(r() * 3);
      for (let k = 0; k < n; k++) pl.vines.push({ u: 0.15 + r() * 0.7, len: 40 + r() * 70, ph: r() * TAU });
      pl.tufts = [];
      for (let k = 0; k < Math.floor(pl.w / 45); k++) pl.tufts.push({ u: r(), s: 0.6 + r() * 0.5, col: pick(r, WILD_COLORS), wild: r() < 0.4 });
    }
    if (pl.type === 'branch') {
      pl.side = pl.x + pl.w / 2 < TREE_X ? 'left' : 'right';
      pl.leaves = [];
      for (let k = 0; k < 8; k++) pl.leaves.push({ dx: -14 + r() * 34, dy: 4 + r() * 22, r: 8 + r() * 8, c: pick(r, ['#3f9a52', '#52b35c', '#6cc562']) });
    }
    return pl;
  });

  const flowers: any[] = FLOWER_DEFS.map(d => {
    const on = d.p != null ? platforms[d.p] : null;
    const x = on ? on.x + on.w * d.u : d.x;
    return {
      x, on,
      by: on ? 0 : groundY(x) + 2,
      h: on ? 32 + r() * 12 : 46 + r() * 24,
      type: pick(r, FLOWER_TYPES),
      col: pick(r, FLOWER_COLORS),
      size: on ? 1 + r() * 0.15 : 1.1 + r() * 0.25,
      phase: r() * TAU,
      dside: r() < 0.5 ? -1 : 1,
      visited: false, open: 0.45, openV: 0, wiggle: 0,
    };
  });

  const decor = [];
  for (let x = 20; x < WORLD_W; x += 14 + r() * 34) {
    const t = r();
    const type = t < 0.55 ? 'tuft' : t < 0.78 ? 'wild' : t < 0.86 ? 'stone' : t < 0.94 ? 'clover' : 'shroom';
    decor.push({ x, type, s: 0.7 + r() * 0.6, col: pick(r, WILD_COLORS), ph: r() * TAU, dark: r() < 0.5 });
  }

  const pebbles = [];
  for (let x = 0; x < WORLD_W; x += 40 + r() * 90) pebbles.push({ x, d: 30 + r() * 120, rx: 4 + r() * 9, ry: 3 + r() * 5 });

  const playBushes: any[] = [];
  for (let x = 60; x < WORLD_W; x += 160 + r() * 260) playBushes.push({ x, i: Math.floor(r() * 8), fern: r() < 0.4, k: 0.7 + r() * 0.5 });

  const canopy = [];
  for (let i = 0; i < 44; i++) canopy.push({ x: TREE_X + (r() - 0.5) * 760, y: -170 + (r() - 0.5) * 240, r: 60 + r() * 55 });
  canopy.sort((a, b) => a.y - b.y);
  const bark = [];
  for (let i = 0; i < 6; i++) bark.push({ dx: -50 + (i / 5) * 100 + (r() - 0.5) * 10 });

  return { platforms, flowers, decor, pebbles, playBushes, canopy, bark };
}
