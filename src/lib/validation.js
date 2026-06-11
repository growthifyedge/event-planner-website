import { z } from 'zod';

export const EVENT_TYPES = [
  'Wedding',
  'Corporate Event',
  'Birthday',
  'Private Party',
  'Contact / General',
  'Other',
];

export const BUDGET_RANGES = [
  'Under Rs 500,000',
  'Rs 500,000 – Rs 1,500,000',
  'Rs 1,500,000 – Rs 3,000,000',
  'Rs 3,000,000 – Rs 7,500,000',
  'Rs 7,500,000+',
];

const optionalString = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal('').transform(() => undefined));

export const inquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Please enter a valid phone number.')
    .max(40),
  eventType: z.enum(EVENT_TYPES, {
    errorMap: () => ({ message: 'Please choose an event type.' }),
  }),
  eventDate: optionalString(40),
  guestCount: z
    .union([z.coerce.number().int().min(0).max(1000000), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : Number(v))),
  budget: optionalString(60),
  message: optionalString(4000),
  // Honeypot — bots that fill this are silently accepted but not stored.
  company: z.string().max(200).optional(),
});
