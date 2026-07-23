import { pixelGridToSvg, Palette } from './pixelGrid.js';
import { SPRITE_LAYOUT } from './layout.js';

// 12 columns x 11 rows. 'S' = sparkly eyes, 'm' = big open smile.
const GRID = [
  '....DDDD....',
  '..DBBBBBBD..',
  '.DBBBBBBBBD.',
  'DBBBBBBBBBBD',
  'BBBSBBBBSBBB',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'BBBBmmmmBBBB',
  '.DBBBBBBBBD.',
  '..DBBBBBBD..',
  '....DDDD....',
].map((row) => row.padEnd(12, '.').slice(0, 12));

const PALETTE: Palette = {
  '.': null,
  D: '#1f6f3e', // dark outline
  B: '#4CD97B', // vibrant healthy green
  S: '#FFFFFF', // bright sparkly eyes
  m: '#0B3D24', // open smile
};

/** Renders the thriving sprite body plus a couple of sparkle accents above its head. */
export function renderThrivingSprite(): string {
  const body = pixelGridToSvg(GRID, PALETTE, SPRITE_LAYOUT);
  // Small 4-point sparkle stars floating near the head to sell "thriving".
  const sparkles = `
    <g fill="#FFD84D">
      <path d="M 90 30 l 4 10 l 10 4 l -10 4 l -4 10 l -4 -10 l -10 -4 l 10 -4 z"/>
      <path d="M 300 45 l 3 7 l 7 3 l -7 3 l -3 7 l -3 -7 l -7 -3 l 7 -3 z"/>
    </g>`;
  return body + sparkles;
}
