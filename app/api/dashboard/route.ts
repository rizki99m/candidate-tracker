import { NextResponse } from "next/server";
import { asString } from "@/lib/api-data";
import { sql } from "@/lib/db";

export async function GET() {
  let totalsRows;
  let byStatus;
  let byRole;
  let byProgress;

  try {
    [totalsRows, byStatus, byRole, byProgress] = await Promise.all([
      sql`SELECT * FROM v_dashboard_totals`,
      sql`
        SELECT *
        FROM v_dashboard_status_summary
        ORDER BY sort_order, status_name
      `,
      sql`
        SELECT *
        FROM v_dashboard_role_summary
        ORDER BY role_name
      `,
      sql`
        SELECT *
        FROM v_dashboard_progress_summary
        ORDER BY sort_order, progress_name
      `,
    ]);
  } catch (error) {
    if (!isMissingRelationError(error)) throw error;

    [totalsRows, byStatus, byRole, byProgress] = await Promise.all([
      sql`
        SELECT
          COUNT(*)::int AS total_candidates,
          COUNT(*) FILTER (WHERE role_id IS NULL)::int AS total_talent_pool,
          COUNT(*) FILTER (WHERE status_id IS NULL)::int AS total_without_status,
          COUNT(*) FILTER (WHERE cs.name = 'Hired')::int AS total_hired,
          COUNT(*) FILTER (WHERE cs.name = 'Rejected')::int AS total_rejected,
          COUNT(*) FILTER (
            WHERE cs.name IS NULL
              OR cs.name NOT IN ('Hired', 'Rejected', 'Withdraw')
          )::int AS total_in_process
        FROM candidates c
        LEFT JOIN candidate_statuses cs ON cs.id = c.status_id
      `,
      sql`
        SELECT
          cs.id AS status_id,
          COALESCE(cs.name, 'No Status') AS status_name,
          COALESCE(cs.sort_order, 9999) AS sort_order,
          COUNT(c.id)::int AS candidate_count
        FROM candidates c
        LEFT JOIN candidate_statuses cs ON cs.id = c.status_id
        GROUP BY cs.id, cs.name, cs.sort_order
        ORDER BY sort_order, status_name
      `,
      sql`
        SELECT
          r.id AS role_id,
          COALESCE(r.name, 'Talent Pool') AS role_name,
          COUNT(c.id)::int AS candidate_count
        FROM candidates c
        LEFT JOIN roles r ON r.id = c.role_id
        GROUP BY r.id, r.name
        ORDER BY role_name
      `,
      sql`
        SELECT
          cp.id AS progress_id,
          COALESCE(cp.name, 'No Progress') AS progress_name,
          COALESCE(cp.sort_order, 9999) AS sort_order,
          COUNT(c.id)::int AS candidate_count
        FROM candidates c
        LEFT JOIN candidate_progresses cp ON cp.id = c.progress_id
        GROUP BY cp.id, cp.name, cp.sort_order
        ORDER BY sort_order, progress_name
      `,
    ]);
  }

  const totals = totalsRows[0] || {};

  return NextResponse.json({
    totals: {
      totalCandidates: Number(totals.total_candidates || 0),
      totalTalentPool: Number(totals.total_talent_pool || 0),
      totalWithoutStatus: Number(totals.total_without_status || 0),
      totalHired: Number(totals.total_hired || 0),
      totalRejected: Number(totals.total_rejected || 0),
      totalInProcess: Number(totals.total_in_process || 0),
    },
    byStatus: byStatus.map((row) => ({
      statusId: asString(row.status_id),
      statusName: asString(row.status_name) || "No Status",
      sortOrder: Number(row.sort_order || 0),
      candidateCount: Number(row.candidate_count || 0),
    })),
    byRole: byRole.map((row) => ({
      roleId: asString(row.role_id),
      roleName: asString(row.role_name) || "Talent Pool",
      candidateCount: Number(row.candidate_count || 0),
    })),
    byProgress: byProgress.map((row) => ({
      progressId: asString(row.progress_id),
      progressName: asString(row.progress_name) || "No Progress",
      sortOrder: Number(row.sort_order || 0),
      candidateCount: Number(row.candidate_count || 0),
    })),
  });
}

function isMissingRelationError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "42P01"
  );
}
