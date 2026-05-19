export function asString(value: unknown) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

export function asDateString(value: unknown) {
  return asString(value).slice(0, 10);
}

export function nullableString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function nullableInt(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

export function nullablePositiveInt(value: unknown) {
  const parsed = nullableInt(value);
  if (parsed === null) return null;
  return parsed > 0 ? parsed : Number.NaN;
}

export function nullableNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function nullableDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  return value;
}

export function requiredString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function mapRole(row: Record<string, unknown>) {
  return {
    id: asString(row.id),
    name: asString(row.name),
    department: asString(row.department),
    level: asString(row.level),
    statusId: asString(row.status_id),
    status: asString(row.status_name) || "Closed",
    notes: asString(row.notes),
    createdAt: asDateString(row.created_at),
    updatedAt: asDateString(row.updated_at),
  };
}

export function mapCandidate(row: Record<string, unknown>) {
  const statusName = asString(row.status_name) || "No Status";
  const progressName = asString(row.progress_name);

  return {
    id: asString(row.id),
    roleId: asString(row.role_id),
    roleName: asString(row.role_name) || "Talent Pool",
    statusId: asString(row.status_id),
    statusName,
    statusColorHex: asString(row.status_color_hex),
    progressId: asString(row.progress_id),
    progressName: progressName || "No Progress",
    position: asString(row.position),
    level: asString(row.level),
    nameOfCandidate: asString(row.name_of_candidate),
    email: asString(row.email),
    phoneNumber: asString(row.phone_number),
    department: asString(row.department),
    source: asString(row.source),
    poolDate: asDateString(row.pool_date),
    workExperienceYears: asString(row.work_experience_years),
    education: asString(row.education),
    university: asString(row.university),
    major: asString(row.major),
    location: asString(row.location),
    rating: asString(row.rating),
    linkedInProfile: asString(row.linked_in_profile),
    summaryInterviewHr: asString(row.summary_interview_hr),
    cvLink: asString(row.cv_link),
    portfolioLink: asString(row.portfolio_link),
    psychologicalTest: asString(row.psychological_test),
    feedbackFromUser: asString(row.feedback_from_user),
    remarks: asString(row.remarks),
    status: statusName,
    progress: progressName,
    interviewDate: asDateString(row.interview_date),
    hrInterviewDate: asDateString(row.hr_interview_date),
    userInterviewDate: asDateString(row.user_interview_date),
    createdAt: asDateString(row.created_at),
    updatedAt: asDateString(row.updated_at),
  };
}

export function mapHireRequest(row: Record<string, unknown>) {
  return {
    id: asString(row.id),
    requestedBy: asString(row.requested_by),
    reasonForHiring: asString(row.reason_for_hiring),
    positionTitle: asString(row.position_title),
    departmentDivision: asString(row.department_division),
    employmentType: asString(row.employment_type),
    teamMembersNeeded: asString(row.team_members_needed),
    expectedJoinDate: asDateString(row.expected_join_date),
    descriptionScopeOfWork: asString(row.description_scope_of_work),
    experienceRequirementsSkills: asString(row.experience_requirements_skills),
    additionalNiceToHaveSkills: asString(row.additional_nice_to_have_skills),
    workingExperience: asString(row.working_experience),
    educationRequired: asString(row.education_required),
    majoringPreferences: asString(row.majoring_preferences),
    ageRange: asString(row.age_range),
    preferencesGender: asString(row.preferences_gender),
    preferencesCandidateResidencies: asString(
      row.preferences_candidate_residencies,
    ),
    statusId: asString(row.status_id),
    status: asString(row.status_name) || "Assigned",
    createdAt: asDateString(row.created_at),
    updatedAt: asDateString(row.updated_at),
  };
}
