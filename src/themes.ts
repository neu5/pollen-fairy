import type { TreePal, BushPal } from './art';

// A theme is the whole look of a level: sky, background layers, ground and light.

export type Weather = 'none' | 'rain' | 'leaves' | 'fireflies' | 'snow' | 'petals' | 'bubbles';

export interface Theme {
  id: string;
  sky: [number, string][];        // gradient stops over world y -500..700
  sun: 'sun' | 'moon' | 'none';
  stars: boolean;
  rays: number;                    // god-ray strength 0..1
  clouds: number;                  // cloud opacity 0..1
  cloudShade: string;
  range1: [string, string];
  range2: [string, string];
  castle: boolean;
  haze: [string, string];          // 'r,g,b' top / bottom
  hazeK: number;                   // haze strength multiplier
  farHill: [string, string];
  far: TreePal[];
  midHill: [string, string];
  mid: TreePal[];
  near: TreePal[];
  backHill: [string, string];
  bushBack: BushPal;
  bushPlay: BushPal;
  fern: string;
  dirt: [string, string, string];
  grass: [string, string, string]; // fringe, band, highlight
  fg: string;
  fgLeaf: string;
  hang: string;
  motes: string;                   // 'r,g,b'
  moteCount: number;
  moteSize: number;
  vignette: string;                // 'r,g,b'
  butterflies: boolean;
  tint: string | null;             // multiply over the play layer (night, rain)
  rocks?: boolean;                 // rock spikes / coral instead of trees
  ceiling?: boolean;               // cave: rock spikes hanging from the top
  seaweed?: boolean;               // sea: seaweed instead of trees
  tuft?: [string, string];         // little grass tufts (dark, light); default green
  nearTrees?: boolean;             // draw the big near trees (default yes)
  weather: Weather;
}

const MEADOW_FAR: TreePal[] = [
  { trunk: '#9bb9cc', dark: '#9cc4cf', mid: '#afd3d9', light: '#cbe6e6' },
  { trunk: '#a9aed4', dark: '#b7bde3', mid: '#c8cdec', light: '#e0e2f6' },
  { trunk: '#b3a9d0', dark: '#d2b8dc', mid: '#e0c8e6', light: '#f2e0f2' },
];
const MEADOW_MID: TreePal[] = [
  { trunk: '#6e7f8f', dark: '#5aa68a', mid: '#71bd96', light: '#a3dcb0' },
  { trunk: '#7b6f8e', dark: '#e195bd', mid: '#f2b1cf', light: '#ffd6e8' },
  { trunk: '#6e7f8f', dark: '#62a8b6', mid: '#7cc2c4', light: '#b0e2d6' },
  { trunk: '#6e7f8f', dark: '#86b866', mid: '#a0cc78', light: '#cbe8a0' },
];
const MEADOW_NEAR: TreePal[] = [
  { trunk: '#6a4f45', trunkLight: '#9a7663', dark: '#2f7d55', mid: '#3e955f', light: '#6dbb6e' },
  { trunk: '#5f4a4a', trunkLight: '#8f6f6a', dark: '#357a63', mid: '#479373', light: '#7cc08a' },
  { trunk: '#6a4f45', trunkLight: '#9a7663', dark: '#c46f9c', mid: '#dc8db5', light: '#f6bcd6' },
];

const meadow: Theme = {
  id: 'meadow',
  sky: [[0, '#4fa9ea'], [0.42, '#8fd0fa'], [0.7, '#cdeefc'], [0.86, '#ffe9d2'], [1, '#ffd5df']],
  sun: 'sun', stars: false, rays: 1, clouds: 1, cloudShade: 'rgba(214,206,245,0.95)',
  range1: ['#bdb6ea', '#efe3f6'], range2: ['#a3c4ea', '#e2eef8'], castle: true,
  haze: ['236,246,255', '255,238,236'], hazeK: 1,
  farHill: ['#b5dbd3', '#d7ece6'], far: MEADOW_FAR,
  midHill: ['#8ccaa0', '#b6dfc0'], mid: MEADOW_MID,
  near: MEADOW_NEAR,
  backHill: ['#6fbf7a', '#4f9d68'],
  bushBack: { dark: '#4f9a6a', mid: '#62ad76', light: '#8fcf90', flower: ['#ffd1e8', '#fff3b0', '#e3d4ff'] },
  bushPlay: { dark: '#2f8048', mid: '#3f9a52', light: '#6cc062', flower: ['#ff8fc7', '#ffffff', '#ffd166', '#b9a0ff'] },
  fern: '#3f9a55',
  dirt: ['#b27a50', '#8f5a42', '#6e4048'],
  grass: ['#45a847', '#52b84a', '#8fe36a'],
  fg: '#1f5a3a', fgLeaf: '#23663f', hang: '#24603f',
  motes: '255,248,200', moteCount: 46, moteSize: 1,
  vignette: '70,30,100',
  butterflies: true, tint: null, weather: 'none',
};

