"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    fetchLookups().then((lookups) => setRoleStatuses(lookups.roleStatuses));
  }, []);

  async function handleSubmit(data: Omit<Role, "id" | "createdAt" | "updatedAt">) {
    await createRole(data);
    router.push("/roles");
  }

  return (
    <RoleForm
      roleStatusesLookup={roleStatuses}
      submitLabel="Save Role"
      onSubmit={handleSubmit}
    />
  );
}
