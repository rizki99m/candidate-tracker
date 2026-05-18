export type RoleStatus = "Active" | "Closed";

export type CandidateStatus =
  | "HR Interview"
  | "User Interview"
  | "Offering"
  | "Hired"
  | "Rejected"
  | "On Hold"
  | "Withdraw";

export type CandidateProgress = "" | "Psychological Test" | "Agency Task";

export type HireRequestStatus = "Assigned" | "In Progress" | "Resolved";

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
  remarks: string;
  status: CandidateStatus;
  progress: CandidateProgress;
  interviewDate: string;
  hrInterviewDate: string;
  userInterviewDate: string;
  createdAt: string;
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
  status: HireRequestStatus;
  createdAt: string;
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

const ROLE_KEY = "recruitment_roles";
const CANDIDATE_KEY = "recruitment_candidates";
const HIRE_REQUEST_KEY = "recruitment_hire_requests";

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
    email: "diego.bayu@example.com",
    phoneNumber: "0812719979830",
    department: "Account",
    source: "Referral",
    poolDate: "2026-05-17",
    workExperienceYears: "1",
    education: "S1",
    university: "Universitas Padjadjaran",
    major: "Marketing Communication",
    location: "Bandung",
    rating: "3",
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
    progress: "",
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
    email: "afryan.mahendra@example.com",
    phoneNumber: "081937326667",
    department: "Account",
    source: "Form Applicant",
    poolDate: "2026-05-18",
    workExperienceYears: "2",
    education: "S1",
    university: "Universitas Indonesia",
    major: "Business Administration",
    location: "Jakarta",
    rating: "4",
    linkedInProfile: "LinkedIn Profile",
    summaryInterviewHr:
      "+ Pengalaman handle B2B. + Komunikasi bagus. + Familiar dengan social media dan Meta Ads.",
    cvLink: "CV-Afryan Mahendra-BD.pdf",
    portfolioLink: "",
    psychologicalTest: "Afryan Mahendra_Busdev_SkillTest.pdf",
    feedbackFromUser: "",
    remarks: "Need user review",
    status: "User Interview",
    progress: "Psychological Test",
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
    email: "alya.algrista@example.com",
    phoneNumber: "088223410762",
    department: "Creative",
    source: "Talent Pool",
    poolDate: "2026-05-19",
    workExperienceYears: "4",
    education: "S1",
    university: "Universitas Telkom Bandung",
    major: "Desain Komunikasi Visual",
    location: "Garut, Jawa Barat",
    rating: "4",
    linkedInProfile: "LinkedIn Profile",
    summaryInterviewHr:
      "Portfolio cukup kuat, pengalaman creative direction oke, perlu dicek style fit dengan DOKI.",
    cvLink: "Alya_CV.pdf",
    portfolioLink: "Portfolio Link",
    psychologicalTest: "",
    feedbackFromUser: "Masuk agency task.",
    remarks: "Agency task sent",
    status: "User Interview",
    progress: "Agency Task",
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
    email: "nadila.marsya@example.com",
    phoneNumber: "081314110769",
    department: "Sales",
    source: "LinkedIn",
    poolDate: "2026-05-21",
    workExperienceYears: "2",
    education: "S1",
    university: "Universitas Brawijaya",
    major: "Communication",
    location: "Jakarta",
    rating: "3",
    linkedInProfile: "LinkedIn Profile",
    summaryInterviewHr:
      "Aktif organisasi, pernah handle sponsorship dan media partner, administratif cukup kuat.",
    cvLink: "CV Nadila Marsya Andhika.pdf",
    portfolioLink: "",
    psychologicalTest: "",
    feedbackFromUser: "",
    remarks: "On hold karena availability.",
    status: "On Hold",
    progress: "",
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
    email: "sofia.shanty@example.com",
    phoneNumber: "081225684812",
    department: "Account",
    source: "Job Portal",
    poolDate: "2026-05-22",
    workExperienceYears: "3",
    education: "S1",
    university: "Universitas Pertamina",
    major: "Komunikasi",
    location: "Jakarta",
    rating: "5",
    linkedInProfile: "LinkedIn Profile",
    summaryInterviewHr:
      "Familiar dengan digital marketing, project management, dan data analysis.",
    cvLink: "Resume_Sofia Shanty Sugiyono.pdf",
    portfolioLink: "",
    psychologicalTest: "",
    feedbackFromUser: "Communication is strong.",
    remarks: "Proceed offering",
    status: "Offering",
    progress: "",
    interviewDate: "2026-05-22",
    hrInterviewDate: "2026-05-22",
    userInterviewDate: "2026-05-24",
    createdAt: "2026-05-22",
  },
  {
    id: "candidate-6",
    roleId: "",
    position: "Business Development",
    level: "",
    nameOfCandidate: "Hanny Aulia Arfiana",
    email: "hn.arfiana@gmail.com",
    phoneNumber: "081382299972",
    department: "Engineering",
    source: "Form Applicant",
    poolDate: "2026-04-12",
    workExperienceYears: "",
    education: "",
    university: "",
    major: "",
    location: "",
    rating: "",
    linkedInProfile: "https://linkedin.com/in/hannyaulia",
    summaryInterviewHr: "",
    cvLink: "https://drive.google.com/example-hanny-cv",
    portfolioLink: "",
    psychologicalTest: "",
    feedbackFromUser: "",
    remarks: "Talent pool kandidat potensial untuk Busdev.",
    status: "HR Interview",
    progress: "",
    interviewDate: "",
    hrInterviewDate: "",
    userInterviewDate: "",
    createdAt: "2026-04-12",
  },
  {
    id: "candidate-7",
    roleId: "",
    position: "Jr. Art Director",
    level: "Junior",
    nameOfCandidate: "Amalia Erza Syafitri",
    email: "e.amaliasyafitri@gmail.com",
    phoneNumber: "087754541403",
    department: "Creative",
    source: "Form Applicant",
    poolDate: "2026-04-12",
    workExperienceYears: "1",
    education: "S1",
    university: "Institut Kesenian Jakarta",
    major: "Desain Komunikasi Visual",
    location: "Tangerang",
    rating: "3",
    linkedInProfile: "",
    summaryInterviewHr: "",
    cvLink: "https://drive.google.com/example-amalia-cv",
    portfolioLink: "https://behance.net/example-amalia",
    psychologicalTest: "",
    feedbackFromUser: "",
    remarks: "Portfolio perlu direview creative lead.",
    status: "On Hold",
    progress: "",
    interviewDate: "",
    hrInterviewDate: "",
    userInterviewDate: "",
    createdAt: "2026-04-12",
  },
];

