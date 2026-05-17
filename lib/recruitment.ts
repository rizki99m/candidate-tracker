export type RoleStatus = "Active" | "Closed";

export type CandidateStatus =
  | "HR Interview"
  | "Psychological Test"
  | "User Interview"
  | "Agency Task"
  | "Offering"
  | "Hired"
  | "Rejected"
  | "On Hold"
  | "Withdraw";

export type DateFilter = "today" | "month" | "year" | "custom" | "all";

export type Role = {
  id: string;
  name: string;
  department: string;
  level: string;
  status: RoleStatus;
  notes: string;
  createdAt: string;
};

export type Candidate = {
  id: string;
  roleId: string;
  position: string;
  level: string;
  nameOfCandidate: string;
  linkedInProfile: string;
  summaryInterviewHr: string;
  cvLink: string;
  portfolioLink: string;
  psychologicalTest: string;
  feedbackFromUser: string;
  remarks: string;
  status: CandidateStatus;
  interviewDate: string;
  hrInterviewDate: string;
  userInterviewDate: string;
  createdAt: string;
};

export const candidateStatuses: CandidateStatus[] = [
  "HR Interview",
  "Psychological Test",
  "User Interview",
  "Agency Task",
  "Offering",
  "Hired",
  "Rejected",
  "On Hold",
  "Withdraw",
];

export const roleStatuses: RoleStatus[] = ["Active", "Closed"];

const ROLE_KEY = "recruitment_roles";
const CANDIDATE_KEY = "recruitment_candidates";

export const seedRoles: Role[] = [
  {
    id: "role-busdev",
    name: "Business Development",
    department: "Sales",
    level: "Staff",
    status: "Active",
    notes: "Role untuk kandidat Busdev.",
    createdAt: "2026-05-01",
  },
  {
    id: "role-intern-ae",
    name: "Intern Account Executive",
    department: "Account",
    level: "Intern",
    status: "Active",
    notes: "Role untuk kandidat intern AE.",
    createdAt: "2026-05-01",
  },
  {
    id: "role-account-executive",
    name: "Account Executive",
    department: "Account",
    level: "Staff",
    status: "Active",
    notes: "Role untuk kandidat Account Executive.",
    createdAt: "2026-05-01",
  },
  {
    id: "role-art-director",
    name: "Art Director",
    department: "Creative",
    level: "Senior",
    status: "Active",
    notes: "Role untuk kandidat Art Director.",
    createdAt: "2026-05-01",
  },
];

export const seedCandidates: Candidate[] = [
  {
    id: "candidate-1",
    roleId: "role-intern-ae",
    position: "Intern Account Executive",
    level: "Intern",
    nameOfCandidate: "Diego Bayu Bagaskara",
    linkedInProfile: "LinkedIn Profile",
    summaryInterviewHr:
      "+ Pernah handle kerja sama brand. + Komunikasi cukup oke. - Masih perlu adaptasi ke agency.",
    cvLink: "DIEGO BAYU BAGASKARA_CV.pdf",
    portfolioLink: "",
    psychologicalTest: "Diego_BusDev_SkillTest.pdf",
    feedbackFromUser:
      "Komunikasi masih kurang clear, belum cukup familiar dengan TikTok.",
    remarks: "REJECT",
    status: "Rejected",
    interviewDate: "2026-05-17",
    hrInterviewDate: "2026-05-17",
    userInterviewDate: "",
    createdAt: "2026-05-17",
  },
  {
    id: "candidate-2",
    roleId: "role-intern-ae",
    position: "Intern Account Executive",
    level: "Intern",
    nameOfCandidate: "Afryan Mahendra",
    linkedInProfile: "LinkedIn Profile",
    summaryInterviewHr:
      "+ Pengalaman handle B2B. + Komunikasi bagus. + Familiar dengan social media dan Meta Ads.",
    cvLink: "CV-Afryan Mahendra-BD.pdf",
    portfolioLink: "",
    psychologicalTest: "Afryan Mahendra_Busdev_SkillTest.pdf",
    feedbackFromUser: "",
    remarks: "Need user review",
    status: "User Interview",
    interviewDate: "2026-05-18",
    hrInterviewDate: "2026-05-18",
    userInterviewDate: "2026-05-20",
    createdAt: "2026-05-18",
  },
  {
    id: "candidate-3",
    roleId: "role-art-director",
    position: "Art Director",
    level: "Senior",
    nameOfCandidate: "Alya Algrista",
    linkedInProfile: "LinkedIn Profile",
    summaryInterviewHr:
      "Portfolio cukup kuat, pengalaman creative direction oke, perlu dicek style fit dengan DOKI.",
    cvLink: "Alya_CV.pdf",
    portfolioLink: "Portfolio Link",
    psychologicalTest: "",
    feedbackFromUser: "Masuk agency task.",
    remarks: "Agency task sent",
    status: "Agency Task",
    interviewDate: "2026-05-19",
    hrInterviewDate: "2026-05-19",
    userInterviewDate: "",
    createdAt: "2026-05-19",
  },
  {
    id: "candidate-4",
    roleId: "role-busdev",
    position: "Business Development",
    level: "Staff",
    nameOfCandidate: "Nadila Marsya Andhika",
    linkedInProfile: "LinkedIn Profile",
    summaryInterviewHr:
      "Aktif organisasi, pernah handle sponsorship dan media partner, administratif cukup kuat.",
    cvLink: "CV Nadila Marsya Andhika.pdf",
    portfolioLink: "",
    psychologicalTest: "",
    feedbackFromUser: "",
    remarks: "On hold karena availability.",
    status: "On Hold",
    interviewDate: "2026-05-21",
    hrInterviewDate: "2026-05-21",
    userInterviewDate: "",
    createdAt: "2026-05-21",
  },
  {
    id: "candidate-5",
    roleId: "role-account-executive",
    position: "Account Executive",
    level: "Staff",
    nameOfCandidate: "Sofia Shanty Sugiyono",
    linkedInProfile: "LinkedIn Profile",
    summaryInterviewHr:
      "Familiar dengan digital marketing, project management, dan data analysis.",
    cvLink: "Resume_Sofia Shanty Sugiyono.pdf",
    portfolioLink: "",
    psychologicalTest: "",
    feedbackFromUser: "Communication is strong.",
    remarks: "Proceed offering",
    status: "Offering",
    interviewDate: "2026-05-22",
    hrInterviewDate: "2026-05-22",
    userInterviewDate: "2026-05-24",
    createdAt: "2026-05-22",
  },
];

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function loadRoles(): Role[] {
  if (typeof window === "undefined") return seedRoles;

  const roles = safeParse<Role[]>(
    window.localStorage.getItem(ROLE_KEY),
    seedRoles
  );

  if (!window.localStorage.getItem(ROLE_KEY)) {
    saveRoles(seedRoles);
  }

  return roles;
}

