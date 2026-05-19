import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username dan password wajib diisi." },
      { status: 400 },
    );
  }

  const users = await sql`
    SELECT id, full_name, username, role
    FROM app_users
    WHERE username = ${username}
      AND password_hash = crypt(${password}, password_hash)
      AND is_active = TRUE
    LIMIT 1
  `;

  const user = users[0] as
    | { id: number; full_name: string; username: string; role: string }
    | undefined;

  if (!user) {
    return NextResponse.json(
      { error: "Username atau password tidak valid." },
      { status: 401 },
    );
  }

  await sql`
    UPDATE app_users
    SET last_login_at = NOW()
    WHERE id = ${user.id}
  `;

  const sessionUser = {
    id: user.id,
    fullName: user.full_name,
    username: user.username,
    role: user.role,
  };
  const token = await createSessionToken(sessionUser);
  const response = NextResponse.json({ user: sessionUser });
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions());
  return response;
}