export const seedHireRequests: HireRequest[] = [
  {
    id: "hire-request-1",
    requestedBy: "Rizka Putri",
    reasonForHiring: "Replacement untuk Account Executive yang resign.",
    positionTitle: "Account Executive",
    departmentDivision: "Account",
    employmentType: "Full Time",
    teamMembersNeeded: "1",
    expectedJoinDate: "2026-06-10",
    descriptionScopeOfWork:
      "Handle client communication, campaign timeline, report coordination, dan follow up deliverables.",
    experienceRequirementsSkills:
      "Minimal 2 tahun di agency, kuat di komunikasi, project management, dan reporting.",
    additionalNiceToHaveSkills: "Familiar dengan TikTok campaign dan Meta Ads.",
    workingExperience: "2-4 tahun",
    educationRequired: "S1",
    majoringPreferences: "Communication, Marketing, Business",
    ageRange: "23-30",
    preferencesGender: "Any",
    preferencesCandidateResidencies: "Jakarta, Tangerang, Bekasi",
    status: "In Progress",
    createdAt: "2026-05-10",
  },
  {
    id: "hire-request-2",
    requestedBy: "Bima Prasetya",
    reasonForHiring: "Penambahan kapasitas creative team untuk pitch pipeline.",
    positionTitle: "Art Director",
    departmentDivision: "Creative",
    employmentType: "Full Time",
    teamMembersNeeded: "1",
    expectedJoinDate: "2026-06-24",
    descriptionScopeOfWork:
      "Develop visual direction, supervise design output, dan translate campaign idea ke key visual.",
    experienceRequirementsSkills:
      "Minimal 4 tahun di creative agency, portfolio campaign digital kuat, mampu present concept.",
    additionalNiceToHaveSkills: "Motion direction, photography, dan AI visual exploration.",
    workingExperience: "4-6 tahun",
    educationRequired: "S1",
    majoringPreferences: "DKV, Visual Communication, Multimedia",
    ageRange: "26-34",
    preferencesGender: "Any",
    preferencesCandidateResidencies: "Jabodetabek",
    status: "Assigned",
    createdAt: "2026-05-14",
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

  const candidates = safeParse<Partial<Candidate>[]>(
    window.localStorage.getItem(CANDIDATE_KEY),
    seedCandidates
  ).map(normalizeCandidate);

  if (!window.localStorage.getItem(CANDIDATE_KEY)) {
    saveCandidates(seedCandidates);
  } else {
    saveCandidates(candidates);
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
  saveHireRequests(seedHireRequests);
}

function normalizeCandidate(candidate: Partial<Candidate>): Candidate {
  const rawStatus = candidate.status as string | undefined;
  const statusIsProgress =
    rawStatus === "Psychological Test" || rawStatus === "Agency Task";
  const status = candidateStatuses.includes(rawStatus as CandidateStatus)
    ? (rawStatus as CandidateStatus)
    : "HR Interview";
  const progress = candidateProgresses.includes(
    candidate.progress as CandidateProgress,
  )
    ? (candidate.progress as CandidateProgress)
    : statusIsProgress
      ? (rawStatus as CandidateProgress)
      : "";

  return {
    id: candidate.id || createId("candidate"),
    roleId: candidate.roleId || "",
    position: candidate.position || "",
    level: candidate.level || "",
    nameOfCandidate: candidate.nameOfCandidate || "",
    email: candidate.email || "",
    phoneNumber: candidate.phoneNumber || "",
    department: candidate.department || "",
    source: candidate.source || "",
    poolDate: candidate.poolDate || candidate.createdAt || "",
    workExperienceYears: candidate.workExperienceYears || "",
    education: candidate.education || "",
    university: candidate.university || "",
    major: candidate.major || "",
    location: candidate.location || "",
    rating: candidate.rating || "",
    linkedInProfile: candidate.linkedInProfile || "",
    summaryInterviewHr: candidate.summaryInterviewHr || "",
    cvLink: candidate.cvLink || "",
    portfolioLink: candidate.portfolioLink || "",
    psychologicalTest: candidate.psychologicalTest || "",
    feedbackFromUser: candidate.feedbackFromUser || "",
    remarks: candidate.remarks || "",
    status,
    progress,
    interviewDate: candidate.interviewDate || "",
    hrInterviewDate: candidate.hrInterviewDate || "",
    userInterviewDate: candidate.userInterviewDate || "",
    createdAt: candidate.createdAt || todayString(),
  };
}

export function loadHireRequests(): HireRequest[] {
  if (typeof window === "undefined") return seedHireRequests;

  const hireRequests = safeParse<HireRequest[]>(
    window.localStorage.getItem(HIRE_REQUEST_KEY),
    seedHireRequests,
  );

  if (!window.localStorage.getItem(HIRE_REQUEST_KEY)) {
    saveHireRequests(seedHireRequests);
  }

  return hireRequests;
}

export function saveHireRequests(hireRequests: HireRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HIRE_REQUEST_KEY, JSON.stringify(hireRequests));
}

export function getRoleName(roles: Role[], roleId: string) {
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
      params.roleFilter === "all"
        ? true
        : params.roleFilter === "talent-pool"
          ? !candidate.roleId
          : candidate.roleId === params.roleFilter;

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
    "User Interview": "bg-cyan-100 text-cyan-700 border-cyan-200",
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
    "User Interview": "#0891b2",
    Offering: "#ea580c",
    Hired: "#059669",
    Rejected: "#e11d48",
    "On Hold": "#64748b",
    Withdraw: "#71717a",
  };

  return colors[status];
}

export function hireRequestStatusClass(status: HireRequestStatus) {
  const tones: Record<HireRequestStatus, string> = {
    Assigned: "bg-blue-100 text-blue-700 border-blue-200",
    "In Progress": "bg-amber-100 text-amber-700 border-amber-200",
    Resolved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return tones[status];
}
