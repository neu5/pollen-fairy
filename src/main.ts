import './style.css';
import { V, IS_TOUCH, resize } from './engine/view';
import { bindInput, releaseAll } from './engine/input';
import { clearFx, spawnConfetti, updateFx } from './engine/fx';
import { clamp, damp } from './util';
import { Sound } from './sound';
import { DEBUG } from './debug';
import { blockZoom } from './engine/noZoom';
import { applyDom, onLangChange, setLang, t, type Key, type Lang } from './i18n';
import { createWorld, starsFor } from './game/world';
import { updatePlayer } from './game/player';
import type { World } from './game/types';
import { renderWorld } from './render/scene';
import { updateHud } from './render/hud';
import { CHAPTERS, getLevel, getSlot, nextKey, type Chapter } from './levels';
import { Save, type Profile } from './save';
import { show, renderWho, askName, confirm, renderMap, renderChapters, showEnd, type ScreenId } from './ui/screens';
import { openWardrobe, tickWardrobe } from './ui/wardrobe';
import { setLook } from './game/look';
import { Modal } from './ui/modal';

// Pollen Fairy — screens, game loop, level flow.

blockZoom();
window.addEventListener('resize', () => { resize(); if (screen === 'map') goMap(); });
resize();

const $ = (id: string) => document.getElementById(id) as HTMLElement;
let world: World = createWorld(getLevel('1-1')!);
let screen: ScreenId = 'title';
let profile: Profile | null = null;
let chapter: Chapter = CHAPTERS[0];
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
    pick: p => { profile = p; Save.select(p.id); goChapters(); },
    add: goNewKid,
    dress: p => goWardrobe(p, goWho),
    remove: p => confirm(t('remove.ask', { name: p.name }), () => { Save.remove(p.id); goWho(); }, goWho),
  });
  setScreen('who');
}

function goNewKid(): void {
  screen = 'newkid';
  askName(
    name => { profile = Save.add(name); goWardrobe(profile, goChapters); },
    () => (Save.profiles().length ? goWho() : setScreen('title')),
  );
  $('home').classList.remove('show');
}

function goWardrobe(p: Profile, then: () => void): void {
  screen = 'wardrobe';
  $('home').classList.remove('show');
  openWardrobe(p.name, p.look, look => { Save.setLook(p.id, look); then(); });
}

function goChapters(): void {
  if (!profile) { goWho(); return; }
  world.mode = 'idle';
  releaseAll();
  setLook(profile.look);
  renderChapters(profile, ch => { chapter = ch; goMap(); }, goWho);
  setScreen('chapters');
}

function goMap(): void {
  if (!profile) { goWho(); return; }
  world.mode = 'idle';
  releaseAll();
  setLook(profile.look);
  renderMap(profile, chapter, startLevel, goChapters, () => goWardrobe(profile!, goMap));
  setScreen('map');
}

function startLevel(key: string): void {
  const def = getLevel(key);
  if (!def) return;
  chapter = CHAPTERS[getSlot(key)!.chapter - 1];
  if (profile) setLook(profile.look);
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
  const next = nextKey(id);
  showEnd(profile.name, t(`w${id}` as Key), stars, `${world.collected} / ${world.total}`, {
    map: goMap,
    replay: () => startLevel(id),
    next: next ? () => startLevel(next) : null,
  });
  screen = 'end';
}

$('play').addEventListener('click', () => { Sound.init(); goWho(); });

// language flags: re-draw screens built in code so their labels change too
document.querySelectorAll<HTMLButtonElement>('#langs button').forEach(b => {
  b.addEventListener('click', () => { setLang(b.dataset.lang as Lang); b.blur(); });
});
onLangChange(() => { if (screen === 'who') goWho(); else if (screen === 'chapters') goChapters(); });
applyDom();
$('home').addEventListener('click', () => { pause(); $('home').blur(); });
$('pausePlay').addEventListener('click', resume);
$('pauseMap').addEventListener('click', goMap);
$('pauseReplay').addEventListener('click', () => startLevel(world.def.id));
$('againGo').addEventListener('click', () => startLevel(world.def.id));

