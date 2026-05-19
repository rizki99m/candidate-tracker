import { NextResponse } from "next/server";
import {
  mapHireRequest,
  nullableDate,
  nullableInt,
  nullablePositiveInt,
  nullableString,
  requiredString,
} from "@/lib/api-data";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const rows = await sql`
    SELECT
      h.id, h.requested_by, h.reason_for_hiring, h.position_title,
      h.department_division, h.employment_type, h.team_members_needed,
      h.expected_join_date, h.description_scope_of_work,
      h.experience_requirements_skills, h.additional_nice_to_have_skills,
      h.working_experience, h.education_required, h.majoring_preferences,
      h.age_range, h.preferences_gender, h.preferences_candidate_residencies,
      h.status_id, hrs.name AS status_name, h.created_at, h.updated_at
    FROM hire_requests h
    LEFT JOIN hire_request_statuses hrs ON hrs.id = h.status_id
    ORDER BY h.created_at DESC
  `;

  return NextResponse.json(rows.map(mapHireRequest));
}

export async function POST(request: Request) {
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

  const user = await getCurrentUser();
  const rows = await sql`
    INSERT INTO hire_requests (
      requested_by, reason_for_hiring, position_title, department_division,
      employment_type, team_members_needed, expected_join_date,
      description_scope_of_work, experience_requirements_skills,
      additional_nice_to_have_skills, working_experience, education_required,
      majoring_preferences, age_range, preferences_gender,
      preferences_candidate_residencies, status_id, created_by_user_id
    )
    VALUES (
      ${requestedBy},
      ${nullableString(body.reasonForHiring ?? body.reason_for_hiring)},
      ${positionTitle},
      ${nullableString(body.departmentDivision ?? body.department_division)},
      ${nullableString(body.employmentType ?? body.employment_type)},
      ${teamMembersNeeded},
      ${nullableDate(body.expectedJoinDate ?? body.expected_join_date)},
      ${nullableString(body.descriptionScopeOfWork ?? body.description_scope_of_work)},
      ${nullableString(body.experienceRequirementsSkills ?? body.experience_requirements_skills)},
      ${nullableString(body.additionalNiceToHaveSkills ?? body.additional_nice_to_have_skills)},
      ${nullableString(body.workingExperience ?? body.working_experience)},
      ${nullableString(body.educationRequired ?? body.education_required)},
      ${nullableString(body.majoringPreferences ?? body.majoring_preferences)},
      ${nullableString(body.ageRange ?? body.age_range)},
      ${nullableString(body.preferencesGender ?? body.preferences_gender)},
      ${nullableString(body.preferencesCandidateResidencies ?? body.preferences_candidate_residencies)},
      ${nullableInt(body.statusId ?? body.status_id)},
      ${user?.id ?? null}
    )
    RETURNING id
  `;

  const id = (rows[0] as { id: number }).id;
  const result = await sql`
    SELECT
      h.id, h.requested_by, h.reason_for_hiring, h.position_title,
      h.department_division, h.employment_type, h.team_members_needed,
      h.expected_join_date, h.description_scope_of_work,
      h.experience_requirements_skills, h.additional_nice_to_have_skills,
      h.working_experience, h.education_required, h.majoring_preferences,
      h.age_range, h.preferences_gender, h.preferences_candidate_residencies,
      h.status_id, hrs.name AS status_name, h.created_at, h.updated_at
    FROM hire_requests h
    LEFT JOIN hire_request_statuses hrs ON hrs.id = h.status_id
    WHERE h.id = ${id}
  `;

  return NextResponse.json(mapHireRequest(result[0] as Record<string, unknown>), {
    status: 201,
  });
}
