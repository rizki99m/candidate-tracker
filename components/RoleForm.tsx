"use client";

import { useState } from "react";
import { LookupItem, Role, RoleStatus, roleStatuses } from "@/lib/recruitment";

export function RoleForm({
  initialRole,
  roleStatusesLookup = [],
  submitLabel,
  onSubmit,
}: {
  initialRole?: Partial<Role>;
  roleStatusesLookup?: LookupItem[];
  submitLabel: string;
  onSubmit: (
    data: Omit<Role, "id" | "createdAt" | "updatedAt">
  ) => void;
}) {
  const [form, setForm] = useState({
    name: initialRole?.name || "",
    department: initialRole?.department || "",
    level: initialRole?.level || "",
    statusId: initialRole?.statusId || roleStatusesLookup[0]?.id || "",
    status: (initialRole?.status || "Active") as RoleStatus,
    notes: initialRole?.notes || "",
  });

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Role Name wajib diisi.");
      return;
    }

    onSubmit({
      name: form.name.trim(),
      department: form.department.trim(),
      level: form.level.trim(),
      statusId: form.statusId,
      status: form.status,
      notes: form.notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <h3 className="text-2xl font-black text-slate-950">{submitLabel}</h3>
        <p className="mt-2 text-sm text-slate-500">
          Role harus dibuat dulu sebelum kandidat bisa diinput.
        </p>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Role Name
        </span>
        <input
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          placeholder="Art Director"
          className="input"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Department
          </span>
          <input
            value={form.department}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                department: event.target.value,
              }))
            }
            placeholder="Creative / Sales / Account"
            className="input"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">
            Level
          </span>
          <input
            value={form.level}
            onChange={(event) =>
              setForm((current) => ({ ...current, level: event.target.value }))
            }
            placeholder="Senior / Staff / Intern"
            className="input"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Status
        </span>
        <select
          value={form.statusId}
          onChange={(event) => {
            const selected = roleStatusesLookup.find(
              (item) => item.id === event.target.value,
            );
            setForm((current) => ({
              ...current,
              statusId: event.target.value,
              status: (selected?.name || event.target.value) as RoleStatus,
            }));
          }}
          className="input"
        >
          {(roleStatusesLookup.length
            ? roleStatusesLookup
            : roleStatuses.map((status) => ({ id: status, name: status }))
          ).map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">
          Notes
        </span>
        <textarea
          value={form.notes}
          onChange={(event) =>
            setForm((current) => ({ ...current, notes: event.target.value }))
          }
          rows={5}
          placeholder="Catatan kebutuhan role..."
          className="input"
        />
      </label>

      <button type="submit" className="primary-button w-full sm:w-auto">
        {submitLabel}
      </button>
    </form>
  );
}
