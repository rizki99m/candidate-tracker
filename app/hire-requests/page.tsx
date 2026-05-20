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
  HireRequest,
  deleteHireRequest as deleteHireRequestRequest,
  fetchHireRequests,
  hireRequestStatusClass,
} from "@/lib/recruitment";

type SearchColumn =
  | "requestedBy"
  | "reasonForHiring"
  | "positionTitle"
  | "departmentDivision"
  | "employmentType"
  | "teamMembersNeeded"
  | "expectedJoinDate"
  | "descriptionScopeOfWork"
  | "experienceRequirementsSkills"
  | "additionalNiceToHaveSkills"
  | "workingExperience"
  | "educationRequired"
  | "majoringPreferences"
  | "ageRange"
  | "preferencesGender"
  | "preferencesCandidateResidencies"
  | "status"
  | "isUrgent"
  | "createdAt";

const columnLabels: { key: SearchColumn; label: string }[] = [
  { key: "requestedBy", label: "Requested By" },
  { key: "reasonForHiring", label: "Reason for Hiring" },
  { key: "positionTitle", label: "Position Title" },
  { key: "departmentDivision", label: "Department/Division" },
  { key: "employmentType", label: "Employment Type" },
  { key: "teamMembersNeeded", label: "Team Member Needed" },
  { key: "expectedJoinDate", label: "Expected Join Date" },
  { key: "descriptionScopeOfWork", label: "Description Scope Of Work" },
  {
    key: "experienceRequirementsSkills",
    label: "Experience Requirements and Skills",
  },
  {
    key: "additionalNiceToHaveSkills",
    label: "Additional nice to have Skills",
  },
  { key: "workingExperience", label: "Working Experience" },
  { key: "educationRequired", label: "Education Required" },
  { key: "majoringPreferences", label: "Majoring Preferences" },
  { key: "ageRange", label: "Age Range" },
  { key: "preferencesGender", label: "Preferences Gender" },
  {
    key: "preferencesCandidateResidencies",
    label: "Preferences Candidate Residencies",
  },
  { key: "status", label: "Status" },
  { key: "isUrgent", label: "Urgency" },
  { key: "createdAt", label: "Created At" },
];

const emptySearchFilters = Object.fromEntries(
  columnLabels.map((column) => [column.key, ""]),
) as Record<SearchColumn, string>;

