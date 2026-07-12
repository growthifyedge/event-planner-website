import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/meal-studio-auth';
import { updateMealPackage, deleteMealPackage } from '@/lib/meal-packages-store';
import { mealPackageUpdateSchema } from '@/lib/meal-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  const parsed = mealPackageUpdateSchema.safeParse(body);
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
    const item = await updateMealPackage(id, parsed.data);
    if (!item) return NextResponse.json({ error: 'Package not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'A package with this slug already exists.' }, { status: 409 });
    }
    console.error('[PATCH /api/admin/meal-studio/packages/[id]]', err);
    return NextResponse.json({ error: 'Failed to update package.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const item = await deleteMealPackage(id);
    if (!item) return NextResponse.json({ error: 'Package not found.' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/admin/meal-studio/packages/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete package.' }, { status: 500 });
  }
}
