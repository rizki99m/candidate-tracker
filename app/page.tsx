"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { InteractiveValue } from "@/components/InteractiveValue";
import {
  PageSize,
  PaginationControls,
} from "@/components/PaginationControls";
import {
  Candidate,
  CandidateStatusLookup,
  DateFilter,
  Role,
  fetchCandidates,
  fetchLookups,
  fetchRoles,
  filterCandidates,
  getRoleName,
  statusClass,
  statusColor,
} from "@/lib/recruitment";
import { SessionUser, canAddCandidate, canSeeSalary } from "@/lib/permissions";
import { LoadingIndicator } from "@/components/LoadingIndicator";

type SearchColumn =
  | "name"
  | "role"
  | "status"
  | "position"
  | "email"
  | "phone"
  | "cv";
type DashboardData = {
  totals: {
    totalCandidates: number;
    totalTalentPool: number;
    totalHired: number;
    totalRejected: number;
    totalInProcess: number;
  };
  byStatus: { statusName: string; candidateCount: number }[];
  byRole: { roleName: string; candidateCount: number }[];
};

export default function DashboardPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [candidateStatusesLookup, setCandidateStatusesLookup] = useState<
    CandidateStatusLookup[]
  >([]);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(
    null,
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchColumn, setSearchColumn] = useState<SearchColumn>("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [latestPage, setLatestPage] = useState(1);
  const [latestPageSize, setLatestPageSize] = useState<PageSize>(10);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [rolesData, candidatesData, lookups, dashboardResponse] =
          await Promise.all([
            fetchRoles(),
            fetchCandidates(),
            fetchLookups(),
            fetch("/api/dashboard").then((response) => {
              if (!response.ok) throw new Error("Gagal memuat dashboard.");
              return response.json() as Promise<DashboardData>;
            }),
          ]);
        setRoles(rolesData);
        setCandidates(candidatesData);
        setCandidateStatusesLookup(lookups.candidateStatuses);
        setDashboard(dashboardResponse);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setUser(payload?.user || null))
      .catch(() => setUser(null));
  }, []);

  const filteredCandidates = useMemo(() => {
    return filterCandidates(candidates, {
      roleFilter,
      statusFilter,
      dateFilter,
      customStart,
      customEnd,
    }).filter((candidate) =>
      matchesDashboardSearch(candidate, roles, searchColumn, searchQuery),
    );
  }, [
    candidates,
    roles,
    roleFilter,
    statusFilter,
    dateFilter,
    customStart,
    customEnd,
    searchColumn,
    searchQuery,
  ]);

  const statusDistributionCandidates = useMemo(() => {
    return filterCandidates(candidates, {
      roleFilter,
      statusFilter: "all",
      dateFilter,
      customStart,
      customEnd,
    }).filter((candidate) =>
      matchesDashboardSearch(candidate, roles, searchColumn, searchQuery),
    );
  }, [
    candidates,
    roles,
    roleFilter,
    dateFilter,
    customStart,
    customEnd,
    searchColumn,
    searchQuery,
  ]);

  const totalCandidates = dashboard?.totals.totalCandidates ?? filteredCandidates.length;
  const totalTalentPool =
    dashboard?.totals.totalTalentPool ??
    filteredCandidates.filter((candidate) => !candidate.roleId).length;
  const totalInProcess = dashboard?.totals.totalInProcess ?? filteredCandidates.filter(
    (candidate) =>
      !["Hired", "Rejected", "Withdraw"].includes(candidate.status),
  ).length;
  const totalHired = dashboard?.totals.totalHired ?? filteredCandidates.filter(
    (candidate) => candidate.status === "Hired",
  ).length;
  const totalRejected = dashboard?.totals.totalRejected ?? filteredCandidates.filter(
    (candidate) => candidate.status === "Rejected",
  ).length;
  const statusSummary = dashboard?.byStatus.length
    ? dashboard.byStatus.map((item) => ({
        status: item.statusName,
        count: item.candidateCount,
      }))
    : candidateStatusesLookup.map((status) => ({
        status: status.name,
        count: statusDistributionCandidates.filter(
          (candidate) =>
            candidate.statusId === status.id || candidate.status === status.name,
        ).length,
      }));

  const roleSummary = dashboard?.byRole.length
    ? dashboard.byRole.map((item) => ({
        label: item.roleName,
        count: item.candidateCount,
      }))
    : [
        {
          label: "Talent Pool",
          count: filteredCandidates.filter((candidate) => !candidate.roleId).length,
        },
        ...roles.map((role) => ({
          label: role.name,
          count: filteredCandidates.filter(
            (candidate) => candidate.roleId === role.id,
          ).length,
        })),
      ];

  const showSalary = canSeeSalary(user?.role);

  const currentLatestPage = Math.min(
    latestPage,
    Math.max(1, Math.ceil(filteredCandidates.length / latestPageSize)),
  );
  const paginatedLatestCandidates = filteredCandidates.slice(
    (currentLatestPage - 1) * latestPageSize,
    currentLatestPage * latestPageSize,
  );

  useEffect(() => {
    queueMicrotask(() => setLatestPage(1));
  }, [
    dateFilter,
    roleFilter,
    statusFilter,
    customStart,
    customEnd,
    searchColumn,
    searchQuery,
    latestPageSize,
  ]);

  function clearFilters() {
    setDateFilter("all");
    setRoleFilter("all");
    setStatusFilter("all");
    setCustomStart("");
    setCustomEnd("");
    setSearchQuery("");
    setSearchColumn("name");
  }

  function toggleStatusFilter(status: Candidate["status"]) {
    if (statusFilter === status) {
      clearFilters();
      return;
    }

    setStatusFilter(status);
  }

  return (
    <section className="space-y-6">
      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}
      {loading && (
        <div className="card text-sm font-semibold text-slate-500">
          <LoadingIndicator label="Loading dashboard from database..." />
        </div>
      )}

      <div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setSearchOpen((s) => !s)}
            aria-label="Open filters"
            className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            {/* Filter icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
              />
            </svg>
          </button>
        </div>

        {searchOpen && (
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Search by
                </span>
                <select
                  value={searchColumn}
                  onChange={(e) =>
                    setSearchColumn(e.target.value as SearchColumn)
                  }
                  className="input"
                >
                  <option value="name">Candidate Name</option>
                  <option value="role">Role</option>
                  <option value="status">Status</option>
                  <option value="position">Position</option>
                  <option value="email">Email</option>
                  <option value="phone">No. HP</option>
                  <option value="cv">CV</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">
                  Search text
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter search text..."
                  className="input border-slate-300 bg-slate-100"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-4">
              <Field label="Date Range">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                  className="input"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </Field>

              <Field label="Role">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Roles</option>
                  <option value="talent-pool">Talent Pool</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Status">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Status</option>
                  {candidateStatusesLookup.map((status) => (
                    <option key={status.id} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Custom Start">
                  <input
                    type="date"
                    value={customStart}
                    disabled={dateFilter !== "custom"}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Custom End">
                  <input
                    type="date"
                    value={customEnd}
                    disabled={dateFilter !== "custom"}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="input"
                  />
                </Field>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={clearFilters} className="secondary-button">
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Candidates" value={totalCandidates} />
        <MetricCard label="Talent Pool" value={totalTalentPool} />
        <MetricCard label="In Process" value={totalInProcess} />
        <MetricCard label="Hired" value={totalHired} />
        <MetricCard label="Rejected" value={totalRejected} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="card">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black">Status Distribution</h3>
              <p className="text-sm text-slate-500">
                Pie chart status kandidat
              </p>
            </div>
          </div>

          <DonutChart
            data={statusSummary}
            activeStatus={
              candidateStatusesLookup.some(
                (status) =>
                  status.id === statusFilter || status.name === statusFilter,
              )
                ? (candidateStatusesLookup.find(
                    (status) =>
                      status.id === statusFilter || status.name === statusFilter,
                  )?.name as Candidate["status"])
                : null
            }
            onStatusClick={toggleStatusFilter}
          />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {statusSummary.map((item) => (
              <button
                key={item.status}
                type="button"
                onClick={() => toggleStatusFilter(item.status)}
              className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-left transition ${
                  statusFilter === item.status
                    ? "border-slate-950 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] ring-2 ring-slate-950"
                    : statusFilter !== "all"
                      ? "border-slate-200 bg-slate-100 text-slate-400"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: statusColor(item.status) }}
                />
                <span className="text-sm font-semibold">
                  {item.status}
                </span>
                <span className="ml-auto text-sm font-black">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card flex h-[28rem] flex-col">
          <div className="mb-5 shrink-0">
            <h3 className="text-xl font-black">Candidates by Role</h3>
            <p className="text-sm text-slate-500">Bar chart berdasarkan role</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-2">
            <BarChart
              data={roleSummary.map((item) => ({
                label: item.label,
                value: item.count,
              }))}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black">Latest Candidates</h3>
            <p className="text-sm text-slate-500">
              Kandidat terbaru sesuai filter dashboard
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {canAddCandidate(user?.role) && (
              <Link href="/candidates/new" className="primary-button">
                Add Candidate
              </Link>
            )}
          </div>
        </div>

        <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
          <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">No. HP</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Posisi yang Dilamar</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">CV</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paginatedLatestCandidates.map((candidate) => (
                <tr key={candidate.id}>
                  <td className="px-4 py-4">
                    <p className="font-black">
                      <InteractiveValue value={candidate.nameOfCandidate} />
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <InteractiveValue value={candidate.email} />
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <InteractiveValue value={candidate.phoneNumber} />
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <InteractiveValue
                      value={getRoleName(roles, candidate.roleId)}
                    />
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <InteractiveValue value={candidate.position} />
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClass(
                        candidate.status,
                      )}`}
                    >
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <InteractiveValue value={candidate.cvLink} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setDetailCandidate(candidate)}
                        className="secondary-button px-3 py-2 text-xs"
                      >
                        Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {paginatedLatestCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <p className="font-black">
                <InteractiveValue value={candidate.nameOfCandidate} />
              </p>
              <p className="mt-1 text-sm text-slate-500">
                <InteractiveValue value={candidate.position} /> /{" "}
                <InteractiveValue value={getRoleName(roles, candidate.roleId)} />
              </p>
              <p className="mt-2 text-sm text-slate-600">
                <InteractiveValue value={candidate.email} /> /{" "}
                <InteractiveValue value={candidate.phoneNumber} />
              </p>
              <span
                className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClass(
                  candidate.status,
                )}`}
              >
                {candidate.status}
              </span>
              <p className="mt-3 text-sm text-slate-600">
                CV: <InteractiveValue value={candidate.cvLink} />
              </p>
              <button
                type="button"
                onClick={() => setDetailCandidate(candidate)}
                className="secondary-button mt-4 w-full text-sm"
              >
                Detail
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <PaginationControls
            page={currentLatestPage}
            pageSize={latestPageSize}
            totalItems={filteredCandidates.length}
            onPageChange={setLatestPage}
            onPageSizeChange={setLatestPageSize}
          />
        </div>
      </div>

      <CandidateDetailDialog
        candidate={detailCandidate}
        roles={roles}
        showSalary={showSalary}
        onClose={() => setDetailCandidate(null)}
      />
    </section>
  );
}

function matchesDashboardSearch(
  candidate: Candidate,
  roles: Role[],
  searchColumn: SearchColumn,
  searchQuery: string,
) {
  if (!searchQuery.trim()) return true;

  const raw = searchQuery.trim().toLowerCase();
  if (searchColumn === "name") {
    return candidate.nameOfCandidate.toLowerCase().includes(raw);
  }

  if (searchColumn === "role") {
    return getRoleName(roles, candidate.roleId).toLowerCase().includes(raw);
  }

  if (searchColumn === "status") {
    return candidate.status.toLowerCase().includes(raw);
  }

  if (searchColumn === "email") {
    return candidate.email.toLowerCase().includes(raw);
  }

  if (searchColumn === "phone") {
    return candidate.phoneNumber.toLowerCase().includes(raw);
  }

  if (searchColumn === "cv") {
    return candidate.cvLink.toLowerCase().includes(raw);
  }

  return candidate.position.toLowerCase().includes(raw);
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-4 text-4xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function CandidateDetailDialog({
  candidate,
  roles,
  showSalary,
  onClose,
}: {
  candidate: Candidate | null;
  roles: Role[];
  showSalary: boolean;
  onClose: () => void;
}) {
  if (!candidate) return null;

  const rows: { label: string; value: string }[] = [
    { label: "ID", value: candidate.id },
    { label: "Role", value: getRoleName(roles, candidate.roleId) },
    { label: "Position", value: candidate.position },
    { label: "Level", value: candidate.level },
    { label: "Name Of Candidate", value: candidate.nameOfCandidate },
    { label: "Email", value: candidate.email },
    { label: "No. HP", value: candidate.phoneNumber },
    { label: "Department", value: candidate.department },
    { label: "Source", value: candidate.source },
    { label: "Pool Date", value: candidate.poolDate },
    { label: "Pendidikan", value: candidate.education },
    { label: "Universitas", value: candidate.university },
    { label: "Jurusan", value: candidate.major },
    { label: "IPK / GPA", value: candidate.gpa },
    { label: "Lokasi", value: candidate.location },
    ...(showSalary
      ? [
          { label: "Current Salary", value: candidate.currentSalary },
          { label: "Expected Salary", value: candidate.expectedSalary },
        ]
      : []),
    { label: "LinkedIn Profile", value: candidate.linkedInProfile },
    { label: "Summary Interview HR", value: candidate.summaryInterviewHr },
    { label: "CV", value: candidate.cvLink },
    { label: "Portfolio", value: candidate.portfolioLink },
    { label: "Psychological Test", value: candidate.psychologicalTest },
    { label: "Feedback From User", value: candidate.feedbackFromUser },
    { label: "Status", value: candidate.status },
    { label: "HR Interview Date", value: candidate.hrInterviewDate },
    { label: "User Interview Date", value: candidate.userInterviewDate },
    { label: "Created At", value: candidate.createdAt },
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-950">
              Candidate Detail
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {candidate.nameOfCandidate}
            </p>
          </div>
          <button type="button" onClick={onClose} className="secondary-button">
            Close
          </button>
        </div>

        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-2 p-4 text-sm md:grid-cols-[220px_1fr]"
            >
              <p className="font-black text-slate-700">{row.label}</p>
              <p className="whitespace-pre-wrap break-words text-slate-600">
                <InteractiveValue value={row.value} truncate={false} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DonutChart({
  data,
  activeStatus,
  onStatusClick,
}: {
  data: { status: Candidate["status"]; count: number }[];
  activeStatus: Candidate["status"] | null;
  onStatusClick: (status: Candidate["status"]) => void;
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="grid h-64 place-items-center rounded-3xl bg-slate-100 text-sm font-bold text-slate-500">
        No data
      </div>
    );
  }

  const segments = data
    .filter((item) => item.count > 0)
    .reduce<
      (typeof data[number] & {
        endAngle: number;
        path: string;
        activePath: string;
      })[]
    >((items, item) => {
      const currentAngle =
        items.length === 0
          ? -90
          : items[items.length - 1].endAngle;
      const angle = (item.count / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + Math.min(angle, 359.99);

      return [
        ...items,
        {
          ...item,
          endAngle,
          path: describeDonutArc(128, 128, 112, 62, startAngle, endAngle),
          activePath: describeDonutArc(
            128,
            128,
            118,
            56,
            startAngle,
            endAngle,
          ),
        },
      ];
    }, []);

  return (
    <div className="flex justify-center">
      <div className="relative h-64 w-64">
        <svg viewBox="0 0 256 256" className="h-full w-full">
          {segments.map((segment) => {
            const isActive = activeStatus === segment.status;
            const isDimmed = !!activeStatus && !isActive;

            return (
              <path
                key={segment.status}
                d={isActive ? segment.activePath : segment.path}
                fill={isDimmed ? "#d1d5db" : statusColor(segment.status)}
                opacity={isDimmed ? 0.55 : 1}
                stroke={isActive ? "#0f172a" : "#ffffff"}
                strokeWidth={isActive ? "4" : "3"}
                role="button"
                tabIndex={0}
                className="cursor-pointer transition hover:opacity-80"
                onClick={() => onStatusClick(segment.status)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onStatusClick(segment.status);
                  }
                }}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="grid h-36 w-36 place-items-center rounded-full bg-white shadow-inner">
            <div className="text-center">
              <p className="text-4xl font-black">{total}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Candidates
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function describeDonutArc(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const endOuter = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const startInner = polarToCartesian(centerX, centerY, innerRadius, startAngle);
  const endInner = polarToCartesian(centerX, centerY, innerRadius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    startOuter.x,
    startOuter.y,
    "A",
    outerRadius,
    outerRadius,
    0,
    largeArcFlag,
    0,
    endOuter.x,
    endOuter.y,
    "L",
    startInner.x,
    startInner.y,
    "A",
    innerRadius,
    innerRadius,
    0,
    largeArcFlag,
    1,
    endInner.x,
    endInner.y,
    "Z",
  ].join(" ");
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-5">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 break-words font-semibold text-slate-700">
              {item.label}
            </span>
            <span className="font-black text-slate-950">{item.value}</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-950"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
