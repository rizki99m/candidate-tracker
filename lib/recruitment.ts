export type RoleStatus = "Active" | "Closed" | string;

export type CandidateStatus =
  | "HR Interview"
  | "User Interview"
  | "Offering"
  | "Hired"
  | "Rejected"
  | "On Hold"
  | "Withdraw"
  | "No Status"
  | string;

export type CandidateProgress =
  | ""
  | "Psychological Test"
  | "Agency Task"
  | "No Progress"
  | string;

export type HireRequestStatus = "Assigned" | "In Progress" | "Resolved" | string;

export type DateFilter = "today" | "month" | "year" | "custom" | "all";

export type LookupItem = {
  id: string;
  name: string;
  sortOrder?: number;
};

export type CandidateStatusLookup = LookupItem & {
  colorHex?: string;
  isTerminal?: boolean;
};

export type CandidateProgressLookup = LookupItem & {
  isActive?: boolean;
};

export type RoleLookup = LookupItem & {
  department: string;
  level: string;
};

export type Lookups = {
  roleStatuses: LookupItem[];
  candidateStatuses: CandidateStatusLookup[];
  candidateProgresses: CandidateProgressLookup[];
  hireRequestStatuses: LookupItem[];
  roles: RoleLookup[];
};

export type Role = {
  id: string;
  name: string;
  department: string;
  level: string;
  statusId: string;
  status: RoleStatus;
  notes: string;
  createdAt: string;
  updatedAt?: string;
};

export type Candidate = {
  id: string;
  roleId: string;
  roleName: string;
  statusId: string;
  statusName: string;
  statusColorHex: string;
  progressId: string;
  progressName: string;
  position: string;
  level: string;
  nameOfCandidate: string;
  email: string;
  phoneNumber: string;
  department: string;
  source: string;
  poolDate: string;
  workExperienceYears: string;
  education: string;
  university: string;
  major: string;
  location: string;
  rating: string;
  linkedInProfile: string;
  summaryInterviewHr: string;
  cvLink: string;
  portfolioLink: string;
  psychologicalTest: string;
  feedbackFromUser: string;
  status: CandidateStatus;
  progress: CandidateProgress;
  interviewDate: string;
  hrInterviewDate: string;
  userInterviewDate: string;
  createdAt: string;
  updatedAt?: string;
};

export type HireRequest = {
  id: string;
  requestedBy: string;
  reasonForHiring: string;
  positionTitle: string;
  departmentDivision: string;
  employmentType: string;
  teamMembersNeeded: string;
  expectedJoinDate: string;
  descriptionScopeOfWork: string;
  experienceRequirementsSkills: string;
  additionalNiceToHaveSkills: string;
  workingExperience: string;
  educationRequired: string;
  majoringPreferences: string;
  ageRange: string;
  preferencesGender: string;
  preferencesCandidateResidencies: string;
  statusId: string;
  status: HireRequestStatus;
  createdAt: string;
  updatedAt?: string;
};

export const candidateStatuses: CandidateStatus[] = [
  "HR Interview",
  "User Interview",
  "Offering",
  "Hired",
  "Rejected",
  "On Hold",
  "Withdraw",
];

export const candidateProgresses: CandidateProgress[] = [
  "",
  "Psychological Test",
  "Agency Task",
];

export const hireRequestStatuses: HireRequestStatus[] = [
  "Assigned",
  "In Progress",
  "Resolved",
];

export const roleStatuses: RoleStatus[] = ["Active", "Closed"];

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || "Request failed");
  }

  return payload as T;
}

export async function fetchRoles() {
  return apiFetch<Role[]>("/api/roles");
}

export async function fetchRole(id: string) {
  return apiFetch<Role>(`/api/roles/${id}`);
}