// Soft early morning: peachy sky, low mist.
const morning: Theme = {
  ...meadow,
  id: 'morning',
  sky: [[0, '#8fb8f0'], [0.45, '#c4dcfa'], [0.72, '#ffe6d6'], [0.88, '#ffd2c2'], [1, '#ffc6d0']],
  rays: 0.8,
  range1: ['#c9b6e4', '#f6e2ee'], range2: ['#b6c2ea', '#efe6f6'],
  haze: ['250,236,240', '255,230,220'], hazeK: 1.3,
  farHill: ['#c4d8d4', '#e6eee8'],
};

const NIGHT_FAR: TreePal[] = [
  { trunk: '#2f3a6a', dark: '#2e3c74', mid: '#36468a', light: '#44559c' },
  { trunk: '#34326a', dark: '#3a3780', mid: '#454294', light: '#5552a6' },
];
const NIGHT_MID: TreePal[] = [
  { trunk: '#1f2a52', dark: '#1f3f5e', mid: '#285072', light: '#356586' },
  { trunk: '#2a2552', dark: '#3a2e6c', mid: '#4a3b84', light: '#5d4c9c' },
  { trunk: '#1f2a52', dark: '#1d4658', mid: '#24586a', light: '#2f6c7e' },
];
const NIGHT_NEAR: TreePal[] = [
  { trunk: '#1c1830', trunkLight: '#2c2846', dark: '#142c34', mid: '#1b3a42', light: '#264c52' },
  { trunk: '#1c1830', trunkLight: '#2c2846', dark: '#1d2440', mid: '#263052', light: '#323e66' },
];

const night: Theme = {
  ...meadow,
  id: 'night',
  sky: [[0, '#0b1240'], [0.45, '#1a2266'], [0.75, '#33367e'], [0.9, '#4d4590'], [1, '#5e4c96']],
  sun: 'moon', stars: true, rays: 0.25, clouds: 0.35, cloudShade: 'rgba(60,60,120,0.9)',
  range1: ['#2a2f6a', '#3a3a7a'], range2: ['#232a5e', '#33366e'], castle: true,
  haze: ['60,70,140', '90,80,150'], hazeK: 0.8,
  farHill: ['#24305e', '#2c3668'], far: NIGHT_FAR,
  midHill: ['#1c2c50', '#24345c'], mid: NIGHT_MID,
  near: NIGHT_NEAR,
  backHill: ['#173040', '#122634'],
  bushBack: { dark: '#14303a', mid: '#1b3c46', light: '#25505a', flower: ['#b8c8ff', '#fff3b0'] },
  fg: '#081a1c', fgLeaf: '#0b2024', hang: '#0b2024',
  motes: '210,255,140', moteCount: 60, moteSize: 1.6,
  vignette: '10,8,40',
  butterflies: false, tint: '#5560a8', weather: 'fireflies',
};

// Grey rainy day: soft blue-grey light, rain in front.
const rain: Theme = {
  ...meadow,
  id: 'rain',
  sky: [[0, '#7584a6'], [0.45, '#9eabc6'], [0.75, '#c3cadc'], [1, '#d6d3e2']],
  sun: 'none', rays: 0, clouds: 1, cloudShade: 'rgba(140,150,180,0.95)',
  range1: ['#a4a8c8', '#c8cadc'], range2: ['#92a6c4', '#c2cfdf'],
  haze: ['200,208,225', '210,212,228'], hazeK: 1.4,
  farHill: ['#a9c2c4', '#c6d6d8'], midHill: ['#87b096', '#a9c8b2'],
  motes: '220,230,255', moteCount: 0,
  vignette: '40,50,90',
  butterflies: false, tint: '#c6cfe2', weather: 'rain',
};

