import { z } from 'zod';
import {
  MEAL_TYPES,
  SPICE_LEVELS,
  MENU_DAYS,
  WEEKLY_MENU_STATUSES,
  MEAL_INQUIRY_STATUSES,
  MEAL_CURRENCIES,
  DEFAULT_MEAL_CURRENCY,
} from '@/data/meal-constants';

/**
 * Centralised Zod validation for the Festigo Daily meal domain.
 *
 * Enums come from a single source (@/data/meal-constants) — never duplicated.
 * Create / Update / Query / Publish inputs are separated. Create & Update
 * schemas are `.strict()` so unknown or unsafe keys are rejected, and Update
 * schemas never expose protected identifiers (_id / singletonKey / status /
 * publishedAt) so those can't be mutated through the wrong door.
 */

// ── shared field helpers ────────────────────────────────────────────────────
const reqStr = (min, max, msg) => z.string().trim().min(min, msg).max(max);
const optStr = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal('').transform(() => undefined));
const stringArray = (maxItems = 50, maxLen = 200) =>
  z.array(z.string().trim().min(1).max(maxLen)).max(maxItems).optional();
const email = () => z.string().trim().toLowerCase().email('Please enter a valid email address.');
const nonNegInt = () => z.coerce.number().int().min(0);
const positiveInt = () => z.coerce.number().int().min(1);
const bool = () => z.coerce.boolean();

const mealImageSchema = z
  .object({
    url: optStr(500),
    publicId: optStr(300),
    alt: optStr(200),
  })
  .strict()
  .optional();

// ── Meal ─────────────────────────────────────────────────────────────────────
export const mealCreateSchema = z
  .object({
    name: reqStr(2, 160, 'Meal name is required.'),
    slug: optStr(200),
    mealType: z.enum(MEAL_TYPES, { errorMap: () => ({ message: 'Invalid meal type.' }) }),
    mainDish: optStr(200),
    base: optStr(200),
    side: optStr(200),
    vegetarianAlternative: optStr(200),
    allergens: stringArray(50, 120),
    spiceLevel: z.enum(SPICE_LEVELS).optional(),
    category: optStr(120),
    description: optStr(2000),
    image: mealImageSchema,
    isPublished: bool().optional(),
  })
  .strict();

export const mealUpdateSchema = mealCreateSchema.partial().strict();

