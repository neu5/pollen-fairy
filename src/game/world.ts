import { TAU, mulberry32, pick } from '../util';
import { THEMES } from '../themes';
import type { Flower, LevelDef, Platform, World, Decor } from './types';

const FLOWER_COLORS = [
  { p: '#ff8fc7', d: '#e8609f' },
  { p: '#ffd166', d: '#f0a838' },
  { p: '#c3aaff', d: '#9776f0' },
  { p: '#86dcff', d: '#4aaee8' },
  { p: '#ffa585', d: '#f2735a' },
  { p: '#ffffff', d: '#e6dcf5' },
];
const FLOWER_TYPES: Flower['type'][] = ['daisy', 'cosmos', 'tulip', 'puff'];
const MUSHROOM_COLORS = [
  { cap: '#ff6b7f', cap2: '#d9456f', spot: '#ffffff' },
  { cap: '#b48cff', cap2: '#8762e0', spot: '#fff4c2' },
  { cap: '#ff9f5a', cap2: '#e2703c', spot: '#ffffff' },
  { cap: '#5ec8ff', cap2: '#3592dc', spot: '#ffffff' },
];
export const WILD_COLORS = ['#ff9fd0', '#ffffff', '#ffe27a', '#c9b3ff', '#9fe0ff'];

export function makePlatform(d: LevelDef['platforms'][number], i: number, ground: (x: number) => number, r: () => number): Platform {
  const pl: Platform = { type: d.type, x: d.x, y: d.y ?? 0, w: d.w, h: d.h ?? 0, sag: 0, sagV: 0, pad: 4, hidden: false };
  if (pl.type === 'mushroom') {
    pl.y = ground(pl.x + pl.w / 2) - pl.h;
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
    pl.leaves = [];
    for (let k = 0; k < 8; k++) pl.leaves.push({ dx: -14 + r() * 34, dy: 4 + r() * 22, r: 8 + r() * 8, c: pick(r, ['#3f9a52', '#52b35c', '#6cc562']) });
  }
  return pl;
}

