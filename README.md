# Helpful Fairy

A calm 2D platformer for kids aged 5–8. You play a fairy who walks, flies and helps woodland friends. Along the way kids practise counting, the clock, colours, sorting and sequences.

- 5 chapters × 10 short levels (meadow, night, garden seasons, river & sea, mountains & sky)
- No dying, no reading needed: each level starts with a picture goal. Timers just restart the level.
- Several kid profiles with saved progress, and a dress-up wardrobe
- English, Polish and French
- Works with keyboard and touch

## Development

Needs Node 18+.

```bash
npm install
npm run dev          # http://localhost:5173
npm run dev:debug    # all levels unlocked + debug keys
npm run build        # typecheck + production build to dist/
```

Debug keys: `N` win level, `1`–`0` jump to level, `C` next chapter (on the map), `F` toggle 2x fast fairy.

Stack: TypeScript, Vite, Canvas 2D. No runtime dependencies. Deployed on Render as a static site (`render.yaml`).
