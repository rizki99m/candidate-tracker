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
  CandidateStatusLookup,
  Role,
  candidateStatuses,
  createCandidate,
  deleteCandidate as deleteCandidateRequest,
  filterCandidates,
  fetchCandidates,
  fetchLookups,
  fetchRoles,
  getRoleName,
  statusClass,
} from "@/lib/recruitment";
import {
  SessionUser,
  canAddCandidate,
  canImportCandidates,
  canManageData,
  canSeeSalary,
} from "@/lib/permissions";

type SearchColumn = "role" | keyof Omit<Candidate, "id">;

const candidateColumns: { key: SearchColumn; label: string }[] = [
  { key: "nameOfCandidate", label: "Nama Lengkap" },
  { key: "email", label: "Email" },
  { key: "phoneNumber", label: "No. HP" },
  { key: "role", label: "Role" },
  { key: "position", label: "Posisi yang Dilamar" },
  { key: "status", label: "Status" },
  { key: "gpa", label: "IPK / GPA" },
  { key: "currentSalary", label: "Current Salary" },
  { key: "expectedSalary", label: "Expected Salary" },
  { key: "cvLink", label: "CV" },
];

const candidateDetailColumns: { key: SearchColumn; label: string }[] = [
  ...candidateColumns,
  { key: "department", label: "Departemen" },
  { key: "level", label: "Level" },
  { key: "source", label: "Sumber" },
  { key: "poolDate", label: "Tanggal Masuk Pool" },
  { key: "education", label: "Pendidikan" },
  { key: "university", label: "Universitas" },
  { key: "major", label: "Jurusan" },
  { key: "location", label: "Lokasi" },
  { key: "linkedInProfile", label: "LinkedIn Profile" },
  { key: "summaryInterviewHr", label: "Summary Interview HR" },
  { key: "portfolioLink", label: "Portfolio" },
  { key: "psychologicalTest", label: "Psychological Test" },
  { key: "feedbackFromUser", label: "Feedback From User" },
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
  const [candidateStatusesLookup, setCandidateStatusesLookup] = useState<
    CandidateStatusLookup[]
  >([]);
  const [user, setUser] = useState<SessionUser | null>(null);
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
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [rolesData, candidatesData, lookups] = await Promise.all([
          fetchRoles(),
          fetchCandidates(),
          fetchLookups(),
        ]);
        setRoles(rolesData);
        setCandidates(candidatesData);
        setCandidateStatusesLookup(lookups.candidateStatuses);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data.");
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

  const canManage = canManageData(user?.role);
  const showSalary = canSeeSalary(user?.role);
  const tableColumns = useMemo(
    () =>
      showSalary
        ? candidateColumns
        : candidateColumns.filter(
            (column) =>
              column.key !== "currentSalary" &&
              column.key !== "expectedSalary",
          ),
    [showSalary],
  );
  const detailColumns = useMemo(
    () =>
      showSalary
        ? candidateDetailColumns
        : candidateDetailColumns.filter(
            (column) =>
              column.key !== "currentSalary" &&
              column.key !== "expectedSalary",
          ),
    [showSalary],
  );
  const searchableColumns = useMemo(
    () => (showSalary ? candidateColumns : tableColumns),
    [showSalary, tableColumns],
  );

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
        searchableColumns.some((column) =>
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
  }, [
    candidates,
    roles,
    roleFilter,
    searchableColumns,
    statusFilter,
    searchFilters,
    searchQuery,
  ]);

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

  async function importCandidates(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const imported = parseCandidateCsv(text).map((row) =>
        buildImportedCandidate(row, roles, candidateStatusesLookup),
      );

      if (imported.length === 0) {
        alert("File import tidak punya data kandidat.");
        return;
      }

      const created: Candidate[] = [];
      const failed: string[] = [];

      for (const [index, candidate] of imported.entries()) {
        const rowNumber = index + 2;
        try {
          created.push(await createCandidate(candidate));
        } catch (err) {
          failed.push(
            `Row ${rowNumber}: ${
              err instanceof Error ? err.message : "Gagal import kandidat."
            }`,
          );
        }
      }

      if (created.length > 0) {
        setCandidates((current) => [...created, ...current]);
      }

      alert(buildImportSummary(created.length, failed));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal import kandidat.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {canAddCandidate(user?.role) && (
              <Link href="/candidates/new" className="primary-button">
                Add Candidate
              </Link>
            )}
          </div>

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
              {tableColumns.map((column) => (
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
              {tableColumns.map((column) => (
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
                {tableColumns.map((column) => (
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
                    {canManage && (
                      <>
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
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredCandidates.length === 0 && (
              <tr>
                <td
                  colSpan={tableColumns.length + 2}
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
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Email: {renderCandidateValue(candidate, roles, "email")}</p>
              <p>No. HP: {renderCandidateValue(candidate, roles, "phoneNumber")}</p>
              <p>
                CV: {renderCandidateValue(candidate, roles, "cvLink")}
              </p>
            </div>

            <div
              className={`mt-4 grid gap-2 ${
                canManage ? "grid-cols-3" : "grid-cols-1"
              }`}
            >
              <button
                onClick={() => setDetailCandidate(candidate)}
                className="secondary-button text-sm"
              >
                Detail
              </button>
              {canManage && (
                <>
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
                </>
              )}
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

      <div className="flex flex-wrap justify-end gap-2">
        {canImportCandidates(user?.role) && (
          <label className="secondary-button cursor-pointer">
            {importing ? "Importing..." : "Import CSV"}
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={importCandidates}
              disabled={importing}
              className="sr-only"
            />
          </label>
        )}
        {canManage && (
          <button
            type="button"
            onClick={exportCandidates}
            className="secondary-button"
          >
            Export to Excel
          </button>
        )}
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
        columns={detailColumns}
        onClose={() => setDetailCandidate(null)}
      />
    </section>
  );
}

function CandidateDetailDialog({
  candidate,
  roles,
  columns,
  onClose,
}: {
  candidate: Candidate | null;
  roles: Role[];
  columns: { key: SearchColumn; label: string }[];
  onClose: () => void;
}) {
  if (!candidate) return null;

  const rows = [
    { label: "ID", value: candidate.id, key: null },
    ...columns.map((column) => ({
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

function parseCandidateCsv(text: string) {
  const rows = parseCsvRows(text.trim());
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => normalizeHeader(header));
  return rows.slice(1).flatMap((row) => {
    if (row.every((cell) => !cell.trim())) return [];
    return [
      Object.fromEntries(
        headers.map((header, index) => [header, row[index]?.trim() || ""]),
      ),
    ];
  });
}

function parseCsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function buildImportedCandidate(
  row: Record<string, string>,
  roles: Role[],
  statuses: CandidateStatusLookup[],
): Omit<
  Candidate,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "roleName"
  | "statusName"
  | "statusColorHex"
> {
  const roleText = getImportValue(row, ["role_applied", "role", "roleid"]);
  const role = roles.find(
    (item) =>
      item.id === roleText ||
      item.name.toLowerCase() === roleText.toLowerCase(),
  );
  const statusText =
    getImportValue(row, ["status", "candidate_status"]) ||
    statuses[0]?.name ||
    "HR Interview";
  const status = statuses.find(
    (item) =>
      item.id === statusText ||
      item.name.toLowerCase() === statusText.toLowerCase(),
  );

  return {
    roleId: role?.id || "",
    position: getImportValue(row, ["position", "posisi"]) || role?.name || "",
    level: getImportValue(row, ["level"]) || role?.level || "",
    nameOfCandidate: getImportValue(row, [
      "name",
      "nama",
      "nama_lengkap",
      "name_of_candidate",
    ]),
    email: getImportValue(row, ["email"]),
    phoneNumber: getImportValue(row, ["no_hp", "phone", "phone_number"]),
    department:
      getImportValue(row, ["department", "departement", "division"]) ||
      role?.department ||
      "",
    source: getImportValue(row, ["source", "sumber"]),
    poolDate: getImportValue(row, ["pool_date", "tanggal_masuk"]) || todayIso(),
    education: getImportValue(row, ["education", "pendidikan"]),
    university: getImportValue(row, ["university", "universitas"]),
    major: getImportValue(row, ["major", "jurusan"]),
    gpa: getImportValue(row, ["gpa", "ipk"]),
    location: getImportValue(row, ["location", "lokasi"]),
    currentSalary: normalizeRupiah(
      getImportValue(row, ["current_salary", "current"]),
    ),
    expectedSalary: normalizeRupiah(
      getImportValue(row, ["expected_salary", "expected", "excpected_salary"]),
    ),
    linkedInProfile: getImportValue(row, ["linkedin", "linked_in_profile"]),
    summaryInterviewHr: getImportValue(row, ["summary_hr", "summary_interview_hr"]),
    cvLink: getImportValue(row, ["cv", "resume", "cv_link"]),
    portfolioLink: getImportValue(row, ["portfolio", "portfolio_link"]),
    psychologicalTest: getImportValue(row, [
      "psychological_test",
      "psikotes",
    ]),
    feedbackFromUser: getImportValue(row, ["summary_user", "feedback_from_user"]),
    statusId: status?.id || "",
    status: status?.name || statusText,
    hrInterviewDate: getImportValue(row, ["hr_interview_date"]),
    userInterviewDate: getImportValue(row, ["user_interview_date"]),
  };
}

function buildImportSummary(successCount: number, failed: string[]) {
  if (failed.length === 0) {
    return `${successCount} kandidat berhasil diimport.`;
  }

  const visibleErrors = failed.slice(0, 15).join("\n");
  const remaining =
    failed.length > 15 ? `\n...dan ${failed.length - 15} error lainnya.` : "";

  return [
    `Import selesai.`,
    `Berhasil: ${successCount}`,
    `Gagal: ${failed.length}`,
    "",
    "Detail gagal:",
    visibleErrors,
    remaining,
  ]
    .filter(Boolean)
    .join("\n");
}

function getImportValue(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[normalizeHeader(key)];
    if (value) return value;
  }
  return "";
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replaceAll(/[^a-z0-9]+/g, "_").replaceAll(/^_|_$/g, "");
}

function normalizeRupiah(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return value.trim();
  return `Rp ${Number(digits).toLocaleString("id-ID")}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
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
