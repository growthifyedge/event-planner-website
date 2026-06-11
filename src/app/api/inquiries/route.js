import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { inquirySchema } from '@/lib/validation';
import { createInquiry, listInquiries, countByStatus } from '@/lib/inquiries-store';
import { sendInquiryNotification, sendClientConfirmation } from '@/lib/email';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Give SMTP enough time to complete within the function lifetime (Vercel).
export const maxDuration = 30;

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

    // IMPORTANT: await the email sends. On serverless (Vercel) any work that
    // isn't awaited is frozen the moment the response returns, so fire-and-forget
    // never actually opens the SMTP connection ("No outgoing requests" in logs).
    // We still return 201 even if email fails (the inquiry is saved), but we now
    // surface email failures in the logs instead of swallowing them.
    const results = await Promise.allSettled([
      sendInquiryNotification(inquiry),
      sendClientConfirmation(inquiry),
    ]);
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(
          `[POST /api/inquiries] email ${i === 0 ? 'notification' : 'confirmation'} failed:`,
          r.reason
        );
      }
    });

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
