"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { BlockingLoadingOverlay } from "@/components/BlockingLoadingOverlay";
import { InteractiveValue } from "@/components/InteractiveValue";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { PageSize, PaginationControls } from "@/components/PaginationControls";
import {
  Candidate,
  CandidateStatusLookup,
  Role,
  createCandidate,
  deleteCandidate as deleteCandidateRequest,
  filterCandidates,
  fetchCandidates,
  fetchLookups,
  fetchRoles,
  getRoleName,
  statusColor,
  updateCandidate,
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
  { key: "role", label: "Role yang Dilamar" },
  { key: "position", label: "Posisi yang Dilamar" },
  { key: "status", label: "Status" },
  { key: "gpa", label: "IPK / GPA" },
  { key: "currentSalary", label: "Current Salary" },
  { key: "expectedSalary", label: "Expected Salary" },
  { key: "cvLink", label: "CV" },
];

const advancedSearchColumns: { key: SearchColumn; label: string }[] = [
  { key: "nameOfCandidate", label: "Nama Lengkap" },
];

const importSourceOptions = [
  "Google Form",
  "LinkedIn",
  "Kalibrr",
  "Glints",
  "Email",
  "Referral",
  "Others",
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
  advancedSearchColumns.map((column) => [column.key, ""]),
) as Record<SearchColumn, string>;

type ImportFailure = {
  rowNumber: number;
  candidate: Partial<Candidate>;
  errors: string[];
};

type CandidateImportData = Omit<
  Candidate,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "roleName"
  | "statusName"
  | "statusColorHex"
>;

type ImportPreviewRow = {
  rowNumber: number;
  candidate: CandidateImportData;
  warnings: string[];
  operation: "create" | "update" | "delete" | "error" | "noop";
  targetId?: string;
  changes?: string[];
};

type ResultDialogState = {
  title: string;
  description: string;
  tone?: "success" | "warning" | "error";
  failures?: ImportFailure[];
} | null;

