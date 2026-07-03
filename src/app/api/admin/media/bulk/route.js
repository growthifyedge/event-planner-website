import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { bulkDeleteMedia } from '@/lib/media-store';
import { destroyAsset, isCloudinaryConfigured } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAuth() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(await verifySessionToken(token));
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

  const action = body?.action;
  const ids = Array.isArray(body?.ids) ? body.ids.filter(Boolean) : [];
  if (!ids.length) {
    return NextResponse.json({ error: 'No items selected.' }, { status: 400 });
  }

  if (action === 'delete') {
    const removed = await bulkDeleteMedia(ids);
    // Best-effort Cloudinary cleanup — never fail the request on cleanup error.
    if (isCloudinaryConfigured()) {
      await Promise.allSettled(
        removed.map((m) => destroyAsset(m.publicId, m.type === 'video' ? 'video' : 'image'))
      );
    }
    return NextResponse.json({ ok: true, deleted: removed.length });
  }

  // Structured for future actions (e.g. { action: 'move', category }).
  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
