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
import type { LevelDef } from '../game/types';

// All 10 stops on the map. Levels not built yet have def: null (shown as "soon").
export interface LevelSlot { id: number; name: string; icon: string; def: LevelDef | null }

const built: LevelDef[] = [level01, level02, level03, level04, level05, level06, level07, level08, level09, level10];

const PLANNED: [string, string][] = [
  ['Sleepy Meadow', '🌼'], ["Snail's Slow Trip", '🐌'], ['Night Garden', '🌙'], ['Rainy Day', '🌧️'],
  ['Windy Hill', '🐦'], ['Frog Pond', '🐸'], ['Grey Garden', '🎨'], ['Autumn Woods', '🍂'],
  ['Crystal Cave', '💎'], ['Rainbow Festival', '🌈'],
];

export const LEVELS: LevelSlot[] = PLANNED.map(([name, icon], i) => {
  const def = built.find(d => d.id === i + 1) ?? null;
  return { id: i + 1, name: def?.name ?? name, icon: def?.icon ?? icon, def };
});

export const getLevel = (id: number): LevelDef | null => LEVELS[id - 1]?.def ?? null;
