import { MixPot, Palette, PaleButterfly } from '../../entities/garden';
import { win } from '../../game/world';
import type { Entity, LevelDef } from '../../game/types';

// 3-3 Colour Mix — mix two paints to make orange, green and purple for the butterflies.

export const l3_03: LevelDef = {
  id: '3-3', name: 'Colour Mix', icon: '🎨', theme: 'summer',
  worldW: 3000, seed: 3303, startX: 220,
  ground: x => 598 - 24 * Math.sin(x * 0.0024 + 0.5) - 12 * Math.sin(x * 0.0062 + 1.7) - 5 * Math.sin(x * 0.016),
  platforms: [
    { type: 'rock', x: 900, y: 360, w: 200 },
    { type: 'leaf', x: 1500, y: 420, w: 150 },
    { type: 'rock', x: 2100, y: 300, w: 200 },
  ],
  flowers: [{ x: 420 }, { x: 1250 }, { x: 1850 }, { x: 2600 }, { p: 0 }, { p: 2 }],
  setup(w) {
    const pal = new Palette();
    const flies = [new PaleButterfly(1350, 320, 'orange', pal), new PaleButterfly(1950, 220, 'green', pal), new PaleButterfly(2550, 300, 'purple', pal)];
    const check: Entity = { z: 0, draw() {}, update(ww) { if (flies.every(f => f.done) && ww.mode === 'play') win(ww, { x: ww.player.x, y: ww.ground(ww.player.x) - 180 }); } };
    w.entities.push(
      new MixPot(520, 'red', pal), new MixPot(640, 'yellow', pal), new MixPot(760, 'blue', pal), new MixPot(1000, null, pal, w.platforms[0].y),
      ...flies, pal, check,
    );
  },
};
