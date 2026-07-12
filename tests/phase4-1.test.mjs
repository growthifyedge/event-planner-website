import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { mealSettingsSchema, normalizeVisibility } from '@/lib/meal-validation';
import { getMealSettingsOrDefaults, upsertMealSettings } from '@/lib/meal-settings-store';

const DATA_DIR = process.env.FESTIGO_DATA_DIR;

function resetData() {
  for (const f of fs.existsSync(DATA_DIR) ? fs.readdirSync(DATA_DIR) : []) {
    if (f.endsWith('.json')) fs.rmSync(path.join(DATA_DIR, f));
  }
}
beforeEach(resetData);

// ── Defaults: hidden, and no write on read ───────────────────────────────────
test('visibility: defaults are all false and reading writes nothing', async () => {
  const s = await getMealSettingsOrDefaults();
  assert.equal(s.publicPageEnabled, false);
  assert.equal(s.showInNavigation, false);
  assert.equal(s.showOnHomepage, false);
  assert.equal(s._id, null, 'defaults are not a persisted record');
  assert.equal(
    fs.existsSync(path.join(DATA_DIR, 'meal-settings.json')),
    false,
    'no settings file created by a read'
  );
});

// ── Backward compatibility: a record with no visibility fields reads as false ─
test('visibility: legacy record without visibility fields serializes to false', async () => {
  // Simulate a pre-4.1 record: saved without any visibility fields.
  await upsertMealSettings({ serviceArea: 'Karachi', maximumDailyCapacity: 500 });
  const s = await getMealSettingsOrDefaults();
  assert.ok(s._id, 'record exists');
  assert.equal(s.publicPageEnabled, false);
  assert.equal(s.showInNavigation, false);
  assert.equal(s.showOnHomepage, false);
});

// ── Schema accepts the new boolean fields ────────────────────────────────────
test('visibility: schema accepts the three boolean fields', () => {
  const r = mealSettingsSchema.safeParse({
    publicPageEnabled: true,
    showInNavigation: true,
    showOnHomepage: false,
  });
  assert.equal(r.success, true);
});

// ── normalizeVisibility server-side enforcement ──────────────────────────────
test('visibility: normalizeVisibility forces dependents off when page disabled', () => {
  const out = normalizeVisibility({
    publicPageEnabled: false,
    showInNavigation: true,
    showOnHomepage: true,
  });
  assert.equal(out.publicPageEnabled, false);
  assert.equal(out.showInNavigation, false);
  assert.equal(out.showOnHomepage, false);
});

test('visibility: normalizeVisibility preserves dependents when page enabled', () => {
  const out = normalizeVisibility({
    publicPageEnabled: true,
    showInNavigation: true,
    showOnHomepage: false,
  });
  assert.equal(out.publicPageEnabled, true);
  assert.equal(out.showInNavigation, true);
  assert.equal(out.showOnHomepage, false);
});

test('visibility: normalizeVisibility treats missing publicPageEnabled as disabled', () => {
  const out = normalizeVisibility({ showInNavigation: true, showOnHomepage: true });
  assert.equal(out.showInNavigation, false);
  assert.equal(out.showOnHomepage, false);
});

test('visibility: normalizeVisibility does not mutate its input', () => {
  const input = { publicPageEnabled: false, showInNavigation: true, showOnHomepage: true };
  const out = normalizeVisibility(input);
  assert.notEqual(out, input);
  assert.equal(input.showInNavigation, true, 'original object untouched');
});

// ── Round-trip: enabling nav persists; disabling the page clears dependents ───
test('visibility: enabling page + nav persists both', async () => {
  const saved = await upsertMealSettings(
    normalizeVisibility({ serviceArea: 'Karachi', publicPageEnabled: true, showInNavigation: true, showOnHomepage: false })
  );
  assert.equal(saved.publicPageEnabled, true);
  assert.equal(saved.showInNavigation, true);
  assert.equal(saved.showOnHomepage, false);

  const reread = await getMealSettingsOrDefaults();
  assert.equal(reread.publicPageEnabled, true);
  assert.equal(reread.showInNavigation, true);
});

test('visibility: enabling homepage only persists homepage, not nav', async () => {
  const saved = await upsertMealSettings(
    normalizeVisibility({ serviceArea: 'Karachi', publicPageEnabled: true, showInNavigation: false, showOnHomepage: true })
  );
  assert.equal(saved.showOnHomepage, true);
  assert.equal(saved.showInNavigation, false);
});

test('visibility: disabling the page clears previously-enabled dependents', async () => {
  // First enable everything.
  await upsertMealSettings(
    normalizeVisibility({ serviceArea: 'Karachi', publicPageEnabled: true, showInNavigation: true, showOnHomepage: true })
  );
  // Then disable the page — even if a client still sends dependents true.
  const off = await upsertMealSettings(
    normalizeVisibility({ serviceArea: 'Karachi', publicPageEnabled: false, showInNavigation: true, showOnHomepage: true })
  );
  assert.equal(off.publicPageEnabled, false);
  assert.equal(off.showInNavigation, false);
  assert.equal(off.showOnHomepage, false);

  const reread = await getMealSettingsOrDefaults();
  assert.equal(reread.publicPageEnabled, false);
  assert.equal(reread.showInNavigation, false);
  assert.equal(reread.showOnHomepage, false);
});

// ── Read-layer defense-in-depth: serialize gates dependents on the page flag ──
test('visibility: serialize never reports nav/homepage on while page is off', async () => {
  // Persist an inconsistent record directly (bypassing normalize) to prove the
  // read layer still refuses to expose an impossible state.
  const file = path.join(DATA_DIR, 'meal-settings.json');
  fs.writeFileSync(
    file,
    JSON.stringify([{ _id: 'x', publicPageEnabled: false, showInNavigation: true, showOnHomepage: true }])
  );
  const s = await getMealSettingsOrDefaults();
  assert.equal(s.showInNavigation, false);
  assert.equal(s.showOnHomepage, false);
});
