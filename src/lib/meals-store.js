import Meal from '@/models/Meal';
import {
  resolveMealBackend,
  fileStore,
  escapeRegex,
  isObjectId,
  clampPagination,
  isoOrNull,
} from './meal-store-helpers';

/**
 * Meals data-access layer for Festigo Daily. MongoDB primary, development-only
 * JSON fallback (.data/meals.json). All reads go through queryMeals() so
 * pagination / filtering / sorting happen in the database, and every returned
 * object is a plain whitelisted shape — Mongoose documents never leak out.
 */

const LABEL = 'meals-store';
const store = fileStore('meals.json');

function serialize(doc) {
  const o = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const img = o.image || null;
  return {
    _id: String(o._id),
    name: o.name,
    slug: o.slug ?? null,
    mealType: o.mealType,
    mainDish: o.mainDish ?? null,
    base: o.base ?? null,
    side: o.side ?? null,
    vegetarianAlternative: o.vegetarianAlternative ?? null,
    allergens: Array.isArray(o.allergens) ? o.allergens : [],
    spiceLevel: o.spiceLevel ?? 'not-applicable',
    category: o.category ?? null,
    description: o.description ?? null,
    image: img ? { url: img.url ?? null, publicId: img.publicId ?? null, alt: img.alt ?? null } : null,
    isPublished: o.isPublished === true,
    createdAt: isoOrNull(o.createdAt),
    updatedAt: isoOrNull(o.updatedAt),
  };
}

function mongoFilter({ mealType, category, search, publishedOnly }) {
  const f = {};
  if (mealType && mealType !== 'All') f.mealType = mealType;
  if (category && category !== 'All') f.category = category;
  if (publishedOnly) f.isPublished = true;
  if (search && String(search).trim()) {
    f.name = { $regex: escapeRegex(String(search).trim()), $options: 'i' };
  }
  return f;
}

const mongoSort = (sort) => (sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 });

function fileMatch(item, o) {
  if (o.mealType && o.mealType !== 'All' && item.mealType !== o.mealType) return false;
  if (o.category && o.category !== 'All' && item.category !== o.category) return false;
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

/** The single paginated/filtered query. @returns {{items,total,page,pageSize,hasMore}} */
export async function queryMeals(opts = {}) {
  const { page, pageSize, skip } = clampPagination(opts);
  const be = await resolveMealBackend(LABEL);

  if (be === 'mongo') {
    const filter = mongoFilter(opts);
    const [docs, total] = await Promise.all([
      Meal.find(filter).sort(mongoSort(opts.sort)).skip(skip).limit(pageSize).lean(),
      Meal.countDocuments(filter),
    ]);
    return { items: docs.map(serialize), total, page, pageSize, hasMore: skip + docs.length < total };
  }

  let items = (await store.read()).filter((i) => fileMatch(i, opts));
  items.sort((a, b) =>
    opts.sort === 'oldest'
      ? new Date(a.createdAt) - new Date(b.createdAt)
      : new Date(b.createdAt) - new Date(a.createdAt)
  );
  const total = items.length;
  return {
    items: items.slice(skip, skip + pageSize).map(serialize),
    total,
    page,
    pageSize,
    hasMore: skip + pageSize < total,
  };
}

// ── Public read helpers (published-only) ──
export const getPublishedMeals = (opts = {}) => queryMeals({ publishedOnly: true, ...opts });

export async function getMealById(id) {
  if (!isObjectId(id)) {
    // In dev the JSON fallback uses UUID ids, so only bail early for mongo.
    if (process.env.MONGODB_URI) return null;
  }
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    if (!isObjectId(id)) return null;
    const doc = await Meal.findById(id).lean();
    return doc ? serialize(doc) : null;
  }
  const found = (await store.read()).find((i) => i._id === id);
  return found ? serialize(found) : null;
}

// ── CRUD ──
export async function createMeal(data) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') return serialize(await Meal.create(data));

  const items = await store.read();
  const now = new Date().toISOString();
  const record = {
    _id: crypto.randomUUID(),
    isPublished: false,
    allergens: [],
    spiceLevel: 'not-applicable',
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  items.push(record);
  await store.write(items);
  return serialize(record);
}

export async function updateMeal(id, updates) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    if (!isObjectId(id)) return null;
    const doc = await Meal.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    return doc ? serialize(doc) : null;
  }
  const items = await store.read();
  const idx = items.findIndex((i) => i._id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  await store.write(items);
  return serialize(items[idx]);
}

export async function deleteMeal(id) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    if (!isObjectId(id)) return null;
    const doc = await Meal.findByIdAndDelete(id);
    return doc ? serialize(doc) : null;
  }
  const items = await store.read();
  const found = items.find((i) => i._id === id);
  if (!found) return null;
  await store.write(items.filter((i) => i._id !== id));
  return serialize(found);
}
