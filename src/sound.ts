// Gentle synthesized sounds: bells, a soft pad and a music-box melody.

export const Sound = (() => {
  let c = null, out = null, dry = null, send = null, ambient = false, muted = false;
  try { muted = localStorage.getItem('pf-muted') === '1'; } catch (e) { /* storage blocked */ }
  const VOL = 0.7;
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0];
  const CHORDS = [[130.81, 196.0, 329.63], [110.0, 164.81, 261.63], [87.31, 174.61, 220.0], [98.0, 146.83, 246.94]];

  function init() {
    if (c) { if (c.state === 'suspended') c.resume(); return; }
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    c = new AC();
    out = c.createGain(); out.gain.value = muted ? 0 : VOL; out.connect(c.destination);
    dry = c.createGain(); dry.connect(out);
    // soft echo for a dreamy feel
    send = c.createGain();
    const d = c.createDelay(1.5); d.delayTime.value = 0.34;
    const fb = c.createGain(); fb.gain.value = 0.4;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
    const wet = c.createGain(); wet.gain.value = 0.45;
    send.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(out);
  }

  function tone(freq: number, o: any = {}) {
    if (!c) return;
    const { type = 'sine', vol = 0.2, attack = 0.008, dur = 1.2, when = 0, fx = 0.5, slide = 0 } = o;
    const t = c.currentTime + when;
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(freq * slide, t + dur * 0.7);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(dry);
    if (fx) { const s = c.createGain(); s.gain.value = fx; g.connect(s); s.connect(send); }
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  function bell(f, vol = 0.14, when = 0) {
    tone(f, { vol, dur: 1.8, when });
    tone(f * 2, { vol: vol * 0.22, dur: 0.9, when });
    tone(f * 3.01, { vol: vol * 0.07, dur: 0.5, when });
  }

  let noiseBuf = null;
  function whoosh() {
    if (!c) return;
    if (!noiseBuf) {
      noiseBuf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const t = c.currentTime;
    const src = c.createBufferSource(); src.buffer = noiseBuf;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(500, t); bp.frequency.exponentialRampToValueAtTime(1800, t + 0.35);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    src.connect(bp); bp.connect(g); g.connect(dry);
    src.start(t); src.stop(t + 0.5);
    tone(1318.5, { vol: 0.025, dur: 0.6, fx: 0.6 });
  }

  function startAmbient() {
    if (!c || ambient) return;
    ambient = true;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650;
    const g = c.createGain(); g.gain.value = 0.045;
    const lfo = c.createOscillator(), lfoG = c.createGain();
    lfo.frequency.value = 0.08; lfoG.gain.value = 0.016; lfo.connect(lfoG); lfoG.connect(g.gain); lfo.start();
    lp.connect(g); g.connect(dry);
    const s = c.createGain(); s.gain.value = 0.3; g.connect(s); s.connect(send);
    const oscs = CHORDS[0].map(f => {
      const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 8;
      o.connect(lp); o.start(); return o;
    });
    let ci = 0;
    setInterval(() => {
      ci = (ci + 1) % CHORDS.length;
      oscs.forEach((o, i) => o.frequency.setTargetAtTime(CHORDS[ci][i], c.currentTime, 0.8));
    }, 7000);
    const musicBox = () => {
      if (!muted) tone(PENTA[2 + Math.floor(Math.random() * 7)], { vol: 0.03, dur: 2.2, fx: 0.7 });
      setTimeout(musicBox, 1600 + Math.random() * 2600);
    };
    setTimeout(musicBox, 1500);
  }

  return {
    init, startAmbient, whoosh,
    get muted() { return muted; },
    collect(n) {
      const i = (n - 1) % 7;
      bell(PENTA[i], 0.13); bell(PENTA[i + 2], 0.07, 0.1); bell(PENTA[i + 3], 0.05, 0.2);
    },
    boing() { tone(200, { vol: 0.16, dur: 0.5, slide: 2.8, fx: 0.2 }); tone(400, { vol: 0.04, dur: 0.4, slide: 2.2, fx: 0.2 }); },
    land() { tone(170, { vol: 0.05, dur: 0.22, slide: 0.6, fx: 0 }); },
    finale() {
      PENTA.forEach((f, i) => bell(f, 0.1, i * 0.12));
      [523.25, 659.25, 783.99, 1046.5].forEach(f => bell(f, 0.08, 1.4));
    },
    setMuted(m) {
      muted = m;
      try { localStorage.setItem('pf-muted', m ? '1' : '0'); } catch (e) { /* storage blocked */ }
      if (out) out.gain.setTargetAtTime(m ? 0 : VOL, c.currentTime, 0.05);
    },
  };
})();
