// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { isRedirect } from "@sveltejs/kit";
import {
  COOKIE_NAME,
  verifyCredentials,
  signAdminJWT,
  verifyAdminJWT,
  getSafeRedirect,
} from "../src/lib/server/auth";
import { handle } from "../src/hooks.server";
import { prisma } from "../src/lib/server/prisma";

describe("Prisma Server Singleton", () => {
  it("exports a valid PrismaClient singleton", () => {
    expect(prisma).toBeDefined();
    expect(typeof prisma.$connect).toBe("function");
  });
});

describe("Admin Authentication Helpers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.ADMIN_USERNAME = "test_admin";
    process.env.ADMIN_PASSWORD = "SecretPassword123!";
    process.env.ADMIN_JWT_SECRET = "01234567890123456789012345678901";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("verifyCredentials", () => {
    it("successfully verifies correct credentials", async () => {
      const valid = await verifyCredentials("test_admin", "SecretPassword123!");
      expect(valid).toBe(true);
    });

    it("rejects invalid username or password", async () => {
      const wrongUser = await verifyCredentials("wrong_user", "SecretPassword123!");
      expect(wrongUser).toBe(false);

      const wrongPass = await verifyCredentials("test_admin", "WrongPassword!");
      expect(wrongPass).toBe(false);
    });

    it("handles missing, empty, or undefined credentials safely", async () => {
      expect(await verifyCredentials("", "SecretPassword123!")).toBe(false);
      expect(await verifyCredentials("test_admin", "")).toBe(false);
      expect(await verifyCredentials(undefined, undefined)).toBe(false);
      expect(await verifyCredentials("test_admin", undefined)).toBe(false);
      expect(await verifyCredentials(undefined, "SecretPassword123!")).toBe(false);
    });

    it("falls back to default credentials when env variables are not set", async () => {
      delete process.env.ADMIN_USERNAME;
      delete process.env.ADMIN_PASSWORD;

      expect(await verifyCredentials("admin", "admin1234")).toBe(true);
      expect(await verifyCredentials("test_admin", "SecretPassword123!")).toBe(false);
    });
  });

  describe("signAdminJWT and verifyAdminJWT", () => {
    it("signs and verifies a valid JWT session", async () => {
      const token = await signAdminJWT("test_admin");
      expect(typeof token).toBe("string");

      const payload = await verifyAdminJWT(token);
      expect(payload).not.toBeNull();
      expect(payload?.username).toBe("test_admin");
      expect(payload?.role).toBe("ADMIN");
    });

    it("rejects an invalid or tampered JWT session", async () => {
      const payload = await verifyAdminJWT("invalid.tampered.token");
      expect(payload).toBeNull();
    });

    it("rejects empty token", async () => {
      const payload = await verifyAdminJWT("");
      expect(payload).toBeNull();
    });

    it("throws error in production when ADMIN_JWT_SECRET is missing", async () => {
      (process.env as any).NODE_ENV = "production";
      delete process.env.ADMIN_JWT_SECRET;
      await expect(signAdminJWT("test_admin")).rejects.toThrow(
        "ADMIN_JWT_SECRET environment variable is required in production"
      );
    });

    it("falls back to default secret when ADMIN_JWT_SECRET is missing in development/test", async () => {
      (process.env as any).NODE_ENV = "development";
      delete process.env.ADMIN_JWT_SECRET;
      const token = await signAdminJWT("fallback_admin");
      expect(typeof token).toBe("string");
      const verified = await verifyAdminJWT(token);
      expect(verified?.username).toBe("fallback_admin");
      expect(verified?.role).toBe("ADMIN");
    });
  });

  describe("getSafeRedirect", () => {
    it("returns default fallback when url is null or undefined or empty", () => {
      expect(getSafeRedirect(null)).toBe("/admin/schedules");
      expect(getSafeRedirect(undefined)).toBe("/admin/schedules");
      expect(getSafeRedirect("")).toBe("/admin/schedules");
    });

    it("preserves safe relative paths including query strings", () => {
      expect(getSafeRedirect("/admin/presets")).toBe("/admin/presets");
      expect(getSafeRedirect("/admin/schedules?semester=1&year=2567")).toBe(
        "/admin/schedules?semester=1&year=2567"
      );
    });

    it("rejects protocol-relative URLs", () => {
      expect(getSafeRedirect("//attacker.com/malicious")).toBe("/admin/schedules");
    });

    it("rejects absolute URLs with protocol", () => {
      expect(getSafeRedirect("https://attacker.com")).toBe("/admin/schedules");
      expect(getSafeRedirect("http://localhost:3000/admin/schedules")).toBe("/admin/schedules");
      expect(getSafeRedirect("javascript:alert(1)")).toBe("/admin/schedules");
    });

    it("rejects relative paths that do not start with /", () => {
      expect(getSafeRedirect("admin/schedules")).toBe("/admin/schedules");
    });
  });
});

