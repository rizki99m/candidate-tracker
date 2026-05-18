"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CandidateForm } from "@/components/CandidateForm";
import {
  Candidate,
  Role,
  loadCandidates,
  loadRoles,
  saveCandidates,
} from "@/lib/recruitment";

export default function EditCandidatePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [roles, setRoles] = useState<Role[]>([]);
  const [candidate, setCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setRoles(loadRoles());
      setCandidate(loadCandidates().find((item) => item.id === id) || null);
    });
  }, [id]);

  function handleSubmit(data: Omit<Candidate, "id" | "createdAt">) {
    const candidates = loadCandidates();

    const updated = candidates.map((item) =>
      item.id === id
        ? {
            ...item,
            ...data,
          }
        : item,
    );

    saveCandidates(updated);
    router.push("/candidates");
  }

  if (!candidate) {
    return (
      <div className="card">
        <h3 className="text-2xl font-black">Candidate not found</h3>
        <p className="mt-2 text-slate-500">Kandidat tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <CandidateForm
      roles={roles}
      initialCandidate={candidate}
      submitLabel="Update Candidate"
      onSubmit={handleSubmit}
    />
  );
}
