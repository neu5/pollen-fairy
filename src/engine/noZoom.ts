// Stop phones from zooming the page. iOS Safari ignores user-scalable=no,
// so a fast double tap or a pinch would zoom in with no easy way back.

export function blockZoom(): void {
  // pinch (Safari only)
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(ev, e => e.preventDefault(), { passive: false });
  }
  // pinch with two fingers (other browsers)
  document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
  // double tap: swallow the second quick tap's zoom, but still let it press the button
  let lastTap = 0;
  document.addEventListener('touchend', e => {
    const now = e.timeStamp;
    if (now - lastTap < 350 && !(e.target instanceof HTMLInputElement)) {
      e.preventDefault();
      (e.target as HTMLElement | null)?.closest<HTMLElement>('button')?.click();
    }
    lastTap = now;
  }, { passive: false });
  document.addEventListener('dblclick', e => e.preventDefault());
}
