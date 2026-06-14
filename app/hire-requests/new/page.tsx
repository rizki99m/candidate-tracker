"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HireRequestForm } from "@/components/HireRequestForm";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import {
  HireRequest,
  LookupItem,
  createHireRequest,
  fetchLookups,
} from "@/lib/recruitment";

export default function NewHireRequestPage() {
  const router = useRouter();
  const [hireRequestStatuses, setHireRequestStatuses] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLookups()
      .then((lookups) =>
        setHireRequestStatuses(lookups.hireRequestStatuses),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(
    data: Omit<HireRequest, "id" | "createdAt" | "updatedAt">,
  ) {
    await createHireRequest(data);
    router.push("/hire-requests");
  }

  if (loading) {
    return (
      <div className="card text-sm font-semibold text-slate-500">
        <LoadingIndicator label="Loading form data from database..." />
      </div>
    );
  }

  return (
    <HireRequestForm
      hireRequestStatusesLookup={hireRequestStatuses}
      submitLabel="Save Hire Request"
      onSubmit={handleSubmit}
    />
  );
}
