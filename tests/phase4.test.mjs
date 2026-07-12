import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { promises as fsp } from 'node:fs';
import path from 'node:path';

import { verifySessionToken, createSessionToken } from '@/lib/auth';
import { validateSignParams } from '@/lib/upload-purposes';
import {
  mealCreateSchema,
  mealSettingsSchema,
  mealInquiryUpdateSchema,
  weeklyMenuCreateSchema,
  serviceAreaError,
} from '@/lib/meal-validation';
import { createMeal, updateMeal } from '@/lib/meals-store';
import {
  createWeeklyMenu,
  publishWeeklyMenu,
  getWeeklyMenuById,
  archiveWeeklyMenu,
  isMealReferencedByActiveMenu,
} from '@/lib/weekly-menu-store';
import { getMealSettingsOrDefaults, upsertMealSettings } from '@/lib/meal-settings-store';
import { createMealInquiry, listMealInquiries } from '@/lib/meal-inquiries-store';

const DATA_DIR = process.env.FESTIGO_DATA_DIR;

function resetData() {
  for (const f of fs.existsSync(DATA_DIR) ? fs.readdirSync(DATA_DIR) : []) {
    if (f.endsWith('.json')) fs.rmSync(path.join(DATA_DIR, f));
  }
}
beforeEach(resetData);

const MEAL_IMG = {
  url: 'https://res.cloudinary.com/test-cloud/image/upload/v1/festigo-daily/meals/x.jpg',
  publicId: 'festigo-daily/meals/x',
  alt: 'x',
};

// ── Auth ─────────────────────────────────────────────────────────────────────
test('unauthenticated: verifySessionToken rejects missing/malformed/forged tokens', async () => {
  assert.equal(await verifySessionToken(undefined), null);
  assert.equal(await verifySessionToken(''), null);
  assert.equal(await verifySessionToken('not-a-token'), null);
  assert.equal(await verifySessionToken('aaa.bbb.ccc'), null);
  const good = await createSessionToken({ email: 'a@b.c', role: 'admin' });
  assert.ok(await verifySessionToken(good), 'a validly signed token verifies');
  assert.equal(await verifySessionToken(good.slice(0, -1) + 'X'), null, 'tampered signature rejected');
});

// ── Cloudinary signing contract ──────────────────────────────────────────────
test('cloudinary: unknown purpose is rejected', () => {
  const r = validateSignParams('bogus', { folder: 'festigo-daily/meals', timestamp: 1 });
  assert.equal(r.ok, false);
  assert.equal(r.status, 400);
});

test('cloudinary: meal upload cannot request the Event folder or an arbitrary folder', () => {
  assert.equal(validateSignParams('daily-meal', { folder: 'festigo/portfolio', timestamp: 1 }).ok, false);
  assert.equal(validateSignParams('daily-meal', { folder: 'anything-else', timestamp: 1 }).ok, false);
  assert.equal(validateSignParams('daily-meal', { timestamp: 1 }).ok, false, 'missing folder rejected');
});

test('cloudinary: meal upload accepts only the meals folder', () => {
  const r = validateSignParams('daily-meal', { folder: 'festigo-daily/meals', timestamp: 1, source: 'uw' });
  assert.equal(r.ok, true);
  assert.equal(r.folder, 'festigo-daily/meals');
  assert.deepEqual(Object.keys(r.params).sort(), ['folder', 'source', 'timestamp']);
});

test('cloudinary: Event portfolio upload still receives its correct folder', () => {
  const r = validateSignParams('event-portfolio', { folder: 'festigo/portfolio', timestamp: 1, source: 'uw' });
  assert.equal(r.ok, true);
  assert.equal(r.folder, 'festigo/portfolio');
});

test('cloudinary: arbitrary signed params (public_id, eager, overwrite, invalidate) are refused', () => {
  for (const bad of ['public_id', 'eager', 'overwrite', 'invalidate', 'transformation', 'type']) {
    const r = validateSignParams('daily-meal', { folder: 'festigo-daily/meals', timestamp: 1, [bad]: 'x' });
    assert.equal(r.ok, false, `${bad} must be rejected`);
    assert.equal(r.status, 400);
  }
});

// ── Meal image metadata validation ───────────────────────────────────────────
test('meal image: valid meals-folder Cloudinary image is accepted', () => {
  const r = mealCreateSchema.safeParse({ name: 'Biryani', mealType: 'regular', image: MEAL_IMG });
  assert.equal(r.success, true);
});