// Warm, windy afternoon with golden grass and dandelion fluff.
const windy: Theme = {
  ...meadow,
  id: 'windy',
  sky: [[0, '#5fb2ec'], [0.45, '#a6dcf8'], [0.75, '#ffe9c0'], [0.9, '#ffd8a4'], [1, '#ffc9a0']],
  range1: ['#c6b6e0', '#f3e2e6'], range2: ['#b4c8e6', '#ece6ee'],
  haze: ['250,240,225', '255,232,205'],
  farHill: ['#d2dcb0', '#e8ecd0'], midHill: ['#c4d488', '#dce6b0'],
  backHill: ['#b9c967', '#98ad52'],
  bushBack: { dark: '#93a955', mid: '#a9bd63', light: '#cddc8a', flower: ['#fff3b0', '#ffffff'] },
  bushPlay: { dark: '#6f9a3c', mid: '#86b04a', light: '#b2d468', flower: ['#ffd166', '#ffffff', '#ff8fc7'] },
  grass: ['#8fb83a', '#a2c84a', '#d6ea7a'],
  dirt: ['#c08a55', '#9c6a48', '#7a4a48'],
  motes: '255,255,255', moteCount: 60, moteSize: 1.3,
};

// Cool, fresh pond-side greens.
const pond: Theme = {
  ...meadow,
  id: 'pond',
  sky: [[0, '#4fb0e6'], [0.45, '#94d8f6'], [0.72, '#d2f1f4'], [0.88, '#e9f6e0'], [1, '#f6e6e8']],
  farHill: ['#a8d8cc', '#d0ece4'], midHill: ['#7cc4a8', '#aedcc4'],
  backHill: ['#5fb38a', '#3f9472'],
  bushPlay: { dark: '#2a7a52', mid: '#38945e', light: '#62bb6c', flower: ['#ffffff', '#c3aaff', '#86dcff'] },
};

// Take the colour out of a theme (for the Grey Garden).
function greyRgb(r: number, g: number, b: number, k: number): number[] {
  const l = r * 0.3 + g * 0.59 + b * 0.11;
  return [r, g, b].map(c => Math.round(c + (l - c) * k));
}
function desaturate<T>(v: T, k: number): T {
  if (typeof v === 'string') {
    if (/^#[0-9a-f]{6}$/i.test(v)) {
      const n = parseInt(v.slice(1), 16);
      return ('#' + greyRgb(n >> 16, (n >> 8) & 255, n & 255, k).map(c => c.toString(16).padStart(2, '0')).join('')) as T;
    }
    const rgba = v.match(/^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/);
    if (rgba) return `rgba(${greyRgb(+rgba[1], +rgba[2], +rgba[3], k).join(',')},${rgba[4]})` as T;
    const rgb = v.match(/^(\d+),(\d+),(\d+)$/);
    if (rgb) return greyRgb(+rgb[1], +rgb[2], +rgb[3], k).join(',') as T;
    return v;
  }
  if (Array.isArray(v)) return v.map(x => desaturate(x, k)) as T;
  if (v && typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, x] of Object.entries(v)) out[key] = desaturate(x, k);
    return out as T;
  }
  return v;
}

const grey: Theme = { ...desaturate(meadow, 0.82), id: 'grey', butterflies: false, rays: 0.5 };

