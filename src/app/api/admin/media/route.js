import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { createMedia, queryMedia } from '@/lib/media-store';
import { MEDIA_CATEGORIES } from '@/models/Media';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAuth() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(await verifySessionToken(token));
}

export async function GET(request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const opts = {
    category: searchParams.get('category') || 'All',
    type: searchParams.get('type') || 'All',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
    pageSize: Math.min(48, parseInt(searchParams.get('pageSize') || '24', 10) || 24),
  };
  try {
    const r = await queryMedia(opts);
    return NextResponse.json({
      media: r.items,
      total: r.total,
      page: r.page,
      pageSize: r.pageSize,
      hasMore: r.hasMore,
    });
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
