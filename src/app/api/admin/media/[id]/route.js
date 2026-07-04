import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { updateMedia, deleteMedia } from '@/lib/media-store';
import { destroyAsset, isCloudinaryConfigured } from '@/lib/cloudinary';
import { MEDIA_CATEGORIES, HOMEPAGE_PLACEMENT_VALUES } from '@/models/Media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  const updates = {};
  if (typeof body.title === 'string' && body.title.trim()) {
    updates.title = body.title.trim().slice(0, 160);
  }
  if (MEDIA_CATEGORIES.includes(body.category)) {
    updates.category = body.category;
  }
  // Homepage placement ('' clears it). Validated against the allowed slots.
  if (
    typeof body.homepagePlacement === 'string' &&
    HOMEPAGE_PLACEMENT_VALUES.includes(body.homepagePlacement)
  ) {
    updates.homepagePlacement = body.homepagePlacement;
  }
  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
  }

  const item = await updateMedia(id, updates);
  if (!item) {
    return NextResponse.json({ error: 'Media not found.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(request, { params }) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;

  const item = await deleteMedia(id);
  if (!item) {
    return NextResponse.json({ error: 'Media not found.' }, { status: 404 });
  }

  // Best-effort removal from Cloudinary (don't fail the request if this errors).
  if (isCloudinaryConfigured() && item.publicId) {
    try {
      await destroyAsset(item.publicId, item.type === 'video' ? 'video' : 'image');
    } catch (err) {
      console.error('[cloudinary destroy]', err);
    }
  }

  return NextResponse.json({ ok: true });
}