// Golden autumn woods with falling leaves.
const autumn: Theme = {
  ...meadow,
  id: 'autumn',
  sky: [[0, '#6fb2e0'], [0.45, '#b4dcf2'], [0.72, '#ffe2c4'], [0.88, '#ffcfa8'], [1, '#ffbfa8']],
  range1: ['#cdb0d8', '#f6dfe0'], range2: ['#c2b4d8', '#f0e2e8'],
  haze: ['255,240,225', '255,222,200'],
  farHill: ['#e2c8a8', '#f2e2cc'],
  far: [
    { trunk: '#b8a090', dark: '#e8b88e', mid: '#f2cba4', light: '#fae0c2' },
    { trunk: '#b8a090', dark: '#e8a8a0', mid: '#f2bcb4', light: '#fad4cc' },
  ],
  midHill: ['#d8b070', '#ead0a0'],
  mid: [
    { trunk: '#7a5f58', dark: '#e0803a', mid: '#f29c4a', light: '#ffc46a' },
    { trunk: '#7a5f58', dark: '#d4553e', mid: '#ea7050', light: '#ff9a70' },
    { trunk: '#7a5f58', dark: '#d8a830', mid: '#ecc040', light: '#ffe070' },
  ],
  near: [
    { trunk: '#6a4f45', trunkLight: '#9a7663', dark: '#b8502e', mid: '#d06a36', light: '#f09a4a' },
    { trunk: '#5f4a4a', trunkLight: '#8f6f6a', dark: '#c08a24', mid: '#d8a830', light: '#f2cc5a' },
  ],
  backHill: ['#c49a4a', '#a07a3a'],
  bushBack: { dark: '#b0703a', mid: '#c8884a', light: '#e2a860', flower: ['#ffe070', '#ff9a70'] },
  bushPlay: { dark: '#9a5a2e', mid: '#b8743a', light: '#dc9a4e', flower: ['#ffd166', '#ff8a5a', '#ffffff'] },
  fern: '#b06a36',
  grass: ['#a8983a', '#bba84a', '#e2d27a'],
  fg: '#6a3a1e', fgLeaf: '#7a3e1e', hang: '#6a3a1e',
  motes: '255,220,170',
  butterflies: false, weather: 'leaves',
};

// Dark crystal cave: purple rock, glowing worms, the fairy's light.
const cave: Theme = {
  ...meadow,
  id: 'cave',
  sky: [[0, '#140c2a'], [0.5, '#24164a'], [0.8, '#3a2468'], [1, '#4a2c74']],
  sun: 'none', stars: true, rays: 0, clouds: 0,
  range1: ['#2e2058', '#3a2a66'], range2: ['#251a4e', '#33245e'], castle: false,
  haze: ['80,60,150', '100,70,160'], hazeK: 0.6,
  farHill: ['#2c2058', '#382a66'],
  far: [
    { trunk: '#2a2050', dark: '#3c2c74', mid: '#4a3888', light: '#6a54b0' },
    { trunk: '#2a2050', dark: '#2c3c74', mid: '#36508a', light: '#5078b0' },
  ],
  midHill: ['#241a4c', '#2e2258'],
  mid: [
    { trunk: '#1e1840', dark: '#1e4a6a', mid: '#2a6688', light: '#46a0c0' },
    { trunk: '#1e1840', dark: '#4a2a6a', mid: '#5e3888', light: '#8a5ab8' },
    { trunk: '#1e1840', dark: '#2a3a6a', mid: '#364c88', light: '#5070b0' },
  ],
  rocks: true, ceiling: true, nearTrees: false,
  backHill: ['#2a1e4a', '#1e1638'],
  bushBack: { dark: '#2a2050', mid: '#34285e', light: '#46387a', flower: ['#7ae0ff', '#c3aaff'] },
  bushPlay: { dark: '#1e3a4a', mid: '#2a4c5c', light: '#3a6672', flower: ['#7ae0ff', '#ff8fd0', '#c3aaff'] },
  fern: '#2e5468',
  dirt: ['#5a4a6a', '#3e3050', '#2a2038'],
  grass: ['#3a6a6a', '#4a8080', '#7ac0b8'],
  fg: '#0e0a1c', fgLeaf: '#120c22', hang: '#140e26',
  motes: '150,230,255', moteCount: 50, moteSize: 1.2,
  vignette: '10,5,30',
  butterflies: false, tint: '#7a6cc0', weather: 'fireflies',
};

// Festival sunset: pink and gold sky.
const sunset: Theme = {
  ...meadow,
  id: 'sunset',
  sky: [[0, '#5a6ed0'], [0.4, '#b48ae0'], [0.66, '#ffb0c4'], [0.85, '#ffcf9a'], [1, '#ffe2a8']],
  rays: 0.9, cloudShade: 'rgba(240,170,200,0.95)',
  range1: ['#b48ad0', '#f2c6d8'], range2: ['#c49ad8', '#f6d0dc'],
  haze: ['255,220,235', '255,214,190'],
  farHill: ['#d8b0cc', '#f2d0dc'],
  midHill: ['#c4a0c8', '#e4c4d6'],
  motes: '255,230,200',
};

