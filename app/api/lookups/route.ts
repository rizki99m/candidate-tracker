import { NextResponse } from "next/server";
import { asString } from "@/lib/api-data";
import { sql } from "@/lib/db";

export async function GET() {
  const [
    roleStatuses,
    candidateStatuses,
    hireRequestStatuses,
    roles,
  ] = await Promise.all([
    sql`SELECT id, name, sort_order FROM role_statuses ORDER BY sort_order, name`,
    sql`
      SELECT id, name, color_hex, is_terminal, sort_order
      FROM candidate_statuses
      ORDER BY sort_order, name
    `,
    sql`
      SELECT id, name, sort_order
      FROM hire_request_statuses
      ORDER BY sort_order, name
    `,
    sql`SELECT id, name, department, level FROM roles ORDER BY name`,
  ]);

  return NextResponse.json({
    roleStatuses: roleStatuses.map((row) => ({
      id: asString(row.id),
      name: asString(row.name),
      sortOrder: Number(row.sort_order || 0),
    })),
    candidateStatuses: candidateStatuses.map((row) => ({
      id: asString(row.id),
      name: asString(row.name),
      colorHex: asString(row.color_hex),
      isTerminal: Boolean(row.is_terminal),
      sortOrder: Number(row.sort_order || 0),
    })),
    hireRequestStatuses: hireRequestStatuses.map((row) => ({
      id: asString(row.id),
      name: asString(row.name),
      sortOrder: Number(row.sort_order || 0),
    })),
    roles: roles.map((row) => ({
      id: asString(row.id),
      name: asString(row.name),
      department: asString(row.department),
      level: asString(row.level),
    })),
  });
}
