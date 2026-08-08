/**
 * Site access.
 *
 * One shared password, no accounts, no database. The password itself is never
 * stored in the cookie — the cookie carries an HMAC signature derived from a
 * separate secret, so a stolen cookie reveals nothing and cannot be forged
 * without SESSION_SECRET.
 *
 * Both values come from the environment and must never be committed.
 * See README.md for how to set them.
 */

export const SESSION_COOKIE = "csg-session";

/** How long a login lasts. Thirty days — this is a reference document. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Runs in the Edge runtime (middleware), so this uses Web Crypto rather than
 * node:crypto. Both are available in the App Router.
 */
async function hmac(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * The token is `issuedAt.signature`. Carrying the timestamp inside the signed
 * payload means an old token cannot be replayed forever even if the cookie's
 * own expiry is tampered with.
 */
export async function createToken(secret: string): Promise<string> {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${await hmac(secret, issuedAt)}`;
}

export async function verifyToken(
  token: string | undefined,
  secret: string,
): Promise<boolean> {
  if (!token) return false;

  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_MAX_AGE * 1000) {
    return false;
  }

  return timingSafeEqual(await hmac(secret, issuedAt), signature);
}

/**
 * Compares in constant time. A plain `===` on a secret comparison leaks the
 * position of the first mismatched character through timing.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
