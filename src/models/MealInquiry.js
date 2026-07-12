import mongoose from 'mongoose';
import { MEAL_TYPES, MEAL_INQUIRY_STATUSES, MEAL_SERVICE_TYPES } from '@/data/meal-constants';

/**
 * MealInquiry — corporate / trial enquiries for Festigo Daily.
 *
 * A SEPARATE collection from the existing event Inquiry model — the two are
 * never mixed.
 *
 * Phase 3 additively extended this with optional corporate-enquiry fields
 * (designation, whatsapp, address, serviceTypes, employeesCount, monthlyBudget,
 * dietaryPreferences). Every addition is optional, so existing Phase 1 records
 * remain valid and nothing pre-existing changed.
 */

const isInt = (v) => Number.isInteger(v);

const MealInquirySchema = new mongoose.Schema(
  {
    contactName: { type: String, required: true, trim: true, maxlength: 120 },
    companyName: { type: String, trim: true, maxlength: 160 },
    // Phase 3: contact person's job title (optional).
    designation: { type: String, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    // Phase 3: optional WhatsApp number (separate from phone).
    whatsapp: { type: String, trim: true, maxlength: 40 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    // Karachi service area (see KARACHI_AREAS — Karachi-only enforcement).
    officeLocation: { type: String, trim: true, maxlength: 200 },
    // Phase 3: complete office address (optional free text).
    address: { type: String, trim: true, maxlength: 500 },

    // Phase 3: one or more selected corporate services.
    serviceTypes: { type: [String], enum: MEAL_SERVICE_TYPES, default: [] },

    mealsCount: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: isInt, message: 'mealsCount must be a positive integer.' },
    },
    mealType: { type: String, enum: MEAL_TYPES },
    // Phase 3: number of employees / headcount (optional).
    employeesCount: {
      type: Number,
      min: 1,
      validate: {
        validator: (v) => v == null || isInt(v),
        message: 'employeesCount must be a positive integer.',
      },
    },

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
    // Phase 3: estimated monthly budget in PKR (optional).
    monthlyBudget: { type: Number, min: 0 },

    // Phase 3: optional dietary preferences and additional requirements.
    dietaryPreferences: { type: String, trim: true, maxlength: 1000 },
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
