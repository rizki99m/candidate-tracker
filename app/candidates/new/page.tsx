"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CandidateForm } from "@/components/CandidateForm";
import {
  Candidate,
  CandidateProgressLookup,
  CandidateStatusLookup,
  Role,
  createCandidate,
  fetchLookups,
} from "@/lib/recruitment";

export default function NewCandidatePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [candidateStatuses, setCandidateStatuses] = useState<CandidateStatusLookup[]>([]);
  const [candidateProgresses, setCandidateProgresses] = useState<CandidateProgressLookup[]>([]);

  useEffect(() => {
    fetchLookups().then((lookups) => {
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
    });
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
      | "progressName"
    >,
  ) {
    await createCandidate(data);
    router.push("/candidates");
  }

  return (
    <CandidateForm
      roles={roles}
      candidateStatusesLookup={candidateStatuses}
      candidateProgressesLookup={candidateProgresses}
      submitLabel="Save Candidate"
      onSubmit={handleSubmit}
    />
  );
}
