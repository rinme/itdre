import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "admin_session";

function getJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET || "fallback_default_secret_32_characters_long_min!";
  return new TextEncoder().encode(secret);
}

export async function verifyCredentials(username?: string, password?: string): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD || "admin1234";

  if (!username || !password) return false;
  return username === expectedUser && password === expectedPass;
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
