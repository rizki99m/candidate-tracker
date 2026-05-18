"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CandidateForm } from "@/components/CandidateForm";
import {
  Candidate,
  Role,
  createId,
  loadCandidates,
  loadRoles,
  saveCandidates,
  todayString,
} from "@/lib/recruitment";

export default function NewCandidatePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    queueMicrotask(() => setRoles(loadRoles()));
  }, []);

  function handleSubmit(data: Omit<Candidate, "id" | "createdAt">) {
    const candidate: Candidate = {
      id: createId("candidate"),
      createdAt: todayString(),
      ...data,
    };

    const candidates = loadCandidates();
    saveCandidates([candidate, ...candidates]);
    router.push("/candidates");
  }

  return (
    <CandidateForm
      roles={roles}
      submitLabel="Save Candidate"
      onSubmit={handleSubmit}
    />
  );
}
