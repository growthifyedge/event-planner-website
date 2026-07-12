import mongoose from 'mongoose';
import WeeklyMenu from '@/models/WeeklyMenu';
import Meal from '@/models/Meal';
import {
  resolveMealBackend,
  fileStore,
  isObjectId,
  clampPagination,
  isoOrNull,
} from './meal-store-helpers';

/**
 * WeeklyMenu data-access + publishing layer for Festigo Daily.
 * MongoDB primary, development-only JSON fallback (.data/weekly-menus.json).
 *
 * Publishing behaviour (all of it lives HERE, never in UI):
 *  - publishWeeklyMenu() freezes a display SNAPSHOT of each referenced Meal
 *    into the menu, then flips status → 'published'. Public reads render from
 *    the snapshot, so later edits to a Meal never mutate a published menu.
 *  - Publishing archives any OTHER published menu whose date range overlaps,
 *    so two conflicting published menus can't cover the same dates.
 *  - getActivePublishedMenu() returns the menu the public site should show.
 */

const LABEL = 'weekly-menu-store';
const store = fileStore('weekly-menus.json');
const mealsFile = fileStore('meals.json');

const SLOT_KEYS = ['regular', 'balanced', 'vegetarian'];

// ── snapshot construction ──────────────────────────────────────────────────
function buildSnapshot(meal) {
  if (!meal) return null;
  const img = meal.image || null;
  return {
    name: meal.name ?? null,
    mealType: meal.mealType ?? null,
    mainDish: meal.mainDish ?? null,
    base: meal.base ?? null,
    side: meal.side ?? null,
    vegetarianAlternative: meal.vegetarianAlternative ?? null,
    allergens: Array.isArray(meal.allergens) ? meal.allergens : [],
    spiceLevel: meal.spiceLevel ?? null,
    category: meal.category ?? null,
    image: img ? { url: img.url ?? null, publicId: img.publicId ?? null, alt: img.alt ?? null } : null,
  };
}

// Fetch every referenced Meal once, keyed by id string, for the active backend.
async function fetchMealsMap(ids, be, session = null) {
  const unique = [...new Set(ids.filter(Boolean).map(String))];
  const map = new Map();
  if (unique.length === 0) return map;

  if (be === 'mongo') {
    const valid = unique.filter(isObjectId);
    if (valid.length === 0) return map;
    const docs = await Meal.find({ _id: { $in: valid } })
      .session(session)
      .lean();
    for (const d of docs) map.set(String(d._id), d);
    return map;
  }
  const all = await mealsFile.read();
  for (const m of all) if (unique.includes(String(m._id))) map.set(String(m._id), m);
  return map;
}

// Collect the meal ids referenced across all day slots.
function collectMealIds(days = []) {
  const ids = [];
  for (const day of days) {
    for (const key of SLOT_KEYS) {
      const slot = day?.[key];
      if (slot?.mealId) ids.push(slot.mealId);
    }
  }
  return ids;
}

// Return a new `days` array with each slot's snapshot frozen from `mealsMap`.
function freezeSnapshots(days = [], mealsMap) {
  return days.map((day) => {
    const next = { ...day };
    for (const key of SLOT_KEYS) {
      const slot = day?.[key];
      if (slot?.mealId) {
        next[key] = { mealId: slot.mealId, snapshot: buildSnapshot(mealsMap.get(String(slot.mealId))) };
      } else if (slot) {
        // No source meal — keep any snapshot already supplied inline.
        next[key] = { ...slot };
      }
    }
    return next;
  });
}

// ── serialization (whitelist; Mongoose docs never leak) ─────────────────────
function serializeSlot(slot) {
  if (!slot) return null;
  const snap = slot.snapshot || null;
  return {
    mealId: slot.mealId ? String(slot.mealId) : null,
    snapshot: snap
      ? {
          name: snap.name ?? null,
          mealType: snap.mealType ?? null,
          mainDish: snap.mainDish ?? null,
          base: snap.base ?? null,
          side: snap.side ?? null,
          vegetarianAlternative: snap.vegetarianAlternative ?? null,
          allergens: Array.isArray(snap.allergens) ? snap.allergens : [],
          spiceLevel: snap.spiceLevel ?? null,
          category: snap.category ?? null,
          image: snap.image
            ? { url: snap.image.url ?? null, publicId: snap.image.publicId ?? null, alt: snap.image.alt ?? null }
            : null,
        }
      : null,
  };
}

function serializeDay(day) {
  return {
    day: day.day,
    available: day.available !== false,
    notes: day.notes ?? null,
    regular: serializeSlot(day.regular),
    balanced: serializeSlot(day.balanced),
    vegetarian: serializeSlot(day.vegetarian),
  };
}

