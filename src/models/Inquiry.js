import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    eventType: {
      type: String,
      required: true,
      enum: [
        'Wedding',
        'Corporate Event',
        'Birthday',
        'Private Party',
        'Contact / General',
        'Other',
      ],
    },
    eventDate: { type: Date },
    guestCount: { type: Number, min: 0 },
    budget: { type: String, trim: true },
    message: { type: String, trim: true, maxlength: 4000 },
    status: {
      type: String,
      enum: ['new', 'contacted', 'booked', 'archived'],
      default: 'new',
      index: true,
    },
    source: { type: String, default: 'booking-form' },
  },
  { timestamps: true }
);

// Most-recent-first is the default admin view.
InquirySchema.index({ createdAt: -1 });

export default mongoose.models.Inquiry ||
  mongoose.model('Inquiry', InquirySchema);
