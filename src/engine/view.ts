// Canvas, screen scale and camera. World units: the view is always 720 tall.

export const VIEW_H = 720;
export const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
export const cvs = document.getElementById('game') as HTMLCanvasElement;
export const ctx = cvs.getContext('2d') as CanvasRenderingContext2D;

export const V = {
  scale: 1, viewW: 1280, viewH: 720, camRest: 0,
  camX: 0, camY: 0, time: 0,
};

export function resize(): void {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // the window can briefly report 0×0 (hidden tab / pane); never let scale hit 0
  cvs.width = Math.max(1, Math.round(window.innerWidth * dpr));
  cvs.height = Math.max(1, Math.round(window.innerHeight * dpr));
  V.scale = Math.min(cvs.height / VIEW_H, cvs.width / 900);
  V.viewW = cvs.width / V.scale;
  V.viewH = cvs.height / V.scale;
  V.camRest = VIEW_H - V.viewH;
}

// Parallax layer transform: f = horizontal speed, fy = vertical speed (1 = world).
export function layer(f: number, fy: number): number {
  const oy = V.camRest + (V.camY - V.camRest) * fy;
  ctx.setTransform(V.scale, 0, 0, V.scale, -V.camX * f * V.scale, -oy * V.scale);
  return oy;
}

export function screenSpace(): void {
  ctx.setTransform(V.scale, 0, 0, V.scale, 0, 0);
}

export const visible = (a: number, b: number): boolean => b > V.camX && a < V.camX + V.viewW;
