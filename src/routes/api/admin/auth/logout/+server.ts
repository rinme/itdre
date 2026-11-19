import { json, type RequestHandler } from "@sveltejs/kit";
import { COOKIE_NAME } from "$lib/server/auth";

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete(COOKIE_NAME, { path: "/" });
  return json({ success: true });
};
