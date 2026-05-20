"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CandidateForm } from "@/components/CandidateForm";
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
    >,
  ) {
    await createCandidate(data);
    router.push("/candidates");
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
