import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { createMedia, listMedia } from '@/lib/media-store';
import { MEDIA_CATEGORIES } from '@/models/Media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAuth() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(await verifySessionToken(token));
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const media = await listMedia();
    return NextResponse.json({ media });
  } catch (err) {
    console.error('[GET /api/admin/media]', err);
    return NextResponse.json({ error: 'Failed to load media.' }, { status: 500 });
  }
}

export async function POST(request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { title, category, type, url, publicId } = body || {};
  if (
    !title ||
    !url ||
    !publicId ||
    !MEDIA_CATEGORIES.includes(category) ||
    !['image', 'video'].includes(type)
  ) {
    return NextResponse.json({ error: 'Missing or invalid fields.' }, { status: 422 });
  }

  try {
    const item = await createMedia({
      title: String(title).trim().slice(0, 160),
      category,
      type,
      url,
      publicId,
    });
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/media]', err);
    return NextResponse.json({ error: 'Failed to save media.' }, { status: 500 });
  }
}