export function saveRoles(roles: Role[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROLE_KEY, JSON.stringify(roles));
}

export function loadCandidates(): Candidate[] {
  if (typeof window === "undefined") return seedCandidates;

  const candidates = safeParse<Candidate[]>(
    window.localStorage.getItem(CANDIDATE_KEY),
    seedCandidates
  );

  if (!window.localStorage.getItem(CANDIDATE_KEY)) {
    saveCandidates(seedCandidates);
  }

  return candidates;
}

export function saveCandidates(candidates: Candidate[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CANDIDATE_KEY, JSON.stringify(candidates));
}

export function resetDemoData() {
  saveRoles(seedRoles);
  saveCandidates(seedCandidates);
}

export function getRoleName(roles: Role[], roleId: string) {
  return roles.find((role) => role.id === roleId)?.name || "Deleted Role";
}

export function getCandidateMainDate(candidate: Candidate) {
  return (
    candidate.interviewDate ||
    candidate.hrInterviewDate ||
    candidate.userInterviewDate ||
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
  customEnd: string
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

  if (filter === "year") {
    return date.getFullYear() === now.getFullYear();
  }

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
  }
) {
  return candidates.filter((candidate) => {
    const matchRole =
      params.roleFilter === "all" ? true : candidate.roleId === params.roleFilter;

    const matchStatus =
      params.statusFilter === "all"
        ? true
        : candidate.status === params.statusFilter;

    const matchDate = isDateInsideFilter(
      getCandidateMainDate(candidate),
      params.dateFilter,
      params.customStart,
      params.customEnd
    );

    return matchRole && matchStatus && matchDate;
  });
}

export function statusClass(status: CandidateStatus) {
  const tones: Record<CandidateStatus, string> = {
    "HR Interview": "bg-blue-100 text-blue-700 border-blue-200",
    "Psychological Test": "bg-violet-100 text-violet-700 border-violet-200",
    "User Interview": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "Agency Task": "bg-amber-100 text-amber-700 border-amber-200",
    Offering: "bg-orange-100 text-orange-700 border-orange-200",
    Hired: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-100 text-rose-700 border-rose-200",
    "On Hold": "bg-slate-100 text-slate-700 border-slate-200",
    Withdraw: "bg-zinc-100 text-zinc-700 border-zinc-200",
  };

  return tones[status];
}

export function statusColor(status: CandidateStatus) {
  const colors: Record<CandidateStatus, string> = {
    "HR Interview": "#2563eb",
    "Psychological Test": "#7c3aed",
    "User Interview": "#0891b2",
    "Agency Task": "#d97706",
    Offering: "#ea580c",
    Hired: "#059669",
    Rejected: "#e11d48",
    "On Hold": "#64748b",
    Withdraw: "#71717a",
  };

  return colors[status];
}