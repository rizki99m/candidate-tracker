"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Role,
  loadCandidates,
  loadRoles,
  saveRoles,
} from "@/lib/recruitment";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    setRoles(loadRoles());
  }, []);

  function deleteRole() {
    if (!selectedRole) return;

    const candidates = loadCandidates();
    const isUsed = candidates.some(
      (candidate) => candidate.roleId === selectedRole.id
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
      <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-black">Roles</h3>
          <p className="mt-1 text-sm text-slate-500">
            Kelola role/position yang dibutuhkan.
          </p>
        </div>
        <Link href="/roles/new" className="primary-button">
          Add Role
        </Link>
      </div>

      <div className="hidden overflow-x-auto rounded-[2rem] border border-white bg-white shadow-sm md:block">
        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-4 py-4">
                  <p className="font-black">{role.name}</p>
                  <p className="text-xs text-slate-500">{role.notes || "-"}</p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {role.department || "-"}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {role.level || "-"}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                    {role.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
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
        {roles.map((role) => (
          <div key={role.id} className="card">
            <p className="text-lg font-black">{role.name}</p>
            <p className="mt-1 text-sm text-slate-500">
              {role.department || "-"} · {role.level || "-"}
            </p>
            <p className="mt-3 text-sm text-slate-600">{role.notes || "-"}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
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

      <ConfirmDialog
        open={!!selectedRole}
        title="Delete Role?"
        description={`Role "${selectedRole?.name}" akan dihapus. Action ini tidak bisa dibatalkan.`}
        confirmText="Delete Role"
        onClose={() => setSelectedRole(null)}
        onConfirm={deleteRole}
      />
    </section>
  );
}