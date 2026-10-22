import type { TreePal, BushPal } from './art';

// A theme is the whole look of a level: sky, background layers, ground and light.

export type Weather = 'none' | 'rain' | 'leaves' | 'fireflies';

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

export const THEMES: Record<string, Theme> = { meadow, morning, night };
