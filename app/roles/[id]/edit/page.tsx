"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoleForm } from "@/components/RoleForm";
import {
  LookupItem,
  Role,
  fetchLookups,
  fetchRole,
  updateRole,
} from "@/lib/recruitment";

export default function EditRolePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [role, setRole] = useState<Role | null>(null);
  const [roleStatuses, setRoleStatuses] = useState<LookupItem[]>([]);

  useEffect(() => {
    Promise.all([fetchLookups(), fetchRole(id)]).then(([lookups, found]) => {
      setRoleStatuses(lookups.roleStatuses);
      setRole(found);
    });
  }, [id]);

  async function handleSubmit(data: Omit<Role, "id" | "createdAt" | "updatedAt">) {
    await updateRole(id, data);
    router.push("/roles");
  }

  if (!role) {
    return (
      <div className="card">
        <h3 className="text-2xl font-black">Role not found</h3>
        <p className="mt-2 text-slate-500">Role tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <RoleForm
      roleStatusesLookup={roleStatuses}
      initialRole={role}
      submitLabel="Update Role"
      onSubmit={handleSubmit}
    />
  );
}
