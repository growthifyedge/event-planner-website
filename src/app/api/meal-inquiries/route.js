import { NextResponse } from 'next/server';
import { corporateEnquirySchema } from '@/lib/meal-validation';
import { createMealInquiry } from '@/lib/meal-inquiries-store';
import { sendMealInquiryNotification, sendMealInquiryConfirmation } from '@/lib/meal-email';
import { KARACHI_AREAS } from '@/data/meal-constants';

/**
 * Public Festigo Daily corporate meal enquiry endpoint.
 *
 * Completely isolated from /api/inquiries (the Event Planner system): it uses
 * only the MealInquiry model/store and the Festigo Daily email module. POST
 * only — the admin listing UI is out of scope for Phase 3.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Give SMTP enough time to complete within the serverless function lifetime.
export const maxDuration = 30;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Honeypot: silently accept (but do not store) obvious bot submissions.
  if (body && body.website) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  // Karachi-only enforcement with a friendly, on-brand message. If an area was
  // provided but isn't one we serve, respond politely rather than with a raw
  // validation error.
  if (
    body &&
    typeof body.officeLocation === 'string' &&
    body.officeLocation.trim() !== '' &&
    !KARACHI_AREAS.includes(body.officeLocation)
  ) {
    return NextResponse.json(
      {
        error:
          'Festigo Daily currently serves Karachi only. If your office is within Karachi, please pick the nearest area — otherwise message us on WhatsApp and we’ll do our best to help.',
        outsideServiceArea: true,
      },
      { status: 422 }
    );
  }

  const parsed = corporateEnquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Please review the highlighted fields and try again.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  // Drop the honeypot; tag the source so these never mix with event inquiries.
  const { website, ...data } = parsed.data;
  data.source = 'festigo-daily-corporate';

  try {
    const inquiry = await createMealInquiry(data);

    // Await the sends: on serverless, un-awaited work is frozen once the
    // response returns. We still return 201 if email fails (enquiry is saved),
    // but surface failures in the logs instead of swallowing them.
    const results = await Promise.allSettled([
      sendMealInquiryNotification(inquiry),
      sendMealInquiryConfirmation(inquiry),
    ]);
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.error(
          `[POST /api/meal-inquiries] email ${i === 0 ? 'notification' : 'confirmation'} failed:`,
          r.reason
        );
      }
    });

    return NextResponse.json(
      { ok: true, id: inquiry._id, message: 'Corporate meal enquiry received.' },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/meal-inquiries]', err);
    return NextResponse.json(
      {
        error:
          'We could not submit your enquiry right now. Please try again, or reach us on WhatsApp.',
      },
      { status: 500 }
    );
  }
}
