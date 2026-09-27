import { describe, expect, it, beforeAll } from "bun:test";
import { NextRequest } from "next/server";
import { verifyCredentials, signAdminJWT, verifyAdminJWT, COOKIE_NAME } from "../src/lib/auth";
import { middleware } from "../src/middleware";

describe("Admin Authentication", () => {
  beforeAll(() => {
    process.env.ADMIN_USERNAME = "test_admin";
    process.env.ADMIN_PASSWORD = "SecretPassword123!";
    process.env.ADMIN_JWT_SECRET = "01234567890123456789012345678901";
  });

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

  it("signs and verifies a valid JWT session", async () => {
    const token = await signAdminJWT("test_admin");
    expect(typeof token).toBe("string");

    const payload = await verifyAdminJWT(token);
    expect(payload).not.toBeNull();
    expect(payload?.username).toBe("test_admin");
  });

  it("rejects an invalid or tampered JWT session", async () => {
    const payload = await verifyAdminJWT("invalid.tampered.token");
    expect(payload).toBeNull();
  });
});

describe("Admin Edge Middleware", () => {
  beforeAll(() => {
    process.env.ADMIN_USERNAME = "test_admin";
    process.env.ADMIN_PASSWORD = "SecretPassword123!";
    process.env.ADMIN_JWT_SECRET = "01234567890123456789012345678901";
  });

  it("allows unauthenticated access to /admin/login", async () => {
    const req = new NextRequest("http://localhost:3000/admin/login");
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("allows unauthenticated access to /api/admin/auth/login", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/auth/login");
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("redirects unauthenticated page requests to /admin/login with from query parameter", async () => {
    const req = new NextRequest("http://localhost:3000/admin/schedules");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/admin/login?from=%2Fadmin%2Fschedules");
  });

  it("returns 401 JSON for unauthenticated /api/admin requests", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/schedules");
    const res = await middleware(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("UNAUTHORIZED");
  });

  it("allows request with valid admin session cookie", async () => {
    const token = await signAdminJWT("test_admin");
    const req = new NextRequest("http://localhost:3000/admin/schedules", {
      headers: {
        cookie: `${COOKIE_NAME}=${token}`,
      },
    });
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });

  it("rejects tampered admin session cookie for API request with 401 INVALID_SESSION", async () => {
    const req = new NextRequest("http://localhost:3000/api/admin/schedules", {
      headers: {
        cookie: `${COOKIE_NAME}=tampered.token.here`,
      },
    });
    const res = await middleware(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("INVALID_SESSION");
  });

  it("redirects tampered admin session cookie for page request to /admin/login", async () => {
    const req = new NextRequest("http://localhost:3000/admin/schedules", {
      headers: {
        cookie: `${COOKIE_NAME}=tampered.token.here`,
      },
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location");
    expect(location).toContain("/admin/login?from=%2Fadmin%2Fschedules");
  });
});
