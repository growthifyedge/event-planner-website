import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/meal-studio-auth';
import { getMealSettingsOrDefaults, upsertMealSettings } from '@/lib/meal-settings-store';
import { mealSettingsSchema, normalizeVisibility } from '@/lib/meal-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/; // 24h HH:MM

// GET — returns the singleton, or the confirmed defaults if none exists.
// This is a READ ONLY endpoint: it never creates a settings record.
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const settings = await getMealSettingsOrDefaults();
    return NextResponse.json({ settings, exists: settings?._id != null });
  } catch (err) {
    console.error('[GET /api/admin/meal-studio/settings]', err);
    return NextResponse.json({ error: 'Failed to load settings.' }, { status: 500 });
  }
}

// PUT — explicit admin save. Only now is the singleton created/updated.
export async function PUT(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const parsed = mealSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please review the settings.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const data = parsed.data;

  // Cross-field operating-hours guard (schema validates the rest: capacity > 0,
  // Karachi-only service area, no Sunday in operatingDays via the MENU_DAYS enum).
  const opening = data.operatingHours?.opening;
  const closing = data.operatingHours?.closing;
  if ((opening && !TIME_RE.test(opening)) || (closing && !TIME_RE.test(closing))) {
    return NextResponse.json({ error: 'Operating hours must be valid times (HH:MM).' }, { status: 422 });
  }
  if (opening && closing && opening >= closing) {
    return NextResponse.json({ error: 'Opening time must be before closing time.' }, { status: 422 });
  }

  try {
    // Enforce the public-visibility invariant regardless of what the client
    // sent: nav/homepage flags cannot persist while the public page is off.
    const settings = await upsertMealSettings(normalizeVisibility(data));
    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    console.error('[PUT /api/admin/meal-studio/settings]', err);
    return NextResponse.json({ error: 'Failed to save settings.' }, { status: 500 });
  }
}
