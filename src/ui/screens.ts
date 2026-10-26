import { CHAPTERS, type Chapter } from '../levels';
import { Save, type Profile } from '../save';
import { paintFairy } from './wardrobe';
import { t, type Key } from '../i18n';

// DOM screens: title, who's playing, new kid, confirm, level map, end card.

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const SCREENS = ['title', 'who', 'newkid', 'wardrobe', 'confirm', 'chapters', 'map', 'intro', 'pause', 'again', 'end'] as const;
export type ScreenId = typeof SCREENS[number] | 'level';

export function show(id: ScreenId): void {
  for (const s of SCREENS) $(s).classList.toggle('show', s === id);
  document.body.dataset.screen = id;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

// Round picture of the kid's fairy (head and shoulders).
function avatar(p: Profile): HTMLElement {
  const a = el('div', 'avatar');
  a.style.setProperty('--c', p.color);
  const c = el('canvas');
  a.append(c);
  requestAnimationFrame(() => paintFairy(c, p.look, 0.6, 'head'));
  return a;
}

export interface WhoHandlers { pick(p: Profile): void; add(): void; remove(p: Profile): void; dress(p: Profile): void }

export function renderWho(h: WhoHandlers): void {
  const box = $('profiles');
  box.replaceChildren();
  for (const p of Save.profiles()) {
    const card = el('div', 'kid');
    const btn = el('button', 'kid-btn');
    btn.setAttribute('aria-label', t('a.playAs', { name: p.name }));
    btn.append(avatar(p), el('span', 'kid-name', p.name));
    const stars = Save.stars(p);
    btn.append(el('span', 'kid-stars', `★ ${stars}`));
    btn.onclick = () => h.pick(p);
    const del = el('button', 'kid-del', '✕');
    del.setAttribute('aria-label', t('a.remove', { name: p.name }));
    del.onclick = e => { e.stopPropagation(); h.remove(p); };
    const dress = el('button', 'kid-dress', '👗');
    dress.setAttribute('aria-label', t('a.dressKid', { name: p.name }));
    dress.onclick = e => { e.stopPropagation(); h.dress(p); };
    card.append(btn, del, dress);
    box.append(card);
  }
  const add = el('button', 'kid-btn add');
  add.setAttribute('aria-label', t('a.newPlayer'));
  add.append(el('div', 'avatar plus', '+'), el('span', 'kid-name', t('new')));
  add.onclick = h.add;
  const card = el('div', 'kid'); card.append(add);
  box.append(card);
}

export function askName(onOk: (name: string) => void, onBack: () => void): void {
  const input = $<HTMLInputElement>('nameInput'), ok = $<HTMLButtonElement>('nameOk');
  input.value = '';
  const sync = () => { ok.disabled = !input.value.trim(); };
  sync();
  input.oninput = sync;
  const submit = () => { if (input.value.trim()) onOk(input.value); };
  ok.onclick = submit;
  input.onkeydown = e => { if (e.key === 'Enter') submit(); };
  $('nameBack').onclick = onBack;
  show('newkid');
  setTimeout(() => input.focus(), 80);
}

export function confirm(msg: string, onYes: () => void, onNo: () => void): void {
  $('confirmMsg').textContent = msg;
  $('confirmYes').onclick = onYes;
  $('confirmNo').onclick = onNo;
  show('confirm');
}

// Stone positions on a 1000×560 board (S-shaped path).
const STONES = [
  [100, 455], [290, 405], [480, 455], [670, 405], [860, 440],
  [880, 215], [690, 150], [500, 200], [310, 140], [120, 185],
];

function pathD(pts: number[][]): string {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

// Chapter picker: one big card per chapter, with stars and a lock.
export function renderChapters(p: Profile, pick: (c: Chapter) => void, back: () => void): void {
  $('chaptersBack').onclick = back;
  const box = $('chapterCards');
  box.replaceChildren();
  for (const ch of CHAPTERS) {
    const built = ch.levels.some(l => l.def);
    const open = built && Save.chapterOpen(p, ch.id);
    const b = el('button', 'chapter' + (open ? '' : ' locked'));
    b.style.setProperty('--c', ch.color);
    b.setAttribute('aria-label', `${t('a.chapter', { n: ch.id })}: ${t(`ch${ch.id}` as Key)}${open ? '' : ' ' + t('a.locked')}`);
    b.append(el('span', 'num', String(ch.id)), el('span', 'icon', open ? ch.icon : '🔒'), el('span', 'name', t(`ch${ch.id}` as Key)));
    if (open) b.append(el('span', 'kid-stars', `★ ${Save.stars(p, ch.id)} / ${ch.levels.length * 3}`));
    b.disabled = !open;
    if (open) b.onclick = () => pick(ch);
    box.append(b);
  }
}

export function renderMap(p: Profile, ch: Chapter, play: (key: string) => void, back: () => void, dress: () => void): void {
  // tall phone screens get the same path turned on its side
  const tall = window.innerHeight > window.innerWidth;
  const W = tall ? 560 : 1000, H = tall ? 1000 : 560;
  const pts = tall ? STONES.map(([x, y]) => [y, x]) : STONES;
  const at = (i: number) => ({ left: `${pts[i][0] / W * 100}%`, top: `${pts[i][1] / H * 100}%` });
  $('map').classList.toggle('tall', tall);
  $('mapSvg').setAttribute('viewBox', `0 0 ${W} ${H}`);
  $('mapName').textContent = p.name;
  $('mapTitle').textContent = `${ch.icon} ${t(`ch${ch.id}` as Key)}`;
  $('map').style.setProperty('--chapter', ch.color);
  $('mapPath').setAttribute('d', pathD(pts));
  $('mapBack').onclick = back;
  $('mapDress').onclick = dress;
  const mc = $<HTMLCanvasElement>('mapFairy');
  requestAnimationFrame(() => paintFairy(mc, p.look, 0.6));
  const box = $('stones');
  box.replaceChildren();
  let current = 1;
  for (const slot of ch.levels) if (Save.isOpen(p, ch.id, slot.n) && slot.def) current = slot.n;
  ch.levels.forEach((slot, i) => {
    const res = p.levels[slot.key];
    const open = Save.isOpen(p, ch.id, slot.n) && !!slot.def;
    const b = el('button', 'stone');
    Object.assign(b.style, at(i));
    b.classList.add(res?.done ? 'done' : open ? 'open' : slot.def ? 'locked' : 'soon');
    if (slot.n === current && !res?.done) b.classList.add('next');
    b.setAttribute('aria-label', `${slot.n}. ${t(`l${slot.key}` as Key)}${open ? '' : ' ' + t('a.locked')}`);
    b.append(el('span', 'num', String(slot.n)), el('span', 'icon', open || res?.done ? slot.icon : '🔒'));
    if (res?.done) {
      const s = el('span', 'stars');
      for (let k = 0; k < 3; k++) s.append(el('i', k < res.stars ? 'on' : '', '★'));
      b.append(s);
    }
    b.disabled = !open;
    if (open) b.onclick = () => play(slot.key);
    box.append(b);
  });
  // fairy marker above the current stone
  const m = $('mapMarker');
  Object.assign(m.style, at(current - 1));
  show('map');
}

// What to do in a level: picture steps with arrows between, and one short sentence.
const JOINERS = new Set(['➡️', '➕', '=', '…']);
export function renderGoal(box: HTMLElement, goal: { steps: string[]; text: string } | null): void {
  box.replaceChildren();
  if (!goal) return;
  const row = el('div', 'goal-steps');
  goal.steps.forEach((st, i) => {
    if (i > 0 && !JOINERS.has(st) && !JOINERS.has(goal.steps[i - 1])) row.append(el('span', 'goal-arrow', '›'));
    row.append(el('span', JOINERS.has(st) ? 'goal-join' : 'goal-step', st));
  });
  box.append(row, el('p', 'goal-text', goal.text));
}

export function showIntro(title: string, goal: { steps: string[]; text: string } | null, go: () => void): void {
  $('introTitle').textContent = title;
  renderGoal($('introGoal'), goal);
  $('introGo').onclick = go;
  show('intro');
}

export interface EndHandlers { map(): void; replay(): void; next: (() => void) | null }

export function showEnd(name: string, text: string, stars: number, count: string, h: EndHandlers): void {
  $('endTitle').textContent = t('hooray', { name });
  $('endSub').textContent = text;
  $('endCount').textContent = count;
  const s = $('endStars');
  s.replaceChildren();
  for (let k = 0; k < 3; k++) {
    const i = el('i', k < stars ? 'on' : '', '★');
    i.style.animationDelay = `${0.3 + k * 0.25}s`;
    s.append(i);
  }
  $('endMap').onclick = h.map;
  $('endReplay').onclick = h.replay;
  const next = $<HTMLButtonElement>('endNext');
  next.hidden = !h.next;
  if (h.next) next.onclick = h.next;
  show('end');
}
