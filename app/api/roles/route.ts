import { NextResponse } from "next/server";
import {
  mapRole,
  nullableInt,
  nullableString,
  requiredString,
} from "@/lib/api-data";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql`
    SELECT
      r.id,
      r.name,
      r.department,
      r.level,
      r.status_id,
      rs.name AS status_name,
      r.notes,
      r.created_at,
      r.updated_at
    FROM roles r
    LEFT JOIN role_statuses rs ON rs.id = r.status_id
    ORDER BY r.created_at DESC
  `;
  return NextResponse.json(rows.map(mapRole));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (user?.role.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const name = requiredString(body.name);
  if (!name) {
    return NextResponse.json({ error: "Role name wajib diisi." }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO roles (name, department, level, status_id, notes)
    VALUES (
      ${name},
      ${nullableString(body.department)},
      ${nullableString(body.level)},
      ${nullableInt(body.statusId ?? body.status_id)},
      ${nullableString(body.notes)}
    )
    RETURNING id
  `;

  const id = (rows[0] as { id: number }).id;
  const result = await sql`
    SELECT
      r.id, r.name, r.department, r.level, r.status_id, rs.name AS status_name,
      r.notes, r.created_at, r.updated_at
    FROM roles r
    LEFT JOIN role_statuses rs ON rs.id = r.status_id
    WHERE r.id = ${id}
  `;

  return NextResponse.json(mapRole(result[0] as Record<string, unknown>), {
    status: 201,
  });
}
