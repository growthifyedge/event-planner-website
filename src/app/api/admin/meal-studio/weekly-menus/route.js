import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/meal-studio-auth';
import { queryWeeklyMenus, createWeeklyMenu } from '@/lib/weekly-menu-store';
import { weeklyMenuCreateSchema, weeklyMenuQuerySchema } from '@/lib/meal-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const parsed = weeklyMenuQuerySchema.safeParse({
    status: searchParams.get('status') || undefined,
    page: searchParams.get('page') || undefined,
    pageSize: searchParams.get('pageSize') || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query.' }, { status: 422 });
  }
  try {
    const r = await queryWeeklyMenus(parsed.data);
    return NextResponse.json(r);
  } catch (err) {
    console.error('[GET /api/admin/meal-studio/weekly-menus]', err);
    return NextResponse.json({ error: 'Failed to load weekly menus.' }, { status: 500 });
  }
}

// POST — create a DRAFT weekly menu (never published here; publish is a
// separate, snapshot-freezing action).
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
  const parsed = weeklyMenuCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please review the menu details.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  try {
    const item = await createWeeklyMenu(parsed.data);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/meal-studio/weekly-menus]', err);
    return NextResponse.json({ error: 'Failed to create weekly menu.' }, { status: 500 });
  }
}