// Pause keeps the level exactly as it is; Play goes on from the same spot.
function pause(): void {
  if (screen !== 'level' || world.mode !== 'play' || Modal.open) return;
  releaseAll();
  setScreen('pause');
}
function resume(): void {
  if (screen !== 'pause') return;
  last = performance.now();
  setScreen('level');
}
// leaving the tab or window pauses too
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
window.addEventListener('blur', pause);

const muteBtn = $('mute');
const syncMute = () => muteBtn.classList.toggle('off', Sound.muted);
syncMute();
muteBtn.addEventListener('click', () => { Sound.init(); Sound.setMuted(!Sound.muted); syncMute(); muteBtn.blur(); });

bindInput(code => {
  if (screen === 'title' && (code === 'Enter' || code === 'Space')) { Sound.init(); goWho(); }
  if (code === 'Escape' || code === 'KeyP') { if (screen === 'level') pause(); else if (screen === 'pause') resume(); }
  else if (screen === 'pause' && (code === 'Enter' || code === 'Space')) resume();
  else if (screen === 'again' && code === 'Enter') startLevel(world.def.id);
  if (!DEBUG || !profile) return;
  // debug keys: N = finish this level now, 1…9 / 0 = jump to level 1…10 of this chapter, C = next chapter
  if (code === 'KeyN' && screen === 'level' && world.mode === 'play') debugWin();
  if (code === 'KeyC' && screen === 'map') { chapter = CHAPTERS[chapter.id % CHAPTERS.length]; goMap(); }
  const digit = code.match(/^Digit(\d)$/);
  if (digit && (screen === 'level' || screen === 'map' || screen === 'end')) startLevel(`${chapter.id}-${+digit[1] || 10}`);
});

function debugWin(): void {
  world.player.frozen = true;
  world.finaleSpot = { x: world.player.x, y: world.player.y - 100 };
  world.mode = 'finale'; world.finaleT = 0;
}

if (DEBUG) {
  const tag = document.createElement('div');
  tag.className = 'debug-tag';
  tag.textContent = 'DEBUG · N = win · 1-0 = level · C = chapter (map)';
  document.body.append(tag);
}

// --------------------------------------------------------------- loop ----
function update(dt: number): void {
  V.time += dt;
  if (screen === 'wardrobe') tickWardrobe(V.time, dt);
  const w = world;
  w.time += dt;
  updatePlayer(w, dt);
  if (w.mode === 'idle') w.player.wingT += dt * 2.5;
  for (const e of w.entities) e.update(w, dt);
  // a timer ran out: no fuss, just offer to start again
  if (w.failed && screen === 'level') { releaseAll(); setScreen('again'); return; }

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
  if (screen !== 'pause' && screen !== 'again' && !Modal.open) update(dt);
  renderWorld(world);
  requestAnimationFrame(frame);
}
snapCamera();
setScreen('title');
requestAnimationFrame(frame);

// console helpers in debug mode: __pf.goto('1-2'), __pf.win(), __pf.step(5), __pf.tp(1200, 400)
if (DEBUG) {
  (window as unknown as { __pf: unknown }).__pf = {
    get world() { return world; },
    get screen() { return screen; },
    goto(key: string) { if (!profile) profile = Save.last() ?? Save.add('Test'); startLevel(key); },
    win: debugWin,
    chapters: CHAPTERS,
    // run the game forward without drawing
    step(sec: number) { for (let i = 0; i < sec * 60; i++) update(1 / 60); renderWorld(world); },
    // move the fairy
    tp(x: number, y?: number) { const p = world.player; p.x = x; p.y = y ?? world.ground(x); p.vy = 0; snapCamera(); },
  };
}