test('meal image: Event-folder public id is rejected', () => {
  const r = mealCreateSchema.safeParse({
    name: 'Biryani',
    mealType: 'regular',
    image: { ...MEAL_IMG, publicId: 'festigo/portfolio/x' },
  });
  assert.equal(r.success, false);
});

test('meal image: non-Cloudinary / non-https URL is rejected', () => {
  for (const url of ['http://evil.example/x.jpg', 'https://evil.example/festigo-daily/meals/x.jpg']) {
    const r = mealCreateSchema.safeParse({ name: 'Biryani', mealType: 'regular', image: { ...MEAL_IMG, url } });
    assert.equal(r.success, false, url);
  }
});

// ── MealSettings singleton ───────────────────────────────────────────────────
test('settings: GET defaults performs no write and reports exists:false', async () => {
  const s = await getMealSettingsOrDefaults();
  assert.equal(s._id, null);
  assert.equal(s.serviceArea, 'Karachi');
  assert.equal(fs.existsSync(path.join(DATA_DIR, 'meal-settings.json')), false, 'no file written on read');
});

test('settings: first save creates one record with a stable id; later saves keep it (exists:true)', async () => {
  const first = await upsertMealSettings({ serviceArea: 'Karachi', maximumDailyCapacity: 500 });
  assert.ok(first._id, 'first save has a non-null id');
  const raw1 = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'meal-settings.json'), 'utf8'));
  assert.equal(raw1.length, 1);
  assert.ok(raw1[0]._id, 'persisted record id is not null');

  const second = await upsertMealSettings({ maximumDailyCapacity: 600 });
  const raw2 = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'meal-settings.json'), 'utf8'));
  assert.equal(raw2.length, 1, 'still exactly one record (singleton)');
  assert.equal(second._id, first._id, 'id preserved across updates');
  assert.equal(second.maximumDailyCapacity, 600);

  const reread = await getMealSettingsOrDefaults();
  assert.ok(reread._id, 'GET after save reports a real id (exists:true)');
});

// ── Karachi / capacity validation ────────────────────────────────────────────
test('settings: dailyCapacity 0 and fractional are rejected; positive accepted', () => {
  assert.equal(mealSettingsSchema.safeParse({ maximumDailyCapacity: 0 }).success, false);
  assert.equal(mealSettingsSchema.safeParse({ maximumDailyCapacity: -5 }).success, false);
  assert.equal(mealSettingsSchema.safeParse({ maximumDailyCapacity: 12.5 }).success, false);
  assert.equal(mealSettingsSchema.safeParse({ maximumDailyCapacity: 'lots' }).success, false);
  assert.equal(mealSettingsSchema.safeParse({ maximumDailyCapacity: 500 }).success, true);
});

test('settings: nationwide wording rejected; valid Karachi wording accepted', () => {
  for (const bad of [
    'Nationwide', 'nation wide', 'all Pakistan', 'across Pakistan',
    'Pakistan-wide', 'countrywide', 'all cities', 'anywhere in Pakistan',
  ]) {
    assert.ok(serviceAreaError(bad), `"${bad}" should be an error`);
    assert.equal(mealSettingsSchema.safeParse({ serviceArea: bad }).success, false, bad);
  }
  assert.equal(serviceAreaError(''), 'Service area cannot be empty.');
  assert.equal(serviceAreaError('  Karachi  '), null);
  assert.equal(mealSettingsSchema.safeParse({ serviceArea: 'Karachi' }).success, true);
  assert.equal(mealSettingsSchema.safeParse({ serviceArea: 'DHA, Karachi' }).success, true);
  assert.equal(mealSettingsSchema.safeParse({ serviceArea: 'Lahore' }).success, false);
});

test('settings: Sunday in operatingDays is rejected', () => {
  assert.equal(mealSettingsSchema.safeParse({ operatingDays: ['Monday', 'Sunday'] }).success, false);
  assert.equal(mealSettingsSchema.safeParse({ operatingDays: ['Monday', 'Saturday'] }).success, true);
});

