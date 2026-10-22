import { Sound } from '../sound';

export type Control = 'left' | 'right' | 'fly';
export const input: Record<Control, boolean> = { left: false, right: false, fly: false };

const KEYS: Record<string, Control> = {
  ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
  Space: 'fly', ArrowUp: 'fly', KeyW: 'fly',
};

export function releaseAll(): void {
  input.left = input.right = input.fly = false;
}

// onKey gets every keydown (for menus); game keys are blocked while typing in a text field.
export function bindInput(onKey: (code: string) => void): void {
  window.addEventListener('keydown', e => {
    const typing = e.target instanceof HTMLInputElement;
    const k = KEYS[e.code];
    if (k && !typing) { input[k] = true; e.preventDefault(); }
    onKey(e.code);
  });
  window.addEventListener('keyup', e => { const k = KEYS[e.code]; if (k) input[k] = false; });
  window.addEventListener('blur', releaseAll);

  document.querySelectorAll<HTMLButtonElement>('#touch button').forEach(btn => {
    const k = btn.dataset.k as Control;
    const on = (e: Event) => { e.preventDefault(); input[k] = true; btn.classList.add('down'); Sound.init(); };
    const off = (e: Event) => { e.preventDefault(); input[k] = false; btn.classList.remove('down'); };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('pointercancel', off);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  });
}
