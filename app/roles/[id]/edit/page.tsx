"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoleForm } from "@/components/RoleForm";
import { Role, loadRoles, saveRoles } from "@/lib/recruitment";

export default function EditRolePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const found = loadRoles().find((item) => item.id === id) || null;
      setRole(found);
    });
  }, [id]);

  function handleSubmit(data: Omit<Role, "id" | "createdAt">) {
    const roles = loadRoles();

    const updated = roles.map((item) =>
      item.id === id
        ? {
            ...item,
            ...data,
          }
        : item
    );

    saveRoles(updated);
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
      initialRole={role}
      submitLabel="Update Role"
      onSubmit={handleSubmit}
    />
  );
}