export function createWorld(def: LevelDef): World {
  const r = mulberry32(def.seed);
  const ground = def.ground;

  const platforms = def.platforms.map((d, i) => makePlatform(d, i, ground, r));
  if (def.tree != null) for (const pl of platforms) if (pl.type === 'branch') pl.side = pl.x + pl.w / 2 < def.tree ? 'left' : 'right';

  const flowers: Flower[] = def.flowers.map(d => {
    const on = d.p != null ? platforms[d.p] : null;
    const x = on ? on.x + on.w * (d.u ?? 0.5) : (d.x ?? 0);
    return {
      x, on,
      by: on ? 0 : ground(x) + 2,
      h: on ? 32 + r() * 12 : 46 + r() * 24,
      type: pick(r, FLOWER_TYPES),
      col: pick(r, FLOWER_COLORS),
      size: on ? 1 + r() * 0.15 : 1.1 + r() * 0.25,
      phase: r() * TAU,
      dside: r() < 0.5 ? -1 : 1,
      visited: false, open: 0.45, openV: 0, wiggle: 0,
    };
  });

  const clear = (x: number) => !(def.noDecorIn ?? []).some(([a, b]) => x > a && x < b);
  const decor: Decor[] = [];
  for (let x = 20; x < def.worldW; x += 14 + r() * 34) {
    const t = r();
    const type: Decor['type'] = t < 0.55 ? 'tuft' : t < 0.78 ? 'wild' : t < 0.86 ? 'stone' : t < 0.94 ? 'clover' : 'shroom';
    const d = { x, type, s: 0.7 + r() * 0.6, col: pick(r, WILD_COLORS), ph: r() * TAU, dark: r() < 0.5 };
    if (clear(x)) decor.push(d);
  }
  const pebbles = [];
  for (let x = 0; x < def.worldW; x += 40 + r() * 90) pebbles.push({ x, d: 30 + r() * 120, rx: 4 + r() * 9, ry: 3 + r() * 5 });
  const playBushes = [];
  for (let x = 60; x < def.worldW; x += 160 + r() * 260) {
    const b = { x, i: Math.floor(r() * 8), fern: r() < 0.4, k: 0.7 + r() * 0.5 };
    if (clear(x)) playBushes.push(b);
  }

  let tree: World['tree'] = null;
  if (def.tree != null) {
    const canopy = [];
    for (let i = 0; i < 44; i++) canopy.push({ x: def.tree + (r() - 0.5) * 760, y: -170 + (r() - 0.5) * 240, r: 60 + r() * 55 });
    canopy.sort((a, b) => a.y - b.y);
    const bark = [];
    for (let i = 0; i < 6; i++) bark.push({ dx: -50 + (i / 5) * 100 + (r() - 0.5) * 10 });
    tree = { x: def.tree, canopy, bark };
  }

  const w: World = {
    def, theme: THEMES[def.theme], nextTheme: null, themeMix: 0, tintA: 1,
    worldW: def.worldW, ground, platforms, flowers, decor, pebbles, playBushes, tree,
    entities: [],
    player: {
      x: def.startX, y: ground(def.startX), vx: 0, vy: 0, face: 1, grounded: true, on: null, energy: 1,
      flying: false, flyHeld: false, wingT: 0, walkT: 0, sq: 0, sqV: 0, frozen: false,
    },
    mode: 'idle',
    collected: 0, total: flowers.length, arrived: 0, jarFill: 0, jarPulse: 0, hudBits: [],
    finaleT: 0, finaleSpot: { x: 0, y: 0 }, rainbowA: 0,
    hints: { walked: !def.hints, flew: !def.hints, walkA: 0, flyA: 0 },
    time: 0,
    failed: false,
  };
  def.setup?.(w);
  spaceFlowers(w);
  return w;
}

export function flowerHead(f: Flower, time: number) {
  const by = f.on ? f.on.y + f.on.sag : f.by;
  const sway = Math.sin(time * 1.2 + f.phase) * 0.06 + Math.sin(time * 9) * 0.2 * f.wiggle * f.wiggle;
  return { x: f.x + Math.sin(sway) * f.h, y: by - Math.cos(sway) * f.h, by, sway };
}

// Level goal reached: the fairy floats to `spot` and the celebration starts.
export function win(w: World, spot: { x: number; y: number }): void {
  if (w.mode !== 'play') return;
  w.mode = 'finale';
  w.finaleT = 0;
  w.finaleSpot = spot;
  w.player.frozen = true;
}

// How dark it is right now (0 = day, 1 = full night tint).
export function nightAmount(w: World): number {
  const a = w.theme.tint ? 1 : 0, b = w.nextTheme ? (w.nextTheme.tint ? 1 : 0) : a;
  return (a + (b - a) * w.themeMix) * w.tintA;
}

// Slowly change the look of the level (night → day). Call every frame until it returns true.
export function fadeTheme(w: World, id: string, dt: number, dur: number): boolean {
  const next = THEMES[id];
  if (w.theme === next) return true;
  w.nextTheme = next;
  w.themeMix = Math.min(1, w.themeMix + dt / dur);
  if (w.themeMix >= 1) { w.theme = next; w.nextTheme = null; w.themeMix = 0; return true; }
  return false;
}

export function playerNear(w: World, x: number, y: number, r: number): boolean {
  const p = w.player, dx = p.x - x, dy = p.y - 45 - y;
  return dx * dx + dy * dy < r * r;
}

export function starsFor(w: World): number {
  const f = w.total ? w.collected / w.total : 1;
  return f >= 0.9 ? 3 : f >= 0.5 ? 2 : 1;
}

// ------------------------------------------------- keep flowers apart ----
// Sleepy flowers must not sit on top of the special things in a level (friends, clocks, pots…).
// After a level is set up, any flower too close to one slides sideways to a free place.

