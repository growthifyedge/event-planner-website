import path from 'node:path';
import { promises as fs } from 'node:fs';
import { connectDB } from './db';
import Media from '@/models/Media';

/**
 * Portfolio media data-access layer. MongoDB primary, with a local JSON
 * fallback for development. Files themselves live in Cloudinary — this only
 * stores metadata. All list reads go through queryMedia() so pagination,
 * filtering and sorting happen in the database (not the client).
 */

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'media.json');

// Resolve per call — never cache the choice (a one-time cold-start failure must
// not pin a serverless instance to the empty file fallback). connectDB() caches
// the successful connection globally, so re-checking here is cheap.
async function resolveBackend() {
  if (!process.env.MONGODB_URI) {
    console.warn('[media-store] MONGODB_URI is not set — using local file store.');
    return 'file';
  }
  try {
    await connectDB();
    return 'mongo';
  } catch (err) {
    console.error('[media-store] MongoDB connection failed — using file fallback:', err);
    return 'file';
  }
}

async function readStore() {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8'));
  } catch {
    return [];
  }
}

async function writeStore(items) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), 'utf8');
}

function serialize(doc) {
  const o = doc && typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  return {
    _id: String(o._id),
    title: o.title,
    category: o.category,
    type: o.type,
    url: o.url,
    publicId: o.publicId,
    featured: o.featured ?? false,
    homepageFeatured: o.homepageFeatured ?? false,
    displayOrder: o.displayOrder ?? 0,
    isPublished: o.isPublished !== false,
    homepagePlacement: o.homepagePlacement || '',
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
    updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : null,
  };
}

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function mongoFilter({ category, type, search, publishedOnly, featured, homepageFeatured, homepagePlacement }) {
  const f = {};
  if (category && category !== 'All') f.category = category;
  if (type && type !== 'All' && (type === 'image' || type === 'video')) f.type = type;
  // `$ne: false` so pre-existing records (no isPublished field) count as published.
  if (publishedOnly) f.isPublished = { $ne: false };
  if (featured) f.featured = true;
  if (homepageFeatured) f.homepageFeatured = true;
  if (homepagePlacement) f.homepagePlacement = homepagePlacement;
  if (search && String(search).trim()) {
    f.title = { $regex: escapeRegex(String(search).trim()), $options: 'i' };
  }
  return f;
}

const mongoSort = (sort) => (sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 });

function fileMatch(item, o) {
  if (o.category && o.category !== 'All' && item.category !== o.category) return false;
  if (o.type && o.type !== 'All' && item.type !== o.type) return false;
  if (o.publishedOnly && item.isPublished === false) return false;
  if (o.featured && !item.featured) return false;
  if (o.homepageFeatured && !item.homepageFeatured) return false;
  if (o.homepagePlacement && item.homepagePlacement !== o.homepagePlacement) return false;
  if (
    o.search &&
    String(o.search).trim() &&
    !String(item.title || '')
      .toLowerCase()
      .includes(String(o.search).trim().toLowerCase())
  ) {
    return false;
  }
  return true;
}

/**
 * The one paginated/filtered query used everywhere.
 * @returns {{ items, total, page, pageSize, hasMore }}
 */