// Evening: the sun is gone, the sky is purple and peach, first stars.
const dusk: Theme = {
  ...night,
  id: 'dusk',
  sky: [[0, '#2a2a78'], [0.4, '#5a4a9e'], [0.66, '#b07ab8'], [0.84, '#f0a8a8'], [1, '#ffc8a0']],
  clouds: 0.6, cloudShade: 'rgba(150,110,170,0.9)',
  range1: ['#5a4a8e', '#8a6aa8'], range2: ['#4a3e80', '#76609c'],
  haze: ['140,110,180', '230,160,170'], hazeK: 0.9,
  farHill: ['#43407e', '#5a5290'], midHill: ['#2e3a66', '#3a4674'],
  tint: '#a29ad8', moteCount: 40,
};

// Fresh spring: blossom trees, falling petals.
const spring: Theme = {
  ...meadow,
  id: 'spring',
  sky: [[0, '#5ab4ee'], [0.45, '#a2dcfa'], [0.72, '#e2f4f6'], [0.88, '#fde8ee'], [1, '#ffd8e6']],
  mid: [
    { trunk: '#7b6f8e', dark: '#e195bd', mid: '#f2b1cf', light: '#ffd6e8' },
    { trunk: '#6e7f8f', dark: '#86c866', mid: '#a0dc78', light: '#cbf0a0' },
    { trunk: '#7b6f8e', dark: '#f0b0c8', mid: '#ffc8dc', light: '#ffe6f0' },
  ],
  grass: ['#58b848', '#66c854', '#a2ee78'],
  weather: 'petals',
};

// Bright summer: warm light, strong colours.
const summer: Theme = {
  ...meadow,
  id: 'summer',
  sky: [[0, '#3a9ee8'], [0.45, '#7ccaf6'], [0.72, '#c4ecfa'], [0.88, '#fff0c8'], [1, '#ffe0a8']],
  rays: 1.2,
  midHill: ['#7cc890', '#a8dcb0'], backHill: ['#62b868', '#4a9a58'],
  grass: ['#4aa83e', '#58ba48', '#94e468'],
  haze: ['240,248,255', '255,240,210'],
};

// Snowy winter: white ground, falling snow.
const winter: Theme = {
  ...meadow,
  id: 'winter',
  sky: [[0, '#7ab0e0'], [0.45, '#b4d8f2'], [0.72, '#e4f0fa'], [0.9, '#f4f0f8'], [1, '#f8eef4']],
  sun: 'sun', rays: 0.5, clouds: 1, cloudShade: 'rgba(200,210,235,0.95)',
  range1: ['#c8d4ee', '#f4f6fc'], range2: ['#b8cce8', '#eef2fa'],
  haze: ['240,246,255', '245,242,250'], hazeK: 1.3,
  farHill: ['#e4ecf6', '#f4f8fc'],
  far: [
    { trunk: '#9aa8c0', dark: '#b8c8dc', mid: '#d0dcea', light: '#eef4fa' },
    { trunk: '#9aa8c0', dark: '#a8bcd4', mid: '#c4d4e6', light: '#e8f0f8' },
  ],
  midHill: ['#dce6f2', '#eef2f8'],
  mid: [
    { trunk: '#7a8498', dark: '#7aa094', mid: '#9cbab0', light: '#f4f8fa' },
    { trunk: '#7a8498', dark: '#8aa8b8', mid: '#a8c4d0', light: '#f4f8fa' },
    { trunk: '#7a8498', dark: '#6a9488', mid: '#8ab0a4', light: '#f0f6f8' },
  ],
  near: [
    { trunk: '#6a5a58', trunkLight: '#9a8680', dark: '#5a8478', mid: '#7aa094', light: '#eef4f6' },
    { trunk: '#5f5050', trunkLight: '#8f7a76', dark: '#6a8a90', mid: '#8aa8ae', light: '#eef4f6' },
  ],
  backHill: ['#e8eef6', '#cdd8e6'],
  bushBack: { dark: '#a8bcc8', mid: '#c4d4de', light: '#f0f6fa', flower: ['#ffffff'] },
  bushPlay: { dark: '#6a9a88', mid: '#88b4a4', light: '#eef6f4', flower: ['#e8455a', '#ffffff'] },
  fern: '#6a9a88',
  dirt: ['#a89a9a', '#8a7a80', '#6a5a66'],
  grass: ['#dce6f0', '#eef2f8', '#ffffff'], tuft: ['#b8cad8', '#dfe8f0'],
  fg: '#7a94a8', fgLeaf: '#6a8a9c', hang: '#8aa0b4',
  motes: '255,255,255', moteCount: 20,
  butterflies: false, weather: 'snow',
};