test('weekly menu: Sunday is rejected by the create schema', () => {
  const base = { title: 'Week One', weekStart: '2026-07-13', weekEnd: '2026-07-18' };
  assert.equal(
    weeklyMenuCreateSchema.safeParse({ ...base, days: [{ day: 'Sunday', regular: { mealId: 'x' } }] }).success,
    false
  );
  assert.equal(
    weeklyMenuCreateSchema.safeParse({ ...base, days: [{ day: 'Monday', regular: { mealId: 'x' } }] }).success,
    true
  );
});

// ── Weekly menu snapshot immutability ────────────────────────────────────────
test('weekly menu: published snapshot does not change when the source meal is edited', async () => {
  const meal = await createMeal({ name: 'Original', mealType: 'regular', isPublished: true });
  const menu = await createWeeklyMenu({
    title: 'Week', weekStart: '2026-07-13', weekEnd: '2026-07-18',
    days: [{ day: 'Monday', regular: { mealId: meal._id } }],
  });
  const published = await publishWeeklyMenu(menu._id);
  assert.equal(published.status, 'published');
  assert.equal(published.days[0].regular.snapshot.name, 'Original');

  await updateMeal(meal._id, { name: 'Renamed' });
  const after = await getWeeklyMenuById(menu._id);
  assert.equal(after.days[0].regular.snapshot.name, 'Original', 'snapshot is frozen');
});

// ── Weekly menu overlap publication failure safety ───────────────────────────
test('weekly menu: a failed publish leaves the previous published menu intact (no partial state)', async () => {
  const a = await createWeeklyMenu({ title: 'A', weekStart: '2026-07-13', weekEnd: '2026-07-18', days: [] });
  await publishWeeklyMenu(a._id); // A is now the live published menu
  const b = await createWeeklyMenu({ title: 'B', weekStart: '2026-07-15', weekEnd: '2026-07-20', days: [] });

  // Force the single persistence write to fail mid-publish.
  const originalWrite = fsp.writeFile;
  fsp.writeFile = async () => {
    throw new Error('forced write failure');
  };
  await assert.rejects(() => publishWeeklyMenu(b._id), /forced write failure/);
  fsp.writeFile = originalWrite;

  const aAfter = await getWeeklyMenuById(a._id);
  const bAfter = await getWeeklyMenuById(b._id);
  assert.equal(aAfter.status, 'published', 'previous published menu is still published');
  assert.equal(bAfter.status, 'draft', 'target was not partially published');
});

// ── Meal deletion reference guard ────────────────────────────────────────────
test('meal deletion guard: blocked while referenced by a draft/published menu, allowed once archived', async () => {
  const meal = await createMeal({ name: 'Ref', mealType: 'regular', isPublished: true });
  assert.equal(await isMealReferencedByActiveMenu(meal._id), false, 'unreferenced meal');

  const menu = await createWeeklyMenu({
    title: 'W', weekStart: '2026-07-13', weekEnd: '2026-07-18',
    days: [{ day: 'Monday', regular: { mealId: meal._id } }],
  });
  assert.equal(await isMealReferencedByActiveMenu(meal._id), true, 'referenced by draft');

  await publishWeeklyMenu(menu._id);
  assert.equal(await isMealReferencedByActiveMenu(meal._id), true, 'referenced by published');

  await archiveWeeklyMenu(menu._id);
  assert.equal(await isMealReferencedByActiveMenu(meal._id), false, 'only archived reference → deletable');
});

// ── Enquiries ────────────────────────────────────────────────────────────────
test('enquiries: invalid status rejected, valid status accepted', () => {
  assert.equal(mealInquiryUpdateSchema.safeParse({ status: 'vip' }).success, false);
  assert.equal(mealInquiryUpdateSchema.safeParse({ status: 'contacted' }).success, true);
  assert.equal(mealInquiryUpdateSchema.safeParse({ status: 'converted', internalNotes: 'ok' }).success, true);
});

test('enquiries: meal enquiries are isolated in their own store (never the Event inquiry file)', async () => {
  await createMealInquiry({
    contactName: 'A', phone: '+92 300 1234567', email: 'a@a.com', mealsCount: 5, source: 'festigo-daily-corporate',
  });
  const { items } = await listMealInquiries();
  assert.equal(items.length, 1);
  assert.ok(String(items[0].source).startsWith('festigo-daily'));
  // The meal store writes ONLY its own file; it never touches the Event inquiry store.
  assert.equal(fs.existsSync(path.join(DATA_DIR, 'meal-inquiries.json')), true);
  assert.equal(fs.existsSync(path.join(DATA_DIR, 'inquiries.json')), false);
});
