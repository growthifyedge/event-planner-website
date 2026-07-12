import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

/**
 * Shared admin gate for the Festigo Daily Meal Studio API routes. Reuses the
 * EXISTING admin session (the `lumiere_admin` HMAC cookie) — it does not create
 * a second auth system, add RBAC, or change any auth behaviour. Every Meal
 * Studio mutation route calls this before touching a store.
 */
export async function isAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return Boolean(await verifySessionToken(token));
}