function serialize(doc) {
  const o = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    _id: String(o._id),
    title: o.title,
    weekStart: isoOrNull(o.weekStart),
    weekEnd: isoOrNull(o.weekEnd),
    status: o.status || 'draft',
    days: Array.isArray(o.days) ? o.days.map(serializeDay) : [],
    publishedAt: isoOrNull(o.publishedAt),
    createdAt: isoOrNull(o.createdAt),
    updatedAt: isoOrNull(o.updatedAt),
  };
}

const rangesOverlap = (aStart, aEnd, bStart, bEnd) =>
  new Date(aStart) <= new Date(bEnd) && new Date(aEnd) >= new Date(bStart);

// ── queries ─────────────────────────────────────────────────────────────────
export async function queryWeeklyMenus(opts = {}) {
  const { page, pageSize, skip } = clampPagination(opts, { defPageSize: 20, maxPageSize: 100 });
  const be = await resolveMealBackend(LABEL);

  if (be === 'mongo') {
    const filter = {};
    if (opts.status && opts.status !== 'all') filter.status = opts.status;
    const [docs, total] = await Promise.all([
      WeeklyMenu.find(filter).sort({ weekStart: -1 }).skip(skip).limit(pageSize).lean(),
      WeeklyMenu.countDocuments(filter),
    ]);
    return { items: docs.map(serialize), total, page, pageSize, hasMore: skip + docs.length < total };
  }

  let items = await store.read();
  if (opts.status && opts.status !== 'all') items = items.filter((i) => i.status === opts.status);
  items.sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));
  const total = items.length;
  return {
    items: items.slice(skip, skip + pageSize).map(serialize),
    total,
    page,
    pageSize,
    hasMore: skip + pageSize < total,
  };
}

export async function getWeeklyMenuById(id) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    if (!isObjectId(id)) return null;
    const doc = await WeeklyMenu.findById(id).lean();
    return doc ? serialize(doc) : null;
  }
  const found = (await store.read()).find((i) => i._id === id);
  return found ? serialize(found) : null;
}

/**
 * The single menu the public site should render: a published menu covering
 * today if one exists, otherwise the most recent published menu.
 */
export async function getActivePublishedMenu() {
  const be = await resolveMealBackend(LABEL);
  const now = new Date();

  if (be === 'mongo') {
    const current = await WeeklyMenu.findOne({
      status: 'published',
      weekStart: { $lte: now },
      weekEnd: { $gte: now },
    })
      .sort({ weekStart: -1 })
      .lean();
    if (current) return serialize(current);
    const latest = await WeeklyMenu.findOne({ status: 'published' }).sort({ weekStart: -1 }).lean();
    return latest ? serialize(latest) : null;
  }

  const published = (await store.read())
    .filter((i) => i.status === 'published')
    .sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));
  const current = published.find(
    (i) => new Date(i.weekStart) <= now && new Date(i.weekEnd) >= now
  );
  const chosen = current || published[0] || null;
  return chosen ? serialize(chosen) : null;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────
export async function createWeeklyMenu(data) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') return serialize(await WeeklyMenu.create({ ...data, status: 'draft' }));

  const items = await store.read();
  const now = new Date().toISOString();
  const record = {
    _id: crypto.randomUUID(),
    days: [],
    ...data,
    status: 'draft', // new menus always start as drafts; publish via publishWeeklyMenu
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  items.push(record);
  await store.write(items);
  return serialize(record);
}

// General update. Does NOT publish — status changes to 'published' must go
// through publishWeeklyMenu() so snapshots are always frozen first.
export async function updateWeeklyMenu(id, updates) {
  const patch = { ...updates };
  delete patch.status;
  delete patch.publishedAt;

  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    if (!isObjectId(id)) return null;
    const doc = await WeeklyMenu.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
    return doc ? serialize(doc) : null;
  }
  const items = await store.read();
  const idx = items.findIndex((i) => i._id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() };
  await store.write(items);
  return serialize(items[idx]);
}

// A MongoDB deployment supports multi-document transactions only on a replica
// set / mongos. Detect the "not supported" failure so we can fall back safely.
function isTxnUnsupported(err) {
  const msg = String(err?.message || '');
  return (
    err?.code === 20 ||
    err?.codeName === 'IllegalOperation' ||
    /Transaction numbers are only allowed|replica set|mongos|transactions are not supported/i.test(
      msg
    )
  );
}

