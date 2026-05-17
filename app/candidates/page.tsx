"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Candidate,
  Role,
  candidateStatuses,
  filterCandidates,
  getRoleName,
  loadCandidates,
  loadRoles,
  saveCandidates,
  statusClass,
} from "@/lib/recruitment";

type SearchColumn =
  | "name"
  | "role"
  | "status"
  | "position"
  | "level"
  | "interviewDate"
  | "cvLink"
  | "portfolioLink"
  | "remarks";

const emptySearchFilters: Record<SearchColumn, string> = {
  name: "",
  role: "",
  status: "",
  position: "",
  level: "",
  interviewDate: "",
  cvLink: "",
  portfolioLink: "",
  remarks: "",
};

export default function CandidatesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(
    null,
  );

  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState(emptySearchFilters);

  useEffect(() => {
    setRoles(loadRoles());
    setCandidates(loadCandidates());
  }, []);

  const filteredCandidates = useMemo(() => {
    return filterCandidates(candidates, {
      roleFilter,
      statusFilter,
      dateFilter: "all",
      customStart: "",
      customEnd: "",
    }).filter((candidate) => {
      const raw = searchQuery.trim().toLowerCase();
      const values = [
        candidate.nameOfCandidate,
        getRoleName(roles, candidate.roleId),
        candidate.status,
        candidate.position,
        candidate.level,
        candidate.interviewDate,
        candidate.hrInterviewDate,
        candidate.userInterviewDate,
        candidate.cvLink,
        candidate.portfolioLink,
        candidate.remarks,
      ];
      const matchesGlobal =
        !raw || values.some((value) => value.toLowerCase().includes(raw));

      const matchesAdvanced = (
        Object.entries(searchFilters) as [SearchColumn, string][]
      ).every(([column, value]) => {
        const filter = value.trim().toLowerCase();
        if (!filter) return true;
        return candidateSearchValue(candidate, roles, column)
          .toLowerCase()
          .includes(filter);
      });

      return matchesGlobal && matchesAdvanced;
    });
  }, [candidates, roles, roleFilter, statusFilter, searchFilters, searchQuery]);

  function updateSearchFilter(column: SearchColumn, value: string) {
    setSearchFilters((current) => ({ ...current, [column]: value }));
  }

  function clearSearch() {
    setSearchQuery("");
    setSearchFilters(emptySearchFilters);
    setRoleFilter("all");
    setStatusFilter("all");
  }

  function deleteCandidate() {
    if (!selectedCandidate) return;

    const updated = candidates.filter(
      (candidate) => candidate.id !== selectedCandidate.id,
    );

    saveCandidates(updated);
    setCandidates(updated);
    setSelectedCandidate(null);
  }

  return (
    <section className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/candidates/new" className="primary-button">
            Add Candidate
          </Link>

          <div className="w-full max-w-md">
            <label className="block">
              <span className="sr-only">Search candidate name</span>
              <div className="flex items-center gap-2">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all candidate columns..."
                  className="input border-slate-300 bg-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen((s) => !s)}
                  className="shrink-0 rounded-2xl bg-slate-100 px-4 py-2 text-sm font-black transition hover:bg-slate-200"
                >
                  Advanced Search
                </button>
              </div>
            </label>
          </div>
        </div>

        {searchOpen && (
          <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Candidate Name">
                <input
                  value={searchFilters.name}
                  onChange={(e) => updateSearchFilter("name", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Position">
                <input
                  value={searchFilters.position}
                  onChange={(e) =>
                    updateSearchFilter("position", e.target.value)
                  }
                  className="input"
                />
              </Field>
              <Field label="Level">
                <input
                  value={searchFilters.level}
                  onChange={(e) => updateSearchFilter("level", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Interview Date">
                <input
                  value={searchFilters.interviewDate}
                  onChange={(e) =>
                    updateSearchFilter("interviewDate", e.target.value)
                  }
                  className="input"
                />
              </Field>
              <Field label="CV">
                <input
                  value={searchFilters.cvLink}
                  onChange={(e) => updateSearchFilter("cvLink", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Portfolio">
                <input
                  value={searchFilters.portfolioLink}
                  onChange={(e) =>
                    updateSearchFilter("portfolioLink", e.target.value)
                  }
                  className="input"
                />
              </Field>
              <Field label="Remarks">
                <input
                  value={searchFilters.remarks}
                  onChange={(e) => updateSearchFilter("remarks", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Role">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input"
                >
                  <option value="all">All Roles</option>
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
                  {candidateStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={clearSearch}
                className="secondary-button"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="hidden max-w-full overflow-x-auto rounded-[2rem] border border-white bg-white shadow-sm lg:block">
        <table className="w-full min-w-[2400px] border-collapse text-left text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Candidate Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">LinkedIn Profile</th>
              <th className="px-4 py-3">Summary Interview HR</th>
              <th className="px-4 py-3">CV</th>
              <th className="px-4 py-3">Portfolio</th>
              <th className="px-4 py-3">Psychological Test</th>
              <th className="px-4 py-3">Feedback From User</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Interview Date</th>
              <th className="px-4 py-3">HR Interview Date</th>
              <th className="px-4 py-3">User Interview Date</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCandidates.map((candidate, index) => (
              <tr key={candidate.id} className="align-top">
                <td className="max-w-[180px] px-4 py-4 text-xs text-slate-500">
                  {index + 1}
                </td>
                <td className="px-4 py-4">
                  <p className="font-black">{candidate.nameOfCandidate}</p>
                  <p className="text-xs text-slate-500">
                    {candidate.position} · {candidate.level || "-"}
                  </p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {getRoleName(roles, candidate.roleId)}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {candidate.position || "-"}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {candidate.level || "-"}
                </td>
                <td className="max-w-xs px-4 py-4 text-slate-600">
                  {truncateText(candidate.linkedInProfile)}
                </td>
                <td className="max-w-sm px-4 py-4 text-slate-600">
                  {truncateText(candidate.summaryInterviewHr)}
                </td>
                <td className="max-w-xs px-4 py-4 text-slate-600">
                  {truncateText(candidate.cvLink)}
                </td>
                <td className="max-w-xs px-4 py-4 text-slate-600">
                  {truncateText(candidate.portfolioLink)}
                </td>
                <td className="max-w-xs px-4 py-4 text-slate-600">
                  {truncateText(candidate.psychologicalTest)}
                </td>
                <td className="max-w-sm px-4 py-4 text-slate-600">
                  {truncateText(candidate.feedbackFromUser)}
                </td>
                <td className="max-w-xs px-4 py-4 text-slate-600">
                  {truncateText(candidate.remarks)}
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
                  <p>Main: {candidate.interviewDate || "-"}</p>
                  <p className="text-xs text-slate-400">
                    HR: {candidate.hrInterviewDate || "-"} · User:{" "}
                    {candidate.userInterviewDate || "-"}
                  </p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {candidate.hrInterviewDate || "-"}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {candidate.userInterviewDate || "-"}
                </td>
                <td className="max-w-xs px-4 py-4 text-slate-600">
                  {candidate.createdAt || "-"}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setDetailCandidate(candidate)}
                      className="secondary-button px-3 py-2 text-xs"
                    >
                      Detail
                    </button>
                    <Link
                      href={`/candidates/${candidate.id}/edit`}
                      className="secondary-button px-3 py-2 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="danger-button px-3 py-2 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredCandidates.length === 0 && (
              <tr>
                <td
                  colSpan={18}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Belum ada kandidat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {filteredCandidates.map((candidate) => (
          <div key={candidate.id} className="card">
            <p className="text-lg font-black">{candidate.nameOfCandidate}</p>
            <p className="mt-1 text-sm text-slate-500">
              {candidate.position} · {getRoleName(roles, candidate.roleId)}
            </p>
            <span
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClass(
                candidate.status,
              )}`}
            >
              {candidate.status}
            </span>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Interview: {candidate.interviewDate || "-"}</p>
              <p>CV: {candidate.cvLink || "-"}</p>
              <p>Portfolio: {candidate.portfolioLink || "-"}</p>
              <p>Remarks: {candidate.remarks || "-"}</p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => setDetailCandidate(candidate)}
                className="secondary-button text-sm"
              >
                Detail
              </button>
              <Link
                href={`/candidates/${candidate.id}/edit`}
                className="secondary-button text-sm"
              >
                Edit
              </Link>
              <button
                onClick={() => setSelectedCandidate(candidate)}
                className="danger-button text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!selectedCandidate}
        title="Delete Candidate?"
        description={`Kandidat "${selectedCandidate?.nameOfCandidate}" akan dihapus. Action ini tidak bisa dibatalkan.`}
        confirmText="Delete Candidate"
        onClose={() => setSelectedCandidate(null)}
        onConfirm={deleteCandidate}
      />

      <CandidateDetailDialog
        candidate={detailCandidate}
        roles={roles}
        onClose={() => setDetailCandidate(null)}
      />
    </section>
  );
}

function truncateText(value: string, maxLength = 80) {
  if (!value) return "-";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

function CandidateDetailDialog({
  candidate,
  roles,
  onClose,
}: {
  candidate: Candidate | null;
  roles: Role[];
  onClose: () => void;
}) {
  if (!candidate) return null;

  const rows: { label: string; value: string }[] = [
    { label: "ID", value: candidate.id },
    { label: "Role", value: getRoleName(roles, candidate.roleId) },
    { label: "Position", value: candidate.position },
    { label: "Level", value: candidate.level },
    { label: "Name Of Candidate", value: candidate.nameOfCandidate },
    { label: "LinkedIn Profile", value: candidate.linkedInProfile },
    { label: "Summary Interview HR", value: candidate.summaryInterviewHr },
    { label: "CV", value: candidate.cvLink },
    { label: "Portfolio", value: candidate.portfolioLink },
    { label: "Psychological Test", value: candidate.psychologicalTest },
    { label: "Feedback From User", value: candidate.feedbackFromUser },
    { label: "Remarks", value: candidate.remarks },
    { label: "Status", value: candidate.status },
    { label: "Interview Date", value: candidate.interviewDate },
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
                {row.value || "-"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function candidateSearchValue(
  candidate: Candidate,
  roles: Role[],
  column: SearchColumn,
) {
  if (column === "name") return candidate.nameOfCandidate;
  if (column === "role") return getRoleName(roles, candidate.roleId);
  if (column === "status") return candidate.status;
  if (column === "position") return candidate.position;
  if (column === "level") return candidate.level;
  if (column === "interviewDate") {
    return [
      candidate.interviewDate,
      candidate.hrInterviewDate,
      candidate.userInterviewDate,
    ].join(" ");
  }
  if (column === "cvLink") return candidate.cvLink;
  if (column === "portfolioLink") return candidate.portfolioLink;
  return candidate.remarks;
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
