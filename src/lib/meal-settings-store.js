import MealSettings from '@/models/MealSettings';
import { MENU_DAYS, FESTIGO_DAILY_DEFAULTS, DEFAULT_MEAL_CURRENCY } from '@/data/meal-constants';
import { resolveMealBackend, fileStore, isoOrNull } from './meal-store-helpers';

/**
 * MealSettings singleton data-access layer for Festigo Daily.
 * MongoDB primary, development-only JSON fallback (.data/meal-settings.json).
 *
 * SINGLETON: there is at most ONE settings record. In MongoDB the unique
 * `singletonKey: 'primary'` guarantees it; the file fallback stores a single
 * object. Every write upserts that one record, so duplicates are impossible.
 *
 * Phase 1 does not write settings anywhere — getMealSettings() is a pure read
 * (returns null when nothing is configured), and getMealSettingsOrDefaults()
 * returns the confirmed business defaults WITHOUT touching the database.
 */

const LABEL = 'meal-settings-store';
const SINGLETON_KEY = 'primary';
const store = fileStore('meal-settings.json');

function serialize(doc) {
  const o = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const hours = o.operatingHours || {};
  return {
    _id: o._id != null ? String(o._id) : null,
    serviceName: o.serviceName ?? FESTIGO_DAILY_DEFAULTS.serviceName,
    serviceArea: o.serviceArea ?? FESTIGO_DAILY_DEFAULTS.serviceArea,
    karachiOnly: o.karachiOnly !== false,
    operatingDays: Array.isArray(o.operatingDays) ? o.operatingDays : [...MENU_DAYS],
    sundayClosed: o.sundayClosed !== false,
    operatingHours: {
      opening: hours.opening ?? FESTIGO_DAILY_DEFAULTS.operatingHours.opening,
      closing: hours.closing ?? FESTIGO_DAILY_DEFAULTS.operatingHours.closing,
    },
    deliveryWindows: Array.isArray(o.deliveryWindows) ? o.deliveryWindows : [],
    maximumDailyCapacity: o.maximumDailyCapacity ?? FESTIGO_DAILY_DEFAULTS.maximumDailyCapacity,
    sfaLicensed: o.sfaLicensed !== false,
    orderingCutoff: o.orderingCutoff ?? null,
    currency: DEFAULT_MEAL_CURRENCY,
    regularOrdersEnabled: o.regularOrdersEnabled !== false,
    balancedOrdersEnabled: o.balancedOrdersEnabled !== false,
    corporateTrialsEnabled: o.corporateTrialsEnabled !== false,
    // Public visibility — default false (hidden) when absent, so existing
    // records and fresh defaults keep Festigo Daily off the public site until
    // the owner explicitly enables it.
    publicPageEnabled: o.publicPageEnabled === true,
    showInNavigation: o.publicPageEnabled === true && o.showInNavigation === true,
    showOnHomepage: o.publicPageEnabled === true && o.showOnHomepage === true,
    isPublished: o.isPublished === true,
    createdAt: isoOrNull(o.createdAt),
    updatedAt: isoOrNull(o.updatedAt),
  };
}

/** Pure read: the single settings record, or null if none has been created. */
export async function getMealSettings() {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    const doc = await MealSettings.findOne({ singletonKey: SINGLETON_KEY }).lean();
    return doc ? serialize(doc) : null;
  }
  const found = (await store.read())[0];
  return found ? serialize(found) : null;
}

/**
 * Read the settings, or — if none exists yet — the confirmed business defaults.
 * Never writes to the database, so it is safe to call from public pages before
 * a settings record is seeded.
 */
export async function getMealSettingsOrDefaults() {
  const existing = await getMealSettings();
  return existing || serialize({});
}

/**
 * Upsert the singleton. (Not used in Phase 1 — no settings are written yet.)
 * Always targets the one 'primary' record, so it can never create a duplicate.
 */
export async function upsertMealSettings(updates = {}) {
  const patch = { ...updates };
  delete patch._id;
  delete patch.singletonKey;

  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    const doc = await MealSettings.findOneAndUpdate(
      { singletonKey: SINGLETON_KEY },
      { $set: patch, $setOnInsert: { singletonKey: SINGLETON_KEY } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return serialize(doc);
  }

  const items = await store.read();
  const now = new Date().toISOString();
  const existing = items[0];
  // On first insert, spread the defaults FIRST so `serialize({})`'s null `_id`
  // can't clobber the generated id — otherwise the record persists with
  // `_id:null` and GET keeps reporting `exists:false` after a successful save.
  const next = existing
    ? { ...existing, ...patch, updatedAt: now }
    : { ...serialize({}), _id: crypto.randomUUID(), ...patch, createdAt: now, updatedAt: now };
  await store.write([next]);
  return serialize(next);
}
