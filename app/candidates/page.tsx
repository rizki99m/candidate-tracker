"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { InteractiveValue } from "@/components/InteractiveValue";
import {
  PageSize,
  PaginationControls,
} from "@/components/PaginationControls";
import {
  Candidate,
  Role,
  candidateStatuses,
  deleteCandidate as deleteCandidateRequest,
  filterCandidates,
  fetchCandidates,
  fetchRoles,
  getRoleName,
  statusClass,
} from "@/lib/recruitment";

type SearchColumn = "role" | keyof Omit<Candidate, "id">;

const candidateColumns: { key: SearchColumn; label: string }[] = [
  { key: "nameOfCandidate", label: "Nama Lengkap" },
  { key: "email", label: "Email" },
  { key: "phoneNumber", label: "No. HP" },
  { key: "role", label: "Role" },
  { key: "position", label: "Posisi yang Dilamar" },
  { key: "status", label: "Status" },
  { key: "progress", label: "Progress" },
  { key: "cvLink", label: "CV" },
];

const candidateDetailColumns: { key: SearchColumn; label: string }[] = [
  ...candidateColumns,
  { key: "department", label: "Departemen" },
  { key: "level", label: "Level" },
  { key: "source", label: "Sumber" },
  { key: "poolDate", label: "Tanggal Masuk Pool" },
  { key: "workExperienceYears", label: "Pengalaman Kerja (Tahun)" },
  { key: "education", label: "Pendidikan" },
  { key: "university", label: "Universitas" },
  { key: "major", label: "Jurusan" },
  { key: "location", label: "Lokasi" },
  { key: "rating", label: "Rating (1-5)" },
  { key: "linkedInProfile", label: "LinkedIn Profile" },
  { key: "summaryInterviewHr", label: "Summary Interview HR" },
  { key: "portfolioLink", label: "Portfolio" },
  { key: "psychologicalTest", label: "Psychological Test" },
  { key: "feedbackFromUser", label: "Feedback From User" },
  { key: "interviewDate", label: "Interview Date" },
  { key: "hrInterviewDate", label: "HR Interview Date" },
  { key: "userInterviewDate", label: "User Interview Date" },
  { key: "createdAt", label: "Created At" },
];