interface Spot { x: number; y: number | null; r: number }   // y null = blocks the whole column

// Some things are big and need more room around them.
const BIG: Record<string, number> = {
  Den: 270, MushroomHouse: 170, OwlTree: 230, SeasonTree: 230, Scale: 230, FoxDen: 170,
  MoonStage: 330, SkyCastle: 220, ClockTower: 120, Nest: 140, SeedPatch: 110, Home: 130,
};

function spotsOf(e: unknown, w: World): Spot[] {
  const o = e as Record<string, unknown>;
  const name = (e as object).constructor?.name ?? '';
  const out: Spot[] = [];
  const add = (x: unknown, y: unknown, r: number) => {
    if (typeof x === 'number' && isFinite(x)) out.push({ x, y: typeof y === 'number' && isFinite(y) ? y : null, r });
  };
  if (name === 'River') { const a = o.a as number, b = o.b as number; for (let x = a; x <= b; x += 60) add(x, null, 60); return out; }
  if (name === 'Updraft') { add(o.x, null, (o.width as number) / 2 + 40); return out; }
  if (name === 'BigStone') { add(o.x, null, 130); return out; }
  const r = BIG[name] ?? 95;
  if (name === 'OwlTree' || name === 'Den') add(o.x, null, r);
  else add(o.x, o.y, r);
  for (const list of [o.items, o.pts, o.stones]) if (Array.isArray(list)) for (const it of list) add(it?.x, it?.y ?? o.y, 90);
  if (Array.isArray(o.rounds)) for (const rd of o.rounds as { clouds?: { x: number; y: number }[] }[]) for (const c of rd.clouds ?? []) add(c.x, c.y, 100);
  if (o.pl && typeof o.pl === 'object') { const pl = o.pl as { x: number; w: number }; add(pl.x + pl.w / 2, null, pl.w / 2 + 50); }
  if (o.bridge && typeof o.bridge === 'object') { const b = o.bridge as { x: number; w: number; x0?: number }; if (typeof b.x0 !== 'number') add(b.x + b.w / 2, null, b.w / 2 + 40); }
  void w;
  return out;
}

function spaceFlowers(w: World): void {
  const spots = w.entities.flatMap(e => spotsOf(e, w));
  if (!spots.length) return;
  const headY = (f: Flower, x: number) => (f.on ? f.on.y : w.ground(x)) - f.h;
  const free = (f: Flower, x: number) => spots.every(s => Math.abs(s.x - x) > s.r || (s.y != null && Math.abs(s.y - headY(f, x)) > 150));
  const others = (f: Flower, x: number) => w.flowers.every(g => g === f || Math.abs(g.x - x) > 70 || (g.on !== f.on));
  for (const f of w.flowers) {
    if (free(f, f.x)) continue;
    let placed = false;
    for (let step = 40; step <= 900 && !placed; step += 40) {
      for (const dir of [1, -1]) {
        const x = f.x + dir * step;
        if (f.on ? (x < f.on.x + 20 || x > f.on.x + f.on.w - 20) : (x < 120 || x > w.worldW - 120)) continue;
        if (free(f, x) && others(f, x)) { f.x = x; if (!f.on) f.by = w.ground(x) + 2; placed = true; break; }
      }
    }
    // no room on its platform: put it on the ground nearby instead
    if (!placed && f.on) {
      const on = f.on, base = on.x + on.w / 2;
      f.on = null;
      for (let step = 0; step <= 1200; step += 40) {
        const x = base + (step / 40 % 2 ? -1 : 1) * step;
        if (x > 120 && x < w.worldW - 120 && free(f, x) && others(f, x)) { f.x = x; f.by = w.ground(x) + 2; placed = true; break; }
      }
      // nowhere free: better to stay on its platform than float in the air
      if (!placed) f.on = on;
    }
  }
}
