import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { signUploadParams, isCloudinaryConfigured } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAuth() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(await verifySessionToken(token));
}

// Signs the params the Cloudinary upload widget intends to send. The API secret
// never leaves the server; the browser uploads directly to Cloudinary.
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

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const paramsToSign = body?.paramsToSign;
  if (!paramsToSign || typeof paramsToSign !== 'object') {
    return NextResponse.json({ error: 'Missing paramsToSign.' }, { status: 400 });
  }

  const signature = signUploadParams(paramsToSign);
  return NextResponse.json({ signature });
}