export async function createRole(data: Omit<Role, "id" | "createdAt" | "updatedAt">) {
  return apiFetch<Role>("/api/roles", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRole(
  id: string,
  data: Omit<Role, "id" | "createdAt" | "updatedAt">,
) {
  return apiFetch<Role>(`/api/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteRole(id: string) {
  return apiFetch<{ success: true }>(`/api/roles/${id}`, { method: "DELETE" });
}

export async function fetchCandidates() {
  return apiFetch<Candidate[]>("/api/candidates");
}

export async function fetchCandidate(id: string) {
  return apiFetch<Candidate>(`/api/candidates/${id}`);
}

export async function createCandidate(
  data: Omit<Candidate, "id" | "createdAt" | "updatedAt" | "roleName" | "statusName" | "statusColorHex" | "progressName">,
) {
  return apiFetch<Candidate>("/api/candidates", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCandidate(
  id: string,
  data: Omit<Candidate, "id" | "createdAt" | "updatedAt" | "roleName" | "statusName" | "statusColorHex" | "progressName">,
) {
  return apiFetch<Candidate>(`/api/candidates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCandidate(id: string) {
  return apiFetch<{ success: true }>(`/api/candidates/${id}`, {
    method: "DELETE",
  });
}

export async function fetchHireRequests() {
  return apiFetch<HireRequest[]>("/api/hire-requests");
}

export async function fetchHireRequest(id: string) {
  return apiFetch<HireRequest>(`/api/hire-requests/${id}`);
}

export async function createHireRequest(
  data: Omit<HireRequest, "id" | "createdAt" | "updatedAt">,
) {
  return apiFetch<HireRequest>("/api/hire-requests", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateHireRequest(
  id: string,
  data: Omit<HireRequest, "id" | "createdAt" | "updatedAt">,
) {
  return apiFetch<HireRequest>(`/api/hire-requests/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteHireRequest(id: string) {
  return apiFetch<{ success: true }>(`/api/hire-requests/${id}`, {
    method: "DELETE",
  });
}

export async function fetchLookups() {
  return apiFetch<Lookups>("/api/lookups");
}

export function getRoleName(roles: Role[] | RoleLookup[], roleId: string) {
  if (!roleId) return "Talent Pool";
  return roles.find((role) => role.id === roleId)?.name || "Deleted Role";
}

export function getCandidateMainDate(candidate: Candidate) {
  return (
    candidate.interviewDate ||
    candidate.hrInterviewDate ||
    candidate.userInterviewDate ||
    candidate.poolDate ||
    candidate.createdAt
  );
}

function isSameDay(date: Date, target: Date) {
  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
}

export function isDateInsideFilter(
  rawDate: string,
  filter: DateFilter,
  customStart: string,
  customEnd: string,
) {
  if (filter === "all") return true;
  if (!rawDate) return false;

  const date = new Date(`${rawDate}T00:00:00`);
  const now = new Date();

  if (filter === "today") return isSameDay(date, now);

  if (filter === "month") {
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  if (filter === "year") return date.getFullYear() === now.getFullYear();

  if (filter === "custom") {
    if (!customStart && !customEnd) return true;

    const start = customStart ? new Date(`${customStart}T00:00:00`) : null;
    const end = customEnd ? new Date(`${customEnd}T23:59:59`) : null;

    if (start && date < start) return false;
    if (end && date > end) return false;

    return true;
  }

  return true;
}

export function filterCandidates(
  candidates: Candidate[],
  params: {
    roleFilter: string;
    statusFilter: string;
    dateFilter: DateFilter;
    customStart: string;
    customEnd: string;
  },
) {
  return candidates.filter((candidate) => {
    const matchRole =
      params.roleFilter === "all"
        ? true
        : params.roleFilter === "talent-pool"
          ? !candidate.roleId
          : candidate.roleId === params.roleFilter;

    const matchStatus =
      params.statusFilter === "all"
        ? true
        : candidate.statusId === params.statusFilter ||
          candidate.status === params.statusFilter;

    const matchDate = isDateInsideFilter(
      getCandidateMainDate(candidate),
      params.dateFilter,
      params.customStart,
      params.customEnd,
    );

    return matchRole && matchStatus && matchDate;
  });
}

export function statusClass(status: CandidateStatus) {
  const tones: Record<string, string> = {
    "HR Interview": "bg-blue-100 text-blue-700 border-blue-200",
    "User Interview": "bg-cyan-100 text-cyan-700 border-cyan-200",
    Offering: "bg-orange-100 text-orange-700 border-orange-200",
    Hired: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-100 text-rose-700 border-rose-200",
    "On Hold": "bg-slate-100 text-slate-700 border-slate-200",
    Withdraw: "bg-zinc-100 text-zinc-700 border-zinc-200",
    "No Status": "bg-slate-100 text-slate-700 border-slate-200",
  };

  return tones[status] || "bg-slate-100 text-slate-700 border-slate-200";
}

export function statusColor(status: CandidateStatus) {
  const colors: Record<string, string> = {
    "HR Interview": "#2563eb",
    "User Interview": "#0891b2",
    Offering: "#ea580c",
    Hired: "#059669",
    Rejected: "#e11d48",
    "On Hold": "#64748b",
    Withdraw: "#71717a",
    "No Status": "#94a3b8",
  };

  return colors[status] || "#94a3b8";
}

export function hireRequestStatusClass(status: HireRequestStatus) {
  const tones: Record<string, string> = {
    Assigned: "bg-blue-100 text-blue-700 border-blue-200",
    "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
    Resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return tones[status] || "bg-slate-100 text-slate-700 border-slate-200";
}
