"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { RoleForm } from "@/components/RoleForm";
import {
  LookupItem,
  Role,
  createRole,
  fetchLookups,
} from "@/lib/recruitment";

export default function NewRolePage() {
  const router = useRouter();
  const [roleStatuses, setRoleStatuses] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLookups()
      .then((lookups) => setRoleStatuses(lookups.roleStatuses))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(data: Omit<Role, "id" | "createdAt" | "updatedAt">) {
    await createRole(data);
    router.push("/roles");
  }

  if (loading) {
    return (
      <div className="card text-sm font-semibold text-slate-500">
        <LoadingIndicator label="Loading form data from database..." />
      </div>
    );
  }

  return (
    <RoleForm
      roleStatusesLookup={roleStatuses}
      submitLabel="Save Role"
      onSubmit={handleSubmit}
    />
  );
}