// Sunny beach: sea far away, sand under your feet.
const beach: Theme = {
  ...meadow,
  id: 'beach',
  sky: [[0, '#3aa4ec'], [0.45, '#80d0fa'], [0.72, '#c8f0fc'], [0.88, '#fff4d8'], [1, '#ffe8c0']],
  range1: ['#6ec4e8', '#a8e2f4'], range2: ['#4aaee0', '#8ad8f2'], castle: false,
  farHill: ['#f0dca8', '#f8ecc8'],
  far: [
    { trunk: '#b89a78', dark: '#8ac8a0', mid: '#a8dcb4', light: '#cceccc' },
    { trunk: '#b89a78', dark: '#9ad0a8', mid: '#b4e2bc', light: '#d4f0d4' },
  ],
  midHill: ['#ecd298', '#f6e4b8'],
  backHill: ['#e8c888', '#d8b070'],
  bushBack: { dark: '#7ab88a', mid: '#94cc9c', light: '#bce4bc', flower: ['#ffffff', '#ffd166'] },
  bushPlay: { dark: '#4a9a68', mid: '#5cb478', light: '#88d494', flower: ['#ff8fc7', '#ffffff'] },
  dirt: ['#f0d498', '#e0bc78', '#c8a060'],
  grass: ['#e8cc88', '#f2dca0', '#fff0c8'], tuft: ['#7ab85a', '#9ad070'],
  butterflies: false,
};

// Under the sea: blue light from above, bubbles, sand floor.
const sea: Theme = {
  ...meadow,
  id: 'sea',
  sky: [[0, '#5ac8f0'], [0.35, '#2a96d0'], [0.7, '#1a6aa8'], [1, '#184a88']],
  sun: 'none', stars: false, rays: 0.9, clouds: 0,
  range1: ['#1e5a90', '#286aa0'], range2: ['#1a4e84', '#24609a'], castle: false,
  haze: ['90,170,220', '40,110,170'], hazeK: 1,
  farHill: ['#2a6a9a', '#2a5a88'],
  far: [
    { trunk: '#2a5a7a', dark: '#2a8a8a', mid: '#3aa0a0', light: '#5ac0b8' },
    { trunk: '#2a5a7a', dark: '#c46a9a', mid: '#dc88b4', light: '#f2acd0' },
  ],
  midHill: ['#e0c898', '#d0b080'],
  mid: [
    { trunk: '#2a5a6a', dark: '#2a9a7a', mid: '#3ab48a', light: '#6cd4a4' },
    { trunk: '#2a5a6a', dark: '#e07a6a', mid: '#f29a84', light: '#ffc0a8' },
    { trunk: '#2a5a6a', dark: '#d8a83a', mid: '#ecc050', light: '#ffe080' },
  ],
  seaweed: true, nearTrees: false,
  backHill: ['#e8d0a0', '#d4b484'],
  bushBack: { dark: '#2a8a7a', mid: '#3aa48a', light: '#6ac8a8', flower: ['#ff8fc7', '#ffd166'] },
  bushPlay: { dark: '#2a8a6a', mid: '#3aa478', light: '#6ccc94', flower: ['#ff6b8a', '#ffd166', '#b48cff'] },
  fern: '#2a9a6a',
  dirt: ['#f0d8a8', '#dcc088', '#c4a46c'],
  grass: ['#e4cc98', '#eed8a8', '#fff0cc'], tuft: ['#2a9a6a', '#4abc84'],
  fg: '#14506a', fgLeaf: '#145a5a', hang: '#1a5a7a',
  motes: '220,245,255', moteCount: 50, moteSize: 1.6,
  vignette: '10,30,70',
  butterflies: false, weather: 'bubbles',
};

export const THEMES: Record<string, Theme> = { meadow, morning, night, rain, windy, pond, grey, autumn, cave, sunset, dusk, spring, summer, winter, beach, sea };
