import path from 'node:path';
import { promises as fs } from 'node:fs';
import { connectDB } from './db';
import Inquiry from '@/models/Inquiry';

/**
 * Data-access layer for inquiries.
 *
 * Primary backend is MongoDB (via Mongoose). If MONGODB_URI is unset or the
 * database is unreachable, we transparently fall back to a local JSON file so
 * the booking + admin flow still works end-to-end during local development.
 * The chosen backend is resolved once per server process.
 */

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE = path.join(DATA_DIR, 'inquiries.json');

let backend = null; // 'mongo' | 'file'

async function resolveBackend() {
  if (backend) return backend;
  if (!process.env.MONGODB_URI) {
    backend = 'file';
    console.warn(
      '[inquiries] MONGODB_URI not set — using local JSON store (.data/inquiries.json).'
    );
    return backend;
  }
  try {
    await connectDB();
    backend = 'mongo';
  } catch {
    backend = 'file';
    console.warn(
      '[inquiries] MongoDB unreachable — falling back to local JSON store (.data/inquiries.json). Start MongoDB or fix MONGODB_URI to persist to the database.'
    );
  }
  return backend;
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
    name: o.name,
    email: o.email,
    phone: o.phone,
    eventType: o.eventType,
    eventDate: o.eventDate ? new Date(o.eventDate).toISOString() : null,
    guestCount: o.guestCount ?? null,
    budget: o.budget ?? null,
    message: o.message ?? null,
    status: o.status || 'new',
    source: o.source || 'booking-form',
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
    updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : null,
  };
}

export async function createInquiry(data) {
  const be = await resolveBackend();
  if (be === 'mongo') {
    const doc = await Inquiry.create(data);
    return serialize(doc);
  }
  const items = await readStore();
  const now = new Date().toISOString();
  const record = {
    _id: crypto.randomUUID(),
    ...data,
    eventDate: data.eventDate ? new Date(data.eventDate).toISOString() : null,
    status: 'new',
    source: data.source || 'booking-form',
    createdAt: now,
    updatedAt: now,
  };
  items.push(record);
  await writeStore(items);
  return serialize(record);
}

export async function listInquiries({ status } = {}) {
  const be = await resolveBackend();
  if (be === 'mongo') {
    const q = status && status !== 'all' ? { status } : {};
    const docs = await Inquiry.find(q).sort({ createdAt: -1 }).lean();
    return docs.map(serialize);
  }
  let items = await readStore();
  if (status && status !== 'all') items = items.filter((i) => i.status === status);
  items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return items.map(serialize);
}

export async function countByStatus() {
  const be = await resolveBackend();
  const statuses =
    be === 'mongo'
      ? (await Inquiry.find({}, 'status').lean()).map((d) => d.status)
      : (await readStore()).map((d) => d.status || 'new');

  const counts = { total: statuses.length, new: 0, contacted: 0, booked: 0, archived: 0 };
  for (const s of statuses) if (counts[s] != null) counts[s] += 1;
  return counts;
}

export async function updateInquiry(id, updates) {
  const be = await resolveBackend();
  if (be === 'mongo') {
    const doc = await Inquiry.findByIdAndUpdate(id, updates, { new: true });
    return doc ? serialize(doc) : null;
  }
  const items = await readStore();
  const idx = items.findIndex((i) => i._id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
  await writeStore(items);
  return serialize(items[idx]);
}

export async function deleteInquiry(id) {
  const be = await resolveBackend();
  if (be === 'mongo') {
    return Boolean(await Inquiry.findByIdAndDelete(id));
  }
  const items = await readStore();
  const next = items.filter((i) => i._id !== id);
  if (next.length === items.length) return false;
  await writeStore(next);
  return true;
}
