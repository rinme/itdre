import { json, type RequestHandler } from "@sveltejs/kit";
import { COOKIE_NAME, verifyAdminJWT } from "$lib/server/auth";

export const GET: RequestHandler = async ({ locals, cookies }) => {
  let user = locals.admin;
  if (!user) {
    const token = cookies.get(COOKIE_NAME);
    if (token) {
      user = (await verifyAdminJWT(token)) ?? undefined;
    }
  }

  if (!user) {
    return json({ authenticated: false }, { status: 401 });
  }

  return json({ authenticated: true, user });
};
