import mongoose from 'mongoose';
import { HOMEPAGE_PLACEMENTS, HOMEPAGE_PLACEMENT_VALUES } from '@/data/placements';

export const MEDIA_CATEGORIES = [
  'Weddings',
  'Corporate',
  'Birthdays',
  'Private Parties',
];

// Re-export placement constants so server code can keep importing from the model.
export { HOMEPAGE_PLACEMENTS, HOMEPAGE_PLACEMENT_VALUES };

const MediaSchema = new mongoose.Schema(
  {
    // ── Core (existing — unchanged) ──
    title: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, enum: MEDIA_CATEGORIES },
    type: { type: String, required: true, enum: ['image', 'video'] },
    url: { type: String, required: true },
    publicId: { type: String, required: true },

    // ── Future-ready optional fields (all default so existing records keep working) ──
    featured: { type: Boolean, default: false },
    homepageFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    clientName: { type: String, trim: true },
    venue: { type: String, trim: true },
    city: { type: String, trim: true },
    eventDate: { type: Date },
    photographer: { type: String, trim: true },
    tags: { type: [String], default: [] },
    featuredVideo: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    // Manually pinned homepage/services hero slot ('' = none). See HOMEPAGE_PLACEMENTS.
    homepagePlacement: { type: String, enum: HOMEPAGE_PLACEMENT_VALUES, default: '' },
  },
  { timestamps: true }
);

// Indexes for scale (5,000+ records) — support the common query shapes.
MediaSchema.index({ createdAt: -1 });
MediaSchema.index({ category: 1, createdAt: -1 });
MediaSchema.index({ type: 1, createdAt: -1 });
MediaSchema.index({ isPublished: 1, createdAt: -1 });
MediaSchema.index({ homepageFeatured: 1, displayOrder: 1 });
MediaSchema.index({ featured: 1, createdAt: -1 });
MediaSchema.index({ homepagePlacement: 1 });

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
