import path from 'node:path';
import { promises as fs } from 'node:fs';
import mongoose from 'mongoose';
import { connectDB } from './db';

/**
 * Shared helpers for the Festigo Daily data stores.
 *
 * These exist ONLY to remove duplication across the five new meal stores —
 * they follow the verified media-store pattern (per-call backend resolution +
 * a development-only JSON fallback). The existing media / inquiries stores are
 * intentionally left untouched.
 */

// Resolved lazily so tests can point the dev file store at an isolated temp
// directory via FESTIGO_DATA_DIR (defaults to `<cwd>/.data`).
const dataDir = () => process.env.FESTIGO_DATA_DIR || path.join(process.cwd(), '.data');
const isProd = () => process.env.NODE_ENV === 'production';

/**
 * Resolve the backend on EVERY call — never cache the choice, so a one-time
 * cold-start failure can't pin a serverless instance to the fallback.
 * connectDB() caches the successful connection globally, so re-checking is
 * cheap. In production the JSON file fallback is disabled: a DB failure throws
 * rather than silently reading/writing the filesystem.
 */
export async function resolveMealBackend(label) {
  if (!process.env.MONGODB_URI) {
    if (isProd()) {
      throw new Error(`[${label}] MONGODB_URI is not set in production.`);
    }
    console.warn(`[${label}] MONGODB_URI is not set — using local file store (dev only).`);
    return 'file';
  }
  try {
    await connectDB();
    return 'mongo';
  } catch (err) {
    if (isProd()) throw err; // never fall back to the filesystem in production
    console.error(`[${label}] MongoDB connection failed — using file fallback (dev only):`, err);
    return 'file';
  }
}

/**
 * A tiny JSON-file store bound to one filename under `.data/` (gitignored).
 * Reads tolerate a missing/corrupt file by returning []. Used for dev only.
 */
export function fileStore(fileName) {
  const filePath = () => path.join(dataDir(), fileName);
  return {
    async read() {
      try {
        const parsed = JSON.parse(await fs.readFile(filePath(), 'utf8'));
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    async write(items) {
      const dir = dataDir();
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, fileName), JSON.stringify(items, null, 2), 'utf8');
    },
  };
}

// Escape a user string for safe use inside a RegExp (search filters).
export const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Safe ObjectId guard so a malformed id can never throw a CastError.
export const isObjectId = (id) => mongoose.Types.ObjectId.isValid(String(id));

// Clamp pagination inputs. Defaults mirror the media-store conventions.
export function clampPagination(opts = {}, { defPageSize = 12, maxPageSize = 60 } = {}) {
  const page = Math.max(1, parseInt(opts.page, 10) || 1);
  const pageSize = Math.min(maxPageSize, Math.max(1, parseInt(opts.pageSize, 10) || defPageSize));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

// ISO string or null — one place for the repeated date-normalisation.
export const isoOrNull = (v) => (v ? new Date(v).toISOString() : null);
