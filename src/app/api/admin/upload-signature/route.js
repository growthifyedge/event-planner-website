import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { signUploadParams, isCloudinaryConfigured } from '@/lib/cloudinary';
import { validateSignParams } from '@/lib/upload-purposes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAuth() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(await verifySessionToken(token));
}

// Signs ONLY the params the server contract allows for a declared upload
// purpose. The API secret never leaves the server, the client can never choose
// an arbitrary folder, and no arbitrary keys (public_id, eager, overwrite,
// invalidate, …) are ever signed. Purpose is taken from the query string
// (?purpose=event-portfolio|daily-meal) so it can't be smuggled inside the
// signable params object.
export async function POST(request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      { error: 'Cloudinary is not configured. Set the CLOUDINARY_* environment variables.' },
      { status: 503 }
    );
  }

  const purpose = new URL(request.url).searchParams.get('purpose');

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const check = validateSignParams(purpose, body?.paramsToSign);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const signature = signUploadParams(check.params);
  return NextResponse.json({ signature });
}
