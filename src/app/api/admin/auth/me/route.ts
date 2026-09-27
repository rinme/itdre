import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminJWT, COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 });

  const session = await verifyAdminJWT(token);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });

  return NextResponse.json({ authenticated: true, user: session });
}
