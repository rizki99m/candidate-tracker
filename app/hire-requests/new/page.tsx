"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HireRequestForm } from "@/components/HireRequestForm";
import {
  HireRequest,
  LookupItem,
  createHireRequest,
  fetchLookups,
} from "@/lib/recruitment";

export default function NewHireRequestPage() {
  const router = useRouter();
  const [hireRequestStatuses, setHireRequestStatuses] = useState<LookupItem[]>([]);

  useEffect(() => {
    fetchLookups().then((lookups) =>
      setHireRequestStatuses(lookups.hireRequestStatuses),
    );
  }, []);

  async function handleSubmit(
    data: Omit<HireRequest, "id" | "createdAt" | "updatedAt">,
  ) {
    await createHireRequest(data);
    router.push("/hire-requests");
  }

  return (
    <HireRequestForm
      hireRequestStatusesLookup={hireRequestStatuses}
      submitLabel="Save Hire Request"
      onSubmit={handleSubmit}
    />
  );
}
