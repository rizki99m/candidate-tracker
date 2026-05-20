import { NextResponse } from "next/server";
import {
  mapHireRequest,
  nullableBoolean,
  nullableDate,
  nullableInt,
  nullablePositiveInt,
  nullableString,
  requiredString,
} from "@/lib/api-data";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

async function getId(params: Promise<{ id: string }>) {
  const id = Number((await params).id);
  return Number.isInteger(id) ? id : null;
}

async function findHireRequest(id: number) {
  const rows = await sql`
    SELECT
      h.id, h.requested_by, h.reason_for_hiring, h.position_title,
      h.department_division, h.employment_type, h.team_members_needed,
      h.expected_join_date, h.description_scope_of_work,
      h.experience_requirements_skills, h.additional_nice_to_have_skills,
      h.working_experience, h.education_required, h.majoring_preferences,
      h.age_range, h.preferences_gender, h.preferences_candidate_residencies,
      h.status_id, hrs.name AS status_name, h.is_urgent,
      h.created_at, h.updated_at
    FROM hire_requests h
    LEFT JOIN hire_request_statuses hrs ON hrs.id = h.status_id
    WHERE h.id = ${id}
    LIMIT 1
  `;

  return rows[0] ? mapHireRequest(rows[0] as Record<string, unknown>) : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const hireRequest = await findHireRequest(id);
  if (!hireRequest) {
    return NextResponse.json({ error: "Hire request not found" }, { status: 404 });
  }

  return NextResponse.json(hireRequest);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || !["admin", "user"].includes(user.role.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const requestedBy = requiredString(body.requestedBy ?? body.requested_by);
  const positionTitle = requiredString(body.positionTitle ?? body.position_title);
  const teamMembersNeeded = nullablePositiveInt(
    body.teamMembersNeeded ?? body.team_members_needed,
  );

  if (!requestedBy) {
    return NextResponse.json({ error: "Requested By wajib diisi." }, { status: 400 });
  }
  if (!positionTitle) {
    return NextResponse.json({ error: "Position Title wajib diisi." }, { status: 400 });
  }
  if (Number.isNaN(teamMembersNeeded)) {
    return NextResponse.json(
      { error: "Team members needed harus kosong atau lebih dari 0." },
      { status: 400 },
    );
  }

  await sql`
    UPDATE hire_requests
    SET
      requested_by = ${requestedBy},
      reason_for_hiring = ${nullableString(body.reasonForHiring ?? body.reason_for_hiring)},
      position_title = ${positionTitle},
      department_division = ${nullableString(body.departmentDivision ?? body.department_division)},
      employment_type = ${nullableString(body.employmentType ?? body.employment_type)},
      team_members_needed = ${teamMembersNeeded},
      expected_join_date = ${nullableDate(body.expectedJoinDate ?? body.expected_join_date)},
      description_scope_of_work = ${nullableString(body.descriptionScopeOfWork ?? body.description_scope_of_work)},
      experience_requirements_skills = ${nullableString(body.experienceRequirementsSkills ?? body.experience_requirements_skills)},
      additional_nice_to_have_skills = ${nullableString(body.additionalNiceToHaveSkills ?? body.additional_nice_to_have_skills)},
      working_experience = ${nullableString(body.workingExperience ?? body.working_experience)},
      education_required = ${nullableString(body.educationRequired ?? body.education_required)},
      majoring_preferences = ${nullableString(body.majoringPreferences ?? body.majoring_preferences)},
      age_range = ${nullableString(body.ageRange ?? body.age_range)},
      preferences_gender = ${nullableString(body.preferencesGender ?? body.preferences_gender)},
      preferences_candidate_residencies = ${nullableString(body.preferencesCandidateResidencies ?? body.preferences_candidate_residencies)},
      status_id = ${nullableInt(body.statusId ?? body.status_id)},
      is_urgent = ${nullableBoolean(body.isUrgent ?? body.is_urgent)},
      updated_at = NOW()
    WHERE id = ${id}
  `;

  const hireRequest = await findHireRequest(id);
  if (!hireRequest) {
    return NextResponse.json({ error: "Hire request not found" }, { status: 404 });
  }

  return NextResponse.json(hireRequest);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || !["admin", "user"].includes(user.role.toLowerCase())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = await getId(params);
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await sql`DELETE FROM hire_requests WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
