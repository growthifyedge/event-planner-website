import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/meal-studio-auth';
import { queryMealPackages, createMealPackage } from '@/lib/meal-packages-store';
import { mealPackageCreateSchema, mealPackageQuerySchema } from '@/lib/meal-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const parsed = mealPackageQuerySchema.safeParse({
    mealType: searchParams.get('mealType') || undefined,
    search: searchParams.get('search') || undefined,
    page: searchParams.get('page') || undefined,
    pageSize: searchParams.get('pageSize') || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query.' }, { status: 422 });
  }
  try {
    const r = await queryMealPackages(parsed.data);
    return NextResponse.json(r);
  } catch (err) {
    console.error('[GET /api/admin/meal-studio/packages]', err);
    return NextResponse.json({ error: 'Failed to load packages.' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
  const parsed = mealPackageCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please review the highlighted fields.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  try {
    const item = await createMealPackage(parsed.data);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'A package with this slug already exists.' }, { status: 409 });
    }
    console.error('[POST /api/admin/meal-studio/packages]', err);
    return NextResponse.json({ error: 'Failed to create package.' }, { status: 500 });
  }
}