describe("SvelteKit Handle Hook", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.ADMIN_USERNAME = "test_admin";
    process.env.ADMIN_PASSWORD = "SecretPassword123!";
    process.env.ADMIN_JWT_SECRET = "01234567890123456789012345678901";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  function createMockEvent(urlStr: string, cookieValue?: string) {
    const url = new URL(urlStr);
    const cookiesMap = new Map<string, string>();
    if (cookieValue) {
      cookiesMap.set(COOKIE_NAME, cookieValue);
    }
    const locals: App.Locals = {};

    const event = {
      url,
      request: new Request(urlStr),
      cookies: {
        get: (name: string) => cookiesMap.get(name),
        set: (name: string, val: string) => cookiesMap.set(name, val),
        delete: (name: string) => cookiesMap.delete(name),
        getAll: () => Array.from(cookiesMap.entries()).map(([name, value]) => ({ name, value })),
      },
      locals,
    } as any;

    const resolve = vi.fn(async (resolvedEvent: any) => {
      return new Response("OK", { status: 200 });
    });

    return { event, resolve };
  }

  it("allows unauthenticated access to /admin/login", async () => {
    const { event, resolve } = createMockEvent("http://localhost:3000/admin/login");
    const response = await handle({ event, resolve });
    expect(response.status).toBe(200);
    expect(resolve).toHaveBeenCalledWith(event);
  });

  it("allows unauthenticated access to /api/admin/auth/login", async () => {
    const { event, resolve } = createMockEvent("http://localhost:3000/api/admin/auth/login");
    const response = await handle({ event, resolve });
    expect(response.status).toBe(200);
    expect(resolve).toHaveBeenCalledWith(event);
  });

  it("redirects unauthenticated page requests to /admin/login with from query parameter", async () => {
    const { event, resolve } = createMockEvent("http://localhost:3000/admin/schedules");
    try {
      await handle({ event, resolve });
      expect.fail("Should have redirected");
    } catch (err: any) {
      expect(isRedirect(err)).toBe(true);
      expect(err.status).toBe(303);
      expect(err.location).toBe("/admin/login?from=%2Fadmin%2Fschedules");
    }
  });

  it("preserves search query in redirect when unauthenticated page requests have query params", async () => {
    const { event, resolve } = createMockEvent(
      "http://localhost:3000/admin/schedules?term=1&year=2567"
    );
    try {
      await handle({ event, resolve });
      expect.fail("Should have redirected");
    } catch (err: any) {
      expect(isRedirect(err)).toBe(true);
      expect(err.status).toBe(303);
      expect(err.location).toBe(
        "/admin/login?from=" + encodeURIComponent("/admin/schedules?term=1&year=2567")
      );
    }
  });

  it("returns 401 JSON for unauthenticated /api/admin requests", async () => {
    const { event, resolve } = createMockEvent("http://localhost:3000/api/admin/schedules");
    const response = await handle({ event, resolve });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "UNAUTHORIZED" });
  });

  it("allows page request with valid admin session cookie and populates event.locals.admin", async () => {
    const token = await signAdminJWT("test_admin");
    const { event, resolve } = createMockEvent(
      "http://localhost:3000/admin/schedules",
      token
    );
    const response = await handle({ event, resolve });
    expect(response.status).toBe(200);
    expect(resolve).toHaveBeenCalledWith(event);
    expect(event.locals.admin).toEqual({
      username: "test_admin",
      role: "ADMIN",
    });
  });

  it("allows api request with valid admin session cookie and populates event.locals.admin", async () => {
    const token = await signAdminJWT("test_admin");
    const { event, resolve } = createMockEvent(
      "http://localhost:3000/api/admin/schedules",
      token
    );
    const response = await handle({ event, resolve });
    expect(response.status).toBe(200);
    expect(resolve).toHaveBeenCalledWith(event);
    expect(event.locals.admin).toEqual({
      username: "test_admin",
      role: "ADMIN",
    });
  });

  it("rejects tampered admin session cookie for API request with 401 UNAUTHORIZED", async () => {
    const { event, resolve } = createMockEvent(
      "http://localhost:3000/api/admin/schedules",
      "tampered.token.here"
    );
    const response = await handle({ event, resolve });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({ error: "UNAUTHORIZED" });
    expect(event.locals.admin).toBeUndefined();
  });

  it("redirects tampered admin session cookie for page request to /admin/login", async () => {
    const { event, resolve } = createMockEvent(
      "http://localhost:3000/admin/schedules",
      "tampered.token.here"
    );
    try {
      await handle({ event, resolve });
      expect.fail("Should have redirected");
    } catch (err: any) {
      expect(isRedirect(err)).toBe(true);
      expect(err.status).toBe(303);
      expect(err.location).toBe("/admin/login?from=%2Fadmin%2Fschedules");
      expect(event.locals.admin).toBeUndefined();
    }
  });

  it("allows public routes without authentication", async () => {
    const { event, resolve } = createMockEvent("http://localhost:3000/");
    const response = await handle({ event, resolve });
    expect(response.status).toBe(200);
    expect(resolve).toHaveBeenCalledWith(event);
  });

  it("populates locals.admin on public routes if valid cookie is present", async () => {
    const token = await signAdminJWT("test_admin");
    const { event, resolve } = createMockEvent("http://localhost:3000/", token);
    const response = await handle({ event, resolve });
    expect(response.status).toBe(200);
    expect(event.locals.admin).toEqual({
      username: "test_admin",
      role: "ADMIN",
    });
  });
});
