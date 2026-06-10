import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { inquirySchema } from '@/lib/validation';
import { createInquiry, listInquiries, countByStatus } from '@/lib/inquiries-store';
import { sendInquiryNotification, sendClientConfirmation } from '@/lib/email';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ── Public: submit an inquiry ───────────────────────────────────────────────
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Please review the highlighted fields and try again.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  // Honeypot: silently accept bot submissions without storing them.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const { company, ...data } = parsed.data;

  try {
    const inquiry = await createInquiry(data);

    // Email notifications are best-effort: never fail the request on email error.
    Promise.allSettled([
      sendInquiryNotification(inquiry),
      sendClientConfirmation(inquiry),
    ]).catch(() => {});

    return NextResponse.json(
      { ok: true, id: inquiry._id, message: 'Inquiry received.' },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/inquiries]', err);
    return NextResponse.json(
      {
        error:
          'We could not save your inquiry right now. Please try again, or email us directly.',
      },
      { status: 500 }
    );
  }
}

// ── Admin: list inquiries ───────────────────────────────────────────────────
async function isAuthed() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(await verifySessionToken(token));
}

export async function GET(request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';
  try {
    const [inquiries, counts] = await Promise.all([
      listInquiries({ status }),
      countByStatus(),
    ]);
    return NextResponse.json({ inquiries, counts });
  } catch (err) {
    console.error('[GET /api/inquiries]', err);
    return NextResponse.json({ error: 'Failed to load inquiries.' }, { status: 500 });
  }
}
