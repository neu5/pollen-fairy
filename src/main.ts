import {
  TAU, mulberry32, lerp, clamp, damp, ease, mod, pick, sprite, drawSprite, circle, rr,
} from './util';
import {
  PAL, CASTLE_PAL, drawRoundTree, drawPine, drawTallTree, drawBush, drawFern, drawCloud, drawCastle,
  drawGrassClump, drawBigLeaf, drawHangingVine,
} from './art';
import { WORLD_W, TREE_X, GREAT_X, groundY, buildLevel } from './level';
import { Sound } from './sound';
import './style.css';

// Pollen Fairy — game loop, player, and the layered (2.5D) renderer.

(() => {
  const cvs = document.getElementById('game') as HTMLCanvasElement;
  const ctx = cvs.getContext('2d');
  const VIEW_H = 720;
  const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;
  let scale = 1, viewW = 1280, viewH = 720, camRest = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // the window can briefly report 0×0 (hidden tab / pane); never let scale hit 0
    cvs.width = Math.max(1, Math.round(window.innerWidth * dpr));
    cvs.height = Math.max(1, Math.round(window.innerHeight * dpr));
    scale = Math.min(cvs.height / VIEW_H, cvs.width / 900);
    viewW = cvs.width / scale;
    viewH = cvs.height / scale;
    camRest = VIEW_H - viewH;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------------------------------------------------------------- art ----
  const R = mulberry32(20261021);
  const ART: any = {}, LAYER: any = {};

  const farHillY = x => 478 - 22 * Math.sin(x * 0.005 + 0.3) - 14 * Math.sin(x * 0.011 + 1);
  const midHillY = x => 522 - 26 * Math.sin(x * 0.0037 + 2) - 14 * Math.sin(x * 0.009);
  const backHillY = x => 556 - 30 * Math.sin(x * 0.0029 + 1.3) - 18 * Math.sin(x * 0.0077 + 0.2);
  const ridge = (x, base, amp, freq, seed) => base - amp * (0.6 * Math.abs(Math.sin(x * freq + seed)) +
    0.28 * Math.sin(x * freq * 2.3 + seed * 2) + 0.12 * Math.sin(x * freq * 5.1 + seed));
  const RANGE1: [number, number, number, number] = [455, 150, 0.0032, 1];
  const RANGE2: [number, number, number, number] = [500, 120, 0.0045, 4];
  const CASTLE_X = 760;

  function scatter(f, spacing, make) {
    const out = [];
    const span = WORLD_W * f + 3200;
    for (let x = -300; x < span; x += spacing * (0.6 + R() * 0.8)) out.push(make(x));
    return out;
  }

  function buildArt() {
    ART.clouds = [0, 1, 2, 3].map(() => sprite(280, 120, 0.5, 2, g => drawCloud(g, 280, 120, R)));
    ART.castle = sprite(300, 290, 0.9, 0.8, g => drawCastle(g, 300, 290, CASTLE_PAL));
    ART.far = [];
    for (let i = 0; i < 9; i++) {
      const p = PAL.far[i % PAL.far.length], pine = i % 3 === 2;
      ART.far.push(sprite(130, 210, 0.45, 1.6, g => (pine ? drawPine : drawRoundTree)(g, 130, 210, p, R)));
    }
    ART.mid = [];
    for (let i = 0; i < 10; i++) {
      const pine = i % 4 === 3, p = pine ? PAL.mid[2] : PAL.mid[i % PAL.mid.length];
      ART.mid.push(sprite(230, 400, 0.6, 0.9, g => (pine ? drawPine : drawRoundTree)(g, 230, 400, p, R)));
    }
    ART.near = [0, 1, 2].map(i => sprite(360, 1000, 0.6, 0.5, g => drawTallTree(g, 360, 1000, PAL.near[i], R)));
    ART.bush = [0, 1, 2, 3, 4].map(i => sprite(200, 110, 0.7, 0.4, g => drawBush(g, 200, 110, PAL.bushBack, R, i % 2 === 0)));
    ART.playBush = [0, 1, 2, 3].map(() => sprite(220, 130, 1, 0, g => drawBush(g, 220, 130, PAL.bushPlay, R, true)));
    ART.fern = [0, 1].map(() => sprite(200, 120, 1, 0, g => drawFern(g, 200, 120, '#3f9a55', R)));
    ART.fgGrass = [0, 1, 2].map(() => sprite(320, 180, 0.3, 4, g => drawGrassClump(g, 320, 180, '#1f5a3a', R)));
    ART.fgLeaf = [0, 1].map(() => sprite(320, 240, 0.3, 4, g => drawBigLeaf(g, 320, 240, '#23663f', R)));
    ART.hang = [0, 1].map(() => sprite(150, 320, 0.3, 4, g => drawHangingVine(g, 150, 320, '#24603f', R)));

    LAYER.clouds = Array.from({ length: 9 }, (_, i) => ({ x: i * 380 + R() * 200, y: 30 + R() * 230, s: pick(R, ART.clouds), k: 0.6 + R() * 0.8, drift: 5 + R() * 8 }));
    LAYER.far = scatter(0.3, 52, x => ({ x, y: farHillY(x) + 14, s: pick(R, ART.far), k: 0.55 + R() * 0.6 })).sort((a, b) => a.k - b.k);
    LAYER.mid = scatter(0.55, 120, x => ({ x, y: midHillY(x) + 18, s: pick(R, ART.mid), k: 0.6 + R() * 0.5 })).sort((a, b) => a.k - b.k);
    LAYER.near = scatter(0.8, 760, x => ({ x, y: 690, s: pick(R, ART.near), k: 0.85 + R() * 0.25 }));
    LAYER.back = scatter(0.9, 110, x => ({ x, y: backHillY(x) + 22, s: pick(R, ART.bush), k: 0.6 + R() * 0.6 }));
    LAYER.fg = scatter(1.35, 520, x => ({ x, y: 772, s: R() < 0.6 ? pick(R, ART.fgGrass) : pick(R, ART.fgLeaf), k: 0.5 + R() * 0.35 }));
    LAYER.hang = scatter(1.25, 1400, x => ({ x, y: 0, s: pick(R, ART.hang), k: 0.7 + R() * 0.4, ay: 0 }));
    LAYER.butterflies = Array.from({ length: 12 }, () => ({
      x: R() * (WORLD_W * 0.75 + 2000), y: 250 + R() * 220, ph: R() * TAU, s: 0.7 + R() * 0.5,
      col: pick(R, ['#ffb3d9', '#ffe08a', '#b8a6ff', '#9fe3ff', '#ffc39e']),
    }));
    LAYER.motes = Array.from({ length: 46 }, () => ({ x: R() * 2400, y: R() * 1200, r: 1 + R() * 2.2, ph: R() * TAU, sp: 4 + R() * 10 }));
  }
  buildArt();

  // -------------------------------------------------------------- state ----
  const level = buildLevel();
  for (const b of level.playBushes) b.s = b.fern ? ART.fern[b.i % 2] : ART.playBush[b.i % 4];
  const total = level.flowers.length;
  const player: any = {};
  const great = { open: 0 };
  const hints = { walked: false, flew: false, walkA: 0, flyA: 0 };
  const input = { left: false, right: false, fly: false };
  let state = 'title', time = 0, camX = 0, camY = 0;
  let collected = 0, arrived = 0, jarFill = 0, jarPulse = 0, finaleT = 0, endShown = false, rainbowA = 0;
  let particles: any[] = [], hudBits: any[] = [], confetti: any[] = [];
  let sunX = 0, sunScreenY = 0;

  function reset() {
    Object.assign(player, {
      x: 200, y: groundY(200), vx: 0, vy: 0, face: 1, grounded: true, on: null, energy: 1,
      flying: false, flyHeld: false, wingT: 0, walkT: 0, sq: 0, sqV: 0,
    });
    for (const f of level.flowers) { f.visited = false; f.open = 0.45; f.openV = 0; f.wiggle = 0; }
    collected = 0; arrived = 0; jarFill = 0; jarPulse = 0;
    particles = []; hudBits = []; confetti = [];
    great.open = 0; finaleT = 0; endShown = false; rainbowA = 0;
    hints.walked = false; hints.flew = false;
    camX = 0; camY = camRest;
  }
  reset();

  // -------------------------------------------------------------- input ----
  const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'fly', ArrowUp: 'fly', KeyW: 'fly' };
  window.addEventListener('keydown', e => {
    const k = KEYS[e.code];
    if (k) { input[k] = true; e.preventDefault(); }
    if (state === 'title' && (e.code === 'Enter' || e.code === 'Space')) startGame();
    else if (state === 'finale' && endShown && e.code === 'Enter') playAgain();
  });
  window.addEventListener('keyup', e => { const k = KEYS[e.code]; if (k) input[k] = false; });
  window.addEventListener('blur', () => { input.left = input.right = input.fly = false; });

  document.querySelectorAll<HTMLButtonElement>('#touch button').forEach(btn => {
    const k = btn.dataset.k;
    const on = e => { e.preventDefault(); input[k] = true; btn.classList.add('down'); Sound.init(); };
    const off = e => { e.preventDefault(); input[k] = false; btn.classList.remove('down'); };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('pointercancel', off);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  });

  const $ = id => document.getElementById(id);
  const muteBtn = $('mute');
  const syncMute = () => muteBtn.classList.toggle('off', Sound.muted);
  syncMute();
  muteBtn.addEventListener('click', () => { Sound.init(); Sound.setMuted(!Sound.muted); syncMute(); muteBtn.blur(); });
  $('play').addEventListener('click', startGame);
  $('again').addEventListener('click', playAgain);

  function startGame() {
    if (state !== 'title') return;
    Sound.init(); Sound.startAmbient();
    $('title').classList.remove('show');
    if (IS_TOUCH) $('touch').classList.add('show');
    state = 'play';
  }
  function playAgain() {
    $('end').classList.remove('show');
    reset();
    state = 'play';
  }
  function showEnd() {
    endShown = true;
    $('endCount').textContent = `${collected} / ${total}`;
    $('endMsg').textContent = collected === total
      ? 'You woke up every single flower!'
      : 'Some sleepy flowers are still waiting for you.';
    $('end').classList.add('show');
  }

  // ------------------------------------------------------------- update ----
  function spawn(o) {
    particles.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, life: 1, max: 1, size: 3, color: '#fff', kind: 'spark', g: 0, rot: 0, vr: 0, drag: 1 }, o));
  }

  function flowerHead(f) {
    const by = f.on ? f.on.y + f.on.sag : f.by;
    const sway = Math.sin(time * 1.2 + f.phase) * 0.06 + Math.sin(time * 9) * 0.2 * f.wiggle * f.wiggle;
    return { x: f.x + Math.sin(sway) * f.h, y: by - Math.cos(sway) * f.h, by, sway };
  }

  function visit(f, hp) {
    f.visited = true; f.openV += 5; f.wiggle = 1;
    collected++;
    Sound.collect(collected);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU, sp = 60 + Math.random() * 90;
      spawn({ x: hp.x, y: hp.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30, life: 0.9, max: 0.9, size: 3 + Math.random() * 3, color: i % 2 ? '#fff3a8' : '#ffd166', drag: 2.5, rot: Math.random() * TAU, vr: 3 });
    }
    const sx = hp.x - camX, sy = hp.y - camY;
    for (let i = 0; i < 5; i++) {
      hudBits.push({ sx, sy, cx: sx + (Math.random() - 0.5) * 240, cy: sy - 120 - Math.random() * 160, t: -i * 0.07, dur: 0.85 + Math.random() * 0.25 });
    }
  }

  function updatePlayer(dt) {
    const p = player;
    const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (dir) p.face = dir;
    p.vx = damp(p.vx, dir * (p.grounded ? 200 : 240), p.grounded ? 9 : 3.5, dt);

    const fly = input.fly;
    if (fly && !p.flyHeld && p.grounded) {
      p.vy = -340; p.grounded = false; p.on = null; p.sqV -= 1.2;
      hints.flew = true;
      Sound.whoosh();
    }
    if (!p.grounded && fly) {
      if (p.energy > 0) {
        if (p.vy > -230) p.vy = Math.max(-230, p.vy - 1700 * dt);
        p.energy = Math.max(0, p.energy - dt / 2.6);
      } else {
        p.vy = Math.min(65, p.vy + 600 * dt); // out of wing-power: gentle glide
      }
      p.flying = true;
    } else {
      p.vy += 1000 * dt;
      p.flying = false;
    }
    if (p.vy > 380) p.vy = 380;
    p.flyHeld = fly;

    const prevY = p.y, wasGrounded = p.grounded, prevOn = p.on, landV = p.vy;
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.x < 30) { p.x = 30; p.vx = 0; }
    if (p.x > WORLD_W - 30) { p.x = WORLD_W - 30; p.vx = 0; }
    if (p.y < -330) { p.y = -330; if (p.vy < 0) p.vy = 0; }

    p.grounded = false; p.on = null;
    let bounced = false;
    if (p.vy >= 0) {
      for (const pl of level.platforms) {
        if (p.x < pl.x + pl.pad || p.x > pl.x + pl.w - pl.pad) continue;
        const top = pl.y + pl.sag;
        if (prevOn === pl || (prevY <= top + 4 && p.y >= top)) {
          p.y = top;
          if (pl.type === 'mushroom') {
            p.vy = -780; pl.sagV += 300; p.sqV += 2.2; bounced = true;
            Sound.boing();
            for (let i = 0; i < 10; i++) spawn({ x: p.x + (Math.random() - 0.5) * 50, y: top, vx: (Math.random() - 0.5) * 120, vy: -60 - Math.random() * 80, life: 0.8, max: 0.8, size: 3, color: '#ffffff', drag: 2 });
          } else {
            if (prevOn !== pl) { pl.sagV += Math.min(landV, 400) * 0.5; landFx(landV); }
            p.vy = 0; p.grounded = true; p.on = pl;
          }
          break;
        }
      }
    }
    if (!p.on && !bounced) {
      const gy = groundY(p.x);
      if (p.y >= gy || (wasGrounded && !prevOn && p.vy >= 0 && p.y > gy - 14)) {
        if (!wasGrounded) landFx(landV);
        p.y = gy; p.vy = 0; p.grounded = true;
      }
    }

    if (p.grounded) p.energy = Math.min(1, p.energy + dt * 1.5);
    if (p.grounded && Math.abs(p.vx) > 15) p.walkT += dt * Math.abs(p.vx) / 22;
    p.wingT += dt * (p.flying ? (p.energy > 0 ? 22 : 9) : p.grounded ? 2.5 : 8);
    if (Math.abs(p.x - 200) > 130) hints.walked = true;

    if (p.flying && p.energy > 0 && Math.random() < 0.7) {
      spawn({ x: p.x - p.face * (14 + Math.random() * 20), y: p.y - 50 + (Math.random() - 0.5) * 30, vx: -p.face * 20, vy: 25, life: 0.9, max: 0.9, size: 2 + Math.random() * 2.5, color: pick(Math.random, ['#fff3a8', '#ffc4ec', '#ffffff']), rot: Math.random() * TAU, vr: 2 });
    }

    const cx = p.x, cy = p.y - 45;
    for (const f of level.flowers) {
      if (f.visited || Math.abs(f.x - cx) > 120) continue;
      const hp = flowerHead(f);
      const dx = hp.x - cx, dy = hp.y - cy;
      if (dx * dx + dy * dy < 58 * 58) visit(f, hp);
    }

    if (Math.abs(p.x - GREAT_X) < 100) startFinale();
  }

  function landFx(v) {
    if (v < 220) return;
    const p = player;
    p.sqV += Math.min(v, 400) * 0.006;
    Sound.land();
    for (let i = 0; i < 8; i++) {
      const s = i < 4 ? -1 : 1;
      spawn({ kind: 'dust', x: p.x + s * 6, y: p.y - 2, vx: s * (40 + Math.random() * 60), vy: -20 - Math.random() * 30, life: 0.6, max: 0.6, size: 4 + Math.random() * 3, color: 'rgba(255,255,255,0.8)', drag: 3 });
    }
  }

  function startFinale() {
    state = 'finale'; finaleT = 0;
    Sound.finale();
    $('touch').classList.remove('show');
  }

  function updateFinale(dt) {
    finaleT += dt;
    const p = player, by = groundY(GREAT_X);
    p.x = damp(p.x, GREAT_X - 150, 1.6, dt);
    p.y = damp(p.y, by - 190 + Math.sin(time * 2) * 8, 1.6, dt);
    p.face = 1; p.flying = true; p.grounded = false; p.energy = 1;
    p.wingT += dt * 14;
    great.open = ease(clamp((finaleT - 0.4) / 2.4, 0, 1));
    rainbowA = clamp((finaleT - 1.2) / 2, 0, 1);
    const head = { x: GREAT_X, y: by - 230 };
    if (finaleT > 0.6 && finaleT < 4.5 && Math.random() < 0.5) {
      const a = Math.random() * TAU, sp = 80 + Math.random() * 140;
      spawn({ x: head.x, y: head.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1.2, max: 1.2, size: 3 + Math.random() * 4, color: pick(Math.random, ['#fff3a8', '#ffd166', '#ffffff', '#ffc4ec']), drag: 1.5, rot: Math.random() * TAU, vr: 3 });
    }
    const confettiRate = finaleT < 5 ? 0.8 : 0.15;
    if (finaleT > 0.8 && Math.random() < confettiRate) {
      confetti.push({ x: Math.random() * viewW, y: -20, vy: 50 + Math.random() * 70, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 4, size: 6 + Math.random() * 6, sway: Math.random() * TAU, col: pick(Math.random, ['#ff8fc7', '#ffd166', '#c3aaff', '#86dcff', '#ffffff', '#ffa585']) });
    }
    if (finaleT > 3.4 && !endShown) showEnd();
  }

  function update(dt) {
    time += dt;
    if (state === 'play') updatePlayer(dt);
    else if (state === 'finale') updateFinale(dt);
    else player.wingT += dt * 2.5;

    const p = player;
    p.sqV += (-p.sq * 260 - p.sqV * 16) * dt;
    p.sq = clamp(p.sq + p.sqV * dt, -0.25, 0.3);

    for (const pl of level.platforms) {
      pl.sagV += (-pl.sag * 90 - pl.sagV * 9) * dt;
      pl.sag += pl.sagV * dt;
    }
    for (const f of level.flowers) {
      const target = f.visited ? 1 : 0.45;
      f.openV += ((target - f.open) * 140 - f.openV * 10) * dt;
      f.open += f.openV * dt;
      f.wiggle = Math.max(0, f.wiggle - dt * 0.8);
    }

    const tx = clamp(p.x - viewW * 0.42 + p.face * viewW * 0.08, 0, Math.max(0, WORLD_W - viewW));
    camX = damp(camX, tx, 3, dt);
    camY = damp(camY, clamp(p.y - viewH * 0.55, -360, camRest), 2.5, dt);

    for (const q of particles) {
      q.life -= dt;
      const dr = Math.exp(-q.drag * dt);
      q.vx *= dr; q.vy *= dr;
      q.vy += q.g * dt;
      q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
    }
    particles = particles.filter(q => q.life > 0);

    for (const b of hudBits) {
      b.t += dt;
      if (b.t >= b.dur && !b.done) { b.done = true; arrived += 0.2; jarPulse = 1; }
    }
    hudBits = hudBits.filter(b => !b.done);
    jarFill = damp(jarFill, arrived / total, 6, dt);
    jarPulse = Math.max(0, jarPulse - dt * 2.5);

    for (const c of confetti) { c.y += c.vy * dt; c.rot += c.vr * dt; c.sway += dt * 1.5; c.x += Math.sin(c.sway) * 30 * dt; }
    confetti = confetti.filter(c => c.y < viewH + 30);

    hints.walkA = damp(hints.walkA, state === 'play' && !hints.walked ? 1 : 0, 4, dt);
    hints.flyA = damp(hints.flyA, state === 'play' && hints.walked && !hints.flew ? 1 : 0, 4, dt);
  }

  // ------------------------------------------------------- render utils ----
  function layer(f, fy) {
    const oy = camRest + (camY - camRest) * fy;
    ctx.setTransform(scale, 0, 0, scale, -camX * f * scale, -oy * scale);
    return oy;
  }
  function screenSpace() { ctx.setTransform(scale, 0, 0, scale, 0, 0); }
  const visible = (a, b) => b > camX && a < camX + viewW;

  function drawItems(items, f, fy, yOff = 0) {
    layer(f, fy);
    const l = camX * f, r = l + viewW;
    for (const it of items) {
      const hw = (it.s.w * 0.5 + it.s.pad) * it.k;
      if (it.x + hw < l || it.x - hw > r) continue;
      drawSprite(ctx, it.s, it.x, it.y + yOff, it.k, 0.5, it.ay === undefined ? 1 : it.ay);
    }
  }

  function fillProfile(f, fy, fn, c0, c1, y0 = 430, y1 = 720) {
    const oy = layer(f, fy);
    // snap samples to a fixed grid so the outline doesn't wobble while scrolling
    const x0 = Math.floor((camX * f - 20) / 14) * 14, x1 = camX * f + viewW + 34, bottom = oy + viewH + 20;
    ctx.beginPath(); ctx.moveTo(x0, bottom);
    for (let x = x0; x <= x1; x += 14) ctx.lineTo(x, fn(x));
    ctx.lineTo(x1, fn(x1)); ctx.lineTo(x1, bottom); ctx.closePath();
    const g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, c0); g.addColorStop(1, c1);
    ctx.fillStyle = g; ctx.fill();
    return g;
  }

  function haze(a) {
    screenSpace();
    const g = ctx.createLinearGradient(0, 0, 0, viewH);
    g.addColorStop(0, 'rgba(236,246,255,0)');
    g.addColorStop(0.5, `rgba(236,246,255,${a * 0.5})`);
    g.addColorStop(1, `rgba(255,238,236,${a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, viewW, viewH);
  }

  function star(x, y, r, rot) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = rot + i * Math.PI / 4, rr2 = i % 2 ? r * 0.32 : r;
      ctx.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2);
    }
    ctx.closePath(); ctx.fill();
  }

  function glow(x, y, r, color, a) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace('A', String(a))); g.addColorStop(1, color.replace('A', '0'));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  function leafShape(x, y, len, wid, ang, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.5, -wid, len, 0);
    ctx.quadraticCurveTo(len * 0.5, wid, 0, 0);
    ctx.fill(); ctx.restore();
  }

  // ------------------------------------------------------- backgrounds ----
  function drawSky() {
    const oy = layer(0, 0.06);
    const g = ctx.createLinearGradient(0, -500, 0, 700);
    g.addColorStop(0, '#4fa9ea'); g.addColorStop(0.42, '#8fd0fa'); g.addColorStop(0.7, '#cdeefc');
    g.addColorStop(0.86, '#ffe9d2'); g.addColorStop(1, '#ffd5df');
    ctx.fillStyle = g; ctx.fillRect(-10, oy - 10, viewW + 20, viewH + 20);
    sunX = viewW * 0.8;
    const sunY = 105;
    const sg = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 440);
    sg.addColorStop(0, 'rgba(255,255,245,1)'); sg.addColorStop(0.07, 'rgba(255,252,228,0.95)');
    sg.addColorStop(0.2, 'rgba(255,240,200,0.45)'); sg.addColorStop(1, 'rgba(255,236,200,0)');
    ctx.fillStyle = sg; ctx.fillRect(sunX - 440, sunY - 440, 880, 880);
    sunScreenY = sunY - oy;
  }

  function drawRainbow() {
    if (rainbowA <= 0) return;
    screenSpace();
    const cx = viewW * 0.55, cy = viewH * 0.98, r0 = Math.min(viewW * 0.42, 600);
    const cols = ['#ff7b9c', '#ffb36b', '#ffe36e', '#8fe388', '#7cc8ff', '#b39bff'];
    ctx.save(); ctx.globalAlpha = rainbowA * 0.55; ctx.lineWidth = 16;
    cols.forEach((c, i) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.arc(cx, cy, r0 - i * 15, Math.PI, 0); ctx.stroke(); });
    ctx.restore();
  }

  function drawClouds() {
    layer(0, 0.08);
    const span = Math.max(viewW + 700, 3400);
    for (const c of LAYER.clouds) {
      const x = mod(c.x + time * c.drift - camX * 0.04, span) - 350;
      drawSprite(ctx, c.s, x, c.y, c.k, 0.5, 0.5);
    }
  }

  function drawMountains() {
    fillProfile(0.07, 0.1, x => ridge(x, ...RANGE1), '#bdb6ea', '#efe3f6', 300, 560);
    const g = fillProfile(0.13, 0.15, x => ridge(x, ...RANGE2), '#a3c4ea', '#e2eef8', 360, 600);
    // fairy-tale castle on the second range
    const cy = ridge(CASTLE_X, ...RANGE2) + 22;
    drawSprite(ctx, ART.castle, CASTLE_X, cy, 0.85, 0.5, 1);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(CASTLE_X, cy + 8, 150, 26, 0, 0, TAU); ctx.fill();
  }

  function drawRays() {
    screenSpace();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const ox = sunX, oy = sunScreenY;
    for (let i = 0; i < 6; i++) {
      const a = 1.95 + i * 0.13 + Math.sin(time * 0.07 + i) * 0.03;
      const len = 1600, w0 = 8, w1 = 60 + (i % 3) * 45;
      const alpha = 0.05 + 0.035 * Math.sin(time * 0.35 + i * 1.7);
      const dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx;
      const g = ctx.createLinearGradient(ox, oy, ox + dx * len, oy + dy * len);
      g.addColorStop(0, `rgba(255,246,210,${alpha * 1.6})`);
      g.addColorStop(0.5, `rgba(255,240,200,${alpha})`);
      g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.fillStyle = g; ctx.beginPath();
      ctx.moveTo(ox + nx * w0, oy + ny * w0); ctx.lineTo(ox - nx * w0, oy - ny * w0);
      ctx.lineTo(ox + dx * len - nx * w1, oy + dy * len - ny * w1);
      ctx.lineTo(ox + dx * len + nx * w1, oy + dy * len + ny * w1);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawBgButterflies() {
    layer(0.75, 0.7);
    const l = camX * 0.75;
    for (const b of LAYER.butterflies) {
      const x = b.x + Math.sin(time * 0.23 + b.ph) * 160;
      const y = b.y + Math.sin(time * 0.8 + b.ph) * 35 + Math.sin(time * 2.3 + b.ph) * 8;
      if (x < l - 40 || x > l + viewW + 40) continue;
      const flap = Math.abs(Math.sin(time * 9 + b.ph));
      ctx.save(); ctx.translate(x, y); ctx.scale(b.s, b.s); ctx.globalAlpha = 0.85;
      ctx.save(); ctx.scale(0.25 + 0.75 * flap, 1); ctx.fillStyle = b.col;
      ctx.beginPath(); ctx.ellipse(-7, -4, 7, 5.5, -0.6, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(7, -4, 7, 5.5, 0.6, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-5, 4, 4.5, 3.5, 0.5, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(5, 4, 4.5, 3.5, -0.5, 0, TAU); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#6b4d7d'; ctx.fillRect(-1, -7, 2, 13);
      ctx.restore();
    }
  }

  // --------------------------------------------------------- play layer ----
  function drawBigTree() {
    const x = TREE_X;
    if (!visible(x - 460, x + 460)) return;
    const gy = groundY(x);
    const g = ctx.createLinearGradient(x - 90, 0, x + 90, 0);
    g.addColorStop(0, '#6e4636'); g.addColorStop(0.55, '#8d5d43'); g.addColorStop(1, '#b8825c');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x - 150, gy + 24);
    ctx.quadraticCurveTo(x - 72, gy - 10, x - 66, gy - 150);
    ctx.bezierCurveTo(x - 60, gy - 320, x - 80, -100, x - 70, -420);
    ctx.lineTo(x + 70, -420);
    ctx.bezierCurveTo(x + 80, -100, x + 60, gy - 320, x + 66, gy - 150);
    ctx.quadraticCurveTo(x + 72, gy - 10, x + 155, gy + 24);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(70,40,30,0.3)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (const b of level.bark) {
      ctx.beginPath(); ctx.moveTo(x + b.dx, gy - 90);
      ctx.bezierCurveTo(x + b.dx + 10, gy - 260, x + b.dx - 12, 100, x + b.dx * 0.8, -300);
      ctx.stroke();
    }
    // round fairy door
    const dw = 48, dh = 80, dy = gy - 2;
    ctx.fillStyle = '#5a3426';
    ctx.beginPath(); ctx.moveTo(x - dw / 2 - 6, dy); ctx.lineTo(x - dw / 2 - 6, dy - dh + dw / 2); ctx.arc(x, dy - dh + dw / 2, dw / 2 + 6, Math.PI, 0); ctx.lineTo(x + dw / 2 + 6, dy); ctx.fill();
    ctx.fillStyle = '#9a5e3c';
    ctx.beginPath(); ctx.moveTo(x - dw / 2, dy); ctx.lineTo(x - dw / 2, dy - dh + dw / 2); ctx.arc(x, dy - dh + dw / 2, dw / 2, Math.PI, 0); ctx.lineTo(x + dw / 2, dy); ctx.fill();
    ctx.strokeStyle = 'rgba(60,30,20,0.35)'; ctx.lineWidth = 2;
    for (const ox of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(x + ox, dy); ctx.lineTo(x + ox, dy - dh + 8); ctx.stroke(); }
    ctx.fillStyle = '#ffd76a'; circle(ctx, x + 14, dy - 36, 3.5);
    // glowing window + lantern
    const wx = x + 18, wy = gy - 160;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(wx, wy, 50, 'rgba(255,214,120,A)', 0.5);
    glow(x - 44, gy - 78, 40, 'rgba(255,214,120,A)', 0.55 + 0.1 * Math.sin(time * 3));
    ctx.restore();
    ctx.fillStyle = '#ffe39a'; circle(ctx, wx, wy, 14);
    ctx.strokeStyle = '#5a3426'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(wx, wy, 14, 0, TAU); ctx.stroke();
    ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(wx - 14, wy); ctx.lineTo(wx + 14, wy); ctx.moveTo(wx, wy - 14); ctx.lineTo(wx, wy + 14); ctx.stroke();
    ctx.strokeStyle = '#4a2c20'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x - 44, gy - 108); ctx.lineTo(x - 44, gy - 90); ctx.stroke();
    ctx.fillStyle = '#ffcf6a'; rr(ctx, x - 51, gy - 90, 14, 20, 5); ctx.fill();
    ctx.fillStyle = '#7a4a2a'; ctx.fillRect(x - 53, gy - 92, 18, 4);
    // canopy
    const cols = ['#2f8a4f', '#45a85a', '#7fd06e'];
    ctx.fillStyle = cols[0]; for (const b of level.canopy) circle(ctx, b.x, b.y + b.r * 0.18, b.r);
    ctx.fillStyle = cols[1]; for (const b of level.canopy) circle(ctx, b.x + b.r * 0.06, b.y - b.r * 0.04, b.r * 0.84);
    ctx.fillStyle = cols[2]; for (const b of level.canopy) if (b.y < -150) circle(ctx, b.x + b.r * 0.25, b.y - b.r * 0.3, b.r * 0.42);
  }

  function drawPlayBushes() {
    for (const b of level.playBushes) {
      if (!visible(b.x - 150, b.x + 150)) continue;
      drawSprite(ctx, b.s, b.x, groundY(b.x) + 18, b.k);
    }
  }

  function drawGround() {
    const x0 = Math.floor((camX - 40) / 16) * 16, x1 = camX + viewW + 40, bottom = camY + viewH + 40;
    const surf = (off) => {
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 16) ctx.lineTo(x, groundY(x) + off);
    };
    ctx.beginPath(); ctx.moveTo(x0, bottom);
    for (let x = x0; x <= x1; x += 16) ctx.lineTo(x, groundY(x) + 4);
    ctx.lineTo(x1, bottom); ctx.closePath();
    const g = ctx.createLinearGradient(0, 540, 0, 760);
    g.addColorStop(0, '#b27a50'); g.addColorStop(0.5, '#8f5a42'); g.addColorStop(1, '#6e4048');
    ctx.fillStyle = g; ctx.fill();
    // pebbles in the soil
    ctx.fillStyle = 'rgba(80,45,40,0.35)';
    for (const pb of level.pebbles) {
      if (pb.x < x0 || pb.x > x1) continue;
      ctx.beginPath(); ctx.ellipse(pb.x, groundY(pb.x) + 16 + pb.d, pb.rx, pb.ry, 0, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,220,180,0.18)';
    for (const pb of level.pebbles) {
      if (pb.x < x0 || pb.x > x1) continue;
      ctx.beginPath(); ctx.ellipse(pb.x + 1, groundY(pb.x) + 14 + pb.d, pb.rx * 0.5, pb.ry * 0.4, 0, 0, TAU); ctx.fill();
    }
    // grass fringe + band
    ctx.fillStyle = '#45a847';
    for (let x = Math.floor((camX - 40) / 14) * 14; x <= x1; x += 14) { ctx.beginPath(); ctx.arc(x, groundY(x) + 12, 8 + Math.sin(x * 1.7) * 2, 0, Math.PI); ctx.fill(); }
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    surf(4); ctx.lineWidth = 18; ctx.strokeStyle = '#52b84a'; ctx.stroke();
    surf(-2); ctx.lineWidth = 6; ctx.strokeStyle = '#8fe36a'; ctx.stroke();
  }

  function drawDecor() {
    const l = camX - 30, r = camX + viewW + 30;
    for (const d of level.decor) {
      if (d.x < l || d.x > r) continue;
      const gy = groundY(d.x) + 1, s = d.s;
      switch (d.type) {
        case 'tuft': {
          const sw = Math.sin(time * 1.6 + d.ph) * 2.5 * s;
          ctx.fillStyle = d.dark ? '#3f9f45' : '#6fcf55';
          for (let i = -2; i <= 2; i++) {
            const bx = d.x + i * 3 * s, bh = (15 - Math.abs(i) * 3) * s;
            ctx.beginPath(); ctx.moveTo(bx - 2 * s, gy + 2);
            ctx.quadraticCurveTo(bx + sw * 0.4 + i, gy - bh * 0.6, bx + sw + i * 2.5, gy - bh);
            ctx.quadraticCurveTo(bx + sw * 0.4 + i + 1, gy - bh * 0.5, bx + 2 * s, gy + 2);
            ctx.fill();
          }
          break;
        }
        case 'wild': {
          const sw = Math.sin(time * 1.3 + d.ph) * 2, hh = 12 * s + 6;
          ctx.strokeStyle = '#3f9f45'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(d.x, gy + 2); ctx.quadraticCurveTo(d.x, gy - hh * 0.5, d.x + sw, gy - hh); ctx.stroke();
          ctx.fillStyle = d.col;
          for (let k = 0; k < 5; k++) circle(ctx, d.x + sw + Math.cos(k * 1.2566 + d.ph) * 2.6 * s, gy - hh + Math.sin(k * 1.2566 + d.ph) * 2.6 * s, 2 * s);
          ctx.fillStyle = '#ffe27a'; circle(ctx, d.x + sw, gy - hh, 1.3 * s);
          break;
        }
        case 'stone':
          ctx.fillStyle = '#a99fc0'; ctx.beginPath(); ctx.ellipse(d.x, gy + 3, 9 * s, 6 * s, 0, Math.PI, 0); ctx.fill();
          ctx.fillStyle = '#d4cce6'; ctx.beginPath(); ctx.ellipse(d.x + 2 * s, gy - 1 * s, 4 * s, 2.2 * s, 0, 0, TAU); ctx.fill();
          break;
        case 'clover':
          ctx.fillStyle = '#4caf50';
          for (let k = 0; k < 3; k++) circle(ctx, d.x + Math.cos(k * 2.09 - 1.57) * 3.5 * s, gy - 6 * s + Math.sin(k * 2.09 - 1.57) * 3.5 * s, 3.4 * s);
          break;
        case 'shroom':
          ctx.fillStyle = '#fff1dc'; ctx.fillRect(d.x - 1.8 * s, gy - 9 * s, 3.6 * s, 10 * s);
          ctx.fillStyle = '#ff6b7f'; ctx.beginPath(); ctx.ellipse(d.x, gy - 8 * s, 7 * s, 6 * s, 0, Math.PI, 0); ctx.fill();
          ctx.fillStyle = '#fff'; circle(ctx, d.x - 2 * s, gy - 11 * s, 1.2 * s); circle(ctx, d.x + 3 * s, gy - 10 * s, 1 * s);
          break;
      }
    }
  }

  function drawRock(pl) {
    const x = pl.x, y = pl.y + pl.sag, w = pl.w, d = w * 0.42 + 26;
    const body = new Path2D();
    body.moveTo(x - 4, y + 6);
    body.bezierCurveTo(x + w * 0.04, y + d * 0.55, x + w * 0.3, y + d * 0.85, x + w * 0.5, y + d);
    body.bezierCurveTo(x + w * 0.68, y + d * 0.8, x + w * 0.95, y + d * 0.5, x + w + 4, y + 6);
    body.closePath();
    const g = ctx.createLinearGradient(x, y, x + w, y + d);
    g.addColorStop(0, '#9c86c4'); g.addColorStop(0.5, '#b9a3dc'); g.addColorStop(1, '#d9c8f2');
    ctx.fillStyle = g; ctx.fill(body);
    const sh = ctx.createLinearGradient(0, y, 0, y + d);
    sh.addColorStop(0, 'rgba(80,60,130,0)'); sh.addColorStop(1, 'rgba(80,60,130,0.45)');
    ctx.fillStyle = sh; ctx.fill(body);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + w * 0.62, y + 10); ctx.lineTo(x + w * 0.56, y + d * 0.55); ctx.lineTo(x + w * 0.5, y + d - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + w * 0.25, y + 12); ctx.lineTo(x + w * 0.32, y + d * 0.45); ctx.stroke();
    for (const v of pl.vines) {
      const vx = x + v.u * w, sw = Math.sin(time * 1.1 + v.ph) * 5;
      ctx.strokeStyle = '#3f9a52'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(vx, y + 8); ctx.quadraticCurveTo(vx + sw * 0.5, y + 8 + v.len * 0.5, vx + sw, y + 8 + v.len); ctx.stroke();
      for (let k = 1; k <= 3; k++) {
        const s = k % 2 ? 1 : -1;
        ctx.fillStyle = '#5cbb5c';
        ctx.beginPath(); ctx.ellipse(vx + sw * k / 3 + s * 5, y + 8 + v.len * k / 3, 5, 2.6, s * 0.6, 0, TAU); ctx.fill();
      }
    }
    ctx.fillStyle = '#45a847';
    for (let gx = x; gx <= x + w; gx += 12) { ctx.beginPath(); ctx.arc(gx, y + 9, 7, 0, Math.PI); ctx.fill(); }
    ctx.fillStyle = '#52b84a'; rr(ctx, x - 8, y - 5, w + 16, 16, 8); ctx.fill();
    ctx.fillStyle = '#8fe36a'; rr(ctx, x - 4, y - 6, w + 8, 6, 3); ctx.fill();
    for (const t of pl.tufts) {
      const tx = x + t.u * w, s = t.s;
      if (t.wild) {
        ctx.fillStyle = t.col;
        for (let k = 0; k < 5; k++) circle(ctx, tx + Math.cos(k * 1.2566) * 2.4 * s, y - 9 * s + Math.sin(k * 1.2566) * 2.4 * s, 2 * s);
        ctx.fillStyle = '#ffe27a'; circle(ctx, tx, y - 9 * s, 1.3 * s);
      } else {
        ctx.fillStyle = '#6fcf55';
        for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(tx + i * 3 - 2, y); ctx.lineTo(tx + i * 4, y - (10 - Math.abs(i) * 3) * s); ctx.lineTo(tx + i * 3 + 2, y); ctx.fill(); }
      }
    }
  }

  function drawLeafPlat(pl) {
    const x = pl.x, y = pl.y + pl.sag, w = pl.w, cx = x + w * 0.45, gy = groundY(cx);
    ctx.strokeStyle = '#3e9a47'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 24, gy + 6);
    ctx.bezierCurveTo(cx - 60, gy - (gy - y) * 0.4, cx + 30, y + 60, cx, y + 8); ctx.stroke();
    const g = ctx.createLinearGradient(0, y - 12, 0, y + 18);
    g.addColorStop(0, '#9be86e'); g.addColorStop(1, '#3fa548');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x - 10, y + 2);
    ctx.quadraticCurveTo(x + w * 0.45, y - 8, x + w + 18, y - 14);
    ctx.quadraticCurveTo(x + w * 0.62, y + 26, x - 10, y + 2);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 4, y + 3); ctx.quadraticCurveTo(x + w * 0.5, y + 3, x + w + 12, y - 12); ctx.stroke();
    ctx.lineWidth = 1.4;
    for (let i = 1; i < 6; i++) {
      const u = i / 6, vx = x + u * w, vy = y + 3 - u * u * 11;
      ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx + 14, vy + 8 - u * 4); ctx.stroke();
    }
  }

  function drawMushroom(pl) {
    const cx = pl.x + pl.w / 2, gy = groundY(cx);
    const sq = clamp(pl.sag / 50, -0.25, 0.35);
    const capW = pl.w * 0.5 * (1 + sq * 0.6), capH = pl.w * 0.36 * (1 - sq);
    const top = pl.y + pl.sag * 0.35, rim = top + capH, sw = pl.w * 0.15;
    const sg = ctx.createLinearGradient(cx - sw, 0, cx + sw, 0);
    sg.addColorStop(0, '#efd6ba'); sg.addColorStop(0.6, '#fff6e6'); sg.addColorStop(1, '#ffeed8');
    ctx.fillStyle = sg; ctx.beginPath();
    ctx.moveTo(cx - sw * 1.25, gy + 8);
    ctx.quadraticCurveTo(cx - sw * 0.8, (gy + rim) / 2, cx - sw * 0.9, rim - 2);
    ctx.lineTo(cx + sw * 0.9, rim - 2);
    ctx.quadraticCurveTo(cx + sw * 0.8, (gy + rim) / 2, cx + sw * 1.25, gy + 8);
    ctx.closePath(); ctx.fill();
    if (gy - rim > 30) {
      const fy = rim + (gy - rim) * 0.42;
      ctx.fillStyle = '#5a3a3a'; circle(ctx, cx - 5, fy, 2.2); circle(ctx, cx + 5, fy, 2.2);
      ctx.strokeStyle = '#5a3a3a'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, fy + 3, 3.5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      ctx.fillStyle = 'rgba(255,130,150,0.5)'; circle(ctx, cx - 9, fy + 4, 2.6); circle(ctx, cx + 9, fy + 4, 2.6);
    }
    ctx.fillStyle = '#f2cdb8';
    ctx.beginPath(); ctx.ellipse(cx, rim, capW * 0.94, capH * 0.22, 0, 0, TAU); ctx.fill();
    const cg = ctx.createLinearGradient(cx - capW, top, cx + capW, rim);
    cg.addColorStop(0, pl.col.cap2); cg.addColorStop(0.6, pl.col.cap); cg.addColorStop(1, pl.col.cap);
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.ellipse(cx, rim, capW, capH, 0, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = pl.col.spot;
    for (const s of pl.spots) {
      const u = clamp(s.u, -0.85, 0.85);
      const sx = cx + u * capW, sy = rim - capH * Math.sqrt(1 - u * u) * s.v, sr = s.r * capW / 60;
      ctx.beginPath(); ctx.ellipse(sx, sy, sr, sr * 0.8, 0, 0, TAU); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(cx + capW * 0.35, top + capH * 0.35, capW * 0.22, capH * 0.15, -0.5, 0, TAU); ctx.fill();
  }

  function drawBranch(pl) {
    const y = pl.y + pl.sag, left = pl.side === 'left';
    const ax = TREE_X + (left ? -30 : 30), ex = left ? pl.x - 10 : pl.x + pl.w + 10, dir = left ? -1 : 1;
    const mx = (ax + ex) / 2;
    const g = ctx.createLinearGradient(0, y - 4, 0, y + 30);
    g.addColorStop(0, '#b47e58'); g.addColorStop(1, '#6e4634');
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(ax, y - 6);
    ctx.quadraticCurveTo(mx, y - 1, ex, y + 1);
    ctx.quadraticCurveTo(ex + dir * 8, y + 7, ex, y + 13);
    ctx.quadraticCurveTo(mx, y + 20, ax, y + 36);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#6cc552'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ax, y - 3); ctx.quadraticCurveTo(mx, y + 1, ex - dir * 6, y + 2); ctx.stroke();
    for (const b of pl.leaves) { ctx.fillStyle = b.c; circle(ctx, ex + b.dx * dir, y + b.dy, b.r); }
  }

  function drawPlatform(pl) {
    if (pl.type === 'rock') drawRock(pl);
    else if (pl.type === 'leaf') drawLeafPlat(pl);
    else if (pl.type === 'mushroom') drawMushroom(pl);
    else drawBranch(pl);
  }

  function drawFace(r, awake) {
    const ex = r * 0.38, ey = -r * 0.08;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6b3a2a'; ctx.lineWidth = Math.max(1, r * 0.13);
    if (awake) {
      ctx.fillStyle = '#4a2a2a';
      for (const s of [-1, 1]) circle(ctx, s * ex, ey, r * 0.15);
      ctx.fillStyle = '#fff';
      for (const s of [-1, 1]) circle(ctx, s * ex + r * 0.05, ey - r * 0.06, r * 0.06);
      ctx.beginPath(); ctx.arc(0, r * 0.12, r * 0.32, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      ctx.fillStyle = 'rgba(255,120,150,0.5)';
      for (const s of [-1, 1]) circle(ctx, s * r * 0.62, r * 0.24, r * 0.17);
    } else {
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * ex, ey - r * 0.06, r * 0.16, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
      ctx.fillStyle = '#8a4a3a'; ctx.beginPath(); ctx.ellipse(0, r * 0.36, r * 0.09, r * 0.11, 0, 0, TAU); ctx.fill();
    }
  }

  function centerDisc(r) {
    ctx.fillStyle = '#ffd34d'; circle(ctx, 0, 0, r);
    ctx.strokeStyle = '#f2a33a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; circle(ctx, r * 0.3, -r * 0.35, r * 0.3);
  }

  function drawBloom(f) {
    const o = f.open, c = f.col, awake = f.visited;
    switch (f.type) {
      case 'daisy': {
        const n = 11, L = 8 + 14 * o, W = 3.4 + 1.6 * o;
        for (let pass = 0; pass < 2; pass++) {
          ctx.fillStyle = pass ? c.p : c.d;
          for (let i = 0; i < n; i++) {
            const a = (i + (pass ? 0 : 0.5)) / n * TAU + f.phase, d = 6 + L * 0.5;
            ctx.beginPath(); ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d, L / 2, W, a, 0, TAU); ctx.fill();
          }
        }
        centerDisc(8); drawFace(8, awake);
        break;
      }
      case 'cosmos': {
        const n = 5, pr = 6 + 5 * o, d = 5 + 7 * o;
        ctx.fillStyle = c.d; for (let i = 0; i < n; i++) { const a = i / n * TAU - Math.PI / 2; circle(ctx, Math.cos(a) * d * 1.05, Math.sin(a) * d * 1.05 + 1, pr); }
        ctx.fillStyle = c.p; for (let i = 0; i < n; i++) { const a = i / n * TAU - Math.PI / 2; circle(ctx, Math.cos(a) * d, Math.sin(a) * d, pr * 0.92); }
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; for (let i = 0; i < n; i++) { const a = i / n * TAU - Math.PI / 2; circle(ctx, Math.cos(a) * d + pr * 0.25, Math.sin(a) * d - pr * 0.3, pr * 0.35); }
        centerDisc(7.5); drawFace(7.5, awake);
        break;
      }
      case 'puff': {
        ctx.fillStyle = c.d; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; circle(ctx, Math.cos(a) * (9 + 5 * o), Math.sin(a) * (9 + 5 * o), 6 + 3 * o); }
        ctx.fillStyle = c.p; for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + 0.4; circle(ctx, Math.cos(a) * (5 + 3 * o), Math.sin(a) * (5 + 3 * o), 5.5 + 2 * o); }
        centerDisc(6.5); drawFace(6.5, awake);
        break;
      }
      default: { // tulip
        const sp = 0.2 + 0.5 * o;
        ctx.fillStyle = c.d;
        for (const s of [-1, 1]) {
          ctx.save(); ctx.rotate(s * sp);
          ctx.beginPath(); ctx.moveTo(0, 6);
          ctx.bezierCurveTo(s * 14, 2, s * 12, -16, s * 2, -22);
          ctx.bezierCurveTo(-s * 2, -14, -s * 2, 0, 0, 6);
          ctx.fill(); ctx.restore();
        }
        ctx.fillStyle = c.p; ctx.beginPath(); ctx.moveTo(0, 8);
        ctx.bezierCurveTo(13, 4, 12, -14, 0, -20 + (1 - o) * 4);
        ctx.bezierCurveTo(-12, -14, -13, 4, 0, 8); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(4, -8, 3, 7, 0.2, 0, TAU); ctx.fill();
        ctx.save(); ctx.translate(0, -4); drawFace(7, awake); ctx.restore();
      }
    }
  }

  function drawFlower(f) {
    const hp = flowerHead(f), by = hp.by, sway = hp.sway;
    ctx.strokeStyle = '#3d9a45'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(f.x, by);
    ctx.quadraticCurveTo(f.x - Math.sin(sway) * f.h * 0.3, by - f.h * 0.55, hp.x, hp.y); ctx.stroke();
    leafShape(f.x, by - f.h * 0.28, 18, 6, -0.6 + sway, '#4cb04f');
    leafShape(f.x, by - f.h * 0.4, 15, 5, Math.PI + 0.6 + sway, '#45a548');
    if (!f.visited) {
      const pr = 0.5 + 0.5 * Math.sin(time * 2.2 + f.phase);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(hp.x, hp.y, 44 + 8 * pr, 'rgba(255,224,120,A)', 0.4 + 0.2 * pr);
      ctx.restore();
    }
    const droop = clamp((1 - f.open) / 0.55, 0, 1) * 0.3 * f.dside;
    ctx.save(); ctx.translate(hp.x, hp.y); ctx.rotate(sway * 1.4 + droop); ctx.scale(f.size, f.size);
    drawBloom(f);
    ctx.restore();
    if (!f.visited) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#ffe680';
      for (let i = 0; i < 3; i++) {
        const a = time * 1.6 + f.phase + i * TAU / 3;
        star(hp.x + Math.cos(a) * 26, hp.y + Math.sin(a) * 14, 3.2, time * 2 + i);
      }
      const zt = mod(time * 0.45 + f.phase, 1);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = Math.sin(zt * Math.PI) * 0.75;
      ctx.fillStyle = '#7d6bb8';
      ctx.font = `700 ${12 + zt * 6}px Fredoka, sans-serif`;
      ctx.fillText('z', hp.x + 14 + zt * 12, hp.y - 20 - zt * 24);
      ctx.restore();
    }
  }

  function drawGreat() {
    const x = GREAT_X;
    if (!visible(x - 320, x + 320)) return;
    const by = groundY(x), o = great.open, h = 230;
    const sway = Math.sin(time * 0.8) * 0.025;
    const hx = x + Math.sin(sway) * h, hy = by - Math.cos(sway) * h;
    leafShape(x, by - 40, 95, 28, -0.5, '#4fb04f');
    leafShape(x, by - 80, 82, 25, Math.PI + 0.55, '#45a548');
    leafShape(x, by - 140, 60, 18, -0.8, '#5cc05a');
    ctx.strokeStyle = '#3a9844'; ctx.lineWidth = 11; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, by + 4); ctx.quadraticCurveTo(x - 18, by - h * 0.5, hx, hy); ctx.stroke();
    const pulse = 0.5 + 0.5 * Math.sin(time * 1.8);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(hx, hy, 120 + o * 130 + pulse * 15, 'rgba(255,230,150,A)', 0.45 + 0.2 * pulse);
    ctx.restore();
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(sway);
    // sepals
    ctx.globalAlpha = 1 - o * 0.6;
    for (const s of [-1, 1]) leafShape(0, 6, 40, 12, -Math.PI / 2 + s * 0.5, '#4cb04f');
    ctx.globalAlpha = 1;
    const rings = [
      { n: 12, L: 76, W: 26, c: '#ff6fae', c2: '#ff94c4' },
      { n: 10, L: 54, W: 20, c: '#ffb0d6', c2: '#ffd2e8' },
    ];
    for (const rg of rings) {
      for (let i = 0; i < rg.n; i++) {
        const full = -Math.PI / 2 + (i / rg.n - 0.5) * TAU + (rg.n === 10 ? 0.3 : 0);
        const closed = -Math.PI / 2 + (i / (rg.n - 1) - 0.5) * 0.7;
        const a = lerp(closed, full, o), L = rg.L * (0.7 + 0.3 * o), d = 8 + L * 0.5;
        ctx.fillStyle = i % 2 ? rg.c : rg.c2;
        ctx.beginPath(); ctx.ellipse(Math.cos(a) * d, Math.sin(a) * d, L / 2, rg.W * (0.55 + 0.45 * o) / 2, a, 0, TAU); ctx.fill();
      }
    }
    if (o > 0.05) {
      ctx.save(); ctx.scale(o, o);
      centerDisc(24); drawFace(24, o > 0.6);
      ctx.restore();
    }
    ctx.restore();
    if (o < 0.05) {
      const zt = mod(time * 0.35, 1);
      ctx.save(); ctx.globalAlpha = Math.sin(zt * Math.PI) * 0.8; ctx.fillStyle = '#7d6bb8';
      ctx.font = `700 ${18 + zt * 12}px Fredoka, sans-serif`;
      ctx.fillText('z', hx + 40 + zt * 20, hy - 60 - zt * 40);
      ctx.restore();
    }
  }

  function supportY(x, y) {
    let best = groundY(x);
    for (const pl of level.platforms) {
      if (x > pl.x && x < pl.x + pl.w) {
        const t = pl.y + pl.sag;
        if (t >= y - 2 && t < best) best = t;
      }
    }
    return best;
  }

  function drawShadow() {
    const p = player, sy = supportY(p.x, p.y), k = clamp(1 - (sy - p.y) / 380, 0, 1);
    if (k <= 0.02) return;
    ctx.fillStyle = `rgba(40,30,70,${0.22 * k})`;
    ctx.beginPath(); ctx.ellipse(p.x, sy + 2, 22 * (0.5 + 0.5 * k), 6 * (0.5 + 0.5 * k), 0, 0, TAU); ctx.fill();
  }

  // -------------------------------------------------------------- fairy ----
  const WING_UP = new Path2D('M0 0 C-6 -34 -44 -64 -60 -44 C-70 -28 -44 -6 0 0Z');
  const WING_LO = new Path2D('M0 2 C-28 4 -50 24 -38 40 C-26 50 -6 26 0 2Z');

  function drawWing(ax, ay, open, far, energy, glowing) {
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(far ? -0.22 : 0.04); ctx.scale(open, 1);
    const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 66);
    if (far) { g.addColorStop(0, '#d9609f'); g.addColorStop(0.55, '#ec90bd'); g.addColorStop(1, '#f2bb7c'); }
    else { g.addColorStop(0, '#ff6fb5'); g.addColorStop(0.45, '#ffa0d2'); g.addColorStop(0.85, '#ffd28a'); g.addColorStop(1, '#fff0b0'); }
    ctx.globalAlpha = (far ? 0.75 : 0.93) * (0.65 + 0.35 * energy);
    if (glowing && !far) { ctx.shadowColor = 'rgba(255,190,240,0.95)'; ctx.shadowBlur = 18 * scale; }
    ctx.fillStyle = g; ctx.fill(WING_UP); ctx.fill(WING_LO);
    ctx.shadowBlur = 0;
    if (!far) {
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.6;
      ctx.stroke(WING_UP); ctx.stroke(WING_LO);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-28, -30, -52, -44); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-30, -14, -56, -26); ctx.moveTo(0, 2); ctx.quadraticCurveTo(-24, 18, -36, 36); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      circle(ctx, -50, -40, 4); circle(ctx, -40, -50, 2.5); circle(ctx, -58, -30, 2); circle(ctx, -32, 34, 3);
    }
    ctx.restore();
  }

  function drawFairy() {
    const p = player;
    const moving = p.grounded && Math.abs(p.vx) > 20;
    const bob = p.grounded ? (moving ? -Math.abs(Math.sin(p.walkT)) * 3 : Math.sin(time * 2) * 0.8) : Math.sin(time * 3.2) * 3;
    const glowing = p.flying && p.energy > 0;
    if (glowing || state === 'finale') {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      glow(p.x, p.y - 45 + bob, 70, 'rgba(255,200,240,A)', 0.25);
      ctx.restore();
    }
    ctx.save();
    ctx.translate(p.x, p.y + bob);
    ctx.scale(p.face * (1 + p.sq * 0.5), 1 - p.sq);
    ctx.rotate(clamp(Math.abs(p.vx) / 240, 0, 1) * (p.grounded ? 0.05 : 0.14));

    const open = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(p.wingT));
    drawWing(-6, -47, open * 0.9, true, p.energy, glowing);
    drawWing(-2, -44, open, false, p.energy, glowing);

    // legs
    const swing = moving ? Math.sin(p.walkT) * 0.6 : 0;
    ctx.lineCap = 'round'; ctx.lineWidth = 3.6;
    for (const s of [-1, 1]) {
      const a = p.grounded ? swing * s : -0.35 + s * 0.12;
      const hx = s * 2.5, fx = hx + Math.sin(a) * 16, fy = -17 + Math.cos(a) * 16;
      ctx.strokeStyle = s < 0 ? '#f2bfa0' : '#ffd2b5';
      ctx.beginPath(); ctx.moveTo(hx, -17); ctx.lineTo(fx, fy); ctx.stroke();
      ctx.fillStyle = s < 0 ? '#e8558f' : '#ff6fa8';
      ctx.beginPath(); ctx.ellipse(fx + 2, fy, 4.2, 2.8, 0, 0, TAU); ctx.fill();
    }
    // petal dress
    const flutter = p.grounded ? 0 : Math.sin(time * 14) * 1.5;
    const dg = ctx.createLinearGradient(0, -46, 0, -14);
    dg.addColorStop(0, '#6fe0c0'); dg.addColorStop(1, '#3fb79c');
    ctx.fillStyle = dg;
    ctx.beginPath(); ctx.moveTo(-6, -44); ctx.lineTo(6, -44);
    ctx.quadraticCurveTo(8, -34, 15, -17 + flutter);
    ctx.quadraticCurveTo(11, -10, 6, -15);
    ctx.quadraticCurveTo(1.5, -9, -3, -15);
    ctx.quadraticCurveTo(-9, -10, -14, -17 - flutter);
    ctx.quadraticCurveTo(-8, -34, -6, -44);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(1, -34); ctx.quadraticCurveTo(3, -24, 6, -16); ctx.moveTo(-3, -34); ctx.quadraticCurveTo(-5, -24, -3, -16); ctx.stroke();
    ctx.fillStyle = '#ffd166'; ctx.fillRect(-6.5, -37, 13, 3);
    // arm
    const armA = p.grounded ? (moving ? -Math.sin(p.walkT) * 0.5 : 0.15) : -0.7 + Math.sin(time * 6) * 0.15;
    const sx = 1, sy = -41, hx2 = sx + Math.sin(armA) * 12, hy2 = sy + Math.cos(armA) * 12;
    ctx.strokeStyle = '#ffd2b5'; ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(hx2, hy2); ctx.stroke();
    // head
    const hx = 2, hy = -58;
    ctx.fillStyle = '#8a56d1'; circle(ctx, hx - 3, hy - 1, 17.5); circle(ctx, hx - 15, hy - 12, 8.5);
    ctx.beginPath(); ctx.ellipse(hx - 14, hy + 8, 6, 11, 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffe2cc'; circle(ctx, hx, hy, 15);
    ctx.fillStyle = '#9a63e0'; ctx.beginPath();
    ctx.arc(hx - 1, hy - 1, 16.5, Math.PI * 0.95, Math.PI * 1.9);
    ctx.quadraticCurveTo(hx + 8, hy - 6, hx + 2, hy - 9);
    ctx.quadraticCurveTo(hx - 4, hy - 4, hx - 15, hy + 2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(hx - 2, hy - 13, 7, 2.5, -0.2, 0, TAU); ctx.fill();
    // hair flower
    ctx.fillStyle = '#ff8fc7';
    for (let k = 0; k < 5; k++) circle(ctx, hx - 15 + Math.cos(k * 1.2566) * 3.6, hy - 13 + Math.sin(k * 1.2566) * 3.6, 2.8);
    ctx.fillStyle = '#ffe27a'; circle(ctx, hx - 15, hy - 13, 2);
    // face
    const blink = mod(time, 4.2) < 0.13;
    for (const ex of [hx + 1.5, hx + 8.8]) {
      if (blink) {
        ctx.strokeStyle = '#3b2550'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(ex, hy + 1, 2.4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      } else {
        ctx.fillStyle = '#3b2550'; ctx.beginPath(); ctx.ellipse(ex, hy + 1, 2.4, 3.2, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff'; circle(ctx, ex + 0.8, hy - 0.4, 1);
      }
    }
    ctx.fillStyle = 'rgba(255,130,160,0.55)'; circle(ctx, hx + 11.5, hy + 6, 2.8); circle(ctx, hx - 2.5, hy + 6, 2.8);
    ctx.strokeStyle = '#c2557a'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(hx + 5.2, hy + 6, 2.6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    // antennae
    ctx.strokeStyle = '#6b4aa0'; ctx.lineWidth = 1.6;
    const aw = Math.sin(time * 3) * 1.5;
    ctx.beginPath(); ctx.moveTo(hx - 2, hy - 15); ctx.quadraticCurveTo(hx - 2, hy - 26, hx + 5 + aw, hy - 31);
    ctx.moveTo(hx + 4, hy - 14); ctx.quadraticCurveTo(hx + 7, hy - 24, hx + 14 + aw, hy - 27); ctx.stroke();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(hx + 5 + aw, hy - 31, 8, 'rgba(255,230,140,A)', 0.8);
    glow(hx + 14 + aw, hy - 27, 8, 'rgba(255,230,140,A)', 0.8);
    ctx.restore();
    ctx.fillStyle = '#ffe27a'; circle(ctx, hx + 5 + aw, hy - 31, 2.6); circle(ctx, hx + 14 + aw, hy - 27, 2.6);
    ctx.restore();

    // wing-power pips
    if (state === 'play' && p.energy < 0.999) {
      const n = 5, e = p.energy * n;
      for (let i = 0; i < n; i++) {
        const fill = clamp(e - i, 0, 1), x = p.x - 16 + i * 8, y = p.y + bob - 106;
        ctx.fillStyle = 'rgba(255,255,255,0.45)'; circle(ctx, x, y, 2.8);
        if (fill > 0) {
          ctx.save(); ctx.globalAlpha = fill; ctx.globalCompositeOperation = 'lighter';
          glow(x, y, 9, 'rgba(255,220,120,A)', 0.9);
          ctx.restore();
          ctx.globalAlpha = fill; ctx.fillStyle = '#ffd84a'; circle(ctx, x, y, 2.8); ctx.globalAlpha = 1;
        }
      }
    }
  }

  function drawParticles() {
    for (const q of particles) {
      if (q.kind !== 'dust') continue;
      ctx.globalAlpha = clamp(q.life / q.max, 0, 1) * 0.8; ctx.fillStyle = q.color;
      circle(ctx, q.x, q.y, q.size * (1.4 - q.life / q.max * 0.6));
    }
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const q of particles) {
      if (q.kind === 'dust') continue;
      const a = clamp(q.life / q.max, 0, 1);
      ctx.globalAlpha = a; ctx.fillStyle = q.color;
      star(q.x, q.y, q.size * (0.6 + 0.4 * a), q.rot);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawKey(x, y, w, label) {
    ctx.fillStyle = '#c9b8f0'; rr(ctx, x, y + 3, w, 34, 9); ctx.fill();
    ctx.fillStyle = '#f3ecff'; rr(ctx, x, y, w, 34, 9); ctx.fill();
    ctx.fillStyle = '#6a4bb0';
    if (label === 'left' || label === 'right') {
      const cx = x + w / 2, cy = y + 17, s = label === 'left' ? -1 : 1;
      ctx.beginPath(); ctx.moveTo(cx + s * 7, cy); ctx.lineTo(cx - s * 5, cy - 8); ctx.lineTo(cx - s * 5, cy + 8); ctx.closePath(); ctx.fill();
    } else if (label === 'wing') {
      ctx.save(); ctx.translate(x + w / 2, y + 17); ctx.fillStyle = '#ff8fc7';
      ctx.beginPath(); ctx.ellipse(-6, -3, 6, 5, -0.6, 0, TAU); ctx.ellipse(6, -3, 6, 5, 0.6, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-4, 5, 4, 3, 0.5, 0, TAU); ctx.ellipse(4, 5, 4, 3, -0.5, 0, TAU); ctx.fill();
      ctx.fillStyle = '#6a4bb0'; ctx.fillRect(-1, -7, 2, 15);
      ctx.restore();
    } else {
      ctx.font = '700 15px Fredoka, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + 18);
    }
  }

  function drawHintBubble(a, keys) {
    if (a < 0.02) return;
    const p = player, gap = 8, pad = 12;
    const tw = keys.reduce((s, k) => s + k.w, 0) + gap * (keys.length - 1) + pad * 2, th = 54;
    const x = p.x, y = p.y - 150 + Math.sin(time * 2) * 3;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    rr(ctx, x - tw / 2, y - th / 2, tw, th, 20); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 9, y + th / 2 - 1); ctx.lineTo(x, y + th / 2 + 11); ctx.lineTo(x + 9, y + th / 2 - 1); ctx.fill();
    let kx = x - tw / 2 + pad;
    for (const k of keys) { drawKey(kx, y - 19, k.w, k.label); kx += k.w + gap; }
    ctx.restore();
  }

  function drawHints() {
    drawHintBubble(hints.walkA, [{ w: 40, label: 'left' }, { w: 40, label: 'right' }]);
    drawHintBubble(hints.flyA, IS_TOUCH ? [{ w: 52, label: 'wing' }] : [{ w: 92, label: 'SPACE' }, { w: 40, label: 'wing' }]);
  }

  // --------------------------------------------------- overlays & HUD ----
  function drawMotes() {
    screenSpace();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const wx = viewW + 80, wy = viewH + 80;
    for (const m of LAYER.motes) {
      const x = mod(m.x - camX * 1.1 + time * m.sp, wx) - 40;
      const y = mod(m.y - (camY - camRest) * 1.1 + Math.sin(time * 0.5 + m.ph) * 20, wy) - 40;
      const a = 0.35 + 0.35 * Math.sin(time * 1.3 + m.ph);
      glow(x, y, m.r * 5, 'rgba(255,248,200,A)', a * 0.6);
      ctx.fillStyle = `rgba(255,255,230,${a})`; circle(ctx, x, y, m.r);
    }
    ctx.restore();
  }

  function drawVignette() {
    screenSpace();
    const cx = viewW / 2, cy = viewH * 0.45;
    const g = ctx.createRadialGradient(cx, cy, Math.min(viewW, viewH) * 0.35, cx, cy, Math.max(viewW, viewH) * 0.75);
    g.addColorStop(0, 'rgba(70,30,100,0)'); g.addColorStop(1, 'rgba(70,30,100,0.28)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, viewW, viewH);
  }

  const JAR_X = 58, JAR_Y = 62;
  function drawHudBits() {
    screenSpace();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const b of hudBits) {
      if (b.t < 0) continue;
      const u = ease(clamp(b.t / b.dur, 0, 1)), v = 1 - u;
      const x = v * v * b.sx + 2 * v * u * b.cx + u * u * JAR_X;
      const y = v * v * b.sy + 2 * v * u * b.cy + u * u * JAR_Y;
      glow(x, y, 16, 'rgba(255,220,110,A)', 0.8);
      ctx.fillStyle = '#fff6c0'; circle(ctx, x, y, 3.5);
    }
    ctx.restore();
  }

  function drawConfetti() {
    screenSpace();
    for (const c of confetti) {
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot); ctx.scale(1, Math.abs(Math.cos(c.rot * 1.3)) * 0.8 + 0.2);
      ctx.fillStyle = c.col; ctx.beginPath(); ctx.ellipse(0, 0, c.size, c.size * 0.55, 0, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  function drawHUD() {
    if (state === 'title') return;
    screenSpace();
    const s = 1 + jarPulse * 0.14;
    ctx.save(); ctx.translate(JAR_X, JAR_Y); ctx.scale(s, s);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    glow(0, 4, 50, 'rgba(255,220,120,A)', 0.25 + jarFill * 0.35 + jarPulse * 0.3);
    ctx.restore();
    rr(ctx, -24, -24, 48, 54, 15);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill();
    ctx.save(); ctx.clip();
    const fh = 54 * clamp(jarFill, 0, 1);
    const fg = ctx.createLinearGradient(0, 30 - fh, 0, 30);
    fg.addColorStop(0, '#ffe680'); fg.addColorStop(1, '#ffb43a');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.moveTo(-26, 30);
    for (let x = -26; x <= 26; x += 4) ctx.lineTo(x, 30 - fh + Math.sin(x * 0.25 + time * 3) * (fh > 2 ? 1.6 : 0));
    ctx.lineTo(26, 30); ctx.closePath(); ctx.fill();
    ctx.restore();
    rr(ctx, -24, -24, 48, 54, 15);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; rr(ctx, -16, -16, 6, 30, 3); ctx.fill();
    ctx.fillStyle = '#c98a4b'; rr(ctx, -19, -33, 38, 11, 5); ctx.fill();
    ctx.fillStyle = '#e5a96a'; rr(ctx, -19, -33, 38, 4, 2); ctx.fill();
    ctx.restore();
    ctx.font = '700 34px Fredoka, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(110,60,140,0.55)';
    const txt = `${collected} / ${total}`;
    ctx.strokeText(txt, 98, 64); ctx.fillStyle = '#ffffff'; ctx.fillText(txt, 98, 64);
  }

  // ------------------------------------------------------------- render ----
  function render() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    drawSky();
    drawRainbow();
    drawClouds();
    drawMountains();
    haze(0.22);
    fillProfile(0.3, 0.3, farHillY, '#b5dbd3', '#d7ece6');
    drawItems(LAYER.far, 0.3, 0.3);
    haze(0.28);
    fillProfile(0.55, 0.55, midHillY, '#8ccaa0', '#b6dfc0');
    drawItems(LAYER.mid, 0.55, 0.55);
    haze(0.14);
    drawRays();
    drawItems(LAYER.near, 0.8, 0.8);
    drawBgButterflies();
    fillProfile(0.9, 0.9, backHillY, '#6fbf7a', '#4f9d68', 500, 720);
    drawItems(LAYER.back, 0.9, 0.9);

    layer(1, 1);
    drawBigTree();
    drawPlayBushes();
    drawGround();
    for (const pl of level.platforms) if (visible(pl.x - 80, pl.x + pl.w + 80)) drawPlatform(pl);
    drawDecor();
    drawGreat();
    drawShadow();
    for (const f of level.flowers) if (visible(f.x - 80, f.x + 80)) drawFlower(f);
    drawFairy();
    drawParticles();
    drawHints();

    drawItems(LAYER.fg, 1.35, 1.15);
    drawItems(LAYER.hang, 1.25, 0, camRest - 20); // pinned to screen top
    drawMotes();
    drawVignette();
    drawHudBits();
    drawConfetti();
    drawHUD();
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // debug hook for testing
  (window as any).__pf = { player, level, get state() { return state; }, input };
})();
