import { NextResponse } from "next/server";
import {
  mapCandidate,
  nullableDate,
  nullableInt,
  nullableNumber,
  nullableString,
  requiredString,
} from "@/lib/api-data";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

function validateCandidate(body: Record<string, unknown>) {
  const position = requiredString(body.position);
  const nameOfCandidate = requiredString(body.nameOfCandidate ?? body.name_of_candidate);
  const rating = nullableInt(body.rating);
  const workExperienceYears = nullableNumber(
    body.workExperienceYears ?? body.work_experience_years,
  );

  if (!position) return { error: "Position wajib diisi." };
  if (!nameOfCandidate) return { error: "Name of Candidate wajib diisi." };
  if (rating !== null && (Number.isNaN(rating) || rating < 1 || rating > 5)) {
    return { error: "Rating harus kosong atau angka 1 sampai 5." };
  }
  if (Number.isNaN(workExperienceYears)) {
    return { error: "Pengalaman kerja harus berupa angka." };
  }

  return {
    position,
    nameOfCandidate,
    rating,
    workExperienceYears,
  };
}

export async function GET() {
  const rows = await sql`
    SELECT
      c.id,
      c.role_id,
      r.name AS role_name,
      c.status_id,
      cs.name AS status_name,
      cs.color_hex AS status_color_hex,
      c.progress_id,
      cp.name AS progress_name,
      c.position,
      c.level,
      c.name_of_candidate,
      c.email,
      c.phone_number,
      c.department,
      c.source,
      c.pool_date,
      c.work_experience_years,
      c.education,
      c.university,
      c.major,
      c.location,
      c.rating,
      c.linked_in_profile,
      c.summary_interview_hr,
      c.cv_link,
      c.portfolio_link,
      c.psychological_test,
      c.feedback_from_user,
      c.remarks,
      c.interview_date,
      c.hr_interview_date,
      c.user_interview_date,
      c.created_at,
      c.updated_at
    FROM candidates c
    LEFT JOIN roles r ON r.id = c.role_id
    LEFT JOIN candidate_statuses cs ON cs.id = c.status_id
    LEFT JOIN candidate_progresses cp ON cp.id = c.progress_id
    ORDER BY c.created_at DESC
  `;
  return NextResponse.json(rows.map(mapCandidate));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const valid = validateCandidate(body);
  if ("error" in valid) {
    return NextResponse.json({ error: valid.error }, { status: 400 });
  }

  const user = await getCurrentUser();

  const rows = await sql`
    INSERT INTO candidates (
      role_id, status_id, progress_id, position, level, name_of_candidate,
      email, phone_number, department, source, pool_date, work_experience_years,
      education, university, major, location, rating, linked_in_profile,
      summary_interview_hr, cv_link, portfolio_link, psychological_test,
      feedback_from_user, remarks, interview_date, hr_interview_date,
      user_interview_date, created_by_user_id
    )
    VALUES (
      ${nullableInt(body.roleId ?? body.role_id)},
      ${nullableInt(body.statusId ?? body.status_id)},
      ${nullableInt(body.progressId ?? body.progress_id)},
      ${valid.position},
      ${nullableString(body.level)},
      ${valid.nameOfCandidate},
      ${nullableString(body.email)},
      ${nullableString(body.phoneNumber ?? body.phone_number)},
      ${nullableString(body.department)},
      ${nullableString(body.source)},
      ${nullableDate(body.poolDate ?? body.pool_date)},
      ${valid.workExperienceYears},
      ${nullableString(body.education)},
      ${nullableString(body.university)},
      ${nullableString(body.major)},
      ${nullableString(body.location)},
      ${valid.rating},
      ${nullableString(body.linkedInProfile ?? body.linked_in_profile)},
      ${nullableString(body.summaryInterviewHr ?? body.summary_interview_hr)},
      ${nullableString(body.cvLink ?? body.cv_link)},
      ${nullableString(body.portfolioLink ?? body.portfolio_link)},
      ${nullableString(body.psychologicalTest ?? body.psychological_test)},
      ${nullableString(body.feedbackFromUser ?? body.feedback_from_user)},
      ${nullableString(body.remarks)},
      ${nullableDate(body.interviewDate ?? body.interview_date)},
      ${nullableDate(body.hrInterviewDate ?? body.hr_interview_date)},
      ${nullableDate(body.userInterviewDate ?? body.user_interview_date)},
      ${user?.id ?? null}
    )
    RETURNING id
  `;

  const id = (rows[0] as { id: number }).id;
  const result = await sql`
    SELECT
      c.id, c.role_id, r.name AS role_name, c.status_id,
      cs.name AS status_name, cs.color_hex AS status_color_hex, c.progress_id,
      cp.name AS progress_name, c.position, c.level, c.name_of_candidate,
      c.email, c.phone_number, c.department, c.source, c.pool_date,
      c.work_experience_years, c.education, c.university, c.major, c.location,
      c.rating, c.linked_in_profile, c.summary_interview_hr, c.cv_link,
      c.portfolio_link, c.psychological_test, c.feedback_from_user, c.remarks,
      c.interview_date, c.hr_interview_date, c.user_interview_date,
      c.created_at, c.updated_at
    FROM candidates c
    LEFT JOIN roles r ON r.id = c.role_id
    LEFT JOIN candidate_statuses cs ON cs.id = c.status_id
    LEFT JOIN candidate_progresses cp ON cp.id = c.progress_id
    WHERE c.id = ${id}
  `;
  return NextResponse.json(mapCandidate(result[0] as Record<string, unknown>), {
    status: 201,
  });
}