export const mealQuerySchema = z.object({
  mealType: z.enum(MEAL_TYPES).optional(),
  category: optStr(120),
  search: optStr(160),
  publishedOnly: bool().optional(),
  sort: z.enum(['newest', 'oldest']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(60).optional(),
});

// ── MealPackage ──────────────────────────────────────────────────────────────
export const mealPackageCreateSchema = z
  .object({
    name: reqStr(2, 160, 'Package name is required.'),
    slug: optStr(200),
    description: optStr(2000),
    inclusions: stringArray(50, 200),
    mealType: z.enum(MEAL_TYPES).optional(),
    startingPrice: nonNegInt().max(100000000).optional(),
    currency: z.enum(MEAL_CURRENCIES).default(DEFAULT_MEAL_CURRENCY),
    minimumOrder: positiveInt().max(1000000).optional(),
    planDuration: optStr(120),
    deliveryInfo: optStr(500),
    ctaLabel: optStr(80),
    displayOrder: z.coerce.number().int().min(0).max(100000).optional(),
    isPublished: bool().optional(),
  })
  .strict();

export const mealPackageUpdateSchema = mealPackageCreateSchema.partial().strict();

export const mealPackageQuerySchema = z.object({
  mealType: z.enum(MEAL_TYPES).optional(),
  search: optStr(160),
  publishedOnly: bool().optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

// ── WeeklyMenu ───────────────────────────────────────────────────────────────
// A slot accepts only a source meal reference; the display snapshot is built
// server-side at publish time and can never be supplied by the client.
const menuSlotSchema = z
  .object({
    mealId: optStr(64),
  })
  .strict()
  .optional();

const menuDaySchema = z
  .object({
    // Monday–Saturday only — Sunday is not a valid production day and the enum
    // rejects it outright.
    day: z.enum(MENU_DAYS, { errorMap: () => ({ message: 'Day must be Monday–Saturday (no Sunday).' }) }),
    available: bool().optional(),
    notes: optStr(500),
    regular: menuSlotSchema,
    balanced: menuSlotSchema,
    vegetarian: menuSlotSchema,
  })
  .strict();

const uniqueDays = (days) =>
  !days || new Set(days.map((d) => d.day)).size === days.length;

export const weeklyMenuCreateSchema = z
  .object({
    title: reqStr(2, 200, 'Menu title is required.'),
    weekStart: z.coerce.date({ errorMap: () => ({ message: 'A valid week start date is required.' }) }),
    weekEnd: z.coerce.date({ errorMap: () => ({ message: 'A valid week end date is required.' }) }),
    days: z.array(menuDaySchema).max(6).optional(),
  })
  .strict()
  .refine((v) => v.weekStart < v.weekEnd, {
    message: 'weekStart must be before weekEnd.',
    path: ['weekEnd'],
  })
  .refine((v) => uniqueDays(v.days), {
    message: 'Each weekday may appear at most once.',
    path: ['days'],
  });

// Update: same content, but partial, no status/publishedAt, and date-order is
// only enforced when BOTH dates are present.
export const weeklyMenuUpdateSchema = z
  .object({
    title: reqStr(2, 200).optional(),
    weekStart: z.coerce.date().optional(),
    weekEnd: z.coerce.date().optional(),
    days: z.array(menuDaySchema).max(6).optional(),
  })
  .strict()
  .refine((v) => !(v.weekStart && v.weekEnd) || v.weekStart < v.weekEnd, {
    message: 'weekStart must be before weekEnd.',
    path: ['weekEnd'],
  })
  .refine((v) => uniqueDays(v.days), {
    message: 'Each weekday may appear at most once.',
    path: ['days'],
  });

export const weeklyMenuPublishSchema = z
  .object({ id: reqStr(1, 64, 'A menu id is required to publish.') })
  .strict();

export const weeklyMenuQuerySchema = z.object({
  status: z.enum(WEEKLY_MENU_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

// ── MealInquiry ──────────────────────────────────────────────────────────────
export const mealInquiryCreateSchema = z
  .object({
    contactName: reqStr(2, 120, 'Your name is required.'),
    companyName: optStr(160),
    phone: reqStr(7, 40, 'A valid phone number is required.'),
    email: email(),
    officeLocation: optStr(200),
    mealsCount: positiveInt().max(1000000),
    mealType: z.enum(MEAL_TYPES).optional(),
    requiredDays: z.coerce.number().int().min(1).max(6).optional(),
    expectedStartDate: z.coerce.date().optional(),
    budgetPerMeal: nonNegInt().max(10000000).optional(),
    message: optStr(4000),
    // Honeypot — mirrors the existing inquiry form's anti-spam field.
    company: z.string().max(200).optional(),
  })
  .strict();

// Admin-side update: only the lifecycle status and internal notes.
export const mealInquiryUpdateSchema = z
  .object({
    status: z.enum(MEAL_INQUIRY_STATUSES).optional(),
    internalNotes: optStr(4000),
  })
  .strict();

export const mealInquiryQuerySchema = z.object({
  status: z.enum(MEAL_INQUIRY_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

// ── MealSettings (singleton upsert) ──────────────────────────────────────────
export const mealSettingsSchema = z
  .object({
    serviceName: optStr(160),
    serviceArea: optStr(160),
    karachiOnly: bool().optional(),
    operatingDays: z.array(z.enum(MENU_DAYS)).max(6).optional(),
    sundayClosed: bool().optional(),
    operatingHours: z
      .object({ opening: optStr(40), closing: optStr(40) })
      .strict()
      .optional(),
    deliveryWindows: stringArray(20, 120),
    maximumDailyCapacity: nonNegInt().max(1000000).optional(),
    sfaLicensed: bool().optional(),
    orderingCutoff: optStr(40),
    regularOrdersEnabled: bool().optional(),
    balancedOrdersEnabled: bool().optional(),
    corporateTrialsEnabled: bool().optional(),
    isPublished: bool().optional(),
  })
  .strict();