type DuplicateCandidate = Candidate & {
  duplicateFields: string[];
  duplicateCandidateIds: string[];
};

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
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>(
    [],
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState(emptySearchFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreviewRow[] | null>(
    null,
  );
  const [importSourceRows, setImportSourceRows] = useState<ImportPreviewRow[] | null>(
    null,
  );
  const [isSystemImport, setIsSystemImport] = useState(false);
  const [deleteMissingCandidates, setDeleteMissingCandidates] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [busyMessage, setBusyMessage] = useState("");
  const [error, setError] = useState("");
  const [resultDialog, setResultDialog] = useState<ResultDialogState>(null);

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
              column.key !== "currentSalary" && column.key !== "expectedSalary",
          ),
    [showSalary],
  );
  const detailColumns = useMemo(
    () =>
      showSalary
        ? candidateDetailColumns
        : candidateDetailColumns.filter(
            (column) =>
              column.key !== "currentSalary" && column.key !== "expectedSalary",
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
  const selectedPageCandidateIds = paginatedCandidates
    .filter((candidate) => selectedCandidateIds.includes(candidate.id))
    .map((candidate) => candidate.id);
  const allPageCandidatesSelected =
    paginatedCandidates.length > 0 &&
    selectedPageCandidateIds.length === paginatedCandidates.length;

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

    const candidateName = selectedCandidate.nameOfCandidate;
    setBusyMessage("Menghapus kandidat...");
    try {
      await deleteCandidateRequest(selectedCandidate.id);
      setCandidates((current) =>
        current.filter((candidate) => candidate.id !== selectedCandidate.id),
      );
      setSelectedCandidateIds((current) =>
        current.filter((id) => id !== selectedCandidate.id),
      );
      setSelectedCandidate(null);
      setResultDialog({
        title: "Data berhasil dihapus",
        description: `Kandidat "${candidateName}" sudah dihapus dari database.`,
        tone: "success",
      });
    } catch (err) {
      setResultDialog({
        title: "Gagal menghapus data",
        description:
          err instanceof Error ? err.message : "Gagal menghapus kandidat.",
        tone: "error",
      });
    } finally {
      setBusyMessage("");
    }
  }

  function toggleCandidateSelection(id: string) {
    setSelectedCandidateIds((current) =>
      current.includes(id)
        ? current.filter((candidateId) => candidateId !== id)
        : [...current, id],
    );
  }

  function toggleCurrentPageSelection() {
    const pageIds = paginatedCandidates.map((candidate) => candidate.id);
    setSelectedCandidateIds((current) => {
      if (allPageCandidatesSelected) {
        return current.filter((id) => !pageIds.includes(id));
      }

      return Array.from(new Set([...current, ...pageIds]));
    });
  }

  async function deleteSelectedCandidates() {
    const idsToDelete = [...selectedCandidateIds];
    if (idsToDelete.length === 0) return;

    setBulkDeleting(true);
    setBusyMessage("Menghapus kandidat terpilih...");
    try {
      const results = await Promise.allSettled(
        idsToDelete.map((id) => deleteCandidateRequest(id)),
      );
      const deletedIds = idsToDelete.filter(
        (_, index) => results[index].status === "fulfilled",
      );
      const failedCount = idsToDelete.length - deletedIds.length;

      if (deletedIds.length > 0) {
        setCandidates((current) =>
          current.filter((candidate) => !deletedIds.includes(candidate.id)),
        );
      }
      setSelectedCandidateIds((current) =>
        current.filter((id) => !deletedIds.includes(id)),
      );
      setBulkDeleteOpen(false);

      setResultDialog({
        title: failedCount
          ? "Penghapusan selesai dengan catatan"
          : "Data berhasil dihapus",
        description: failedCount
          ? `${deletedIds.length} kandidat berhasil dihapus, ${failedCount} kandidat gagal dihapus.`
          : `${deletedIds.length} kandidat berhasil dihapus dari database.`,
        tone: failedCount ? "warning" : "success",
      });
    } finally {
      setBulkDeleting(false);
      setBusyMessage("");
    }
  }

  async function exportCandidates() {
    setExporting(true);
    setBusyMessage("Menyiapkan CSV sinkronisasi...");
    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      exportCandidatesToCsv(candidates, roles);
    } finally {
      setExporting(false);
      setBusyMessage("");
    }
  }

  async function importCandidates(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusyMessage("Membaca dan memeriksa file CSV...");
    try {
      const text = await file.text();
      const parsedRows = parseCandidateCsv(text);
      const importedRows = parsedRows.map((row, index) =>
        buildImportedCandidate(row, roles, candidateStatusesLookup, index + 1),
      );
      const systemImport = parsedRows.some((row) => "id" in row);
      const imported = buildImportPreview(importedRows, candidates, false);

      if (imported.length === 0) {
        setResultDialog({
          title: "Import gagal",
          description: "File import tidak punya data kandidat.",
          tone: "error",
        });
        return;
      }

      setImportSourceRows(importedRows);
      setIsSystemImport(systemImport);
      setDeleteMissingCandidates(false);
      setImportPreview(imported);
    } catch (err) {
      setResultDialog({
        title: "Import gagal",
        description:
          err instanceof Error ? err.message : "Gagal import kandidat.",
        tone: "error",
      });
    } finally {
      setBusyMessage("");
    }
  }

  function updateImportPreview(
    rowNumber: number,
    update: Partial<CandidateImportData>,
  ) {
    setImportSourceRows((current) => {
      const next = current?.map((row) =>
          row.rowNumber === rowNumber
            ? { ...row, candidate: { ...row.candidate, ...update } }
            : row,
        ) || null;
      if (next) {
        setImportPreview(
          buildImportPreview(next, candidates, deleteMissingCandidates),
        );
      }
      return next;
    });
  }

  function updateImportPreviewRole(rowNumber: number, roleId: string) {
    const selectedRole = roles.find((role) => role.id === roleId);
    updateImportPreview(rowNumber, {
      roleId,
      position: selectedRole?.name || "",
      level: selectedRole?.level || "",
      department: selectedRole?.department || "",
    });
  }

  function updateDeleteMissingCandidates(enabled: boolean) {
    setDeleteMissingCandidates(enabled);
    if (importSourceRows) {
      setImportPreview(buildImportPreview(importSourceRows, candidates, enabled));
    }
  }

  async function confirmImport() {
    if (!importPreview) return;

    setImporting(true);
    setBusyMessage("Mengimpor kandidat ke database...");
    try {
      let createdCount = 0;
      let updatedCount = 0;
      let deletedCount = 0;
      const failed: ImportFailure[] = [];

      for (const row of importPreview) {
        if (row.operation === "noop") continue;

        if (row.operation === "delete") {
          try {
            await deleteCandidateRequest(row.targetId || "");
            deletedCount += 1;
          } catch (err) {
            failed.push({
              rowNumber: row.rowNumber,
              candidate: row.candidate,
              errors: [
                err instanceof Error ? err.message : "Gagal menghapus kandidat.",
              ],
            });
          }
          continue;
        }

        if (row.operation === "error") {
          failed.push({
            rowNumber: row.rowNumber,
            candidate: row.candidate,
            errors: row.warnings,
          });
          continue;
        }

        const validationErrors = validateImportedCandidate(row.candidate);
        if (validationErrors.length > 0) {
          failed.push({
            rowNumber: row.rowNumber,
            candidate: row.candidate,
            errors: validationErrors,
          });
          continue;
        }

        try {
          if (row.operation === "update" && row.targetId) {
            await updateCandidate(row.targetId, row.candidate);
            updatedCount += 1;
          } else {
            await createCandidate(row.candidate);
            createdCount += 1;
          }
        } catch (err) {
          failed.push({
            rowNumber: row.rowNumber,
            candidate: row.candidate,
            errors: [
              err instanceof Error ? err.message : "Gagal import kandidat.",
            ],
          });
        }
      }

      if (createdCount + updatedCount + deletedCount > 0) {
        setCandidates(await fetchCandidates());
      }

      setImportPreview(null);
      setImportSourceRows(null);
      setIsSystemImport(false);
      setDeleteMissingCandidates(false);
      setResultDialog(
        buildImportResultDialog(
          createdCount,
          updatedCount,
          deletedCount,
          failed,
        ),
      );
    } finally {
      setImporting(false);
      setBusyMessage("");
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
            {canManage && selectedCandidateIds.length > 0 && (
              <button
                type="button"
                onClick={() => setBulkDeleteOpen(true)}
                className="danger-button"
              >
                Delete Selected ({selectedCandidateIds.length})
              </button>
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
              {advancedSearchColumns.map((column) => (
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
                  <option value="without-role">Belum ada role</option>
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
                  {candidateStatusesLookup.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
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
          <LoadingIndicator label="Loading candidates from database..." />
        </div>
      )}

      {!loading && (
        <div className="hidden max-w-full overflow-x-auto rounded-[2rem] border border-white bg-white shadow-sm lg:block">
          <table className="w-full min-w-[1100px] table-fixed border-collapse text-left text-sm">
            <colgroup>
              {canManage && <col className="w-12" />}
              <col className="w-16" />
              {tableColumns.map((column) => (
                <col key={column.key} className="w-[10rem]" />
              ))}
              <col className="w-[18rem]" />
            </colgroup>
            <thead className="bg-slate-950 text-white">
              <tr>
                {canManage && (
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allPageCandidatesSelected}
                      onChange={toggleCurrentPageSelection}
                      aria-label="Pilih semua kandidat pada halaman ini"
                      className="h-4 w-4 accent-emerald-600"
                    />
                  </th>
                )}
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
                  {canManage && (
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCandidateIds.includes(candidate.id)}
                        onChange={() => toggleCandidateSelection(candidate.id)}
                        aria-label={`Pilih ${candidate.nameOfCandidate}`}
                        className="h-4 w-4 accent-emerald-600"
                      />
                    </td>
                  )}
                  <td className="px-4 py-4 text-xs text-slate-500">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>
                  {tableColumns.map((column) => (
                    <td
                      key={column.key}
                      className="min-w-0 overflow-hidden px-4 py-4 text-slate-600"
                    >
                      {renderCandidateValue(candidate, roles, column.key)}
                    </td>
                  ))}
                  <td className="px-4 py-4">
                    <div className="flex min-w-max justify-end gap-2">
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
                    colSpan={tableColumns.length + (canManage ? 3 : 2)}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Belum ada kandidat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="space-y-3 lg:hidden">
        {paginatedCandidates.map((candidate) => (
          <div key={candidate.id} className="card">
            {canManage && (
              <label className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={selectedCandidateIds.includes(candidate.id)}
                  onChange={() => toggleCandidateSelection(candidate.id)}
                  className="h-4 w-4 accent-emerald-600"
                />
                Pilih kandidat
              </label>
            )}
            <p className="text-lg font-black">
              <InteractiveValue value={candidate.nameOfCandidate} />
            </p>
            <p className="mt-1 text-sm text-slate-500">
              <InteractiveValue value={candidate.position} /> /{" "}
              <InteractiveValue value={getRoleName(roles, candidate.roleId)} />
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className="inline-flex rounded-full border px-3 py-1 text-xs font-black text-white"
                style={candidateStatusStyle(candidate)}
              >
                {candidate.status}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Email: {renderCandidateValue(candidate, roles, "email")}</p>
              <p>
                No. HP: {renderCandidateValue(candidate, roles, "phoneNumber")}
              </p>
              <p>CV: {renderCandidateValue(candidate, roles, "cvLink")}</p>
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
            {importing ? (
              <LoadingIndicator label="Importing..." />
            ) : (
              "Preview CSV"
            )}
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
            disabled={exporting}
            className="secondary-button disabled:opacity-60"
          >
            {exporting ? (
              <LoadingIndicator label="Exporting..." />
            ) : (
              "Export Full CSV"
            )}
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

      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Delete selected candidates?"
        description={`${selectedCandidateIds.length} kandidat yang dipilih akan dihapus. Action ini tidak bisa dibatalkan.`}
        confirmText={bulkDeleting ? "Deleting..." : "Delete Selected"}
        onClose={() => {
          if (!bulkDeleting) setBulkDeleteOpen(false);
        }}
        onConfirm={deleteSelectedCandidates}
      />

      <CandidateDetailDialog
        candidate={detailCandidate}
        roles={roles}
        columns={detailColumns}
        onClose={() => setDetailCandidate(null)}
      />

      <ResultDialog
        result={resultDialog}
        onClose={() => setResultDialog(null)}
      />

      <ImportPreviewDialog
        rows={importPreview}
        roles={roles}
        statuses={candidateStatusesLookup}
        importing={importing}
        isSystemImport={isSystemImport}
        deleteMissingCandidates={deleteMissingCandidates}
        onDeleteMissingCandidatesChange={updateDeleteMissingCandidates}
        onClose={() => {
          setImportPreview(null);
          setImportSourceRows(null);
          setIsSystemImport(false);
          setDeleteMissingCandidates(false);
        }}
        onUpdate={updateImportPreview}
        onRoleChange={updateImportPreviewRole}
        onConfirm={confirmImport}
      />
      <BlockingLoadingOverlay
        open={loading || !!busyMessage}
        label={busyMessage || "Memuat data kandidat..."}
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

// The legacy table dialog is intentionally retained as an internal utility while
// duplicate handling is now limited to import validation.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DuplicateCandidatesDialog({
  open,
  candidates,
  canManage,
  onClose,
  onDelete,
}: {
  open: boolean;
  candidates: DuplicateCandidate[];
  canManage: boolean;
  onClose: () => void;
  onDelete: (candidate: Candidate) => void;
}) {
  const [expandedCandidateIds, setExpandedCandidateIds] = useState<string[]>(
    [],
  );

  function toggleDetail(candidateId: string) {
    setExpandedCandidateIds((current) =>
      current.includes(candidateId)
        ? current.filter((id) => id !== candidateId)
        : [...current, candidateId],
    );
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-3 sm:p-4">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-7xl flex-col rounded-2xl bg-white p-4 shadow-2xl sm:max-h-[85vh] sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-950 sm:text-2xl">
              Kandidat Duplikat
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="secondary-button px-4 py-2 text-sm"
          >
            Close
          </button>
        </div>

        <div className="mt-6 hidden min-h-0 overflow-auto rounded-2xl border border-slate-200 md:block">
          <table className="w-full min-w-[720px] table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-16" />
              <col className="w-[13rem]" />
              <col className="w-[14rem]" />
              <col className="w-[10rem]" />
              <col className="w-[16rem]" />
            </colgroup>
            <thead className="sticky top-0 bg-slate-950 text-white">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">No. HP</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {candidates.map((candidate, index) => {
                const expanded = expandedCandidateIds.includes(candidate.id);
                const duplicateEntries = [
                  candidate,
                  ...candidates.filter((item) =>
                    candidate.duplicateCandidateIds.includes(item.id),
                  ),
                ];

                return (
                  <Fragment key={candidate.id}>
                    <tr className="align-top">
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <InteractiveValue value={candidate.nameOfCandidate} />
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <InteractiveValue value={candidate.email} />
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        <InteractiveValue value={candidate.phoneNumber} />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleDetail(candidate.id)}
                          aria-expanded={expanded}
                          className="secondary-button px-3 py-2 text-xs"
                        >
                          {expanded ? "Tutup Detail" : "Detail"}
                        </button>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-slate-50">
                        <td colSpan={5} className="px-4 py-4">
                          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                            <table className="w-full min-w-[720px] text-left text-sm">
                              <thead className="bg-slate-100 text-slate-700">
                                <tr>
                                  <th className="px-4 py-3">Nama Lengkap</th>
                                  <th className="px-4 py-3">
                                    Posisi yang Dilamar
                                  </th>
                                  <th className="px-4 py-3">Status</th>
                                  {canManage && (
                                    <th className="px-4 py-3 text-right">
                                      Action
                                    </th>
                                  )}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                {duplicateEntries.map((relatedCandidate) => (
                                  <tr key={relatedCandidate.id}>
                                    <td className="px-4 py-3 text-slate-600">
                                      <InteractiveValue
                                        value={relatedCandidate.nameOfCandidate}
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                      <InteractiveValue
                                        value={relatedCandidate.position}
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      {renderCandidateValue(
                                        relatedCandidate,
                                        [],
                                        "status",
                                      )}
                                    </td>
                                    {canManage && (
                                      <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                          <Link
                                            href={`/candidates/${relatedCandidate.id}/edit`}
                                            className="secondary-button px-3 py-2 text-xs"
                                          >
                                            Edit
                                          </Link>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              onDelete(relatedCandidate)
                                            }
                                            className="danger-button px-3 py-2 text-xs"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {candidates.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Tidak ada kandidat duplikat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 min-h-0 space-y-3 overflow-y-auto md:hidden">
          {candidates.map((candidate, index) => {
            const expanded = expandedCandidateIds.includes(candidate.id);
            const duplicateEntries = [
              candidate,
              ...candidates.filter((item) =>
                candidate.duplicateCandidateIds.includes(item.id),
              ),
            ];

            return (
              <article
                key={candidate.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-black text-slate-400">
                    #{index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleDetail(candidate.id)}
                    aria-expanded={expanded}
                    className="secondary-button shrink-0 px-3 py-2 text-xs"
                  >
                    {expanded ? "Tutup Detail" : "Detail"}
                  </button>
                </div>
                <p className="mt-2 break-words text-base font-black text-slate-950">
                  <InteractiveValue
                    value={candidate.nameOfCandidate}
                    truncate={false}
                  />
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="font-bold text-slate-500">Email</dt>
                    <dd className="break-words text-slate-700">
                      <InteractiveValue
                        value={candidate.email}
                        truncate={false}
                      />
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-500">No. HP</dt>
                    <dd className="break-words text-slate-700">
                      <InteractiveValue
                        value={candidate.phoneNumber}
                        truncate={false}
                      />
                    </dd>
                  </div>
                </dl>

                {expanded && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <p className="text-sm font-black text-slate-800">
                      Data duplikat berdasarkan:{" "}
                      {candidate.duplicateFields.join(", ")}
                    </p>
                    <div className="mt-3 space-y-3">
                      {duplicateEntries.map((relatedCandidate) => (
                        <div
                          key={relatedCandidate.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="font-mono text-xs text-slate-500">
                            ID: {relatedCandidate.id}
                          </p>
                          <p className="mt-1 break-words font-black text-slate-950">
                            <InteractiveValue
                              value={relatedCandidate.nameOfCandidate}
                              truncate={false}
                            />
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            <span className="font-bold text-slate-500">
                              Posisi:
                            </span>{" "}
                            <InteractiveValue
                              value={relatedCandidate.position}
                              truncate={false}
                            />
                          </p>
                          <div className="mt-3">
                            {renderCandidateValue(
                              relatedCandidate,
                              [],
                              "status",
                            )}
                          </div>
                          {canManage && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <Link
                                href={`/candidates/${relatedCandidate.id}/edit`}
                                className="secondary-button px-3 py-2 text-center text-xs"
                              >
                                Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => onDelete(relatedCandidate)}
                                className="danger-button px-3 py-2 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}

          {candidates.length === 0 && (
            <div className="rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-500">
              Tidak ada kandidat duplikat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function findDuplicateCandidates(
  candidates: Candidate[],
): DuplicateCandidate[] {
  const fields = [
    {
      key: "nameOfCandidate",
      label: "Nama Lengkap",
      normalize: normalizeDuplicateText,
    },
    { key: "email", label: "Email", normalize: normalizeDuplicateText },
    { key: "phoneNumber", label: "No. HP", normalize: normalizePhoneNumber },
  ] as const;
  const duplicateIds = new Map<string, string[]>();
  const duplicateCandidateIds = new Map<string, Set<string>>();

  for (const field of fields) {
    const values = new Map<string, Candidate[]>();
    for (const candidate of candidates) {
      const value = field.normalize(candidate[field.key]);
      if (!value) continue;
      values.set(value, [...(values.get(value) || []), candidate]);
    }

    for (const matches of values.values()) {
      if (matches.length < 2) continue;
      for (const candidate of matches) {
        duplicateIds.set(candidate.id, [
          ...(duplicateIds.get(candidate.id) || []),
          field.label,
        ]);
        duplicateCandidateIds.set(
          candidate.id,
          new Set([
            ...(duplicateCandidateIds.get(candidate.id) || []),
            ...matches
              .filter((item) => item.id !== candidate.id)
              .map((item) => item.id),
          ]),
        );
      }
    }
  }

  return candidates.flatMap((candidate) => {
    const duplicateFields = duplicateIds.get(candidate.id);
    return duplicateFields
      ? [
          {
            ...candidate,
            duplicateFields,
            duplicateCandidateIds: Array.from(
              duplicateCandidateIds.get(candidate.id) || [],
            ),
          },
        ]
      : [];
  });
}

function normalizeDuplicateText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizePhoneNumber(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) digits = digits.slice(2);
  return digits.replace(/^0+/, "");
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
        className="inline-flex rounded-full border px-3 py-1 text-xs font-black text-white"
        style={candidateStatusStyle(candidate)}
      >
        {candidate.status}
      </span>
    );
  }

  return (
    <InteractiveValue
      value={value}
      truncate={truncate}
      className={truncate ? "block max-w-full truncate" : ""}
    />
  );
}

function candidateStatusStyle(candidate: Candidate) {
  const color = candidate.statusColorHex || statusColor(candidate.status);
  return {
    backgroundColor: color,
    borderColor: color,
  };
}

function importOperationLabel(operation: ImportPreviewRow["operation"]) {
  return {
    create: "Buat",
    update: "Perbarui",
    delete: "Hapus",
    error: "Perlu Diperbaiki",
    noop: "Tidak Ada Perubahan",
  }[operation];
}

function importOperationClass(operation: ImportPreviewRow["operation"]) {
  return {
    create: "bg-emerald-100 text-emerald-700",
    update: "bg-sky-100 text-sky-700",
    delete: "bg-rose-100 text-rose-700",
    error: "bg-amber-100 text-amber-800",
    noop: "bg-slate-100 text-slate-700",
  }[operation];
}

function ImportPreviewDialog({
  rows,
  roles,
  statuses,
  importing,
  isSystemImport,
  deleteMissingCandidates,
  onClose,
  onUpdate,
  onRoleChange,
  onDeleteMissingCandidatesChange,
  onConfirm,
}: {
  rows: ImportPreviewRow[] | null;
  roles: Role[];
  statuses: CandidateStatusLookup[];
  importing: boolean;
  isSystemImport: boolean;
  deleteMissingCandidates: boolean;
  onClose: () => void;
  onUpdate: (rowNumber: number, update: Partial<CandidateImportData>) => void;
  onRoleChange: (rowNumber: number, roleId: string) => void;
  onDeleteMissingCandidatesChange: (enabled: boolean) => void;
  onConfirm: () => void;
}) {
  if (!rows) return null;
  const operationCounts = {
    create: rows.filter((row) => row.operation === "create").length,
    update: rows.filter((row) => row.operation === "update").length,
    delete: rows.filter((row) => row.operation === "delete").length,
  };
  const actionableCount =
    operationCounts.create + operationCounts.update + operationCounts.delete;
  const invalidRows = rows.filter(
    (row) =>
      row.operation === "error" ||
      (row.operation !== "delete" &&
        row.operation !== "noop" &&
        validateImportedCandidate(row.candidate).length > 0),
  );
  const duplicateRows = rows.filter(
    (row) =>
      !invalidRows.includes(row) &&
      row.warnings.some((warning) => warning.startsWith("Duplikat")),
  );
  const invalidCount = invalidRows.length;
  const importGroups = [
    {
      key: "create",
      label: "Kandidat Baru",
      tone: importOperationClass("create"),
      rows: rows.filter(
        (row) => row.operation === "create" && !invalidRows.includes(row) && !duplicateRows.includes(row),
      ),
    },
    {
      key: "update",
      label: "Kandidat Diperbarui",
      tone: importOperationClass("update"),
      rows: rows.filter(
        (row) => row.operation === "update" && !invalidRows.includes(row) && !duplicateRows.includes(row),
      ),
    },
    {
      key: "delete",
      label: "Kandidat Dihapus",
      tone: importOperationClass("delete"),
      rows: rows.filter((row) => row.operation === "delete"),
    },
    {
      key: "duplicate",
      label: "Data Duplikasi",
      tone: "bg-amber-100 text-amber-800",
      rows: duplicateRows,
    },
    {
      key: "error",
      label: "Perlu Diperbaiki",
      tone: importOperationClass("error"),
      rows: invalidRows,
    },
  ];
  const displayCounts = {
    create: importGroups.find((group) => group.key === "create")?.rows.length || 0,
    update: importGroups.find((group) => group.key === "update")?.rows.length || 0,
    delete: importGroups.find((group) => group.key === "delete")?.rows.length || 0,
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-3 sm:p-4">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col rounded-2xl bg-white p-4 shadow-2xl sm:max-h-[85vh] sm:rounded-[2rem] sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-950 sm:text-2xl">
              Preview Sinkronisasi Kandidat
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="secondary-button px-4 py-2 text-sm disabled:opacity-60"
          >
            Batal
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {([
            ["create", "Buat"],
            ["update", "Perbarui"],
            ["delete", "Hapus"],
            ["error", "Perlu Diperbaiki"],
            ["duplicate", "Duplikasi"],
          ] as const).map(([operation, label]) => (
            <div
              key={operation}
              className={`rounded-xl p-3 ${
                operation === "duplicate"
                  ? "bg-amber-100 text-amber-800"
                  : importOperationClass(operation)
              }`}
            >
              <p className="text-xs font-bold">{label}</p>
              <p className="mt-1 text-2xl font-black">
                {operation === "error"
                    ? invalidCount
                  : operation === "duplicate"
                    ? duplicateRows.length
                    : displayCounts[operation]}
              </p>
            </div>
          ))}
        </div>
        {isSystemImport && (
          <label className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <input
              type="checkbox"
              checked={deleteMissingCandidates}
              onChange={(event) => onDeleteMissingCandidatesChange(event.target.checked)}
              disabled={importing}
              className="mt-0.5 h-4 w-4"
            />
            <span className="font-semibold">
              Hapus kandidat database yang tidak ada dalam file ini.
            </span>
          </label>
        )}
        {invalidCount > 0 && (
          <p className="mt-3 text-sm font-bold text-rose-700">
            Perbaiki {invalidCount} data yang bermasalah sebelum sinkronisasi dapat
            dijalankan.
          </p>
        )}

        <div className="mt-5 min-h-0 space-y-3 overflow-y-auto pr-1">
          {importGroups.map(({ key, label, tone, rows: groupRows }) => {
            if (groupRows.length === 0) return null;

            return (
              <details
                key={key}
                className="group rounded-2xl border border-slate-200 bg-slate-50"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 marker:content-none">
                  <span className="font-black text-slate-950">{label}</span>
                  <span className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${tone}`}
                    >
                      {groupRows.length} data
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-sm font-black text-slate-500 transition-transform group-open:rotate-90"
                    >
                      &gt;
                    </span>
                  </span>
                </summary>
                <div className="space-y-4 border-t border-slate-200 p-4">
                  {groupRows.map((row) => (
            <article
              key={row.rowNumber}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-black text-slate-950">
                  Data {row.rowNumber}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${importOperationClass(
                    row.operation,
                  )}`}
                >
                  {importOperationLabel(row.operation)}
                </span>
                {row.warnings.length > 0 && (
                  <p className="text-xs font-bold text-amber-700">
                    {row.warnings.length} perlu dicek
                  </p>
                )}

                {row.operation === "delete" && (
                  <p className="mt-3 text-sm font-black text-rose-700">
                    Akan dihapus: {row.candidate.nameOfCandidate || "Nama kosong"}
                    {row.candidate.position ? ` - ${row.candidate.position}` : ""}
                  </p>
                )}
              </div>

              {row.warnings.length > 0 && (
                <ul className="mt-3 space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                  {row.warnings.map((warning) => (
                    <li key={warning}>- {warning}</li>
                  ))}
                </ul>
              )}

              {row.operation === "update" && row.changes?.length ? (
                <p className="mt-3 text-xs font-semibold text-sky-700">
                  Perubahan: {row.changes.join(", ")}.
                </p>
              ) : null}

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <PreviewField label="Pool Date / Timestamp">
                  <input
                    type="datetime-local"
                    value={toDateTimeLocalValue(row.candidate.poolDate)}
                    onChange={(event) =>
                      onUpdate(row.rowNumber, { poolDate: event.target.value })
                    }
                    className="input"
                  />
                </PreviewField>
                <PreviewField label="Nama Lengkap">
                  <input
                    value={row.candidate.nameOfCandidate}
                    onChange={(event) =>
                      onUpdate(row.rowNumber, {
                        nameOfCandidate: event.target.value,
                      })
                    }
                    className="input"
                  />
                </PreviewField>
                <PreviewField label="Role yang Dilamar">
                  <select
                    value={row.candidate.roleId}
                    onChange={(event) =>
                      onRoleChange(row.rowNumber, event.target.value)
                    }
                    className="input"
                  >
                    <option value="">Pilih role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </PreviewField>
                <PreviewField label="Posisi yang Dilamar">
                  <input
                    value={row.candidate.position}
                    onChange={(event) =>
                      onUpdate(row.rowNumber, { position: event.target.value })
                    }
                    className="input"
                  />
                </PreviewField>
                <PreviewField label="Level">
                  <input
                    value={row.candidate.level}
                    readOnly
                    className="input"
                  />
                </PreviewField>
                <PreviewField label="Departemen">
                  <input
                    value={row.candidate.department}
                    readOnly
                    className="input"
                  />
                </PreviewField>
                <PreviewField label="Email">
                  <input
                    type="email"
                    value={row.candidate.email}
                    onChange={(event) =>
                      onUpdate(row.rowNumber, { email: event.target.value })
                    }
                    className="input"
                  />
                </PreviewField>
                <PreviewField label="No. HP">
                  <input
                    value={row.candidate.phoneNumber}
                    onChange={(event) =>
                      onUpdate(row.rowNumber, {
                        phoneNumber: event.target.value,
                      })
                    }
                    className="input"
                  />
                </PreviewField>
                <PreviewField label="Domicile City">
                  <input
                    value={row.candidate.location}
                    onChange={(event) =>
                      onUpdate(row.rowNumber, { location: event.target.value })
                    }
                    className="input"
                  />
                </PreviewField>
                <PreviewField label="Source">
                  <select
                    value={row.candidate.source}
                    onChange={(event) =>
                      onUpdate(row.rowNumber, { source: event.target.value })
                    }
                    className="input"
                  >
                    {importSourceOptions.map((source) => (
                      <option key={source} value={source}>
                        {source}
                      </option>
                    ))}
                  </select>
                </PreviewField>
                <PreviewField label="Status">
                  <select
                    value={row.candidate.statusId}
                    onChange={(event) => {
                      const status = statuses.find(
                        (item) => item.id === event.target.value,
                      );
                      onUpdate(row.rowNumber, {
                        statusId: event.target.value,
                        status: status?.name || "",
                      });
                    }}
                    className="input"
                  >
                    <option value="">Pilih status</option>
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </PreviewField>
                <PreviewField label="CV / Resume">
                  <input
                    value={row.candidate.cvLink}
                    onChange={(event) =>
                      onUpdate(row.rowNumber, { cvLink: event.target.value })
                    }
                    className="input"
                  />
                </PreviewField>
                <PreviewField label="LinkedIn">
                  <input
                    value={row.candidate.linkedInProfile}
                    onChange={(event) =>
                      onUpdate(row.rowNumber, {
                        linkedInProfile: event.target.value,
                      })
                    }
                    className="input"
                  />
                </PreviewField>
                <PreviewField label="Portfolio">
                  <input
                    value={row.candidate.portfolioLink}
                    onChange={(event) =>
                      onUpdate(row.rowNumber, {
                        portfolioLink: event.target.value,
                      })
                    }
                    className="input"
                  />
                </PreviewField>
              </div>
            </article>
                  ))}
                </div>
              </details>
            );
          })}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={importing}
            className="secondary-button disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={importing || actionableCount === 0 || invalidCount > 0}
            className="primary-button disabled:cursor-not-allowed disabled:opacity-60"
          >
            {importing ? (
              <LoadingIndicator label="Menyimpan..." />
            ) : actionableCount === 0 ? (
              "Tidak ada perubahan"
            ) : invalidCount > 0 ? (
              "Perbaiki data bermasalah"
            ) : (
              "Terapkan Sinkronisasi"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function exportCandidatesToCsv(candidates: Candidate[], roles: Role[]) {
  const headers = [
    "ID",
    "Pool Date",
    "Application for Position",
    "Full Name",
    "Email",
    "Mobile Phone Number",
    "Department",
    "Level",
    "Source",
    "Education",
    "University",
    "Major",
    "GPA",
    "Domicile City",
    "Current Salary",
    "Expected Salary",
    "LinkedIn Profile",
    "Summary HR",
    "Upload your latest resume",
    "Portfolio",
    "Psychological Test",
    "Feedback From User",
    "Status",
    "HR Interview Date",
    "User Interview Date",
  ];
  const rows = candidates.map((candidate) => [
    candidate.id,
    candidate.poolDate,
    getRoleName(roles, candidate.roleId),
    candidate.nameOfCandidate,
    candidate.email,
    candidate.phoneNumber,
    candidate.department,
    candidate.level,
    candidate.source,
    candidate.education,
    candidate.university,
    candidate.major,
    candidate.gpa,
    candidate.location,
    candidate.currentSalary,
    candidate.expectedSalary,
    candidate.linkedInProfile,
    candidate.summaryInterviewHr,
    candidate.cvLink,
    candidate.portfolioLink,
    candidate.psychologicalTest,
    candidate.feedbackFromUser,
    candidate.status,
    candidate.hrInterviewDate,
    candidate.userInterviewDate,
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => escapeCsvCell(String(value || ""))).join(","))
    .join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `candidate-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value: string) {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function parseCandidateCsv(text: string) {
  const rows = parseCsvRows(text.trim());
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => normalizeHeader(header));
  return rows.slice(1).flatMap((row) => {
    const cells = normalizeCandidateCsvRow(row, headers.length);
    if (row.every((cell) => !cell.trim())) return [];
    return [
      Object.fromEntries(
        headers.map((header, index) => [header, cells[index]?.trim() || ""]),
      ),
    ];
  });
}

function normalizeCandidateCsvRow(row: string[], expectedColumns: number) {
  if (row.length !== 1 || expectedColumns <= 1 || !row[0]?.includes(",")) {
    return row;
  }

  const recoveredRows = parseCsvRows(row[0].trim());
  const recovered = recoveredRows[0] || row;
  return recovered.length > row.length ? recovered : row;
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
  rowNumber: number,
): ImportPreviewRow {
  const warnings: string[] = [];
  const roleText = getImportValue(row, [
    "application_for_position",
    "role_applied",
    "role",
    "roleid",
  ]);
  const roleMatch = findRoleMatch(roles, roleText);
  const role = roleMatch?.role;
  if (roleText && !role) {
    warnings.push(`Role "${roleText}" belum cocok dengan role sistem.`);
  } else if (roleMatch?.isFuzzy) {
    warnings.push(`Role "${roleText}" dipetakan ke "${role?.name}".`);
  }

  const statusFromCsv = getImportValue(row, ["status", "candidate_status"]);
  const statusText =
    statusFromCsv ||
    findDefaultStatus(statuses)?.name ||
    statuses[0]?.name ||
    "";
  const status = findStatusLookup(statuses, statusText);
  if (!status)
    warnings.push("Status belum dapat dipetakan dari lookup sistem.");

  const sourceText = getImportValue(row, [
    "how_did_you_hear_about_us",
    "source",
    "sumber",
  ]);
  const sourceMatch = findSourceMatch(sourceText);
  if (sourceText && sourceMatch.isFallback) {
    warnings.push(`Source "${sourceText}" dipetakan ke Others.`);
  } else if (sourceMatch.isFuzzy) {
    warnings.push(
      `Source "${sourceText}" dipetakan ke "${sourceMatch.value}".`,
    );
  }

  const timestamp = normalizeImportTimestamp(
    getImportValue(row, ["timestamp", "pool_date", "tanggal_masuk"]),
  );
  if (!timestamp)
    warnings.push("Timestamp tidak terbaca; Pool Date memakai waktu saat ini.");

  return {
    rowNumber,
    warnings,
    operation: "create",
    targetId: getImportValue(row, ["id", "candidate_id"]),
    candidate: {
      roleId: role?.id || "",
      position: getImportValue(row, ["position", "posisi"]) || role?.name || "",
      level: getImportValue(row, ["level"]) || role?.level || "",
      nameOfCandidate: getImportValue(row, [
        "full_name",
        "name",
        "nama",
        "nama_lengkap",
        "name_of_candidate",
      ]),
      email: getImportValue(row, ["email"]),
      phoneNumber: getImportValue(row, [
        "mobile_phone_number",
        "no_hp",
        "phone",
        "phone_number",
      ]),
      department:
        getImportValue(row, ["department", "departement", "division"]) ||
        role?.department ||
        "",
      source: sourceMatch.value,
      poolDate: timestamp,
      education: getImportValue(row, ["education", "pendidikan"]),
      university: getImportValue(row, ["university", "universitas"]),
      major: getImportValue(row, ["major", "jurusan"]),
      gpa: getImportValue(row, ["gpa", "ipk"]),
      location: getImportValue(row, ["domicile_city", "location", "lokasi"]),
      currentSalary: normalizeRupiah(
        getImportValue(row, ["current_salary", "current"]),
      ),
      expectedSalary: normalizeRupiah(
        getImportValue(row, [
          "expected_salary",
          "expected",
          "excpected_salary",
        ]),
      ),
      linkedInProfile: getImportValue(row, [
        "linkedin_profile",
        "linkedin",
        "linked_in_profile",
      ]),
      summaryInterviewHr: getImportValue(row, [
        "summary_hr",
        "summary_interview_hr",
      ]),
      cvLink: getImportValue(row, [
        "upload_your_latest_resume",
        "cv",
        "resume",
        "cv_link",
      ]),
      portfolioLink: getImportValue(row, ["portfolio", "portfolio_link"]),
      psychologicalTest: getImportValue(row, [
        "psychological_test",
        "psikotes",
      ]),
      feedbackFromUser: getImportValue(row, [
        "summary_user",
        "feedback_from_user",
      ]),
      statusId: status?.id || "",
      status: status?.name || statusText,
      hrInterviewDate: normalizeImportTimestamp(
        getImportValue(row, ["hr_interview_date"]),
      ),
      userInterviewDate: normalizeImportTimestamp(
        getImportValue(row, ["user_interview_date"]),
      ),
    },
  };
}

function addDuplicateImportWarnings(
  rows: ImportPreviewRow[],
  existingCandidates: Candidate[],
) {
  const rowsByKey = new Map<string, ImportPreviewRow[]>();
  for (const row of rows) {
    if (row.operation === "delete") continue;
    const key = candidateNameRoleKey(row.candidate);
    if (!key) continue;
    rowsByKey.set(key, [...(rowsByKey.get(key) || []), row]);
  }

  const databaseByKey = new Map<string, Candidate[]>();
  for (const candidate of existingCandidates) {
    const key = candidateNameRoleKey(candidate);
    if (!key) continue;
    databaseByKey.set(key, [...(databaseByKey.get(key) || []), candidate]);
  }

  return rows.map((row) => {
    if (row.operation === "delete") return row;
    const key = candidateNameRoleKey(row.candidate);
    if (!key) return row;

    const warnings = [...row.warnings];
    const csvDuplicates = (rowsByKey.get(key) || []).filter(
      (item) => item.rowNumber !== row.rowNumber,
    );
    if (csvDuplicates.length > 0) {
      warnings.push(
        `Duplikat dalam data import: nama dan role sama dengan data ${csvDuplicates
          .map((item) => item.rowNumber)
          .join(", ")}.`,
      );
    }

    const databaseDuplicates = (databaseByKey.get(key) || []).filter(
      (candidate) => candidate.id !== row.targetId,
    );
    if (databaseDuplicates.length > 0) {
      warnings.push(
        "Duplikat di database: sudah ada kandidat dengan nama dan role yang sama.",
      );
    }

    return { ...row, warnings };
  });
}

function buildImportPreview(
  rows: ImportPreviewRow[],
  existingCandidates: Candidate[],
  deleteMissingCandidates: boolean,
) {
  return addDuplicateImportWarnings(
    planImportOperations(rows, existingCandidates, deleteMissingCandidates),
    existingCandidates,
  );
}

function planImportOperations(
  rows: ImportPreviewRow[],
  existingCandidates: Candidate[],
  isSystemExport: boolean,
) {
  const existingById = new Map(
    existingCandidates.map((candidate) => [candidate.id, candidate]),
  );
  const idCounts = new Map<string, number>();
  for (const row of rows) {
    const id = row.targetId?.trim();
    if (id) idCounts.set(id, (idCounts.get(id) || 0) + 1);
  }
  const idsInFile = new Set(
    rows.map((row) => row.targetId?.trim()).filter(Boolean),
  );
  const plannedRows = rows.map((row) => {
    const id = row.targetId?.trim();
    if (!id) return { ...row, operation: "create" as const, targetId: undefined };

    if ((idCounts.get(id) || 0) > 1) {
      return {
        ...row,
        operation: "error" as const,
        warnings: [
          ...row.warnings,
          `ID ${id} muncul lebih dari satu kali dalam file. Setiap ID hanya boleh memiliki satu data.`,
        ],
      };
    }

    const existing = existingById.get(id);
    if (!existing) {
      return {
        ...row,
        operation: "error" as const,
        warnings: [
          ...row.warnings,
          "ID kandidat tidak ditemukan di database. Data ini tidak dapat diperbarui.",
        ],
      };
    }

    const changes = getCandidateChanges(existing, row.candidate);
    return {
      ...row,
      operation: changes.length > 0 ? ("update" as const) : ("noop" as const),
      targetId: id,
      changes,
    };
  });

  if (!isSystemExport) return plannedRows;

  const deleteRows = existingCandidates
    .filter((candidate) => !idsInFile.has(candidate.id))
    .map((candidate, index) => ({
      rowNumber: plannedRows.length + index + 1,
      candidate: candidateToImportData(candidate),
      warnings: [
        "Data ini ada di database tetapi tidak terdapat pada file sinkronisasi.",
      ],
      operation: "delete" as const,
      targetId: candidate.id,
    }));

  return [...plannedRows, ...deleteRows];
}

function candidateToImportData(candidate: Candidate): CandidateImportData {
  return {
    roleId: candidate.roleId,
    position: candidate.position,
    level: candidate.level,
    nameOfCandidate: candidate.nameOfCandidate,
    email: candidate.email,
    phoneNumber: candidate.phoneNumber,
    department: candidate.department,
    source: candidate.source,
    poolDate: candidate.poolDate,
    education: candidate.education,
    university: candidate.university,
    major: candidate.major,
    gpa: candidate.gpa,
    location: candidate.location,
    currentSalary: candidate.currentSalary,
    expectedSalary: candidate.expectedSalary,
    linkedInProfile: candidate.linkedInProfile,
    summaryInterviewHr: candidate.summaryInterviewHr,
    cvLink: candidate.cvLink,
    portfolioLink: candidate.portfolioLink,
    psychologicalTest: candidate.psychologicalTest,
    feedbackFromUser: candidate.feedbackFromUser,
    statusId: candidate.statusId,
    status: candidate.status,
    hrInterviewDate: candidate.hrInterviewDate,
    userInterviewDate: candidate.userInterviewDate,
  };
}

function getCandidateChanges(
  existing: Candidate,
  next: CandidateImportData,
) {
  const fields: { key: keyof CandidateImportData; label: string }[] = [
    { key: "roleId", label: "Role" },
    { key: "position", label: "Posisi" },
    { key: "level", label: "Level" },
    { key: "nameOfCandidate", label: "Nama" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "No. HP" },
    { key: "department", label: "Departemen" },
    { key: "source", label: "Source" },
    { key: "poolDate", label: "Pool Date" },
    { key: "location", label: "Domisili" },
    { key: "cvLink", label: "CV" },
    { key: "linkedInProfile", label: "LinkedIn" },
    { key: "portfolioLink", label: "Portfolio" },
    { key: "statusId", label: "Status" },
    { key: "hrInterviewDate", label: "Tanggal Interview HR" },
    { key: "userInterviewDate", label: "Tanggal Interview User" },
  ];
  return fields
    .filter(
      (field) =>
        !areCandidateValuesEqual(
          field.key,
          String(existing[field.key] || ""),
          String(next[field.key] || ""),
        ),
    )
    .map((field) => field.label);
}

function areCandidateValuesEqual(
  key: keyof CandidateImportData,
  existing: string,
  next: string,
) {
  if (["poolDate", "hrInterviewDate", "userInterviewDate"].includes(key)) {
    if (isDateOnly(existing) || isDateOnly(next)) {
      return calendarDateInJakarta(existing) === calendarDateInJakarta(next);
    }
    return normalizeComparableDateTime(existing) === normalizeComparableDateTime(next);
  }

  if (key === "phoneNumber") {
    return normalizePhoneNumber(existing) === normalizePhoneNumber(next);
  }

  return existing.trim() === next.trim();
}

function normalizeComparableDateTime(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return `date:${trimmed}`;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;

  const jakartaDate = new Date(parsed.getTime() + 7 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const hasMidnightTime =
    parsed.getUTCHours() === 0 &&
    parsed.getUTCMinutes() === 0 &&
    parsed.getUTCSeconds() === 0;
  return hasMidnightTime ? `date:${jakartaDate}` : parsed.toISOString();
}

function isDateOnly(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value.trim());
}

function calendarDateInJakarta(value: string) {
  const trimmed = value.trim();
  if (isDateOnly(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return new Date(parsed.getTime() + 7 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

function candidateNameRoleKey(
  candidate: Pick<Candidate, "nameOfCandidate" | "roleId" | "position">,
) {
  const name = normalizeImportText(candidate.nameOfCandidate);
  const role = candidate.roleId || normalizeImportText(candidate.position);
  return name && role ? `${name}::${role}` : "";
}

function findRoleMatch(roles: Role[], value: string) {
  const trimmed = value.trim();
  const normalized = normalizeImportText(value);
  if (!trimmed && !normalized) return undefined;

  const exact = roles.find(
    (item) =>
      item.id === trimmed ||
      item.name.trim().toLowerCase() === trimmed.toLowerCase() ||
      normalizeImportText(item.name) === normalized,
  );
  if (exact) return { role: exact, isFuzzy: false };

  const closest = findClosestMatch(value, roles, (role) => role.name);
  return closest && closest.score >= 0.78
    ? { role: closest.item, isFuzzy: true }
    : undefined;
}

function findStatusLookup(statuses: CandidateStatusLookup[], value: string) {
  const normalized = normalizeImportText(value);
  if (!normalized) return undefined;
  const exact = statuses.find(
    (item) =>
      normalizeImportText(item.id) === normalized ||
      normalizeImportText(item.name) === normalized,
  );
  if (exact) return exact;

  const closest = findClosestMatch(value, statuses, (status) => status.name);
  return closest && closest.score >= 0.78 ? closest.item : undefined;
}

function findDefaultStatus(statuses: CandidateStatusLookup[]) {
  return (
    statuses.find((status) =>
      /new|belum diproses|hr interview/i.test(status.name),
    ) || statuses[0]
  );
}

function findSourceMatch(value: string) {
  const normalized = normalizeImportText(value);
  if (!normalized) return { value: "Others", isFuzzy: false, isFallback: true };

  const aliases: Record<string, string[]> = {
    "Google Form": [
      "google form",
      "google forms",
      "instagram",
      "tiktok",
      "social media",
      "doki",
    ],
    LinkedIn: ["linkedin", "linked in"],
    Kalibrr: ["kalibrr"],
    Glints: ["glints"],
    Email: ["email", "e mail"],
    Referral: ["referral", "referal", "teman", "rekomendasi", "recommendation"],
    Others: ["others", "other", "lainnya"],
  };

  for (const [source, words] of Object.entries(aliases)) {
    if (words.some((word) => normalized.includes(normalizeImportText(word)))) {
      return {
        value: source,
        isFuzzy: normalizeImportText(source) !== normalized,
        isFallback: false,
      };
    }
  }

  const closest = findClosestMatch(
    value,
    importSourceOptions,
    (source) => source,
  );
  return closest && closest.score >= 0.78
    ? { value: closest.item, isFuzzy: true, isFallback: false }
    : { value: "Others", isFuzzy: false, isFallback: true };
}

function findClosestMatch<T>(
  value: string,
  items: T[],
  getLabel: (item: T) => string,
) {
  const target = normalizeImportText(value);
  if (!target) return undefined;

  return items.reduce<{ item: T; score: number } | undefined>((best, item) => {
    const label = normalizeImportText(getLabel(item));
    const score = similarityScore(target, label);
    return !best || score > best.score ? { item, score } : best;
  }, undefined);
}

function similarityScore(first: string, second: string) {
  if (first === second) return 1;
  if (first.includes(second) || second.includes(first)) return 0.9;

  const longer = Math.max(first.length, second.length);
  if (!longer) return 0;
  return 1 - levenshteinDistance(first, second) / longer;
}

function levenshteinDistance(first: string, second: string) {
  let previous = Array.from({ length: second.length + 1 }, (_, index) => index);

  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    const current = [firstIndex];
    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      current[secondIndex] = Math.min(
        current[secondIndex - 1] + 1,
        previous[secondIndex] + 1,
        previous[secondIndex - 1] +
          (first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1),
      );
    }
    previous = current;
  }

  return previous[second.length];
}

function validateImportedCandidate(
  candidate: Omit<
    Candidate,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "roleName"
    | "statusName"
    | "statusColorHex"
  >,
) {
  const errors: string[] = [];

  if (!candidate.nameOfCandidate.trim()) {
    errors.push("Name of Candidate wajib diisi.");
  }

  if (!candidate.position.trim()) {
    errors.push("Position wajib diisi.");
  }

  if (!candidate.poolDate) {
    errors.push("Pool Date wajib diisi dan harus memakai tanggal serta jam yang valid.");
  }

  if (!candidate.roleId) {
    errors.push("Role yang Dilamar wajib dipilih dari role yang tersedia.");
  }

  if (!candidate.statusId) {
    errors.push("Status wajib dipilih dari status yang tersedia.");
  }

  return errors;
}

function buildImportResultDialog(
  createdCount: number,
  updatedCount: number,
  deletedCount: number,
  failed: ImportFailure[],
): ResultDialogState {
  const successCount = createdCount + updatedCount + deletedCount;
  const summary = `${createdCount} dibuat, ${updatedCount} diperbarui, ${deletedCount} dihapus`;
  if (failed.length === 0) {
    return {
      title: "Sinkronisasi berhasil",
      description: `${summary}.`,
      tone: "success",
    };
  }

  if (successCount === 0) {
    return {
      title: "Import gagal",
      description: `Tidak ada perubahan yang berhasil diterapkan. ${failed.length} data gagal diproses.`,
      tone: "error",
      failures: failed,
    };
  }

  return {
    title: "Sinkronisasi selesai dengan catatan",
    description: `${summary}. ${failed.length} data gagal diproses.`,
    tone: "warning",
    failures: failed,
  };
}

function getImportValue(row: Record<string, string>, keys: string[]) {
  for (const key of keys) {
    const value = row[normalizeHeader(key)];
    if (value) return value;
  }
  return "";
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replaceAll(/^_|_$/g, "");
}

function normalizeRupiah(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return value.trim();
  return `Rp ${Number(digits).toLocaleString("id-ID")}`;
}

function normalizeImportDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed || /^[a-z\s]+$/i.test(trimmed)) return "";

  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return validDateParts(year, month, day)
      ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      : "";
  }

  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!slashMatch) return "";

  const [, first, second, year] = slashMatch;
  const dayFirst =
    Number(first) > 12 || Number(second) <= 12
      ? { day: first, month: second }
      : { day: second, month: first };

  return validDateParts(year, dayFirst.month, dayFirst.day)
    ? `${year}-${dayFirst.month.padStart(2, "0")}-${dayFirst.day.padStart(2, "0")}`
    : "";
}

function normalizeImportTimestamp(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  // Google Forms exports local Jakarta time as DD/MM/YYYY HH:mm:ss.
  const googleFormsMatch = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?$/,
  );
  if (googleFormsMatch) {
    const [, day, month, year, hour, minute, second = "0"] = googleFormsMatch;
    const validTime =
      Number(hour) >= 0 &&
      Number(hour) <= 23 &&
      Number(minute) >= 0 &&
      Number(minute) <= 59 &&
      Number(second) >= 0 &&
      Number(second) <= 59;

    if (!validDateParts(year, month, day) || !validTime) return "";

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute}:${second.padStart(2, "0")}+07:00`;
  }

  // System exports dates without a time component. Keep that representation so
  // an immediate export-import cycle is recognised as unchanged.
  const dateOnly = normalizeImportDate(trimmed);
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed) && dateOnly) {
    return dateOnly;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function toDateTimeLocalValue(value: string) {
  const dateTime = value.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
  if (dateTime) return `${dateTime[1]}T${dateTime[2]}:${dateTime[3]}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00` : "";
}

function validDateParts(year: string, month: string, day: string) {
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const parsedDay = Number(day);
  if (
    !Number.isInteger(parsedYear) ||
    !Number.isInteger(parsedMonth) ||
    !Number.isInteger(parsedDay)
  ) {
    return false;
  }

  const date = new Date(Date.UTC(parsedYear, parsedMonth - 1, parsedDay));
  return (
    date.getUTCFullYear() === parsedYear &&
    date.getUTCMonth() === parsedMonth - 1 &&
    date.getUTCDate() === parsedDay
  );
}

function normalizeImportText(value: string) {
  return value
    .normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, " ")
    .replaceAll(/\s+/g, " ");
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

function ResultDialog({
  result,
  onClose,
}: {
  result: ResultDialogState;
  onClose: () => void;
}) {
  if (!result) return null;

  const toneClass =
    result.tone === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : result.tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className={`rounded-2xl border px-4 py-3 ${toneClass}`}>
          <h3 className="text-2xl font-black text-slate-950">{result.title}</h3>
          <p className="mt-2 text-sm font-semibold leading-6">
            {result.description}
          </p>
        </div>

        {result.failures && result.failures.length > 0 && (
          <div className="mt-5 min-h-0 overflow-y-auto pr-1">
            <p className="mb-3 text-sm font-black text-slate-800">
              Detail data yang gagal
            </p>
            <div className="space-y-3">
              {result.failures.map((failure) => (
                <div
                  key={failure.rowNumber}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-black text-slate-950">
                      Data {failure.rowNumber}
                    </p>
                    <p className="text-slate-500">
                      {failure.candidate.nameOfCandidate || "Nama kosong"}
                    </p>
                  </div>
                  <dl className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                    <div>
                      <dt className="font-black text-slate-500">Email</dt>
                      <dd className="break-words">
                        {failure.candidate.email || "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-black text-slate-500">Position</dt>
                      <dd className="break-words">
                        {failure.candidate.position || "-"}
                      </dd>
                    </div>
                  </dl>
                  <ul className="mt-3 space-y-1 text-sm font-semibold text-rose-700">
                    {failure.errors.map((item) => (
                      <li key={item}>- {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="primary-button">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
