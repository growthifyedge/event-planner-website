/**
 * Server-controlled upload-purpose → Cloudinary folder contract.
 *
 * The signed-upload endpoint must NEVER trust a client-supplied folder or sign
 * arbitrary keys. Instead the client declares a recognized *purpose*; the server
 * maps it to an exact, hardcoded folder and refuses to sign anything else.
 *
 * This keeps the existing Event portfolio flow working (its folder is preserved)
 * while confining Festigo Daily meal uploads to `festigo-daily/meals`.
 */

// purpose → the ONLY folder the server will ever sign for that purpose.
export const UPLOAD_PURPOSES = Object.freeze({
  'event-portfolio': { folder: 'festigo/portfolio' },
  'daily-meal': { folder: 'festigo-daily/meals' },
});

// The only keys that may ever be signed. Anything else — public_id, eager,
// transformation, overwrite, invalidate, type, access_mode, tags, … — is
// refused so a client can neither overwrite an existing asset nor request
// unexpected server-side processing.
const ALLOWED_SIGN_KEYS = new Set(['folder', 'timestamp', 'source']);

export function resolveUploadPurpose(purpose) {
  return UPLOAD_PURPOSES[purpose] || null;
}

/**
 * Validate the widget-supplied `paramsToSign` against the server contract for
 * `purpose`. On success returns `{ ok:true, folder, params }` where `params` is
 * the exact (already-safe) object to sign. On failure returns
 * `{ ok:false, status, error }`.
 *
 * The signature must match precisely what the upload widget will send to
 * Cloudinary, so we validate the incoming params and pass through only the
 * whitelisted keys — we never fabricate or drop a key that would break the
 * signature, and we hard-require the folder to equal the server-mapped folder.
 */
export function validateSignParams(purpose, paramsToSign) {
  const mapped = resolveUploadPurpose(purpose);
  if (!mapped) return { ok: false, status: 400, error: 'Unknown upload purpose.' };

  if (!paramsToSign || typeof paramsToSign !== 'object' || Array.isArray(paramsToSign)) {
    return { ok: false, status: 400, error: 'Missing paramsToSign.' };
  }

  const keys = Object.keys(paramsToSign);
  const illegal = keys.filter((k) => !ALLOWED_SIGN_KEYS.has(k));
  if (illegal.length) {
    return {
      ok: false,
      status: 400,
      error: `Unsupported signed parameter(s): ${illegal.join(', ')}.`,
    };
  }

  // The client MUST NOT choose the folder. It has to be present and identical
  // to the server-mapped folder for the declared purpose — a missing or
  // mismatched folder is rejected outright (never signed).
  if (paramsToSign.folder !== mapped.folder) {
    return { ok: false, status: 400, error: 'Folder is not permitted for this purpose.' };
  }

  // Pass through only whitelisted keys that are actually present, so the signed
  // set matches exactly what the widget sends.
  const params = {};
  for (const k of keys) params[k] = paramsToSign[k];
  return { ok: true, folder: mapped.folder, params };
}
