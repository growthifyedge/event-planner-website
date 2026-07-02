import mongoose from 'mongoose';

export const MEDIA_CATEGORIES = [
  'Weddings',
  'Corporate',
  'Birthdays',
  'Private Parties',
];

const MediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, enum: MEDIA_CATEGORIES },
    type: { type: String, required: true, enum: ['image', 'video'] },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true }
);

MediaSchema.index({ createdAt: -1 });

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
