import mongoose from 'mongoose';
import { MEAL_TYPES, MEAL_CURRENCIES, DEFAULT_MEAL_CURRENCY } from '@/data/meal-constants';

/**
 * MealPackage — a purchasable Festigo Daily plan (pricing lives in the data
 * layer, never hard-coded in UI). Prices are non-negative integers in PKR;
 * minimum order is a positive integer. New records default to unpublished.
 */

const isInt = (v) => Number.isInteger(v);

const MealPackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, trim: true, lowercase: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },

    inclusions: { type: [String], default: [] },
    mealType: { type: String, enum: MEAL_TYPES },

    // Whole-rupee amounts only — no fractional currency.
    startingPrice: {
      type: Number,
      min: 0,
      validate: { validator: isInt, message: 'startingPrice must be a non-negative integer.' },
    },
    currency: { type: String, enum: MEAL_CURRENCIES, default: DEFAULT_MEAL_CURRENCY },

    minimumOrder: {
      type: Number,
      min: 1,
      validate: { validator: isInt, message: 'minimumOrder must be a positive integer.' },
    },

    planDuration: { type: String, trim: true, maxlength: 120 },
    deliveryInfo: { type: String, trim: true, maxlength: 500 },
    ctaLabel: { type: String, trim: true, maxlength: 80 },

    displayOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MealPackageSchema.index({ isPublished: 1, displayOrder: 1 });
MealPackageSchema.index({ slug: 1 }, { unique: true, sparse: true });

export default mongoose.models.MealPackage ||
  mongoose.model('MealPackage', MealPackageSchema);
