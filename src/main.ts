import './style.css';
import { V, IS_TOUCH, resize } from './engine/view';
import { bindInput, releaseAll } from './engine/input';
import { clearFx, spawnConfetti, updateFx } from './engine/fx';
import { clamp, damp } from './util';
import { Sound } from './sound';
import { DEBUG } from './debug';
import { createWorld, starsFor } from './game/world';
import { updatePlayer } from './game/player';
import type { World } from './game/types';
import { renderWorld } from './render/scene';
import { updateHud } from './render/hud';
import { LEVELS, getLevel } from './levels';
import { Save, type Profile } from './save';
import { show, renderWho, askName, confirm, renderMap, showEnd, type ScreenId } from './ui/screens';

// Pollen Fairy — screens, game loop, level flow.

window.addEventListener('resize', () => { resize(); if (screen === 'map') goMap(); });
resize();

const $ = (id: string) => document.getElementById(id) as HTMLElement;
let world: World = createWorld(getLevel(1)!);
let screen: ScreenId = 'title';
let profile: Profile | null = null;
let ended = false;

function setScreen(s: ScreenId): void {
  screen = s;
  if (s !== 'level') show(s);
  else show('level');
  $('touch').classList.toggle('show', IS_TOUCH && s === 'level');
  $('home').classList.toggle('show', s === 'level');
}

function snapCamera(): void {
  const p = world.player;
  V.camX = clamp(p.x - V.viewW * 0.42 + p.face * V.viewW * 0.08, 0, Math.max(0, world.worldW - V.viewW));
  V.camY = V.camRest;
}

// ------------------------------------------------------------ screens ----
function goWho(): void {
  if (!Save.profiles().length) { goNewKid(); return; }
  renderWho({
    pick: p => { profile = p; Save.select(p.id); goMap(); },
    add: goNewKid,
    remove: p => confirm(`Remove ${p.name}?`, () => { Save.remove(p.id); goWho(); }, goWho),
  });
  setScreen('who');
}

function goNewKid(): void {
  screen = 'newkid';
  askName(
    name => { profile = Save.add(name); goMap(); },
    () => (Save.profiles().length ? goWho() : setScreen('title')),
  );
  $('home').classList.remove('show');
}

function goMap(): void {
  if (!profile) { goWho(); return; }
  world.mode = 'idle';
  releaseAll();
  renderMap(profile, startLevel, goWho);
  setScreen('map');
}

function startLevel(id: number): void {
  const def = getLevel(id);
  if (!def) return;
  Sound.init(); Sound.startAmbient();
  clearFx();
  world = createWorld(def);
  world.mode = 'play';
  ended = false;
  snapCamera();
  setScreen('level');
}

function levelWon(): void {
  if (!profile) return;
  const id = world.def.id, stars = starsFor(world);
  Save.finish(profile.id, id, stars);
  const nextDef = getLevel(id + 1);
  showEnd(profile.name, world.def.winText ?? 'You did it!', stars, `${world.collected} / ${world.total}`, {
    map: goMap,
    replay: () => startLevel(id),
    next: nextDef ? () => startLevel(id + 1) : null,
  });
  screen = 'end';
}

$('play').addEventListener('click', () => { Sound.init(); goWho(); });
$('home').addEventListener('click', () => { goMap(); });

const muteBtn = $('mute');
const syncMute = () => muteBtn.classList.toggle('off', Sound.muted);
syncMute();
muteBtn.addEventListener('click', () => { Sound.init(); Sound.setMuted(!Sound.muted); syncMute(); muteBtn.blur(); });

bindInput(code => {
  if (screen === 'title' && (code === 'Enter' || code === 'Space')) { Sound.init(); goWho(); }
  if (!DEBUG || !profile) return;
  // debug keys: N = finish this level now, 1…9 / 0 = jump to level 1…10
  if (code === 'KeyN' && screen === 'level' && world.mode === 'play') debugWin();
  const digit = code.match(/^Digit(\d)$/);
  if (digit && (screen === 'level' || screen === 'map' || screen === 'end')) startLevel(+digit[1] || 10);
});

function debugWin(): void {
  world.player.frozen = true;
  world.finaleSpot = { x: world.player.x, y: world.player.y - 100 };
  world.mode = 'finale'; world.finaleT = 0;
}

if (DEBUG) {
  const tag = document.createElement('div');
  tag.className = 'debug-tag';
  tag.textContent = 'DEBUG · N = win · 1-0 = level';
  document.body.append(tag);
}

// --------------------------------------------------------------- loop ----
function update(dt: number): void {
  V.time += dt;
  const w = world;
  w.time += dt;
  updatePlayer(w, dt);
  if (w.mode === 'idle') w.player.wingT += dt * 2.5;
  for (const e of w.entities) e.update(w, dt);

  const p = w.player;
  p.sqV += (-p.sq * 260 - p.sqV * 16) * dt;
  p.sq = clamp(p.sq + p.sqV * dt, -0.25, 0.3);
  for (const pl of w.platforms) {
    pl.sagV += (-pl.sag * 90 - pl.sagV * 9) * dt;
    pl.sag += pl.sagV * dt;
  }
  for (const f of w.flowers) {
    const target = f.visited ? 1 : 0.45;
    f.openV += ((target - f.open) * 140 - f.openV * 10) * dt;
    f.open += f.openV * dt;
    f.wiggle = Math.max(0, f.wiggle - dt * 0.8);
  }

  if (w.mode === 'finale') {
    if (w.finaleT === 0) Sound.finale();
    w.finaleT += dt;
    w.rainbowA = clamp((w.finaleT - 1.2) / 2, 0, 1);
    if (w.finaleT > 0.8 && Math.random() < (w.finaleT < 5 ? 0.8 : 0.15)) spawnConfetti();
    if (w.finaleT > 3.4 && !ended) { ended = true; levelWon(); }
  }

  const tx = clamp(p.x - V.viewW * 0.42 + p.face * V.viewW * 0.08, 0, Math.max(0, w.worldW - V.viewW));
  V.camX = damp(V.camX, tx, 3, dt);
  V.camY = damp(V.camY, clamp(p.y - V.viewH * 0.55, -360, V.camRest), 2.5, dt);

  updateFx(dt);
  updateHud(w, dt);
}

let last = performance.now();
function frame(now: number): void {
  const dt = clamp((now - last) / 1000, 0, 0.033);
  last = now;
  update(dt);
  renderWorld(world);
  requestAnimationFrame(frame);
}
snapCamera();
setScreen('title');
requestAnimationFrame(frame);

// console helpers in debug mode: __pf.goto(2), __pf.win(), __pf.step(5), __pf.tp(1200, 400)
if (DEBUG) {
  (window as unknown as { __pf: unknown }).__pf = {
    get world() { return world; },
    get screen() { return screen; },
    goto(id: number) { if (!profile) profile = Save.last() ?? Save.add('Test'); startLevel(id); },
    win: debugWin,
    levels: LEVELS,
    // run the game forward without drawing
    step(sec: number) { for (let i = 0; i < sec * 60; i++) update(1 / 60); renderWorld(world); },
    // move the fairy
    tp(x: number, y?: number) { const p = world.player; p.x = x; p.y = y ?? world.ground(x); p.vy = 0; snapCamera(); },
  };
}
