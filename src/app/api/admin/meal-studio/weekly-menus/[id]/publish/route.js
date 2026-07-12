import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/meal-studio-auth';
import { publishWeeklyMenu } from '@/lib/weekly-menu-store';
import { weeklyMenuPublishSchema } from '@/lib/meal-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// POST — publish a weekly menu via the approved Phase 1 publishWeeklyMenu().
// This FREEZES a display snapshot from the current meals and archives any
// overlapping published menu. Snapshot creation is never bypassed.
export async function POST(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const parsed = weeklyMenuPublishSchema.safeParse({ id });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid menu id.' }, { status: 422 });
  }
  try {
    const item = await publishWeeklyMenu(parsed.data.id);
    if (!item) return NextResponse.json({ error: 'Menu not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error('[POST publish weekly-menu]', err);
    return NextResponse.json({ error: 'Failed to publish menu.' }, { status: 500 });
  }
}
