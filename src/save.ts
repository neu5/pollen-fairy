import { DEBUG } from './debug';

// Kid profiles + level progress in localStorage. Works (in memory only) if storage is blocked.

export interface LevelResult { done: boolean; stars: number }
export interface Profile {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  levels: Record<number, LevelResult>;
}
interface SaveData { profiles: Profile[]; lastProfileId: string | null }

const KEY = 'pf-save-v1';
const COLORS = ['#ff8fc7', '#c3aaff', '#86dcff', '#ffd166', '#8fe388', '#ffa585'];

function load(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw) as SaveData;
      if (Array.isArray(d.profiles)) return d;
    }
  } catch { /* storage blocked or bad JSON: start fresh */ }
  return { profiles: [], lastProfileId: null };
}

const data = load();

function persist(): void {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage blocked */ }
}

export const Save = {
  profiles(): Profile[] { return data.profiles; },
  get(id: string | null): Profile | null { return data.profiles.find(p => p.id === id) ?? null; },
  last(): Profile | null { return this.get(data.lastProfileId); },

  add(name: string): Profile {
    const p: Profile = {
      id: Math.random().toString(36).slice(2, 10) + Date.now().toString(36),
      name: name.trim().slice(0, 12),
      color: COLORS[data.profiles.length % COLORS.length],
      createdAt: Date.now(),
      levels: {},
    };
    data.profiles.push(p);
    data.lastProfileId = p.id;
    persist();
    return p;
  },

  remove(id: string): void {
    data.profiles = data.profiles.filter(p => p.id !== id);
    if (data.lastProfileId === id) data.lastProfileId = null;
    persist();
  },

  select(id: string): void {
    data.lastProfileId = id;
    persist();
  },

  // Keeps the best stars when a level is replayed.
  finish(id: string, level: number, stars: number): void {
    const p = this.get(id);
    if (!p) return;
    const prev = p.levels[level];
    p.levels[level] = { done: true, stars: Math.max(stars, prev?.stars ?? 0) };
    persist();
  },

  // Level n is open when it is the first one or the one before is done.
  isOpen(p: Profile, level: number): boolean {
    return DEBUG || level === 1 || !!p.levels[level - 1]?.done;
  },
};
