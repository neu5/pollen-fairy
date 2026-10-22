import type { Theme } from '../themes';

export type PlatformType = 'leaf' | 'rock' | 'mushroom' | 'branch';

export interface PlatformDef {
  type: PlatformType;
  x: number;
  y?: number;   // top surface (not for mushrooms)
  w: number;
  h?: number;   // mushrooms: height above ground
}

export interface MushroomCol { cap: string; cap2: string; spot: string }

export interface Platform {
  type: PlatformType;
  x: number; y: number; w: number; h: number;
  sag: number; sagV: number; pad: number;
  stem?: boolean;            // leaf platforms: draw the stalk from the ground (default yes)
  hidden: boolean;           // not solid / not drawn (e.g. a bridge that is not built yet)
  col?: MushroomCol;
  spots?: { u: number; v: number; r: number }[];
  vines?: { u: number; len: number; ph: number }[];
  tufts?: { u: number; s: number; col: string; wild: boolean }[];
  side?: 'left' | 'right';
  leaves?: { dx: number; dy: number; r: number; c: string }[];
}

export interface FlowerDef { x?: number; p?: number; u?: number }

export interface Flower {
  x: number; on: Platform | null; by: number; h: number;
  type: 'daisy' | 'cosmos' | 'tulip' | 'puff';
  col: { p: string; d: string };
  size: number; phase: number; dside: number;
  visited: boolean; open: number; openV: number; wiggle: number;
}

export interface Decor { x: number; type: 'tuft' | 'wild' | 'stone' | 'clover' | 'shroom'; s: number; col: string; ph: number; dark: boolean }

export interface Player {
  x: number; y: number; vx: number; vy: number; face: number;
  grounded: boolean; on: Platform | null; energy: number;
  flying: boolean; flyHeld: boolean; wingT: number; walkT: number; sq: number; sqV: number;
  frozen: boolean;           // controlled by a cut-scene (finale)
}

// Anything that lives in a level: friends, glowing triggers, goals.
export interface Entity {
  z: number;                 // <0 behind flowers, 0 before player, >0 in front of player
  update(w: World, dt: number): void;
  draw(w: World): void;
  drawLight?(w: World): void; // drawn after the night tint, additive
  drawOver?(w: World): void;  // bubbles and arrows, drawn on top of everything in the world
}

export interface LevelDef {
  id: number;
  name: string;
  icon: string;
  theme: string;
  worldW: number;
  seed: number;
  startX: number;
  ground(x: number): number;
  platforms: PlatformDef[];
  flowers: FlowerDef[];
  tree?: number;             // x of the big fairy-house tree
  noDecorIn?: [number, number][]; // x ranges kept clear (rivers…)
  setup?(w: World): void;    // spawn entities
  hints?: boolean;           // show walk / fly hints
  winText?: string;
}

export interface HudBit { sx: number; sy: number; cx: number; cy: number; t: number; dur: number; done?: boolean }

export interface World {
  def: LevelDef;
  theme: Theme;
  nextTheme: Theme | null;   // crossfade target (night → day)
  themeMix: number;          // 0..1 towards nextTheme
  tintA: number;             // strength of theme tint (multiply)
  worldW: number;
  ground(x: number): number;
  platforms: Platform[];
  flowers: Flower[];
  decor: Decor[];
  pebbles: { x: number; d: number; rx: number; ry: number }[];
  playBushes: { x: number; i: number; fern: boolean; k: number }[];
  tree: { x: number; canopy: { x: number; y: number; r: number }[]; bark: { dx: number }[] } | null;
  entities: Entity[];
  player: Player;
  mode: 'idle' | 'play' | 'finale';
  collected: number; total: number; arrived: number; jarFill: number; jarPulse: number;
  hudBits: HudBit[];
  finaleT: number;
  finaleSpot: { x: number; y: number };
  rainbowA: number;
  hints: { walked: boolean; flew: boolean; walkA: number; flyA: number };
  time: number;              // seconds since level start
}
