import { DEBUG } from './debug';
import { fixLook, randomLook, type Look } from './game/look';

// Kid profiles + level progress in localStorage. Works (in memory only) if storage is blocked.

export interface LevelResult { done: boolean; stars: number }
export interface Profile {
  id: string;
  name: string;
  color: string;
  createdAt: number;
  levels: Record<string, LevelResult>;   // key 'chapter-level', e.g. '2-3'
  look: Look;
}
interface SaveData { profiles: Profile[]; lastProfileId: string | null }

const KEY = 'pf-save-v2';
const OLD_KEY = 'pf-save-v1';   // before chapters: levels were keyed 1..10
const PER_CHAPTER = 10;
const COLORS = ['#ff8fc7', '#c3aaff', '#86dcff', '#ffd166', '#8fe388', '#ffa585'];

function load(): SaveData {
  try {
    let raw = localStorage.getItem(KEY), old = false;
    if (!raw) { raw = localStorage.getItem(OLD_KEY); old = true; }
    if (raw) {
      const d = JSON.parse(raw) as SaveData;
      if (Array.isArray(d.profiles)) {
        for (const p of d.profiles) {
          p.look = fixLook(p.look);
          // old saves: level 3 → '1-3' (the first 10 levels are chapter 1)
          if (old) p.levels = Object.fromEntries(Object.entries(p.levels ?? {}).map(([k, v]) => [/^\d+$/.test(k) ? `1-${k}` : k, v]));
        }
        return d;
      }
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
      look: randomLook(),
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

  setLook(id: string, look: Look): void {
    const p = this.get(id);
    if (!p) return;
    p.look = look;
    persist();
  },

  select(id: string): void {
    data.lastProfileId = id;
    persist();
  },

  // Keeps the best stars when a level is replayed.
  finish(id: string, level: string, stars: number): void {
    const p = this.get(id);
    if (!p) return;
    const prev = p.levels[level];
    p.levels[level] = { done: true, stars: Math.max(stars, prev?.stars ?? 0) };
    persist();
  },

  // A chapter opens when every level of the chapter before it is done.
  chapterOpen(p: Profile, chapter: number): boolean {
    if (DEBUG || chapter === 1) return true;
    for (let n = 1; n <= PER_CHAPTER; n++) if (!p.levels[`${chapter - 1}-${n}`]?.done) return false;
    return true;
  },

  // Level n of a chapter is open when the chapter is open and level n-1 is done.
  isOpen(p: Profile, chapter: number, n: number): boolean {
    if (!this.chapterOpen(p, chapter)) return false;
    return DEBUG || n === 1 || !!p.levels[`${chapter}-${n - 1}`]?.done;
  },

  stars(p: Profile, chapter?: number): number {
    return Object.entries(p.levels).reduce((s, [k, l]) => s + (chapter == null || k.startsWith(`${chapter}-`) ? l.stars : 0), 0);
  },
};
