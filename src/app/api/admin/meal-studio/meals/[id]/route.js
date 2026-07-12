import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/meal-studio-auth';
import { updateMeal, deleteMeal, getMealById } from '@/lib/meals-store';
import { mealUpdateSchema } from '@/lib/meal-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PATCH — edit a meal, or toggle publish (all fields validated; unknown keys rejected).
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
  const parsed = mealUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please review the highlighted fields.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }
  try {
    const item = await updateMeal(id, parsed.data);
    if (!item) return NextResponse.json({ error: 'Meal not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'A meal with this slug already exists.' }, { status: 409 });
    }
    console.error('[PATCH /api/admin/meal-studio/meals/[id]]', err);
    return NextResponse.json({ error: 'Failed to update meal.' }, { status: 500 });
  }
}

// DELETE — remove a meal. Blocks deletion when the meal is referenced by a
// non-archived weekly menu (published menus keep frozen snapshots, but an
// active draft/published reference should be resolved first).
export async function DELETE(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const existing = await getMealById(id);
    if (!existing) return NextResponse.json({ error: 'Meal not found.' }, { status: 404 });

    // Reference guard: don't hard-delete a meal that a draft/published menu
    // still points at by id (published menus render from snapshots, so they are
    // unaffected, but a live draft reference would be orphaned).
    const { isMealReferencedByActiveMenu } = await import('@/lib/weekly-menu-store');
    if (await isMealReferencedByActiveMenu(id)) {
      return NextResponse.json(
        {
          error:
            'This meal is used by a current or upcoming weekly menu. Remove it from the menu (or unpublish it) before deleting.',
        },
        { status: 409 }
      );
    }

    const item = await deleteMeal(id);
    if (!item) return NextResponse.json({ error: 'Meal not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/admin/meal-studio/meals/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete meal.' }, { status: 500 });
  }
}
