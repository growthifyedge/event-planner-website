import mongoose from 'mongoose';
import {
  MEAL_TYPES,
  SPICE_LEVELS,
  MENU_DAYS,
  WEEKLY_MENU_STATUSES,
} from '@/data/meal-constants';

/**
 * WeeklyMenu — a Monday–Saturday menu for Festigo Daily.
 *
 * Public gate: status === 'published' (there is no separate isPublished flag;
 * the lifecycle status is the single source of truth). See weekly-menu-store
 * for getActivePublishedMenu().
 *
 * SNAPSHOT DESIGN
 * ---------------
 * Each meal slot keeps two things:
 *   - `mealId`   → a reference back to the source Meal (traceability / re-edit)
 *   - `snapshot` → a frozen copy of the display fields at publish time
 *
 * The public menu and (future) poster generator render from `snapshot` ONLY.
 * When a menu is published the store copies the current Meal display fields
 * into each slot's snapshot. Editing the source Meal afterwards therefore does
 * NOT silently change an already-published menu — the snapshot is immutable
 * display data until the menu is re-published. Drafts may carry only mealId
 * (no snapshot yet); the snapshot is materialised at publish time.
 */

// Frozen display copy of a Meal — everything the public menu / poster needs.
const MealSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    mealType: { type: String, enum: MEAL_TYPES },
    mainDish: { type: String, trim: true },
    base: { type: String, trim: true },
    side: { type: String, trim: true },
    vegetarianAlternative: { type: String, trim: true },
    allergens: { type: [String], default: [] },
    spiceLevel: { type: String, enum: SPICE_LEVELS },
    category: { type: String, trim: true },
    image: {
      type: new mongoose.Schema(
        {
          url: { type: String, trim: true },
          publicId: { type: String, trim: true },
          alt: { type: String, trim: true },
        },
        { _id: false }
      ),
      default: undefined,
    },
  },
  { _id: false }
);

// One meal slot within a day (regular / balanced / vegetarian).
const MealSlotSchema = new mongoose.Schema(
  {
    mealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meal' },
    snapshot: { type: MealSnapshotSchema, default: undefined },
  },
  { _id: false }
);

// One production day. `day` is constrained to Monday–Saturday — Sunday is
// never a valid menu-production day.
const DaySchema = new mongoose.Schema(
  {
    day: { type: String, required: true, enum: MENU_DAYS },
    available: { type: Boolean, default: true },
    notes: { type: String, trim: true, maxlength: 500 },
    regular: { type: MealSlotSchema, default: undefined },
    balanced: { type: MealSlotSchema, default: undefined },
    vegetarian: { type: MealSlotSchema, default: undefined },
  },
  { _id: false }
);

const WeeklyMenuSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    weekStart: { type: Date, required: true },
    weekEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: WEEKLY_MENU_STATUSES,
      default: 'draft',
      index: true,
    },
    days: { type: [DaySchema], default: [] },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

WeeklyMenuSchema.index({ status: 1, weekStart: -1 });
WeeklyMenuSchema.index({ weekStart: 1, weekEnd: 1 });

export default mongoose.models.WeeklyMenu ||
  mongoose.model('WeeklyMenu', WeeklyMenuSchema);
