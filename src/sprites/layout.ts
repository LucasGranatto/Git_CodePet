import { PixelGridOptions } from './pixelGrid.js';

/**
 * Shared grid placement so all four mood sprites line up identically —
 * only the pixel colors/glyphs change between moods, not the position.
 * This keeps the pet from "jumping around" when its mood changes between
 * README refreshes.
 */
export const SPRITE_LAYOUT: PixelGridOptions = {
  pixelSize: 14,
  offsetX: 116, // centers a 12-column grid in a 400-wide viewBox
  offsetY: 24,
};

export const SVG_WIDTH = 400;
export const SVG_HEIGHT = 260;
