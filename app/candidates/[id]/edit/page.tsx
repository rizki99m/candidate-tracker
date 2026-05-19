"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CandidateForm } from "@/components/CandidateForm";
import {
  Candidate,
  CandidateProgressLookup,
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
  const [candidateProgresses, setCandidateProgresses] = useState<CandidateProgressLookup[]>([]);

  useEffect(() => {
    Promise.all([fetchLookups(), fetchCandidate(id)]).then(([lookups, found]) => {
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
      setCandidateProgresses(lookups.candidateProgresses);
      setCandidate(found);
    });
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
      | "progressName"
    >,
  ) {
    await updateCandidate(id, data);
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
      candidateStatusesLookup={candidateStatuses}
      candidateProgressesLookup={candidateProgresses}
      initialCandidate={candidate}
      submitLabel="Update Candidate"
      onSubmit={handleSubmit}
    />
  );
}
