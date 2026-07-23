import { ActivitySummary, Mood } from './types.js';
import { SVG_WIDTH, SVG_HEIGHT } from './sprites/layout.js';
import { renderThrivingSprite } from './sprites/thriving.js';
import { renderContentSprite } from './sprites/content.js';
import { renderHungrySprite } from './sprites/hungry.js';
import { renderSickSprite } from './sprites/sick.js';
import { renderNeutralSprite } from './sprites/neutral.js';

/** Background tint + label color per mood, kept separate from sprite palettes
 *  so the "frame" reads consistently even as sprite colors vary. */
const MOOD_THEME: Record<Mood, { bg: string; border: string; label: string; text: string }> = {
  thriving: { bg: '#EAFBF0', border: '#4CD97B', label: 'Thriving', text: '#1f6f3e' },
  content: { bg: '#F0FBF4', border: '#7FD8A0', label: 'Content', text: '#2f7a52' },
  hungry: { bg: '#FDF6E3', border: '#E8C158', label: 'Hungry', text: '#7A5B12' },
  sick: { bg: '#F1EFF4', border: '#9C93A8', label: 'Neglected', text: '#3a3a45' },
  neutral: { bg: '#F5F5F5', border: '#C9C9C9', label: 'No data yet', text: '#5a5a5a' },
};

const SPRITE_RENDERERS: Record<Mood, () => string> = {
  thriving: renderThrivingSprite,
  content: renderContentSprite,
  hungry: renderHungrySprite,
  sick: renderSickSprite,
  neutral: renderNeutralSprite,
};

export interface RenderOptions {
  username: string;
  mood: Mood;
  activity: ActivitySummary;
}

/**
 * Builds the full SVG document string for the pet, ready to serve as-is.
 * No external assets, no <script>, no <foreignObject> — pure static markup,
 * since this needs to render correctly inside GitHub's camo-proxied README
 * image pipeline with zero client-side JS.
 */
export function renderPetSvg({ username, mood, activity }: RenderOptions): string {
  const theme = MOOD_THEME[mood];
  const spriteMarkup = SPRITE_RENDERERS[mood]();

  const lastCommitText =
    activity.daysSinceLastCommit === null
      ? 'No public activity yet'
      : activity.daysSinceLastCommit === 0
        ? 'Committed today'
        : `Last commit: ${activity.daysSinceLastCommit} day${activity.daysSinceLastCommit === 1 ? '' : 's'} ago`;

  const streakText = `\u{1F525} Streak: ${activity.currentStreak} day${activity.currentStreak === 1 ? '' : 's'}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_WIDTH}" height="${SVG_HEIGHT}" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}">
  <rect x="1" y="1" width="${SVG_WIDTH - 2}" height="${SVG_HEIGHT - 2}" rx="16" fill="${theme.bg}" stroke="${theme.border}" stroke-width="2"/>

  ${spriteMarkup}

  <text x="${SVG_WIDTH / 2}" y="200" text-anchor="middle" font-family="Verdana, Geneva, sans-serif" font-size="16" font-weight="bold" fill="${theme.text}">${escapeXml(username)}'s CodePet — ${theme.label}</text>
  <text x="${SVG_WIDTH / 2}" y="222" text-anchor="middle" font-family="Verdana, Geneva, sans-serif" font-size="13" fill="${theme.text}">${escapeXml(streakText)}</text>
  <text x="${SVG_WIDTH / 2}" y="240" text-anchor="middle" font-family="Verdana, Geneva, sans-serif" font-size="13" fill="${theme.text}">${escapeXml(lastCommitText)}</text>
</svg>`;
}

/** Escapes text inserted into SVG/XML to prevent malformed markup or injection
 *  from unusual GitHub usernames (GitHub usernames are actually quite
 *  restricted, but this is cheap insurance since the value is user-supplied). */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
