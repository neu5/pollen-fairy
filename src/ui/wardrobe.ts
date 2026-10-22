import { mainCtx, setCtx } from '../engine/view';
import { drawFigure, idlePose } from '../game/fairyArt';
import {
  HAIRS, DRESSES, SHOES, WINGS, HAIR_COLORS, SKINS, DRESS_COLORS, SHOE_COLORS, randomLook, type Look,
} from '../game/look';
import { Sound } from '../sound';
import { show } from './screens';

// Dress-up screen: pick hair, dress, shoes and wings. Pictures only, no reading needed.

type Tab = 'hair' | 'dress' | 'shoes' | 'wings';
type Focus = 'full' | 'head' | 'feet';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

// Draw the fairy into any canvas. focus zooms on the head or the feet.
export function paintFairy(c: HTMLCanvasElement, look: Look, t: number, focus: Focus = 'full'): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.round(c.clientWidth * dpr) || c.width, h = Math.round(c.clientHeight * dpr) || c.height;
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const g = c.getContext('2d') as CanvasRenderingContext2D;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.clearRect(0, 0, w, h);
  let k: number, cx: number, cy: number;
  if (focus === 'head') { k = h / 52; cx = 2; cy = -60; }
  else if (focus === 'feet') { k = h / 34; cx = 3; cy = -8; }
  else { k = h / 118; cx = -18; cy = -50; }
  g.setTransform(k, 0, 0, k, w / 2 - cx * k, h / 2 - cy * k);
  setCtx(g);
  drawFigure(look, idlePose(t));
  setCtx(mainCtx);
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'hair', label: 'Hair' }, { id: 'dress', label: 'Dress' }, { id: 'shoes', label: 'Shoes' }, { id: 'wings', label: 'Wings' },
];

let look: Look;
let tab: Tab = 'hair';
let popT = 0;

function choiceButton(selected: boolean, label: string, onPick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = 'ward-choice' + (selected ? ' on' : '');
  b.setAttribute('aria-label', label);
  b.setAttribute('aria-pressed', String(selected));
  b.onclick = () => { onPick(); popT = 0.35; Sound.tick(); Sound.happy(); build(); };
  return b;
}

function swatches(boxId: string, colors: string[], value: string, set: (c: string) => void, label: string): void {
  const box = $(boxId);
  box.replaceChildren();
  for (const col of colors) {
    const b = choiceButton(col === value, `${label} ${col}`, () => set(col));
    b.className = 'ward-swatch' + (col === value ? ' on' : '');
    b.style.setProperty('--c', col);
    box.append(b);
  }
  box.hidden = false;
}

function styles<T extends string>(options: readonly T[], value: T, apply: (v: T) => Look, focus: Focus, set: (v: T) => void): void {
  const box = $('wardStyles');
  box.replaceChildren();
  for (const opt of options) {
    const b = choiceButton(opt === value, opt, () => set(opt));
    const c = document.createElement('canvas');
    b.append(c);
    box.append(b);
    requestAnimationFrame(() => paintFairy(c, apply(opt), 0.6, focus));
  }
}

const TAB_FOCUS: Focus[] = ['head', 'full', 'feet', 'full'];

function build(): void {
  document.querySelectorAll<HTMLButtonElement>('#wardTabs button').forEach((b, i) => {
    b.classList.toggle('on', b.dataset.tab === tab);
    // tab pictures show the current look, zoomed on that part
    const c = b.querySelector('canvas');
    if (c) requestAnimationFrame(() => paintFairy(c, i === 2 && look.dress === 'gown' ? { ...look, dress: 'tutu' } : look, 0.6, TAB_FOCUS[i]));
  });
  $('wardSkins').hidden = true;
  switch (tab) {
    case 'hair':
      styles(HAIRS, look.hair, v => ({ ...look, hair: v }), 'head', v => { look.hair = v; });
      swatches('wardColors', HAIR_COLORS, look.hairColor, c => { look.hairColor = c; }, 'Hair colour');
      swatches('wardSkins', SKINS, look.skin, c => { look.skin = c; }, 'Skin');
      break;
    case 'dress':
      styles(DRESSES, look.dress, v => ({ ...look, dress: v }), 'full', v => { look.dress = v; });
      swatches('wardColors', DRESS_COLORS, look.dressColor, c => { look.dressColor = c; }, 'Dress colour');
      break;
    case 'shoes':
      // a long gown would hide the shoes in the little pictures
      styles(SHOES, look.shoes, v => ({ ...look, shoes: v, dress: look.dress === 'gown' ? 'tutu' : look.dress }), 'feet', v => { look.shoes = v; });
      swatches('wardColors', SHOE_COLORS, look.shoeColor, c => { look.shoeColor = c; }, 'Shoe colour');
      break;
    case 'wings':
      styles(WINGS, look.wings, v => ({ ...look, wings: v }), 'full', v => { look.wings = v; });
      $('wardColors').hidden = true;
      break;
  }
}

export function openWardrobe(name: string, start: Look, done: (l: Look) => void): void {
  look = { ...start };
  tab = 'hair';
  $('wardName').textContent = name;
  const tabs = $('wardTabs');
  if (!tabs.childElementCount) {
    for (const t of TABS) {
      const b = document.createElement('button');
      b.dataset.tab = t.id;
      b.setAttribute('aria-label', t.label);
      const c = document.createElement('canvas');
      b.append(c);
      b.onclick = () => { tab = t.id; Sound.tick(); build(); };
      tabs.append(b);
    }
  }
  $('wardRandom').onclick = () => { look = randomLook(); popT = 0.5; Sound.magic(); build(); };
  $('wardDone').onclick = () => done(look);
  show('wardrobe');
  build();
}

// Called every frame while the dress-up screen is open: the big fairy flaps and bounces.
export function tickWardrobe(t: number, dt: number): void {
  popT = Math.max(0, popT - dt);
  const c = $<HTMLCanvasElement>('wardCanvas');
  c.style.transform = popT > 0 ? `scale(${1 + Math.sin(popT / 0.35 * Math.PI) * 0.06})` : '';
  paintFairy(c, look, t);
}
