"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CandidateForm } from "@/components/CandidateForm";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import {
  Candidate,
  CandidateStatusLookup,
  Role,
  fetchCandidate,
  fetchLookups,
  updateCandidate,
} from "@/lib/recruitment";

export default function EditCandidatePage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const [roles, setRoles] = useState<Role[]>([]);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [candidateStatuses, setCandidateStatuses] = useState<CandidateStatusLookup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchLookups(), fetchCandidate(id)])
      .then(([lookups, found]) => {
        setRoles(
          lookups.roles.map((role) => ({
            ...role,
            statusId: "",
            status: "Active",
            notes: "",
            createdAt: "",
          })),
        );
        setCandidateStatuses(lookups.candidateStatuses);
        setCandidate(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(
    data: Omit<
      Candidate,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "roleName"
      | "statusName"
      | "statusColorHex"
    >,
  ) {
    await updateCandidate(id, data);
    router.push("/candidates");
  }

  if (loading) {
    return (
      <div className="card text-sm font-semibold text-slate-500">
        <LoadingIndicator label="Loading candidate from database..." />
      </div>
    );
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
      candidateStatusesLookup={candidateStatuses}
      initialCandidate={candidate}
      submitLabel="Update Candidate"
      onSubmit={handleSubmit}
    />
  );
}
