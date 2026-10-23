import { Sound } from '../sound';
import { Modal } from './modal';
import { releaseAll } from '../engine/input';

// Clock puzzle window: turn the hands until the clock shows the asked time.
// Big buttons move the long (minute) hand by 15 minutes; small ones move the hour.

export interface ClockTime { h: number; m: number }   // h 1..12, m 0/15/30/45

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const NS = 'http://www.w3.org/2000/svg';

let now: ClockTime = { h: 12, m: 0 };
let goal: ClockTime = { h: 12, m: 0 };
let minDeg = 0, hourDeg = 0;     // keep adding, so hands never spin backwards the long way
let misses = 0;
let solved: (() => void) | null = null;

export const fmt = (c: ClockTime): string => `${c.h}:${String(c.m).padStart(2, '0')}`;

function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, parent: Element): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  parent.append(e);
  return e;
}

// Draw a clock face into an <svg>. Returns the two hand groups.
export function buildFace(root: SVGSVGElement, small = false): { hour: SVGGElement; min: SVGGElement; ghostH: SVGGElement; ghostM: SVGGElement } {
  root.replaceChildren();
  root.setAttribute('viewBox', '-110 -110 220 220');
  svg('circle', { r: 104, fill: '#fff8e8', stroke: '#c98a4b', 'stroke-width': 10 }, root);
  for (let i = 0; i < 60; i++) {
    const a = i * Math.PI / 30, big = i % 5 === 0, r0 = big ? 82 : 88;
    svg('line', { x1: Math.sin(a) * r0, y1: -Math.cos(a) * r0, x2: Math.sin(a) * 94, y2: -Math.cos(a) * 94, stroke: big ? '#6a4bb0' : '#cbbbe8', 'stroke-width': big ? 4 : 2, 'stroke-linecap': 'round' }, root);
  }
  if (!small) {
    for (let n = 1; n <= 12; n++) {
      const a = n * Math.PI / 6;
      const t = svg('text', { x: Math.sin(a) * 66, y: -Math.cos(a) * 66 + 9, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: '#5b3a8c' }, root);
      t.textContent = String(n);
    }
  }
  const hand = (len: number, w: number, col: string, op = 1) => {
    const g = svg('g', { opacity: op }, root);
    svg('line', { x1: 0, y1: 12, x2: 0, y2: -len, stroke: col, 'stroke-width': w, 'stroke-linecap': 'round' }, g);
    return g;
  };
  const ghostH = hand(46, 12, '#ffcf3a', 0), ghostM = hand(76, 8, '#ffcf3a', 0);
  const hour = hand(46, 12, '#5b3a8c'), min = hand(76, 8, '#ff6fa8');
  svg('circle', { r: 9, fill: '#ffcf3a', stroke: '#5b3a8c', 'stroke-width': 3 }, root);
  for (const g of [hour, min, ghostH, ghostM]) g.style.transition = 'transform 0.35s cubic-bezier(.3,1.4,.5,1)';
  return { hour, min, ghostH, ghostM };
}

export function setHands(f: { hour: SVGGElement; min: SVGGElement }, c: ClockTime): void {
  f.hour.style.transform = `rotate(${((c.h % 12) + c.m / 60) * 30}deg)`;
  f.min.style.transform = `rotate(${c.m * 6}deg)`;
}

let face: ReturnType<typeof buildFace> | null = null;

function draw(): void {
  if (!face) return;
  face.min.style.transform = `rotate(${minDeg}deg)`;
  face.hour.style.transform = `rotate(${hourDeg}deg)`;
}

function turn(minutes: number): void {
  minDeg += minutes * 6;
  hourDeg += minutes * 0.5;
  let total = ((now.h % 12) * 60 + now.m + minutes) % 720;
  if (total < 0) total += 720;
  now = { h: Math.floor(total / 60) || 12, m: total % 60 };
  Sound.tick();
  draw();
}

function check(): void {
  const ok = now.h === goal.h && now.m === goal.m;
  const box = $('clockFace');
  if (ok) {
    Sound.magic(); Sound.finale();
    box.classList.add('ok');
    setTimeout(() => { close(); solved?.(); }, 1100);
  } else {
    Sound.oops();
    misses++;
    box.classList.remove('no'); void box.offsetWidth; box.classList.add('no');
    // after two tries, show where the hands should go (yellow, see-through)
    if (misses >= 2 && face) { setHands({ hour: face.ghostH, min: face.ghostM }, goal); face.ghostH.setAttribute('opacity', '0.45'); face.ghostM.setAttribute('opacity', '0.45'); }
  }
}

function close(): void {
  $('clock').classList.remove('show');
  Modal.open = false;
}

export function openClock(target: ClockTime, start: ClockTime, onSolved: () => void): void {
  releaseAll();
  goal = target; now = { ...start }; misses = 0; solved = onSolved;
  face = buildFace($('clockFace') as unknown as SVGSVGElement);
  minDeg = now.m * 6; hourDeg = ((now.h % 12) + now.m / 60) * 30;
  face.min.style.transition = face.hour.style.transition = 'none';
  draw();
  requestAnimationFrame(() => { if (face) face.min.style.transition = face.hour.style.transition = 'transform 0.35s cubic-bezier(.3,1.4,.5,1)'; });
  $('clockFace').classList.remove('ok', 'no');
  $('clockGoal').textContent = fmt(goal);
  const goalFace = buildFace($('clockGoalFace') as unknown as SVGSVGElement, true);
  setHands(goalFace, goal);
  $('clock').classList.add('show');
  Modal.open = true;
}

// buttons are wired once
document.getElementById('clockMinBack')!.onclick = () => turn(-15);
document.getElementById('clockMinFwd')!.onclick = () => turn(15);
document.getElementById('clockHourBack')!.onclick = () => turn(-60);
document.getElementById('clockHourFwd')!.onclick = () => turn(60);
document.getElementById('clockOk')!.onclick = check;
document.getElementById('clockClose')!.onclick = close;