const emptySearchFilters = Object.fromEntries(
  candidateColumns.map((column) => [column.key, ""]),
) as Record<SearchColumn, string>;

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [rolesData, candidatesData] = await Promise.all([
          fetchRoles(),
          fetchCandidates(),
        ]);
        setRoles(rolesData);
        setCandidates(candidatesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
      const matchesGlobal =
        !raw ||
        candidateColumns.some((column) =>
          candidateSearchValue(candidate, roles, column.key)
            .toLowerCase()
            .includes(raw),
        );

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

  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filteredCandidates.length / pageSize)),
  );
  const paginatedCandidates = filteredCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    queueMicrotask(() => setPage(1));
  }, [roleFilter, statusFilter, searchFilters, searchQuery, pageSize]);

  function updateSearchFilter(column: SearchColumn, value: string) {
    setSearchFilters((current) => ({ ...current, [column]: value }));
  }

  function clearSearch() {
    setSearchQuery("");
    setSearchFilters(emptySearchFilters);
    setRoleFilter("all");
    setStatusFilter("all");
  }

  async function deleteCandidate() {
    if (!selectedCandidate) return;

    try {
      await deleteCandidateRequest(selectedCandidate.id);
      setCandidates((current) =>
        current.filter((candidate) => candidate.id !== selectedCandidate.id),
      );
      setSelectedCandidate(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus kandidat.");
    }
  }

  function exportCandidates() {
    exportCandidatesToExcel(filteredCandidates, roles);
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
              <span className="sr-only">Search candidate</span>
              <div className="flex items-center gap-2">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search all candidate columns..."
                  className="input border-slate-300 bg-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen((state) => !state)}
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
              {candidateColumns.map((column) => (
                <Field key={column.key} label={column.label}>
                  <input
                    value={searchFilters[column.key]}
                    onChange={(event) =>
                      updateSearchFilter(column.key, event.target.value)
                    }
                    className="input"
                  />
                </Field>
              ))}

              <Field label="Role Filter">
                <select
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                  className="input"
                >
                  <option value="all">All Roles</option>
                  <option value="talent-pool">Talent Pool</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Status Filter">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="input"
                >
                  <option value="all">All Status</option>
                  {candidateStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
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

      {error && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="card text-sm font-semibold text-slate-500">
          Loading candidates...
        </div>
      )}

      {!loading && <div className="hidden max-w-full overflow-x-auto rounded-[2rem] border border-white bg-white shadow-sm lg:block">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="px-4 py-3">No</th>
              {candidateColumns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedCandidates.map((candidate, index) => (
              <tr key={candidate.id} className="align-top">
                <td className="px-4 py-4 text-xs text-slate-500">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                {candidateColumns.map((column) => (
                  <td
                    key={column.key}
                    className="max-w-xs px-4 py-4 text-slate-600"
                  >
                    {renderCandidateValue(candidate, roles, column.key)}
                  </td>
                ))}
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
                  colSpan={candidateColumns.length + 2}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Belum ada kandidat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>}

      <div className="space-y-3 lg:hidden">
        {paginatedCandidates.map((candidate) => (
          <div key={candidate.id} className="card">
            <p className="text-lg font-black">
              <InteractiveValue value={candidate.nameOfCandidate} />
            </p>
            <p className="mt-1 text-sm text-slate-500">
              <InteractiveValue value={candidate.position} /> /{" "}
              <InteractiveValue value={getRoleName(roles, candidate.roleId)} />
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClass(
                  candidate.status,
                )}`}
              >
                {candidate.status}
              </span>
              {candidate.progress && (
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">
                  {candidate.progress}
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Email: {renderCandidateValue(candidate, roles, "email")}</p>
              <p>No. HP: {renderCandidateValue(candidate, roles, "phoneNumber")}</p>
              <p>
                CV: {renderCandidateValue(candidate, roles, "cvLink")}
              </p>
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

      <PaginationControls
        page={currentPage}
        pageSize={pageSize}
        totalItems={filteredCandidates.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={exportCandidates}
          className="secondary-button"
        >
          Export to Excel
        </button>
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

  const rows = [
    { label: "ID", value: candidate.id, key: null },
    ...candidateDetailColumns.map((column) => ({
      label: column.label,
      value: candidateSearchValue(candidate, roles, column.key),
      key: column.key,
    })),
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
              className="grid gap-2 p-4 text-sm md:grid-cols-[240px_1fr]"
            >
              <p className="font-black text-slate-700">{row.label}</p>
              <div className="whitespace-pre-wrap break-words text-slate-600">
                {row.key
                  ? renderCandidateValue(candidate, roles, row.key, false)
                  : row.value || "-"}
              </div>
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
  if (column === "role") return getRoleName(roles, candidate.roleId);
  return String(candidate[column] || "");
}

function renderCandidateValue(
  candidate: Candidate,
  roles: Role[],
  column: SearchColumn,
  truncate = true,
) {
  const value = candidateSearchValue(candidate, roles, column);
  if (!value) return "-";

  if (column === "status") {
    return (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClass(
          candidate.status,
        )}`}
      >
        {candidate.status}
      </span>
    );
  }

  return <InteractiveValue value={value} truncate={truncate} />;
}

function exportCandidatesToExcel(candidates: Candidate[], roles: Role[]) {
  const headers = ["ID", ...candidateColumns.map((column) => column.label)];
  const rows = candidates.map((candidate) => [
    candidate.id,
    ...candidateColumns.map((column) =>
      candidateSearchValue(candidate, roles, column.key),
    ),
  ]);
  const tableRows = [headers, ...rows]
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => `<td>${escapeHtml(String(cell || ""))}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  const html = `<html><head><meta charset="UTF-8" /></head><body><table>${tableRows}</table></body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `candidate-export-${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
