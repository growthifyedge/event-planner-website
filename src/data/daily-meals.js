// ═══════════════════════════════════════════════════════════════════════════
//  FESTIGO DAILY — static presentational copy for the public /daily-meals page.
//  Business facts (hours, capacity, cut-off) come from MealSettings at request
//  time; this file only holds fixed marketing copy and small view helpers.
//  Contact details are NEVER hard-coded here — the WhatsApp helper derives the
//  number from the centralized src/data/site.js.
// ═══════════════════════════════════════════════════════════════════════════
import { site } from './site';

export const dailyBrand = {
  name: 'Festigo Daily',
  parent: 'Festigo Event Planner & Caterers',
  subtitle: 'Office Lunches & Balanced Meal Plans',
  heroMessage:
    'Fresh, reliable and professionally prepared meals for offices, teams and individuals across Karachi.',
};

/**
 * Build a WhatsApp deep-link from the centralized number in site.js (digits
 * only, per wa.me rules) with a Festigo Daily–specific prefilled message. This
 * reuses the single source-of-truth number — it does not duplicate it.
 */
export function dailyWhatsAppHref(
  message = 'Hello Festigo Daily! I’d like to know more about your office lunches and meal plans.'
) {
  const digits = String(site.whatsapp || '').replace(/\D/g, '');
  const base = digits ? `https://wa.me/${digits}` : site.whatsappHref;
  return `${base}?text=${encodeURIComponent(message)}`;
}

// Format a stored 'HH:MM' (24h) value as a friendly 'h:MM AM/PM'. Falls back to
// the raw value if it isn't in the expected shape.
export function formatTime(value) {
  if (typeof value !== 'string') return value ?? '';
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return value;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const suffix = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${min} ${suffix}`;
}

// The four approved service categories (fixed copy — no ordering system).
export const serviceCategories = [
  {
    key: 'regular',
    icon: 'UtensilsCrossed',
    title: 'Regular Office Lunches',
    description:
      'Dependable, freshly prepared daily lunches for teams — hearty, well-portioned meals delivered on a schedule that suits your office.',
  },
  {
    key: 'balanced',
    icon: 'Salad',
    title: 'Balanced Meal Plans',
    description:
      'Thoughtfully composed meals with a lighter, well-rounded profile — a considered option for individuals and teams who prefer balance.',
  },
  {
    key: 'corporate',
    icon: 'Building2',
    title: 'Corporate Meal Programs',
    description:
      'Recurring meal programs for offices and organisations, arranged around your headcount, schedule and delivery location across Karachi.',
  },
  {
    key: 'trial',
    icon: 'HandPlatter',
    title: 'Trial & Tasting Meals',
    description:
      'Sample the quality before you commit. We arrange trial and tasting meals so businesses can evaluate the menu with their team.',
  },
];

// Simple, informational customer journey (no checkout / cart / accounts).
export const howItWorksSteps = [
  {
    icon: 'ClipboardCheck',
    title: 'Choose your option',
    description: 'Pick a meal plan or a regular office lunch arrangement that fits your team.',
  },
  {
    icon: 'MessageCircle',
    title: 'Contact us on WhatsApp',
    description: 'Message Festigo Daily to share your requirements and ask any questions.',
  },
  {
    icon: 'CalendarDays',
    title: 'Confirm the details',
    description: 'Agree on quantity, delivery schedule and your office location in Karachi.',
  },
  {
    icon: 'Truck',
    title: 'Receive fresh meals',
    description: 'Enjoy freshly prepared meals delivered according to the agreed schedule.',
  },
];

// Audiences highlighted in the corporate call-to-action.
export const corporateAudiences = [
  'Offices',
  'Teams',
  'Schools',
  'Clinics',
  'Studios',
  'Small & medium businesses',
];

/**
 * Build the FAQ list from confirmed business info + live MealSettings. Any
 * value that can't be expressed safely falls back to neutral wording — no
 * fixed cut-off or unsupported claim is ever invented.
 */
export function buildDailyFaqs(settings = {}) {
  const area = settings.serviceArea || 'Karachi';
  const opening = formatTime(settings.operatingHours?.opening) || '7:00 AM';
  const closing = formatTime(settings.operatingHours?.closing) || '7:00 PM';
  const capacity = settings.maximumDailyCapacity || 500;
  const cutoff = typeof settings.orderingCutoff === 'string' ? settings.orderingCutoff.trim() : '';

  return [
    {
      q: 'Which areas do you serve?',
      a: `Festigo Daily currently serves ${area} only. Share your office location on WhatsApp and we’ll confirm delivery for your area.`,
    },
    {
      q: 'Which days do you operate?',
      a: `We operate Monday to Saturday, ${opening} to ${closing}. We are closed on Sundays.`,
    },
    {
      q: 'Are balanced meal plans available?',
      a: 'Yes. Alongside regular office lunches, we offer balanced meal plans with a lighter, well-rounded profile.',
    },
    {
      q: 'Can offices request a trial meal?',
      a: 'Absolutely. We arrange trial and tasting meals so your team can evaluate the menu before committing to a plan.',
    },
    {
      q: 'How early should an order be confirmed?',
      a: cutoff
        ? `Advance confirmation is recommended. Our current ordering cut-off is ${cutoff}. Contact Festigo Daily to confirm timing for your order.`
        : 'Advance confirmation is recommended. Contact Festigo Daily for the applicable cut-off.',
    },
    {
      q: 'Can you handle large office orders?',
      a: `Yes. We prepare up to ${capacity} combined meals per day. Get in touch with your headcount and we’ll plan the schedule with you.`,
    },
  ];
}
