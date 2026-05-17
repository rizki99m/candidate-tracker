"use client";

import { useRouter } from "next/navigation";
import { RoleForm } from "@/components/RoleForm";
import {
  Role,
  createId,
  loadRoles,
  saveRoles,
  todayString,
} from "@/lib/recruitment";

export default function NewRolePage() {
  const router = useRouter();

  function handleSubmit(data: Omit<Role, "id" | "createdAt">) {
    const role: Role = {
      id: createId("role"),
      createdAt: todayString(),
      ...data,
    };

    const roles = loadRoles();
    saveRoles([role, ...roles]);
    router.push("/roles");
  }

  return <RoleForm submitLabel="Save Role" onSubmit={handleSubmit} />;
}