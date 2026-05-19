import { NextResponse } from "next/server";
import {
  mapCandidate,
  nullableDate,
  nullableInt,
  nullableNumber,
  nullableString,
  requiredString,
} from "@/lib/api-data";
import { sql } from "@/lib/db";

async function getId(params: Promise<{ id: string }>) {
  const id = Number((await params).id);
  return Number.isInteger(id) ? id : null;
}

async function findCandidate(id: number) {
  const rows = await sql`
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
    LIMIT 1
  `;

  return rows[0] ? mapCandidate(rows[0] as Record<string, unknown>) : null;
}

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

  return { position, nameOfCandidate, rating, workExperienceYears };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const candidate = await findCandidate(id);
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json(candidate);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const valid = validateCandidate(body);
  if ("error" in valid) {
    return NextResponse.json({ error: valid.error }, { status: 400 });
  }

  await sql`
    UPDATE candidates
    SET
      role_id = ${nullableInt(body.roleId ?? body.role_id)},
      status_id = ${nullableInt(body.statusId ?? body.status_id)},
      progress_id = ${nullableInt(body.progressId ?? body.progress_id)},
      position = ${valid.position},
      level = ${nullableString(body.level)},
      name_of_candidate = ${valid.nameOfCandidate},
      email = ${nullableString(body.email)},
      phone_number = ${nullableString(body.phoneNumber ?? body.phone_number)},
      department = ${nullableString(body.department)},
      source = ${nullableString(body.source)},
      pool_date = ${nullableDate(body.poolDate ?? body.pool_date)},
      work_experience_years = ${valid.workExperienceYears},
      education = ${nullableString(body.education)},
      university = ${nullableString(body.university)},
      major = ${nullableString(body.major)},
      location = ${nullableString(body.location)},
      rating = ${valid.rating},
      linked_in_profile = ${nullableString(body.linkedInProfile ?? body.linked_in_profile)},
      summary_interview_hr = ${nullableString(body.summaryInterviewHr ?? body.summary_interview_hr)},
      cv_link = ${nullableString(body.cvLink ?? body.cv_link)},
      portfolio_link = ${nullableString(body.portfolioLink ?? body.portfolio_link)},
      psychological_test = ${nullableString(body.psychologicalTest ?? body.psychological_test)},
      feedback_from_user = ${nullableString(body.feedbackFromUser ?? body.feedback_from_user)},
      remarks = ${nullableString(body.remarks)},
      interview_date = ${nullableDate(body.interviewDate ?? body.interview_date)},
      hr_interview_date = ${nullableDate(body.hrInterviewDate ?? body.hr_interview_date)},
      user_interview_date = ${nullableDate(body.userInterviewDate ?? body.user_interview_date)},
      updated_at = NOW()
    WHERE id = ${id}
  `;

  const candidate = await findCandidate(id);
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json(candidate);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await sql`DELETE FROM candidates WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
