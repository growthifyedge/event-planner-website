import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  (await cookies()).set(SESSION_COOKIE, '', {
    ...sessionCookieOptions,
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
