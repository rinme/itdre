import { redirect, json, type Handle } from "@sveltejs/kit";
import { COOKIE_NAME, verifyAdminJWT } from "$lib/server/auth";

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname, search } = event.url;
  const token = event.cookies.get(COOKIE_NAME);

  if (token) {
    const session = await verifyAdminJWT(token);
    if (session) {
      event.locals.admin = session;
    }
  }

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isLoginRoute = pathname === "/admin/login" || pathname === "/api/admin/auth/login";

  if (isAdminRoute && !isLoginRoute) {
    if (!event.locals.admin) {
      if (pathname.startsWith("/api/")) {
        return json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      const from = pathname + search;
      throw redirect(303, `/admin/login?from=${encodeURIComponent(from)}`);
    }
  }

  return resolve(event);
};
