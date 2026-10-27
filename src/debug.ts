// Debug mode for testing levels. Turn on with: npm run dev:debug  (or VITE_DEBUG=1 in .env.local)
export const DEBUG = import.meta.env.VITE_DEBUG === '1';

// Fast mode (debug only): fairy walks and flies sideways 2x faster. F toggles it.
export const fast = { on: DEBUG };
