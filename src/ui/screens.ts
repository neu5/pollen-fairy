import { LEVELS } from '../levels';
import { Save, type Profile } from '../save';

// DOM screens: title, who's playing, new kid, confirm, level map, end card.

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const SCREENS = ['title', 'who', 'newkid', 'confirm', 'map', 'end'] as const;
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

function avatar(p: Profile): HTMLElement {
  const a = el('div', 'avatar');
  a.style.setProperty('--c', p.color);
  a.append(el('span', 'wing l'), el('span', 'wing r'), el('span', 'face', p.name.slice(0, 1).toUpperCase()));
  return a;
}

export interface WhoHandlers { pick(p: Profile): void; add(): void; remove(p: Profile): void }

export function renderWho(h: WhoHandlers): void {
  const box = $('profiles');
  box.replaceChildren();
  for (const p of Save.profiles()) {
    const card = el('div', 'kid');
    const btn = el('button', 'kid-btn');
    btn.setAttribute('aria-label', `Play as ${p.name}`);
    btn.append(avatar(p), el('span', 'kid-name', p.name));
    const stars = Object.values(p.levels).reduce((s, l) => s + l.stars, 0);
    btn.append(el('span', 'kid-stars', `★ ${stars}`));
    btn.onclick = () => h.pick(p);
    const del = el('button', 'kid-del', '✕');
    del.setAttribute('aria-label', `Remove ${p.name}`);
    del.onclick = e => { e.stopPropagation(); h.remove(p); };
    card.append(btn, del);
    box.append(card);
  }
  const add = el('button', 'kid-btn add');
  add.setAttribute('aria-label', 'New player');
  add.append(el('div', 'avatar plus', '+'), el('span', 'kid-name', 'New'));
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

export function renderMap(p: Profile, play: (id: number) => void, back: () => void): void {
  // tall phone screens get the same path turned on its side
  const tall = window.innerHeight > window.innerWidth;
  const W = tall ? 560 : 1000, H = tall ? 1000 : 560;
  const pts = tall ? STONES.map(([x, y]) => [y, x]) : STONES;
  const at = (i: number) => ({ left: `${pts[i][0] / W * 100}%`, top: `${pts[i][1] / H * 100}%` });
  $('map').classList.toggle('tall', tall);
  $('mapSvg').setAttribute('viewBox', `0 0 ${W} ${H}`);
  $('mapName').textContent = p.name;
  $('mapPath').setAttribute('d', pathD(pts));
  $('mapBack').onclick = back;
  const box = $('stones');
  box.replaceChildren();
  let current = 1;
  for (const slot of LEVELS) if (Save.isOpen(p, slot.id) && slot.def) current = slot.id;
  LEVELS.forEach((slot, i) => {
    const res = p.levels[slot.id];
    const open = Save.isOpen(p, slot.id) && !!slot.def;
    const b = el('button', 'stone');
    Object.assign(b.style, at(i));
    b.classList.add(res?.done ? 'done' : open ? 'open' : slot.def ? 'locked' : 'soon');
    if (slot.id === current && !res?.done) b.classList.add('next');
    b.setAttribute('aria-label', `${slot.id}. ${slot.name}${open ? '' : ' (locked)'}`);
    b.append(el('span', 'num', String(slot.id)), el('span', 'icon', open || res?.done ? slot.icon : '🔒'));
    if (res?.done) {
      const s = el('span', 'stars');
      for (let k = 0; k < 3; k++) s.append(el('i', k < res.stars ? 'on' : '', '★'));
      b.append(s);
    }
    b.disabled = !open;
    if (open) b.onclick = () => play(slot.id);
    box.append(b);
  });
  // fairy marker above the current stone
  const m = $('mapMarker');
  Object.assign(m.style, at(current - 1));
  show('map');
}

export interface EndHandlers { map(): void; replay(): void; next: (() => void) | null }

export function showEnd(name: string, text: string, stars: number, count: string, h: EndHandlers): void {
  $('endTitle').textContent = `Hooray, ${name}!`;
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
