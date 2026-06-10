/**
 * Lightweight, dependency-free session tokens signed with HMAC-SHA256 via the
 * Web Crypto API. Because it relies only on `globalThis.crypto.subtle`, the same
 * code runs in the Edge middleware runtime AND the Node API routes.
 */

export const SESSION_COOKIE = 'lumiere_admin';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Fail closed in production — never sign sessions with an insecure default.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'JWT_SECRET is not set. Configure a strong JWT_SECRET environment variable before deploying.'
      );
    }
    return 'dev-insecure-secret-change-me';
  }
  return secret;
}

const encoder = new TextEncoder();

function b64urlFromBytes(bytes) {
  let bin = '';
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlFromString(str) {
  return b64urlFromBytes(encoder.encode(str));
}

function b64urlToString(b64) {
  let s = b64.replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);
  return atob(s);
}

async function sign(data) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return b64urlFromBytes(sig);
}

/** Create a signed session token for the given payload. */
export async function createSessionToken(payload) {
  const header = b64urlFromString(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const body = b64urlFromString(
    JSON.stringify({ ...payload, iat: now, exp: now + SESSION_MAX_AGE })
  );
  const signature = await sign(`${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

/** Verify a session token; returns the payload object or null. */
export async function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const expected = await sign(`${header}.${body}`);
  // Constant-time-ish comparison.
  if (expected.length !== signature.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (diff !== 0) return null;

  try {
    const payload = JSON.parse(b64urlToString(body));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Compare submitted admin credentials with the configured env values. */
export function verifyCredentials(email, password) {
  const adminEmail = process.env.ADMIN_EMAIL || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (!adminEmail || !adminPassword) return false;

  const emailOk =
    String(email).trim().toLowerCase() === adminEmail.trim().toLowerCase();

  // Constant-time string compare for the password.
  const a = String(password);
  const b = adminPassword;
  let diff = a.length === b.length ? 0 : 1;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return emailOk && diff === 0;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE,
};
