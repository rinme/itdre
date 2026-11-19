import { json, type RequestHandler } from "@sveltejs/kit";
import { verifyCredentials, signAdminJWT, COOKIE_NAME } from "$lib/server/auth";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { username, password } = await request.json();
    const isValid = await verifyCredentials(username, password);

    if (!isValid) {
      return json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    const token = await signAdminJWT(username);

    cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return json({ success: true, username });
  } catch (error) {
    return json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
};
