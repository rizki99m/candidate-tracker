import { NextResponse } from "next/server";
import {
  mapRole,
  nullableInt,
  nullableString,
  requiredString,
} from "@/lib/api-data";
import { sql } from "@/lib/db";

async function findRole(id: number) {
  const rows = await sql`
    SELECT
      r.id, r.name, r.department, r.level, r.status_id, rs.name AS status_name,
      r.notes, r.created_at, r.updated_at
    FROM roles r
    LEFT JOIN role_statuses rs ON rs.id = r.status_id
    WHERE r.id = ${id}
    LIMIT 1
  `;

  return rows[0] ? mapRole(rows[0] as Record<string, unknown>) : null;
}

async function getId(params: Promise<{ id: string }>) {
  const id = Number((await params).id);
  return Number.isInteger(id) ? id : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const role = await findRole(id);
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  return NextResponse.json(role);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const name = requiredString(body.name);
  if (!name) {
    return NextResponse.json({ error: "Role name wajib diisi." }, { status: 400 });
  }

  await sql`
    UPDATE roles
    SET
      name = ${name},
      department = ${nullableString(body.department)},
      level = ${nullableString(body.level)},
      status_id = ${nullableInt(body.statusId ?? body.status_id)},
      notes = ${nullableString(body.notes)},
      updated_at = NOW()
    WHERE id = ${id}
  `;

  const role = await findRole(id);
  if (!role) return NextResponse.json({ error: "Role not found" }, { status: 404 });

  return NextResponse.json(role);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await sql`DELETE FROM roles WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
