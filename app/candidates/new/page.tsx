"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    setRoles(loadRoles());
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

  if (roles.length === 0) {
    return (
      <div className="card">
        <h3 className="text-2xl font-black">Role belum ada</h3>
        <p className="mt-2 text-slate-500">
          Buat role dulu sebelum input kandidat.
        </p>
        <Link href="/roles/new" className="primary-button mt-5">
          Add Role
        </Link>
      </div>
    );
  }

  return (
    <CandidateForm
      roles={roles}
      submitLabel="Save Candidate"
      onSubmit={handleSubmit}
    />
  );
}