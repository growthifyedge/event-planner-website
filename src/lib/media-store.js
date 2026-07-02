import path from 'node:path';
import { promises as fs } from 'node:fs';
import { connectDB } from './db';
import Media from '@/models/Media';

/**
 * Portfolio media data-access layer. MongoDB primary, with a local JSON
 * fallback for development (mirrors inquiries-store.js). Files themselves live
 * in Cloudinary — this only stores metadata (url, title, category, type).
 */

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'media.json');

// Resolve per call — do NOT cache the choice. Caching a one-time cold-start
// failure in a module-level variable would pin a serverless instance to the
// (empty, read-only) file fallback for its whole lifetime. connectDB() already
// caches the successful connection globally, so re-checking here is cheap.
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
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
    updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : null,
  };
}

export async function createMedia(data) {
  const be = await resolveBackend();
  if (be === 'mongo') {
    const doc = await Media.create(data);
    return serialize(doc);
  }
  const items = await readStore();
  const now = new Date().toISOString();
  const record = { _id: crypto.randomUUID(), ...data, createdAt: now, updatedAt: now };
  items.push(record);
  await writeStore(items);
  return serialize(record);
}

export async function listMedia() {
  const be = await resolveBackend();
  if (be === 'mongo') {
    const docs = await Media.find({}).sort({ createdAt: -1 }).lean();
    return docs.map(serialize);
  }
  const items = await readStore();
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return items.map(serialize);
}

export async function updateMedia(id, updates) {
  const be = await resolveBackend();
  if (be === 'mongo') {
    const doc = await Media.findByIdAndUpdate(id, updates, { new: true });
    return doc ? serialize(doc) : null;
  }
  const items = await readStore();
  const idx = items.findIndex((i) => i._id === id);
  if (idx === -1) return null;
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
