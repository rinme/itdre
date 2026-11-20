import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "admin_session";

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_JWT_SECRET environment variable is required in production");
    }
    return new TextEncoder().encode("fallback_default_secret_32_characters_long_min!");
  }
  return new TextEncoder().encode(secret);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function verifyCredentials(username?: string, password?: string): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD || "admin1234";

  if (!username || !password) return false;

  return safeEqual(username, expectedUser) && safeEqual(password, expectedPass);
}

export async function signAdminJWT(username: string): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ username, role: "ADMIN" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminJWT(token: string): Promise<{ username: string; role: string } | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return {
      username: payload.username as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export function getSafeRedirect(url: string | null | undefined): string {
  if (!url) return "/admin/schedules";
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("://")) {
    return url;
  }
  return "/admin/schedules";
}
