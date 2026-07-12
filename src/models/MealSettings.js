import mongoose from 'mongoose';
import { MENU_DAYS, FESTIGO_DAILY_DEFAULTS } from '@/data/meal-constants';

/**
 * MealSettings — singleton settings source for Festigo Daily.
 *
 * SINGLETON DESIGN
 * ----------------
 * `singletonKey` is fixed to 'primary', immutable, and uniquely indexed, so
 * the database itself guarantees at most one settings document ever exists —
 * a second insert would violate the unique index. The store always upserts on
 * this key, so there can never be duplicate active settings.
 *
 * Schema defaults mirror the confirmed business defaults, but Phase 1 writes
 * NOTHING to the database — the defaults only materialise if/when a future
 * seeding step creates the document.
 */

const HoursSchema = new mongoose.Schema(
  {
    opening: { type: String, trim: true, default: FESTIGO_DAILY_DEFAULTS.operatingHours.opening },
    closing: { type: String, trim: true, default: FESTIGO_DAILY_DEFAULTS.operatingHours.closing },
  },
  { _id: false }
);

const MealSettingsSchema = new mongoose.Schema(
  {
    // Enforces the singleton at the database layer.
    singletonKey: {
      type: String,
      default: 'primary',
      immutable: true,
      unique: true,
    },

    serviceName: { type: String, trim: true, maxlength: 160, default: FESTIGO_DAILY_DEFAULTS.serviceName },
    serviceArea: { type: String, trim: true, maxlength: 160, default: FESTIGO_DAILY_DEFAULTS.serviceArea },
    karachiOnly: { type: Boolean, default: FESTIGO_DAILY_DEFAULTS.karachiOnly },

    operatingDays: { type: [String], enum: MENU_DAYS, default: () => [...MENU_DAYS] },
    sundayClosed: { type: Boolean, default: FESTIGO_DAILY_DEFAULTS.sundayClosed },
    operatingHours: { type: HoursSchema, default: () => ({}) },

    deliveryWindows: { type: [String], default: [] },
    maximumDailyCapacity: {
      type: Number,
      min: 0,
      default: FESTIGO_DAILY_DEFAULTS.maximumDailyCapacity,
    },
    sfaLicensed: { type: Boolean, default: FESTIGO_DAILY_DEFAULTS.sfaLicensed },
    orderingCutoff: { type: String, trim: true, maxlength: 40 },

    regularOrdersEnabled: { type: Boolean, default: true },
    balancedOrdersEnabled: { type: Boolean, default: true },
    corporateTrialsEnabled: { type: Boolean, default: true },

    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.MealSettings ||
  mongoose.model('MealSettings', MealSettingsSchema);
