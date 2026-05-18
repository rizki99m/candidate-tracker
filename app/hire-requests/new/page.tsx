"use client";

import { useRouter } from "next/navigation";
import { HireRequestForm } from "@/components/HireRequestForm";
import {
  HireRequest,
  createId,
  loadHireRequests,
  saveHireRequests,
  todayString,
} from "@/lib/recruitment";

export default function NewHireRequestPage() {
  const router = useRouter();

  function handleSubmit(data: Omit<HireRequest, "id" | "createdAt">) {
    const hireRequest: HireRequest = {
      id: createId("hire-request"),
      createdAt: todayString(),
      ...data,
      status: "Assigned",
    };

    const hireRequests = loadHireRequests();
    saveHireRequests([hireRequest, ...hireRequests]);
    router.push("/hire-requests");
  }

  return (
    <HireRequestForm
      submitLabel="Save Hire Request"
      onSubmit={handleSubmit}
    />
  );
}
