import { pixelGridToSvg, Palette } from './pixelGrid.js';
import { SPRITE_LAYOUT } from './layout.js';

// 12 columns x 11 rows. 'h' = droopy half-lidded eyes, 'w' = flat wavy mouth.
const GRID = [
  '....DDDD....',
  '..DBBBBBBD..',
  '.DBBBBBBBBD.',
  'DBBBBBBBBBBD',
  'BBBhBBBBhBBB',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'BBBBBwwBBBBB',
  '.DBBBBBBBBD.',
  '..DBBBBBBD..',
  '....DDDD....',
].map((row) => row.padEnd(12, '.').slice(0, 12));

const PALETTE: Palette = {
  '.': null,
  D: '#a3791f', // dark outline
  B: '#E8C158', // dulled, hungry-yellow body
  h: '#7A5B12', // droopy eyes
  w: '#7A5B12', // flat mouth
};

export function renderHungrySprite(): string {
  const body = pixelGridToSvg(GRID, PALETTE, SPRITE_LAYOUT);
  // A single droplet under one eye — a small visual cue without adding a full new emotion sprite.
  const drop = `<path d="M 220 90 q 6 8 0 14 q -6 -6 0 -14 z" fill="#7EC8E3"/>`;
  return body + drop;
}
