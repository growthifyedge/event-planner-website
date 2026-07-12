import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/meal-studio-auth';
import {
  getWeeklyMenuById,
  updateWeeklyMenu,
  archiveWeeklyMenu,
  deleteWeeklyMenu,
} from '@/lib/weekly-menu-store';
import { weeklyMenuUpdateSchema } from '@/lib/meal-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const item = await getWeeklyMenuById(id);
    if (!item) return NextResponse.json({ error: 'Menu not found.' }, { status: 404 });
    return NextResponse.json({ item });
  } catch (err) {
    console.error('[GET /api/admin/meal-studio/weekly-menus/[id]]', err);
    return NextResponse.json({ error: 'Failed to load menu.' }, { status: 500 });
  }
}

// PATCH — either edit draft content, or archive the menu (action: 'archive').
// Publishing is NOT done here — it has its own snapshot-freezing route.
export async function PATCH(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (body?.action === 'archive') {
    try {
      const item = await archiveWeeklyMenu(id);
      if (!item) return NextResponse.json({ error: 'Menu not found.' }, { status: 404 });
      return NextResponse.json({ ok: true, item });
    } catch (err) {
      console.error('[PATCH archive weekly-menu]', err);
      return NextResponse.json({ error: 'Failed to archive menu.' }, { status: 500 });
    }
  }

  const parsed = weeklyMenuUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please review the menu details.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }
  try {
    const item = await updateWeeklyMenu(id, parsed.data);
    if (!item) return NextResponse.json({ error: 'Menu not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error('[PATCH update weekly-menu]', err);
    return NextResponse.json({ error: 'Failed to update menu.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const item = await deleteWeeklyMenu(id);
    if (!item) return NextResponse.json({ error: 'Menu not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE weekly-menu]', err);
    return NextResponse.json({ error: 'Failed to delete menu.' }, { status: 500 });
  }
}