export default function HireRequestsPage() {
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
  const [selectedHireRequest, setSelectedHireRequest] =
    useState<HireRequest | null>(null);
  const [detailHireRequest, setDetailHireRequest] =
    useState<HireRequest | null>(null);
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
        setHireRequests(await fetchHireRequests());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal memuat hire requests.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredHireRequests = useMemo(() => {
    return hireRequests.filter((hireRequest) => {
      const raw = searchQuery.trim().toLowerCase();
      const matchesGlobal =
        !raw ||
        columnLabels.some((column) =>
          hireRequestSearchValue(hireRequest, column.key)
            .toLowerCase()
            .includes(raw),
        );

      const matchesAdvanced = (
        Object.entries(searchFilters) as [SearchColumn, string][]
      ).every(([column, value]) => {
        const filter = value.trim().toLowerCase();
        if (!filter) return true;
        return hireRequestSearchValue(hireRequest, column)
          .toLowerCase()
          .includes(filter);
      });

      return matchesGlobal && matchesAdvanced;
    });
  }, [hireRequests, searchFilters, searchQuery]);

  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filteredHireRequests.length / pageSize)),
  );
  const paginatedHireRequests = filteredHireRequests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    queueMicrotask(() => setPage(1));
  }, [searchFilters, searchQuery, pageSize]);

  function updateSearchFilter(column: SearchColumn, value: string) {
    setSearchFilters((current) => ({ ...current, [column]: value }));
  }

  function clearSearch() {
    setSearchQuery("");
    setSearchFilters(emptySearchFilters);
  }

  async function deleteHireRequest() {
    if (!selectedHireRequest) return;

    try {
      await deleteHireRequestRequest(selectedHireRequest.id);
      setHireRequests((current) =>
        current.filter((hireRequest) => hireRequest.id !== selectedHireRequest.id),
      );
      setSelectedHireRequest(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus hire request.");
    }
  }

  return (
    <section className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/hire-requests/new" className="primary-button">
            Add Hire Request
          </Link>

          <div className="w-full max-w-md">
            <label className="block">
              <span className="sr-only">Search hire request</span>
              <div className="flex items-center gap-2">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search all hire request columns..."
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
              {columnLabels.map((column) => (
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
          Loading hire requests...
        </div>
      )}

      {!loading && <div className="hidden max-w-full overflow-x-auto rounded-[2rem] border border-white bg-white shadow-sm xl:block">
        <table className="w-full min-w-[2900px] border-collapse text-left text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="px-4 py-3">No</th>
              {columnLabels.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3">Flag</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedHireRequests.map((hireRequest, index) => (
              <tr key={hireRequest.id} className="align-top">
                <td className="px-4 py-4 text-xs text-slate-500">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                {columnLabels.map((column) => (
                  <td
                    key={column.key}
                    className="max-w-xs px-4 py-4 text-slate-600"
                  >
                    {column.key === "status" ? (
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${hireRequestStatusClass(
                          hireRequest.status,
                        )}`}
                      >
                        {hireRequest.status}
                      </span>
                    ) : column.key === "isUrgent" ? (
                      hireRequest.isUrgent ? "Urgent" : "-"
                    ) : (
                      <InteractiveValue
                        value={hireRequestSearchValue(
                          hireRequest,
                          column.key,
                        )}
                      />
                    )}
                  </td>
                ))}
                <td className="px-4 py-4">
                  {hireRequest.isUrgent && <UrgentBadge />}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setDetailHireRequest(hireRequest)}
                      className="secondary-button px-3 py-2 text-xs"
                    >
                      Detail
                    </button>
                    <Link
                      href={`/hire-requests/${hireRequest.id}/edit`}
                      className="secondary-button px-3 py-2 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setSelectedHireRequest(hireRequest)}
                      className="danger-button px-3 py-2 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredHireRequests.length === 0 && (
              <tr>
                <td
                  colSpan={columnLabels.length + 3}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Belum ada hire request.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>}

      <div className="space-y-3 xl:hidden">
        {paginatedHireRequests.map((hireRequest) => (
          <div key={hireRequest.id} className="card">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-black">
                  <InteractiveValue value={hireRequest.positionTitle} />
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  <InteractiveValue value={hireRequest.departmentDivision} /> /{" "}
                  <InteractiveValue value={hireRequest.requestedBy} />
                </p>
              </div>
              <span
                className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-black ${hireRequestStatusClass(
                  hireRequest.status,
                )}`}
              >
                {hireRequest.status}
              </span>
            </div>
            {hireRequest.isUrgent && (
              <div className="mt-3">
                <UrgentBadge />
              </div>
            )}

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                Reason: <InteractiveValue value={hireRequest.reasonForHiring} />
              </p>
              <p>
                Expected Join:{" "}
                <InteractiveValue value={hireRequest.expectedJoinDate} />
              </p>
              <p>
                Employment: <InteractiveValue value={hireRequest.employmentType} />
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => setDetailHireRequest(hireRequest)}
                className="secondary-button text-sm"
              >
                Detail
              </button>
              <Link
                href={`/hire-requests/${hireRequest.id}/edit`}
                className="secondary-button text-sm"
              >
                Edit
              </Link>
              <button
                onClick={() => setSelectedHireRequest(hireRequest)}
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
        totalItems={filteredHireRequests.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <ConfirmDialog
        open={!!selectedHireRequest}
        title="Delete Hire Request?"
        description={`Hire request "${selectedHireRequest?.positionTitle}" akan dihapus. Action ini tidak bisa dibatalkan.`}
        confirmText="Delete Hire Request"
        onClose={() => setSelectedHireRequest(null)}
        onConfirm={deleteHireRequest}
      />

      <HireRequestDetailDialog
        hireRequest={detailHireRequest}
        onClose={() => setDetailHireRequest(null)}
      />
    </section>
  );
}

function HireRequestDetailDialog({
  hireRequest,
  onClose,
}: {
  hireRequest: HireRequest | null;
  onClose: () => void;
}) {
  if (!hireRequest) return null;

  const rows = [
    { label: "ID", value: hireRequest.id },
    ...columnLabels.map((column) => ({
      label: column.label,
      value: hireRequestSearchValue(hireRequest, column.key),
    })),
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-950">
              Hire Request Detail
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {hireRequest.positionTitle}
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
              className="grid gap-2 p-4 text-sm md:grid-cols-[260px_1fr]"
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

function hireRequestSearchValue(
  hireRequest: HireRequest,
  column: SearchColumn,
) {
  if (column === "isUrgent") return hireRequest.isUrgent ? "Urgent" : "";
  return String(hireRequest[column] || "");
}

function UrgentBadge() {
  return (
    <span className="inline-flex rounded-md bg-red-600 px-3 py-1 text-xs font-black text-white">
      Urgent
    </span>
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
