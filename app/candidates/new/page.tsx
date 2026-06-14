"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CandidateForm } from "@/components/CandidateForm";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import {
  Candidate,
  CandidateStatusLookup,
  Role,
  createCandidate,
  fetchLookups,
} from "@/lib/recruitment";

export default function NewCandidatePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [candidateStatuses, setCandidateStatuses] = useState<CandidateStatusLookup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLookups()
      .then((lookups) => {
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
      })
      .finally(() => setLoading(false));
  }, []);

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
    await createCandidate(data);
    router.push("/candidates");
  }

  if (loading) {
    return (
      <div className="card text-sm font-semibold text-slate-500">
        <LoadingIndicator label="Loading form data from database..." />
      </div>
    );
  }

  return (
    <CandidateForm
      roles={roles}
      candidateStatusesLookup={candidateStatuses}
      submitLabel="Save Candidate"
      onSubmit={handleSubmit}
    />
  );
}
