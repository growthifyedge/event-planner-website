import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  verifyCredentials,
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { email, password } = body || {};
  if (!verifyCredentials(email, password)) {
    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 }
    );
  }

  const token = await createSessionToken({
    email: String(email).toLowerCase(),
    role: 'admin',
  });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  return NextResponse.json({ ok: true });
}
