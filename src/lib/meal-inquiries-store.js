import MealInquiry from '@/models/MealInquiry';
import { MEAL_INQUIRY_STATUSES } from '@/data/meal-constants';
import {
  resolveMealBackend,
  fileStore,
  isObjectId,
  clampPagination,
  isoOrNull,
} from './meal-store-helpers';

/**
 * MealInquiry data-access layer — corporate / trial enquiries for Festigo
 * Daily, in a SEPARATE collection from the existing event Inquiry system.
 * MongoDB primary, development-only JSON fallback (.data/meal-inquiries.json).
 *
 * Phase 1 provides the store only: no public POST route and no emails are
 * wired up here.
 */

const LABEL = 'meal-inquiries-store';
const store = fileStore('meal-inquiries.json');

function serialize(doc) {
  const o = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    _id: String(o._id),
    contactName: o.contactName,
    companyName: o.companyName ?? null,
    phone: o.phone,
    email: o.email,
    officeLocation: o.officeLocation ?? null,
    mealsCount: o.mealsCount ?? null,
    mealType: o.mealType ?? null,
    requiredDays: o.requiredDays ?? null,
    expectedStartDate: isoOrNull(o.expectedStartDate),
    budgetPerMeal: o.budgetPerMeal ?? null,
    message: o.message ?? null,
    status: o.status || 'new',
    internalNotes: o.internalNotes ?? null,
    source: o.source || 'festigo-daily',
    createdAt: isoOrNull(o.createdAt),
    updatedAt: isoOrNull(o.updatedAt),
  };
}

export async function createMealInquiry(data) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') return serialize(await MealInquiry.create(data));

  const items = await store.read();
  const now = new Date().toISOString();
  const record = {
    _id: crypto.randomUUID(),
    ...data,
    expectedStartDate: data.expectedStartDate
      ? new Date(data.expectedStartDate).toISOString()
      : null,
    status: 'new',
    source: data.source || 'festigo-daily',
    createdAt: now,
    updatedAt: now,
  };
  items.push(record);
  await store.write(items);
  return serialize(record);
}

export async function listMealInquiries(opts = {}) {
  const { page, pageSize, skip } = clampPagination(opts, { defPageSize: 25, maxPageSize: 100 });
  const be = await resolveMealBackend(LABEL);

  if (be === 'mongo') {
    const filter = {};
    if (opts.status && opts.status !== 'all') filter.status = opts.status;
    const [docs, total] = await Promise.all([
      MealInquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      MealInquiry.countDocuments(filter),
    ]);
    return { items: docs.map(serialize), total, page, pageSize, hasMore: skip + docs.length < total };
  }

  let items = await store.read();
  if (opts.status && opts.status !== 'all') items = items.filter((i) => i.status === opts.status);
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = items.length;
  return {
    items: items.slice(skip, skip + pageSize).map(serialize),
    total,
    page,
    pageSize,
    hasMore: skip + pageSize < total,
  };
}

export async function countMealInquiriesByStatus() {
  const be = await resolveMealBackend(LABEL);
  const statuses =
    be === 'mongo'
      ? (await MealInquiry.find({}, 'status').lean()).map((d) => d.status)
      : (await store.read()).map((d) => d.status || 'new');

  const counts = { total: statuses.length };
  for (const s of MEAL_INQUIRY_STATUSES) counts[s] = 0;
  for (const s of statuses) if (counts[s] != null) counts[s] += 1;
  return counts;
}

export async function updateMealInquiry(id, updates) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    if (!isObjectId(id)) return null;
    const doc = await MealInquiry.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    return doc ? serialize(doc) : null;
  }
  const items = await store.read();
  const idx = items.findIndex((i) => i._id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  await store.write(items);
  return serialize(items[idx]);
}

export async function deleteMealInquiry(id) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    if (!isObjectId(id)) return false;
    return Boolean(await MealInquiry.findByIdAndDelete(id));
  }
  const items = await store.read();
  const next = items.filter((i) => i._id !== id);
  if (next.length === items.length) return false;
  await store.write(next);
  return true;
}