export async function queryMedia(opts = {}) {
  const page = Math.max(1, parseInt(opts.page, 10) || 1);
  const pageSize = Math.min(60, Math.max(1, parseInt(opts.pageSize, 10) || 12));
  const skip = (page - 1) * pageSize;
  const be = await resolveBackend();

  if (be === 'mongo') {
    const filter = mongoFilter(opts);
    const [docs, total] = await Promise.all([
      Media.find(filter).sort(mongoSort(opts.sort)).skip(skip).limit(pageSize).lean(),
      Media.countDocuments(filter),
    ]);
    return {
      items: docs.map(serialize),
      total,
      page,
      pageSize,
      hasMore: skip + docs.length < total,
    };
  }

  let items = (await readStore()).filter((i) => fileMatch(i, opts));
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

// ── Reusable public query helpers (avoid duplicating logic across pages) ──
export const getPortfolioMedia = (opts = {}) => queryMedia({ publishedOnly: true, ...opts });
export const getCategoryMedia = (category, opts = {}) =>
  queryMedia({ publishedOnly: true, category, ...opts });
export const getLatestMedia = (limit = 12) =>
  queryMedia({ publishedOnly: true, page: 1, pageSize: limit });
export const getFeaturedMedia = (limit = 12) =>
  queryMedia({ publishedOnly: true, featured: true, page: 1, pageSize: limit });
export const getHomepageMedia = (limit = 8) =>
  queryMedia({ publishedOnly: true, homepageFeatured: true, page: 1, pageSize: limit });

// Resolve one category surface's hero image, in priority order:
//   1) the image manually pinned to this homepage slot (placement)
//   2) the newest published image in the category
//   3) null  → caller keeps its bundled static fallback
// Only images are eligible (a video can't back a hero <img>).
export async function resolveCategoryImage({ placement, category } = {}) {
  if (placement) {
    try {
      const { items } = await queryMedia({
        publishedOnly: true,
        homepagePlacement: placement,
        type: 'image',
        page: 1,
        pageSize: 1,
        sort: 'newest',
      });
      if (items[0]?.url) return items[0].url;
    } catch {
      /* fall through to the category default */
    }
  }
  try {
    const { items } = await queryMedia({
      publishedOnly: true,
      category,
      type: 'image',
      page: 1,
      pageSize: 1,
      sort: 'newest',
    });
    if (items[0]?.url) return items[0].url;
  } catch {
    /* fall through to the static fallback */
  }
  return null;
}

// ── CRUD ──
export async function createMedia(data) {
  const be = await resolveBackend();
  if (be === 'mongo') {
    const doc = await Media.create(data);
    return serialize(doc);
  }
  const items = await readStore();
  const now = new Date().toISOString();
  const record = {
    _id: crypto.randomUUID(),
    ...data,
    featured: false,
    homepageFeatured: false,
    displayOrder: 0,
    tags: [],
    isPublished: true,
    homepagePlacement: '',
    createdAt: now,
    updatedAt: now,
  };
  items.push(record);
  await writeStore(items);
  return serialize(record);
}

export async function updateMedia(id, updates) {
  const be = await resolveBackend();
  // Single-slot homepage placement: when pinning to a non-empty slot, clear
  // that slot from every other item so only one image ever holds it.
  const placement = updates.homepagePlacement;
  if (be === 'mongo') {
    // Update the target first; only clear the slot from other items once we
    // know the target exists — so a stale/bad id can never orphan a slot.
    const doc = await Media.findByIdAndUpdate(id, updates, { new: true });
    if (!doc) return null;
    if (placement) {
      await Media.updateMany(
        { homepagePlacement: placement, _id: { $ne: id } },
        { $set: { homepagePlacement: '' } }
      );
    }
    return serialize(doc);
  }
  const items = await readStore();
  const idx = items.findIndex((i) => i._id === id);
  if (idx === -1) return null;
  if (placement) {
    items.forEach((i) => {
      if (i._id !== id && i.homepagePlacement === placement) i.homepagePlacement = '';
    });
  }
  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  await writeStore(items);
  return serialize(items[idx]);
}

export async function deleteMedia(id) {
  const be = await resolveBackend();
  if (be === 'mongo') {
    const doc = await Media.findByIdAndDelete(id);
    return doc ? serialize(doc) : null;
  }
  const items = await readStore();
  const found = items.find((i) => i._id === id);
  if (!found) return null;
  await writeStore(items.filter((i) => i._id !== id));
  return serialize(found);
}

/** Bulk delete; returns the removed records (with publicId) for Cloudinary cleanup. */
export async function bulkDeleteMedia(ids = []) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const be = await resolveBackend();
  if (be === 'mongo') {
    const docs = await Media.find({ _id: { $in: ids } }).lean();
    await Media.deleteMany({ _id: { $in: ids } });
    return docs.map(serialize);
  }
  const items = await readStore();
  const removed = items.filter((i) => ids.includes(i._id));
  await writeStore(items.filter((i) => !ids.includes(i._id)));
  return removed.map(serialize);
}
