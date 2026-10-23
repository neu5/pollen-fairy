import { Sound } from '../sound';
import { Modal } from './modal';
import { releaseAll } from '../engine/input';

// Number picker window: shows a question made of pictures (e.g. 🪵🪵🪵 + 🪵🪵) and buttons 1…10.
// Each button has dots under it, so kids can count if they cannot read the number yet.

export type AskPart = string | { icon: string; n: number };   // text, or a group of n pictures

const $ = (id: string) => document.getElementById(id) as HTMLElement;
let answer = 0, misses = 0, done: (() => void) | null = null;

function close(): void { $('numbers').classList.remove('show'); Modal.open = false; }

export function openNumbers(ask: AskPart[], correct: number, onCorrect: () => void, max = 10): void {
  releaseAll();
  answer = correct; misses = 0; done = onCorrect;
  const box = $('numbersAsk');
  box.replaceChildren();
  for (const part of ask) {
    const s = document.createElement('span');
    if (typeof part === 'string') s.textContent = part;
    else {
      s.className = 'group';
      for (let k = 0; k < part.n; k++) { const i = document.createElement('span'); i.textContent = part.icon; s.append(i); }
    }
    box.append(s);
  }
  const pad = $('numbersPad');
  pad.replaceChildren();
  for (let n = 1; n <= max; n++) {
    const b = document.createElement('button');
    b.setAttribute('aria-label', String(n));
    const num = document.createElement('span'); num.textContent = String(n);
    const dots = document.createElement('span'); dots.className = 'dots';
    for (let k = 0; k < n; k++) dots.append(document.createElement('i'));
    b.append(num, dots);
    b.onclick = () => pick(n, b);
    pad.append(b);
  }
  $('numbers').classList.add('show');
  Modal.open = true;
}

function pick(n: number, b: HTMLButtonElement): void {
  if (n === answer) {
    b.classList.add('yes'); Sound.magic();
    setTimeout(() => { close(); done?.(); }, 700);
    return;
  }
  Sound.oops(); misses++;
  b.classList.remove('no'); void b.offsetWidth; b.classList.add('no');
  // after two tries, show the right button
  if (misses >= 2) $('numbersPad').children[answer - 1]?.classList.add('hint');
}

document.getElementById('numbersClose')!.onclick = close;