// Do the publish + overlap-archive for the mongo backend. When a `session` is
// supplied both writes run inside a transaction and commit atomically; without
// one we publish the TARGET first, then archive overlaps, so an interruption
// can never leave the site with no published menu (worst case: a transient
// duplicate the public reader already tolerates).
async function mongoPublish(id, be, session) {
  const opts = session ? { session } : {};
  const menu = await WeeklyMenu.findById(id).session(session ?? null).lean();
  if (!menu) return null;

  const mealsMap = await fetchMealsMap(collectMealIds(menu.days), be, session ?? null);
  const frozenDays = freezeSnapshots(menu.days, mealsMap);
  const publishedAt = new Date();

  const overlapFilter = {
    _id: { $ne: id },
    status: 'published',
    weekStart: { $lte: menu.weekEnd },
    weekEnd: { $gte: menu.weekStart },
  };

  if (session) {
    // Atomic: order is irrelevant, both commit or neither does.
    await WeeklyMenu.updateMany(overlapFilter, { $set: { status: 'archived' } }, opts);
    const doc = await WeeklyMenu.findByIdAndUpdate(
      id,
      { $set: { days: frozenDays, status: 'published', publishedAt } },
      { new: true, runValidators: true, ...opts }
    );
    return doc ? serialize(doc) : null;
  }

  // Non-transactional safe order: publish target first, then archive overlaps.
  const doc = await WeeklyMenu.findByIdAndUpdate(
    id,
    { $set: { days: frozenDays, status: 'published', publishedAt } },
    { new: true, runValidators: true }
  );
  if (!doc) return null;
  await WeeklyMenu.updateMany(overlapFilter, { $set: { status: 'archived' } });
  return serialize(doc);
}

/**
 * Publish a menu: freeze display snapshots from the current Meals, flip status
 * to 'published', stamp publishedAt, and archive any other published menu that
 * overlaps this menu's date range.
 *
 * Atomicity:
 *  - MongoDB: attempted inside a single transaction; if the deployment does not
 *    support transactions we fall back to the safe order above.
 *  - JSON fallback: the complete next state is computed in memory and written in
 *    ONE `store.write()`, so a failure before that write leaves the previous
 *    published menu and all overlap state completely intact (no partial write).
 */
export async function publishWeeklyMenu(id) {
  const be = await resolveMealBackend(LABEL);

  if (be === 'mongo') {
    if (!isObjectId(id)) return null;

    let session;
    try {
      session = await mongoose.startSession();
      let result = null;
      await session.withTransaction(async () => {
        result = await mongoPublish(id, be, session);
      });
      return result;
    } catch (err) {
      if (isTxnUnsupported(err)) {
        return mongoPublish(id, be, null); // safe non-transactional fallback
      }
      throw err;
    } finally {
      if (session) await session.endSession();
    }
  }

  // ── JSON fallback: build the COMPLETE next state, then one atomic write ──
  const items = await store.read();
  const idx = items.findIndex((i) => i._id === id);
  if (idx === -1) return null;

  const menu = items[idx];
  const mealsMap = await fetchMealsMap(collectMealIds(menu.days), be);
  const frozenDays = freezeSnapshots(menu.days || [], mealsMap);
  const publishedAt = new Date().toISOString();

  const next = items.map((it, i) => {
    if (i === idx) {
      return { ...menu, days: frozenDays, status: 'published', publishedAt, updatedAt: publishedAt };
    }
    if (
      it.status === 'published' &&
      rangesOverlap(menu.weekStart, menu.weekEnd, it.weekStart, it.weekEnd)
    ) {
      return { ...it, status: 'archived', updatedAt: publishedAt };
    }
    return it;
  });

  await store.write(next); // single write — never a partial state
  return serialize(next[idx]);
}

/**
 * Is `mealId` referenced by any non-archived (draft or published) weekly menu?
 * Published menus render from frozen snapshots, but a live draft/published slot
 * still points at the meal by id, so deleting it would orphan that reference.
 * Centralised here so the delete route and its tests share one definition.
 */
export async function isMealReferencedByActiveMenu(mealId) {
  const target = String(mealId);
  const { items } = await queryWeeklyMenus({ pageSize: 100 });
  return items.some(
    (m) =>
      m.status !== 'archived' &&
      (m.days || []).some((d) =>
        SLOT_KEYS.some((k) => d?.[k]?.mealId && String(d[k].mealId) === target)
      )
  );
}

export async function archiveWeeklyMenu(id) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    if (!isObjectId(id)) return null;
    const doc = await WeeklyMenu.findByIdAndUpdate(id, { $set: { status: 'archived' } }, { new: true });
    return doc ? serialize(doc) : null;
  }
  const items = await store.read();
  const idx = items.findIndex((i) => i._id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], status: 'archived', updatedAt: new Date().toISOString() };
  await store.write(items);
  return serialize(items[idx]);
}

export async function deleteWeeklyMenu(id) {
  const be = await resolveMealBackend(LABEL);
  if (be === 'mongo') {
    if (!isObjectId(id)) return null;
    const doc = await WeeklyMenu.findByIdAndDelete(id);
    return doc ? serialize(doc) : null;
  }
  const items = await store.read();
  const found = items.find((i) => i._id === id);
  if (!found) return null;
  await store.write(items.filter((i) => i._id !== id));
  return serialize(found);
}
