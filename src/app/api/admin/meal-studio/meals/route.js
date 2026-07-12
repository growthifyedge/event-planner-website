import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/meal-studio-auth';
import { queryMeals, createMeal } from '@/lib/meals-store';
import { mealCreateSchema, mealQuerySchema } from '@/lib/meal-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET — list/search meals for the admin (includes unpublished; admin only).
export async function GET(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const parsed = mealQuerySchema.safeParse({
    mealType: searchParams.get('mealType') || undefined,
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || undefined,
    page: searchParams.get('page') || undefined,
    pageSize: searchParams.get('pageSize') || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query.' }, { status: 422 });
  }
  try {
    const r = await queryMeals(parsed.data);
    return NextResponse.json(r);
  } catch (err) {
    console.error('[GET /api/admin/meal-studio/meals]', err);
    return NextResponse.json({ error: 'Failed to load meals.' }, { status: 500 });
  }
}

// POST — create a meal.
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
  const parsed = mealCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please review the highlighted fields.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  try {
    const item = await createMeal(parsed.data);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'A meal with this slug already exists. Choose a different slug.' }, { status: 409 });
    }
    console.error('[POST /api/admin/meal-studio/meals]', err);
    return NextResponse.json({ error: 'Failed to create meal.' }, { status: 500 });
  }
}
