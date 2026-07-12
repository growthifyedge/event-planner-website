import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/meal-studio-auth';
import { listMealInquiries, countMealInquiriesByStatus } from '@/lib/meal-inquiries-store';
import { mealInquiryQuerySchema } from '@/lib/meal-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET — list corporate MealInquiry records (NEVER event inquiries).
export async function GET(request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const parsed = mealInquiryQuerySchema.safeParse({
    status: searchParams.get('status') || undefined,
    page: searchParams.get('page') || undefined,
    pageSize: searchParams.get('pageSize') || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query.' }, { status: 422 });
  }
  try {
    const [list, counts] = await Promise.all([
      listMealInquiries({ ...parsed.data, pageSize: parsed.data.pageSize || 100 }),
      countMealInquiriesByStatus(),
    ]);
    return NextResponse.json({ ...list, counts });
  } catch (err) {
    console.error('[GET /api/admin/meal-studio/enquiries]', err);
    return NextResponse.json({ error: 'Failed to load enquiries.' }, { status: 500 });
  }
}
