// How the fairy looks. Each kid picks their own and it is saved with their profile.

export const HAIRS = ['bun', 'pigtails', 'long', 'bob', 'curly'] as const;
export const DRESSES = ['petal', 'tutu', 'gown', 'leaf'] as const;
export const SHOES = ['slippers', 'boots', 'flowers', 'sneakers'] as const;
export const WINGS = ['butterfly', 'monarch', 'dragonfly', 'petal', 'rainbow'] as const;

export const HAIR_COLORS = ['#8a56d1', '#7a4a2a', '#f2c84b', '#2d2438', '#e0703a', '#ff8fc7', '#5aa8f0'];
export const SKINS = ['#ffe2cc', '#f5c9a0', '#d9a07a', '#a8704e', '#7a4e34'];
export const DRESS_COLORS = ['#6fe0c0', '#ff9fcf', '#b9a0ff', '#86d0ff', '#ffd166', '#ff8a7a'];
export const SHOE_COLORS = ['#ff6fa8', '#e8455a', '#9a6ae0', '#4a9ae8', '#f0b830', '#ffffff'];

export interface Look {
  hair: typeof HAIRS[number];
  hairColor: string;
  skin: string;
  dress: typeof DRESSES[number];
  dressColor: string;
  shoes: typeof SHOES[number];
  shoeColor: string;
  wings: typeof WINGS[number];
}

export const DEFAULT_LOOK: Look = {
  hair: 'bun', hairColor: '#8a56d1', skin: '#ffe2cc',
  dress: 'petal', dressColor: '#6fe0c0',
  shoes: 'slippers', shoeColor: '#ff6fa8',
  wings: 'butterfly',
};

const pick = <T>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export function randomLook(): Look {
  return {
    hair: pick(HAIRS), hairColor: pick(HAIR_COLORS), skin: pick(SKINS),
    dress: pick(DRESSES), dressColor: pick(DRESS_COLORS),
    shoes: pick(SHOES), shoeColor: pick(SHOE_COLORS),
    wings: pick(WINGS),
  };
}

// Fill in anything missing (older saves, or options that were removed).
export function fixLook(l: Partial<Look> | undefined): Look {
  const out = { ...DEFAULT_LOOK, ...(l ?? {}) };
  if (!HAIRS.includes(out.hair)) out.hair = DEFAULT_LOOK.hair;
  if (!DRESSES.includes(out.dress)) out.dress = DEFAULT_LOOK.dress;
  if (!SHOES.includes(out.shoes)) out.shoes = DEFAULT_LOOK.shoes;
  if (!WINGS.includes(out.wings)) out.wings = DEFAULT_LOOK.wings;
  return out;
}

// The look used when drawing the fairy in the game.
let current: Look = DEFAULT_LOOK;
export const getLook = (): Look => current;
export const setLook = (l: Look): void => { current = l; };
