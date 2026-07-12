import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/meal-studio-auth';
import { updateMealInquiry } from '@/lib/meal-inquiries-store';
import { mealInquiryUpdateSchema } from '@/lib/meal-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PATCH — update a corporate enquiry's status / internal notes only.
// No email is sent on status change (per Phase 4 scope).
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
  const parsed = mealInquiryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid update.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }
  try {
    const item = await updateMealInquiry(id, parsed.data);
    if (!item) return NextResponse.json({ error: 'Enquiry not found.' }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error('[PATCH /api/admin/meal-studio/enquiries/[id]]', err);
    return NextResponse.json({ error: 'Failed to update enquiry.' }, { status: 500 });
  }
}
