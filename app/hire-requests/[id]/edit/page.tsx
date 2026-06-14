"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HireRequestForm } from "@/components/HireRequestForm";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import {
  HireRequest,
  LookupItem,
  fetchHireRequest,
  fetchLookups,
  updateHireRequest,
} from "@/lib/recruitment";

export default function EditHireRequestPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [hireRequest, setHireRequest] = useState<HireRequest | null>(null);
  const [hireRequestStatuses, setHireRequestStatuses] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchLookups(), fetchHireRequest(id)])
      .then(([lookups, found]) => {
        setHireRequestStatuses(lookups.hireRequestStatuses);
        setHireRequest(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(
    data: Omit<HireRequest, "id" | "createdAt" | "updatedAt">,
  ) {
    await updateHireRequest(id, data);
    router.push("/hire-requests");
  }

  if (loading) {
    return (
      <div className="card text-sm font-semibold text-slate-500">
        <LoadingIndicator label="Loading hire request from database..." />
      </div>
    );
  }

  if (!hireRequest) {
    return (
      <div className="card">
        <h3 className="text-2xl font-black">Hire request not found</h3>
        <p className="mt-2 text-slate-500">Hire request tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <HireRequestForm
      hireRequestStatusesLookup={hireRequestStatuses}
      initialHireRequest={hireRequest}
      submitLabel="Update Hire Request"
      onSubmit={handleSubmit}
    />
  );
}
