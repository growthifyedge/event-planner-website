import mongoose from 'mongoose';
import { MEAL_TYPES, SPICE_LEVELS } from '@/data/meal-constants';

/**
 * Meal — a single dish/offering in the Festigo Daily catalogue.
 *
 * Isolated from the existing Media / Inquiry domain. Contains NO contact
 * information and NO calorie / therapeutic / medical fields (Phase 1 scope).
 * New records default to unpublished so nothing reaches the public surface
 * until it is explicitly published.
 */

// Reusable image sub-document (Cloudinary-backed, populated in a later phase).
const MealImageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, trim: true, maxlength: 200 },
  },
  { _id: false }
);

const MealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    // Optional friendly identifier for future public URLs. Sparse + unique so
    // meals without a slug never collide, but a set slug stays unique.
    slug: { type: String, trim: true, lowercase: true, maxlength: 200 },

    mealType: { type: String, required: true, enum: MEAL_TYPES },

    mainDish: { type: String, trim: true, maxlength: 200 },
    base: { type: String, trim: true, maxlength: 200 },
    side: { type: String, trim: true, maxlength: 200 },
    vegetarianAlternative: { type: String, trim: true, maxlength: 200 },

    allergens: { type: [String], default: [] },

    spiceLevel: { type: String, enum: SPICE_LEVELS, default: 'not-applicable' },
    category: { type: String, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000 },

    image: { type: MealImageSchema, default: undefined },

    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MealSchema.index({ isPublished: 1, createdAt: -1 });
MealSchema.index({ mealType: 1, createdAt: -1 });
MealSchema.index({ slug: 1 }, { unique: true, sparse: true });

export default mongoose.models.Meal || mongoose.model('Meal', MealSchema);
