import { pixelGridToSvg, Palette } from './pixelGrid.js';
import { SPRITE_LAYOUT } from './layout.js';

// 12 columns x 11 rows. 'e' = normal dot eyes, 'm' = small gentle smile.
const GRID = [
  '....DDDD....',
  '..DBBBBBBD..',
  '.DBBBBBBBBD.',
  'DBBBBBBBBBBD',
  'BBBeBBBBeBBB',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'BBBBBmmBBBBB',
  '.DBBBBBBBBD.',
  '..DBBBBBBD..',
  '....DDDD....',
].map((row) => row.padEnd(12, '.').slice(0, 12));

const PALETTE: Palette = {
  '.': null,
  D: '#2f7a52', // dark outline
  B: '#7FD8A0', // soft content green
  e: '#1B4332', // calm dot eyes
  m: '#1B4332', // gentle smile
};

export function renderContentSprite(): string {
  return pixelGridToSvg(GRID, PALETTE, SPRITE_LAYOUT);
}
