// Test bootstrap: force the isolated dev file store (never production MongoDB),
// point it at a throwaway temp dir, provide dummy Cloudinary config for signing,
// and register the alias/extension resolve hook. Loaded via `node --import`.
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { register } from 'node:module';

process.env.MONGODB_URI = ''; // → dev JSON file store, never a real database
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'test';

// Dummy Cloudinary config so signature/URL validation is exercised without any
// real account or network. No live upload or email is ever performed.
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'test-cloud';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test-key';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test-secret';

if (!process.env.FESTIGO_DATA_DIR) {
  process.env.FESTIGO_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'festigo-test-'));
}

register(new URL('./alias-hooks.mjs', import.meta.url));
