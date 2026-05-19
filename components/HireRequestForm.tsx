"use client";

import { useState } from "react";
import {
  HireRequest,
  HireRequestStatus,
  LookupItem,
  hireRequestStatuses,
  todayString,
} from "@/lib/recruitment";

type HireRequestFormData = Omit<HireRequest, "id" | "createdAt" | "updatedAt">;

const fieldLabels: { key: keyof HireRequestFormData; label: string }[] = [
  { key: "requestedBy", label: "Requested By" },
  { key: "reasonForHiring", label: "Reason for Hiring" },
  { key: "positionTitle", label: "Position Title" },
  { key: "departmentDivision", label: "Department/Division" },
  { key: "employmentType", label: "Employment Type" },
  {
    key: "teamMembersNeeded",
    label: "How many Team Member do you need?",
  },
  { key: "expectedJoinDate", label: "Expected Join Date" },
  { key: "descriptionScopeOfWork", label: "Description Scope Of Work" },
  {
    key: "experienceRequirementsSkills",
    label: "Experience Requirements and Skills (In Detail)",
  },
  {
    key: "additionalNiceToHaveSkills",
    label: "Additional nice to have Skills",
  },
  { key: "workingExperience", label: "Working Experience" },
  { key: "educationRequired", label: "Education Required" },
  { key: "majoringPreferences", label: "Majoring Preferences" },
  { key: "ageRange", label: "Age Range" },
  { key: "preferencesGender", label: "Preferences Gender" },
  {
    key: "preferencesCandidateResidencies",
    label: "Preferences Candidate Residencies",
  },
];

export function HireRequestForm({
  initialHireRequest,
  hireRequestStatusesLookup = [],
  submitLabel,
  onSubmit,
}: {
  initialHireRequest?: Partial<HireRequest>;
  hireRequestStatusesLookup?: LookupItem[];
  submitLabel: string;
  onSubmit: (data: HireRequestFormData) => void;
}) {
  const isEdit = !!initialHireRequest?.id;
  const [form, setForm] = useState<HireRequestFormData>({
    requestedBy: initialHireRequest?.requestedBy || "",
    reasonForHiring: initialHireRequest?.reasonForHiring || "",
    positionTitle: initialHireRequest?.positionTitle || "",
    departmentDivision: initialHireRequest?.departmentDivision || "",
    employmentType: initialHireRequest?.employmentType || "",
    teamMembersNeeded: initialHireRequest?.teamMembersNeeded || "",
    expectedJoinDate: initialHireRequest?.expectedJoinDate || todayString(),
    descriptionScopeOfWork: initialHireRequest?.descriptionScopeOfWork || "",
    experienceRequirementsSkills:
      initialHireRequest?.experienceRequirementsSkills || "",
    additionalNiceToHaveSkills:
      initialHireRequest?.additionalNiceToHaveSkills || "",
    workingExperience: initialHireRequest?.workingExperience || "",
    educationRequired: initialHireRequest?.educationRequired || "",
    majoringPreferences: initialHireRequest?.majoringPreferences || "",
    ageRange: initialHireRequest?.ageRange || "",
    preferencesGender: initialHireRequest?.preferencesGender || "",
    preferencesCandidateResidencies:
      initialHireRequest?.preferencesCandidateResidencies || "",
    statusId: initialHireRequest?.statusId || hireRequestStatusesLookup[0]?.id || "",
    status: initialHireRequest?.status || "Assigned",
  });

  function updateField(key: keyof HireRequestFormData, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    for (const field of fieldLabels) {
      if (!String(form[field.key]).trim()) {
        alert(`${field.label} wajib diisi.`);
        return;
      }
    }

    onSubmit({
      ...form,
      requestedBy: form.requestedBy.trim(),
      reasonForHiring: form.reasonForHiring.trim(),
      positionTitle: form.positionTitle.trim(),
      departmentDivision: form.departmentDivision.trim(),
      employmentType: form.employmentType.trim(),
      teamMembersNeeded: form.teamMembersNeeded.trim(),
      expectedJoinDate: form.expectedJoinDate,
      descriptionScopeOfWork: form.descriptionScopeOfWork.trim(),
      experienceRequirementsSkills: form.experienceRequirementsSkills.trim(),
      additionalNiceToHaveSkills: form.additionalNiceToHaveSkills.trim(),
      workingExperience: form.workingExperience.trim(),
      educationRequired: form.educationRequired.trim(),
      majoringPreferences: form.majoringPreferences.trim(),
      ageRange: form.ageRange.trim(),
      preferencesGender: form.preferencesGender.trim(),
      preferencesCandidateResidencies:
        form.preferencesCandidateResidencies.trim(),
      statusId: form.statusId,
      status: isEdit ? form.status : "Assigned",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div>
        <h3 className="text-2xl font-black text-slate-950">{submitLabel}</h3>
        <p className="mt-2 text-sm text-slate-500">
          Status otomatis Assigned saat hire request baru dibuat.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fieldLabels.map((field) => (
          <Field key={field.key} label={field.label}>
            {field.key === "expectedJoinDate" ? (
              <input
                type="date"
                value={form.expectedJoinDate}
                onChange={(event) =>
                  updateField(field.key, event.target.value)
                }
                className="input"
              />
            ) : field.key === "descriptionScopeOfWork" ||
              field.key === "experienceRequirementsSkills" ||
              field.key === "additionalNiceToHaveSkills" ? (
              <textarea
                value={String(form[field.key])}
                onChange={(event) =>
                  updateField(field.key, event.target.value)
                }
                rows={4}
                className="input"
              />
            ) : (
              <input
                value={String(form[field.key])}
                onChange={(event) =>
                  updateField(field.key, event.target.value)
                }
                className="input"
              />
            )}
          </Field>
        ))}

        {isEdit && (
          <Field label="Status">
            <select
              value={form.statusId}
              onChange={(event) => {
                const selected = hireRequestStatusesLookup.find(
                  (item) => item.id === event.target.value,
                );
                setForm((current) => ({
                  ...current,
                  statusId: event.target.value,
                  status: (selected?.name || event.target.value) as HireRequestStatus,
                }));
              }}
              className="input"
            >
              {(hireRequestStatusesLookup.length
                ? hireRequestStatusesLookup
                : hireRequestStatuses.map((status) => ({
                    id: status,
                    name: status,
                  }))
              ).map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </Field>
        )}
      </div>

      <button type="submit" className="primary-button w-full sm:w-auto">
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
