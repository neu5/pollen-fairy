import { level01 } from './level01';
import { level02 } from './level02';
import { level03 } from './level03';
import { level04 } from './level04';
import { level05 } from './level05';
import { level06 } from './level06';
import { level07 } from './level07';
import { level08 } from './level08';
import { level09 } from './level09';
import { level10 } from './level10';
import { l2_01 } from './ch2/l01';
import { l2_02 } from './ch2/l02';
import { l2_03 } from './ch2/l03';
import { l2_04 } from './ch2/l04';
import { l2_05 } from './ch2/l05';
import { l2_06 } from './ch2/l06';
import { l2_07 } from './ch2/l07';
import { l2_08 } from './ch2/l08';
import { l2_09 } from './ch2/l09';
import { l2_10 } from './ch2/l10';
import { l3_01 } from './ch3/l01';
import { l3_02 } from './ch3/l02';
import { l3_03 } from './ch3/l03';
import { l3_04 } from './ch3/l04';
import { l3_05 } from './ch3/l05';
import { l3_06 } from './ch3/l06';
import { l3_07 } from './ch3/l07';
import { l3_08 } from './ch3/l08';
import { l3_09 } from './ch3/l09';
import { l3_10 } from './ch3/l10';
import { l4_01 } from './ch4/l01';
import { l4_02 } from './ch4/l02';
import { l4_03 } from './ch4/l03';
import { l4_04 } from './ch4/l04';
import { l4_05 } from './ch4/l05';
import { l4_06 } from './ch4/l06';
import { l4_07 } from './ch4/l07';
import { l4_08 } from './ch4/l08';
import { l4_09 } from './ch4/l09';
import { l4_10 } from './ch4/l10';
import type { LevelDef } from '../game/types';

// 5 chapters × 10 levels. Level keys are 'chapter-level', e.g. '2-3'.
// Levels not built yet have def: null (shown locked on the map).

export const PER_CHAPTER = 10;

export interface LevelSlot { key: string; chapter: number; n: number; icon: string; def: LevelDef | null }
export interface Chapter { id: number; icon: string; color: string; levels: LevelSlot[] }

const built: LevelDef[] = [level01, level02, level03, level04, level05, level06, level07, level08, level09, level10,
  l2_01, l2_02, l2_03, l2_04, l2_05, l2_06, l2_07, l2_08, l2_09, l2_10,
  l3_01, l3_02, l3_03, l3_04, l3_05, l3_06, l3_07, l3_08, l3_09, l3_10,
  l4_01, l4_02, l4_03, l4_04, l4_05, l4_06, l4_07, l4_08, l4_09, l4_10,
];

const ICONS: string[][] = [
  ['🌼', '🐌', '🌙', '🌧️', '🐦', '🐸', '🎨', '🍂', '💎', '🌈'],
  ['👓', '🦡', '🕗', '🦔', '🐛', '⭐', '🦉', '🦊', '🦋', '🌕'],
  ['🌱', '🐝', '🎨', '🥕', '🪱', '🌳', '☁️', '🍎', '⛄', '🌸'],
  ['🦆', '♻️', '🦫', '🛶', '💧', '🐟', '🗼', '🦀', '🐢', '🐠'],
  ['🐐', '🔥', '⚖️', '☁️', '❄️', '🌙', '🎈', '🕰️', '✨', '🏰'],
];
const COLORS = ['#ffd166', '#a99cff', '#8fe388', '#6cc4ff', '#ffb3c6'];
const CH_ICONS = ['🌼', '🦉', '🌱', '🌊', '⛰️'];

export const CHAPTERS: Chapter[] = ICONS.map((icons, ci) => ({
  id: ci + 1,
  icon: CH_ICONS[ci],
  color: COLORS[ci],
  levels: icons.map((icon, li) => {
    const key = `${ci + 1}-${li + 1}`;
    const def = built.find(d => d.id === key) ?? null;
    return { key, chapter: ci + 1, n: li + 1, icon: def?.icon ?? icon, def };
  }),
}));

export const getSlot = (key: string): LevelSlot | null => {
  const [c, n] = key.split('-').map(Number);
  return CHAPTERS[c - 1]?.levels[n - 1] ?? null;
};
export const getLevel = (key: string): LevelDef | null => getSlot(key)?.def ?? null;

// The next level in the same chapter, if it is built.
export function nextKey(key: string): string | null {
  const s = getSlot(key);
  if (!s) return null;
  const n = CHAPTERS[s.chapter - 1].levels[s.n];
  return n?.def ? n.key : null;
}
