// Festigo Daily — shared domain constants.
//
// Plain constants only: NO mongoose or server imports here, so this file is
// safe to import from client components, Zod validation, models and stores
// alike. Centralising the enums in one place keeps the model, the validation
// layer and (future) UI in agreement — no enum is duplicated across files.

// ── Meal types ──
export const MEAL_TYPES = ['regular', 'balanced', 'vegetarian'];

// ── Spice levels ── ('not-applicable' is the safe default for items where a
// spice rating does not make sense, e.g. a dessert or a drink.)
export const SPICE_LEVELS = ['mild', 'medium', 'regular', 'not-applicable'];

// ── Weekly menu lifecycle ── the public gate is status === 'published'.
export const WEEKLY_MENU_STATUSES = ['draft', 'published', 'archived'];

// ── Meal inquiry lifecycle ──
export const MEAL_INQUIRY_STATUSES = [
  'new',
  'contacted',
  'trial-scheduled',
  'converted',
  'closed',
];

// ── Production / menu days ── Festigo Daily operates Monday–Saturday.
// Sunday is intentionally excluded and must never be accepted as a
// menu-production day (Sunday is closed).
export const MENU_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// ── Currency ── Festigo Daily prices are PKR-only for Phase 1.
export const MEAL_CURRENCIES = ['PKR'];
export const DEFAULT_MEAL_CURRENCY = 'PKR';

// Confirmed business defaults. Kept here for reference and for a future
// seeding step only — Phase 1 does NOT write these to the database.
export const FESTIGO_DAILY_DEFAULTS = Object.freeze({
  serviceName: 'Festigo Daily',
  serviceArea: 'Karachi',
  karachiOnly: true,
  operatingDays: MENU_DAYS,
  sundayClosed: true,
  operatingHours: { opening: '07:00', closing: '19:00' },
  maximumDailyCapacity: 500,
  sfaLicensed: true,
});
