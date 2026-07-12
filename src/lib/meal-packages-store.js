import MealPackage from '@/models/MealPackage';
import { DEFAULT_MEAL_CURRENCY } from '@/data/meal-constants';
import {
  resolveMealBackend,
  fileStore,
  escapeRegex,
  isObjectId,
  clampPagination,
  isoOrNull,
} from './meal-store-helpers';

/**
 * MealPackage data-access layer. MongoDB primary, development-only JSON
 * fallback (.data/meal-packages.json). Prices live here, never in UI files.
 */

const LABEL = 'meal-packages-store';
const store = fileStore('meal-packages.json');

function serialize(doc) {
  const o = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    _id: String(o._id),
    name: o.name,
    slug: o.slug ?? null,
    description: o.description ?? null,
    inclusions: Array.isArray(o.inclusions) ? o.inclusions : [],
    mealType: o.mealType ?? null,
    startingPrice: o.startingPrice ?? null,
    currency: o.currency || DEFAULT_MEAL_CURRENCY,
    minimumOrder: o.minimumOrder ?? null,
    planDuration: o.planDuration ?? null,
    deliveryInfo: o.deliveryInfo ?? null,
    ctaLabel: o.ctaLabel ?? null,
    displayOrder: o.displayOrder ?? 0,
    isPublished: o.isPublished === true,
    createdAt: isoOrNull(o.createdAt),
    updatedAt: isoOrNull(o.updatedAt),
  };
}

function mongoFilter({ mealType, search, publishedOnly }) {
  const f = {};
  if (mealType && mealType !== 'All') f.mealType = mealType;
  if (publishedOnly) f.isPublished = true;
  if (search && String(search).trim()) {
    f.name = { $regex: escapeRegex(String(search).trim()), $options: 'i' };
  }
  return f;
}

function fileMatch(item, o) {
  if (o.mealType && o.mealType !== 'All' && item.mealType !== o.mealType) return false;
  if (o.publishedOnly && item.isPublished !== true) return false;
  if (
    o.search &&
    String(o.search).trim() &&
    !String(item.name || '').toLowerCase().includes(String(o.search).trim().toLowerCase())
  ) {
    return false;
  }
  return true;
}

// Ordered by displayOrder (asc) then newest — the natural catalogue order.
const byDisplayOrder = (a, b) =>
  (a.displayOrder ?? 0) - (b.displayOrder ?? 0) ||
  new Date(b.createdAt) - new Date(a.createdAt);

/** Paginated/filtered query. @returns {{items,total,page,pageSize,hasMore}} */
export async function queryMealPackages(opts = {}) {
  const { page, pageSize, skip } = clampPagination(opts, { defPageSize: 20, maxPageSize: 100 });
  const be = await resolveMealBackend(LABEL);

  if (be === 'mongo') {
    const filter = mongoFilter(opts);
    const [docs, total] = await Promise.all([
      MealPackage.find(filter).sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      MealPackage.countDocuments(filter),
    ]);
    return { items: docs.map(serialize), total, page, pageSize, hasMore: skip + docs.length < total };
  }

  let items = (await store.read()).filter((i) => fileMatch(i, opts));
  items.sort(byDisplayOrder);
  const total = items.length;
  return {
    items: items.slice(skip, skip + pageSize).map(serialize),
    total,
    page,
    pageSize,
    hasMore: skip + pageSize < total,
  };
}

// ── Public read helper (published-only) ──
export const getPublishedMealPackages = (opts = {}) =>
  queryMealPackages({ publishedOnly: true, ...opts });

// ── CRUD ──
export async function createMealPackage(data) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') return serialize(await MealPackage.create(data));

  const items = await store.read();
  const now = new Date().toISOString();
  const record = {
    _id: crypto.randomUUID(),
    currency: DEFAULT_MEAL_CURRENCY,
    inclusions: [],
    displayOrder: 0,
    isPublished: false,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  items.push(record);
  await store.write(items);
  return serialize(record);
}

export async function updateMealPackage(id, updates) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    if (!isObjectId(id)) return null;
    const doc = await MealPackage.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    return doc ? serialize(doc) : null;
  }
  const items = await store.read();
  const idx = items.findIndex((i) => i._id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  await store.write(items);
  return serialize(items[idx]);
}

export async function deleteMealPackage(id) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    if (!isObjectId(id)) return null;
    const doc = await MealPackage.findByIdAndDelete(id);
    return doc ? serialize(doc) : null;
  }
  const items = await store.read();
  const found = items.find((i) => i._id === id);
  if (!found) return null;
  await store.write(items.filter((i) => i._id !== id));
  return serialize(found);
}
