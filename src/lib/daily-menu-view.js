import { MENU_DAYS } from '@/data/meal-constants';

/**
 * Pure presentation helpers for the public weekly menu. These do NOT touch the
 * Phase 1 store architecture — they only shape already-fetched, already-
 * serialized snapshot data for safe display.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Classify the active published menu so it is never mislabeled as "current".
 * getActivePublishedMenu() may return a menu covering today, a future menu, or
 * (as a last resort) an older one — so we re-derive the safe label here.
 *
 * @returns {{ state: 'current'|'upcoming'|'none', label: string|null }}
 *   - current : covers today            → "This Week’s Menu"
 *   - upcoming: starts in the future     → "Upcoming Weekly Menu"
 *   - none    : stale/past or invalid    → caller shows the empty state
 */
export function classifyActiveMenu(menu, now = new Date()) {
  if (!menu || !menu.weekStart || !menu.weekEnd) return { state: 'none', label: null };
  const start = new Date(menu.weekStart);
  const end = new Date(menu.weekEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { state: 'none', label: null };
  }
  // Include the whole of weekEnd's calendar day so a Saturday menu still reads
  // as current on Saturday evening.
  const endInclusive = end.getTime() + DAY_MS;
  const t = now.getTime();
  if (t >= start.getTime() && t < endInclusive) return { state: 'current', label: 'This Week’s Menu' };
  if (t < start.getTime()) return { state: 'upcoming', label: 'Upcoming Weekly Menu' };
  return { state: 'none', label: null };
}

/**
 * Return the menu's days in canonical Monday–Saturday order, each paired with
 * its source entry (or null when that day has no entry). Sunday is never
 * produced because MENU_DAYS excludes it.
 */
export function orderedMenuDays(menu) {
  const byDay = new Map();
  for (const d of menu?.days ?? []) {
    if (d && d.day) byDay.set(d.day, d);
  }
  return MENU_DAYS.map((day) => ({ day, entry: byDay.get(day) || null }));
}

// The meal-type slots shown per day, in a stable order with public labels.
export const MENU_SLOTS = [
  { key: 'regular', label: 'Regular' },
  { key: 'balanced', label: 'Balanced' },
  { key: 'vegetarian', label: 'Vegetarian' },
];

// A day is presentable only if it's marked available and has at least one slot
// carrying a published snapshot.
export function dayHasMeals(entry) {
  if (!entry || entry.available === false) return false;
  return MENU_SLOTS.some(({ key }) => entry[key]?.snapshot?.name);
}

// Format a menu's ISO week range as e.g. "13 – 18 Jul 2026". Returns null when
// the dates are missing/invalid so callers can omit the label cleanly.
export function formatWeekRange(startISO, endISO) {
  const start = startISO ? new Date(startISO) : null;
  const end = endISO ? new Date(endISO) : null;
  if (!start || Number.isNaN(start.getTime()) || !end || Number.isNaN(end.getTime())) {
    return null;
  }
  const day = (d) => new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(d);
  const monthYear = (d) =>
    new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(d);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  return sameMonth
    ? `${day(start)} – ${day(end)} ${monthYear(end)}`
    : `${day(start)} ${monthYear(start)} – ${day(end)} ${monthYear(end)}`;
}
