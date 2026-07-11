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

// ── Corporate enquiry service types (Phase 3) ── the selectable services on
// the public corporate meal enquiry form. Multiple may be chosen.
export const MEAL_SERVICE_TYPES = [
  'Office Lunches',
  'Balanced Meal Plans',
  'Corporate Meal Program',
  'Trial / Tasting Meal',
];

// ── Karachi service areas (Phase 3) ── Festigo Daily serves Karachi ONLY.
// This controlled list is the structural enforcement of the Karachi-only rule:
// an enquiry's area must be one of these values.
export const KARACHI_AREAS = [
  'DHA',
  'Clifton',
  'PECHS',
  'Gulshan-e-Iqbal',
  'Gulistan-e-Jauhar',
  'North Nazimabad',
  'North Karachi',
  'Korangi',
  'Shah Faisal',
  'Saddar',
  'SITE',
  'Malir',
  'Bahria Town Karachi',
  'Defence',
  'FB Area',
  'Buffer Zone',
];

// Sentinel the public form uses when a visitor's area is not listed / outside
// Karachi. It is intentionally NOT a valid area, so it never passes validation
// — the UI shows a polite "Karachi only" message instead.
export const OUTSIDE_KARACHI_VALUE = '__outside_karachi__';

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
