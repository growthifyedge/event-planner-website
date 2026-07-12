// Shared display labels for the Festigo Daily Meal Studio. Enum VALUES come
// from the approved Phase 1 constants — these only map them to friendly labels
// and badge styles for the admin UI (no enum is redefined here).
import { MEAL_INQUIRY_STATUSES, MEAL_TYPES, MENU_DAYS } from '@/data/meal-constants';

export { MEAL_INQUIRY_STATUSES, MEAL_TYPES, MENU_DAYS };

// Corporate enquiry status → friendly label (source of truth = Phase 1 enum:
// new, contacted, trial-scheduled, converted, closed).
export const ENQUIRY_STATUS_LABEL = {
  new: 'New',
  contacted: 'Contacted',
  'trial-scheduled': 'Trial Scheduled',
  converted: 'Converted',
  closed: 'Closed',
};

export const ENQUIRY_STATUS_STYLE = {
  new: 'bg-gold-100 text-gold-800 border-gold-300',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  'trial-scheduled': 'bg-violet-50 text-violet-700 border-violet-200',
  converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-ink-100 text-ink-500 border-ink-200',
};

export const MEAL_TYPE_LABEL = {
  regular: 'Regular',
  balanced: 'Balanced',
  vegetarian: 'Vegetarian',
};

export const MENU_STATUS_STYLE = {
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  archived: 'bg-ink-100 text-ink-500 border-ink-200',
};

// Format an integer PKR amount, or return a dash.
export const pkr = (v) =>
  typeof v === 'number' && Number.isFinite(v) ? `PKR ${v.toLocaleString('en-PK')}` : '—';
