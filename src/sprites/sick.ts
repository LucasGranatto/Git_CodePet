import { pixelGridToSvg, Palette } from './pixelGrid.js';
import { SPRITE_LAYOUT } from './layout.js';

// 12 columns x 11 rows. 'x' = closed/squinting eyes, 'f' = frown, 'g' = sickly spots.
const GRID = [
  '....DDDD....',
  '..DBBBBBBD..',
  '.DBBBgBBBBD.',
  'DBBBBBBBgBBD',
  'BBBxBBBBxBBB',
  'BBgBBBBBBBBB',
  'BBBBBgBBBBBB',
  'BBBBBffBBBBB',
  '.DBBBBBBBBD.',
  '..DBBBBBBD..',
  '....DDDD....',
].map((row) => row.padEnd(12, '.').slice(0, 12));

const PALETTE: Palette = {
  '.': null,
  D: '#5b5b6b', // dark, dull outline
  B: '#9C93A8', // sickly grayish-purple body
  x: '#3a3a45', // closed/squinting eyes (drawn as flat dots)
  f: '#3a3a45', // frown
  g: '#6B8E5A', // sickly green spots
};

export function renderSickSprite(): string {
  const body = pixelGridToSvg(GRID, PALETTE, SPRITE_LAYOUT);
  // A small drooping "z" to suggest lethargy, floating above the head.
  const lethargyMark = `<text x="270" y="45" font-family="monospace" font-size="18" fill="#6B6B7A">z</text>`;
  return body + lethargyMark;
}
