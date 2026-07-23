import { pixelGridToSvg, Palette } from './pixelGrid.js';
import { SPRITE_LAYOUT } from './layout.js';

// Same shape as the "content" sprite — reused deliberately (per project
// decision) rather than building a distinct 5th sprite — but in muted
// grayscale tones so it reads as "no data yet" rather than "happy".
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
  D: '#8a8a8a', // muted gray outline
  B: '#C9C9C9', // pale, neutral gray body
  e: '#5a5a5a', // plain dot eyes
  m: '#5a5a5a', // flat, neither-happy-nor-sad mouth
};

export function renderNeutralSprite(): string {
  return pixelGridToSvg(GRID, PALETTE, SPRITE_LAYOUT);
}
