import mongoose from 'mongoose';
import { MEAL_TYPES, MEAL_INQUIRY_STATUSES } from '@/data/meal-constants';

/**
 * MealInquiry — corporate / trial enquiries for Festigo Daily.
 *
 * A SEPARATE collection from the existing event Inquiry model — the two are
 * never mixed. No public POST API and no emails are wired in Phase 1; this is
 * the data foundation only.
 */

const isInt = (v) => Number.isInteger(v);

const MealInquirySchema = new mongoose.Schema(
  {
    contactName: { type: String, required: true, trim: true, maxlength: 120 },
    companyName: { type: String, trim: true, maxlength: 160 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    officeLocation: { type: String, trim: true, maxlength: 200 },

    mealsCount: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: isInt, message: 'mealsCount must be a positive integer.' },
    },
    mealType: { type: String, enum: MEAL_TYPES },

    requiredDays: {
      type: Number,
      min: 1,
      max: 6, // Monday–Saturday only.
      validate: {
        validator: (v) => v == null || isInt(v),
        message: 'requiredDays must be a positive integer.',
      },
    },

    expectedStartDate: { type: Date },
    budgetPerMeal: { type: Number, min: 0 },

    message: { type: String, trim: true, maxlength: 4000 },

    status: {
      type: String,
      enum: MEAL_INQUIRY_STATUSES,
      default: 'new',
      index: true,
    },
    internalNotes: { type: String, trim: true, maxlength: 4000 },
    source: { type: String, default: 'festigo-daily' },
  },
  { timestamps: true }
);

MealInquirySchema.index({ createdAt: -1 });
MealInquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.MealInquiry ||
  mongoose.model('MealInquiry', MealInquirySchema);
