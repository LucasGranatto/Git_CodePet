/**
 * Tiny helper for describing pixel-art sprites as a 2D array of single-char
 * keys mapped to colors, instead of hand-writing dozens of <rect> tags.
 *
 * Example:
 *   const grid = [
 *     '.KK.',
 *     'KWWK',
 *     'KWWK',
 *     '.KK.',
 *   ];
 *   const palette = { '.': null, K: '#222', W: '#fff' };
 *   pixelGridToSvg(grid, palette, { pixelSize: 10, offsetX: 20, offsetY: 20 })
 *
 * '.' (or any key mapped to null) is treated as transparent and skipped.
 */

export type Palette = Record<string, string | null>;

export interface PixelGridOptions {
  /** Width/height of each square pixel, in SVG user units. */
  pixelSize: number;
  /** Top-left offset of the whole grid within the parent SVG. */
  offsetX: number;
  offsetY: number;
}

export function pixelGridToSvg(
  grid: string[],
  palette: Palette,
  options: PixelGridOptions,
): string {
  const { pixelSize, offsetX, offsetY } = options;
  const rects: string[] = [];

  grid.forEach((row, rowIndex) => {
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const key = row[colIndex];
      const color = palette[key];
      if (!color) continue; // transparent / unmapped char
      const x = offsetX + colIndex * pixelSize;
      const y = offsetY + rowIndex * pixelSize;
      rects.push(`<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="${color}"/>`);
    }
  });

  return rects.join('');
}
