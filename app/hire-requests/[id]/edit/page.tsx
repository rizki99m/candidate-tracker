"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { HireRequestForm } from "@/components/HireRequestForm";
import {
  HireRequest,
  loadHireRequests,
  saveHireRequests,
} from "@/lib/recruitment";

export default function EditHireRequestPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);
  const [hireRequest, setHireRequest] = useState<HireRequest | null>(null);

  useEffect(() => {
    queueMicrotask(() =>
      setHireRequest(loadHireRequests().find((item) => item.id === id) || null),
    );
  }, [id]);

  function handleSubmit(data: Omit<HireRequest, "id" | "createdAt">) {
    const hireRequests = loadHireRequests();
    const updated = hireRequests.map((item) =>
      item.id === id ? { ...item, ...data } : item,
    );

    saveHireRequests(updated);
    router.push("/hire-requests");
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
      initialHireRequest={hireRequest}
      submitLabel="Update Hire Request"
      onSubmit={handleSubmit}
    />
  );
}
