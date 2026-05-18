"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { InteractiveValue } from "@/components/InteractiveValue";
import {
  PageSize,
  PaginationControls,
} from "@/components/PaginationControls";
import { Role, loadCandidates, loadRoles, saveRoles } from "@/lib/recruitment";

type SearchColumn = "name" | "department" | "level" | "status" | "notes";

const emptySearchFilters: Record<SearchColumn, string> = {
  name: "",
  department: "",
  level: "",
  status: "",
  notes: "",
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [detailRole, setDetailRole] = useState<Role | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState(emptySearchFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);

  useEffect(() => {
    queueMicrotask(() => setRoles(loadRoles()));
  }, []);

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const raw = searchQuery.trim().toLowerCase();
      const values = [
        role.name,
        role.department,
        role.level,
        role.status,
        role.notes,
      ];
      const matchesGlobal =
        !raw || values.some((value) => value.toLowerCase().includes(raw));

      const matchesAdvanced = (
        Object.entries(searchFilters) as [SearchColumn, string][]
      ).every(([column, value]) => {
        const filter = value.trim().toLowerCase();
        if (!filter) return true;
        return roleSearchValue(role, column).toLowerCase().includes(filter);
      });

      return matchesGlobal && matchesAdvanced;
    });
  }, [roles, searchFilters, searchQuery]);

  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filteredRoles.length / pageSize)),
  );
  const paginatedRoles = filteredRoles.slice(
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

  function deleteRole() {
    if (!selectedRole) return;

    const candidates = loadCandidates();
    const isUsed = candidates.some(
      (candidate) => candidate.roleId === selectedRole.id,
    );

    if (isUsed) {
      alert("Role ini masih dipakai kandidat. Ubah/hapus kandidatnya dulu.");
      setSelectedRole(null);
      return;
    }

    const updated = roles.filter((role) => role.id !== selectedRole.id);
    saveRoles(updated);
    setRoles(updated);
    setSelectedRole(null);
  }

  return (
    <section className="space-y-6">
      <div className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/roles/new" className="primary-button">
            Add Role
          </Link>

          <div className="w-full max-w-md">
            <label className="block">
              <span className="sr-only">Search role name</span>
              <div className="flex items-center gap-2">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all role columns..."
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
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Field label="Role Name">
                <input
                  value={searchFilters.name}
                  onChange={(e) => updateSearchFilter("name", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Department">
                <input
                  value={searchFilters.department}
                  onChange={(e) =>
                    updateSearchFilter("department", e.target.value)
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
              <Field label="Status">
                <input
                  value={searchFilters.status}
                  onChange={(e) => updateSearchFilter("status", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Notes">
                <input
                  value={searchFilters.notes}
                  onChange={(e) => updateSearchFilter("notes", e.target.value)}
                  className="input"
                />
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

      <div className="hidden max-w-full overflow-x-auto rounded-[2rem] border border-white bg-white shadow-sm md:block">
        <table className="w-full min-w-[1200px] border-collapse text-left text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedRoles.map((role, index) => (
              <tr key={role.id}>
                <td className="max-w-[180px] px-4 py-4 text-xs text-slate-500">
                  {(currentPage - 1) * pageSize + index + 1}
                </td>
                <td className="px-4 py-4">
                  <p className="font-black">
                    <InteractiveValue value={role.name} />
                  </p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  <InteractiveValue value={role.department} />
                </td>
                <td className="px-4 py-4 text-slate-600">
                  <InteractiveValue value={role.level} />
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                    {role.status}
                  </span>
                </td>
                <td className="max-w-xs px-4 py-4 text-slate-600">
                  <InteractiveValue value={role.notes} />
                </td>
                <td className="px-4 py-4 text-slate-600">
                  <InteractiveValue value={role.createdAt} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setDetailRole(role)}
                      className="secondary-button px-3 py-2 text-xs"
                    >
                      Detail
                    </button>
                    <Link
                      href={`/roles/${role.id}/edit`}
                      className="secondary-button px-3 py-2 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setSelectedRole(role)}
                      className="danger-button px-3 py-2 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {paginatedRoles.map((role) => (
          <div key={role.id} className="card">
            <p className="text-lg font-black">
              <InteractiveValue value={role.name} />
            </p>
            <p className="mt-1 text-sm text-slate-500">
              <InteractiveValue value={role.department} /> /{" "}
              <InteractiveValue value={role.level} />
            </p>
            <p className="mt-3 text-sm text-slate-600">
              <InteractiveValue value={role.notes} />
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => setDetailRole(role)}
                className="secondary-button text-sm"
              >
                Detail
              </button>
              <Link
                href={`/roles/${role.id}/edit`}
                className="secondary-button text-sm"
              >
                Edit
              </Link>
              <button
                onClick={() => setSelectedRole(role)}
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
        totalItems={filteredRoles.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <ConfirmDialog
        open={!!selectedRole}
        title="Delete Role?"
        description={`Role "${selectedRole?.name}" akan dihapus. Action ini tidak bisa dibatalkan.`}
        confirmText="Delete Role"
        onClose={() => setSelectedRole(null)}
        onConfirm={deleteRole}
      />

      <RoleDetailDialog role={detailRole} onClose={() => setDetailRole(null)} />
    </section>
  );
}

function RoleDetailDialog({
  role,
  onClose,
}: {
  role: Role | null;
  onClose: () => void;
}) {
  if (!role) return null;

  const rows: { label: string; value: string }[] = [
    { label: "ID", value: role.id },
    { label: "Role", value: role.name },
    { label: "Department", value: role.department },
    { label: "Level", value: role.level },
    { label: "Status", value: role.status },
    { label: "Notes", value: role.notes },
    { label: "Created At", value: role.createdAt },
  ];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black text-slate-950">
              Role Detail
            </h3>
            <p className="mt-1 text-sm text-slate-500">{role.name}</p>
          </div>
          <button type="button" onClick={onClose} className="secondary-button">
            Close
          </button>
        </div>

        <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200">
          {rows.map((row) => (
            <div
              key={row.label}
              className="grid gap-2 p-4 text-sm md:grid-cols-[180px_1fr]"
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

function roleSearchValue(role: Role, column: SearchColumn) {
  if (column === "name") return role.name;
  if (column === "department") return role.department;
  if (column === "level") return role.level;
  if (column === "status") return role.status;
  return role.notes;
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
