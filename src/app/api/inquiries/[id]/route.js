import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { updateInquiry, deleteInquiry } from '@/lib/inquiries-store';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const STATUSES = ['new', 'contacted', 'booked', 'archived'];

async function requireAuth() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(await verifySessionToken(token));
}

export async function PATCH(request, { params }) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  if (!STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
  }
  const inquiry = await updateInquiry(id, { status: body.status });
  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, inquiry });
}

export async function DELETE(request, { params }) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const ok = await deleteInquiry(id);
  if (!ok) {
    return NextResponse.json({ error: 'Inquiry not found.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
