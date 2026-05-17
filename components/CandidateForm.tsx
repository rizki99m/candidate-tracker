"use client";

import { useState } from "react";
import {
  Candidate,
  CandidateStatus,
  Role,
  candidateStatuses,
  todayString,
} from "@/lib/recruitment";

export function CandidateForm({
  roles,
  initialCandidate,
  submitLabel,
  onSubmit,
}: {
  roles: Role[];
  initialCandidate?: Partial<Candidate>;
  submitLabel: string;
  onSubmit: (
    data: Omit<Candidate, "id" | "createdAt">
  ) => void;
}) {
  const firstRole = roles[0];

  const [form, setForm] = useState({
    roleId: initialCandidate?.roleId || firstRole?.id || "",
    position: initialCandidate?.position || firstRole?.name || "",
    level: initialCandidate?.level || firstRole?.level || "",
    nameOfCandidate: initialCandidate?.nameOfCandidate || "",
    linkedInProfile: initialCandidate?.linkedInProfile || "",
    summaryInterviewHr: initialCandidate?.summaryInterviewHr || "",
    cvLink: initialCandidate?.cvLink || "",
    portfolioLink: initialCandidate?.portfolioLink || "",
    psychologicalTest: initialCandidate?.psychologicalTest || "",
    feedbackFromUser: initialCandidate?.feedbackFromUser || "",
    remarks: initialCandidate?.remarks || "",
    status: (initialCandidate?.status || "HR Interview") as CandidateStatus,
    interviewDate: initialCandidate?.interviewDate || todayString(),
    hrInterviewDate: initialCandidate?.hrInterviewDate || "",
    userInterviewDate: initialCandidate?.userInterviewDate || "",
  });

  function handleRoleChange(roleId: string) {
    const selectedRole = roles.find((role) => role.id === roleId);

    setForm((current) => ({
      ...current,
      roleId,
      position: selectedRole?.name || current.position,
      level: selectedRole?.level || current.level,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.roleId) {
      alert("Role wajib dipilih.");
      return;
    }

    if (!form.nameOfCandidate.trim()) {
      alert("Name of Candidate wajib diisi.");
      return;
    }

    if (!form.position.trim()) {
      alert("Position wajib diisi.");
      return;
    }

    onSubmit({
      roleId: form.roleId,
      position: form.position.trim(),
      level: form.level.trim(),
      nameOfCandidate: form.nameOfCandidate.trim(),
      linkedInProfile: form.linkedInProfile.trim(),
      summaryInterviewHr: form.summaryInterviewHr.trim(),
      cvLink: form.cvLink.trim(),
      portfolioLink: form.portfolioLink.trim(),
      psychologicalTest: form.psychologicalTest.trim(),
      feedbackFromUser: form.feedbackFromUser.trim(),
      remarks: form.remarks.trim(),
      status: form.status,
      interviewDate: form.interviewDate,
      hrInterviewDate: form.hrInterviewDate,
      userInterviewDate: form.userInterviewDate,
    });
  }

  if (roles.length === 0) {
    return (
      <div className="card">
        <h3 className="text-2xl font-black">Belum ada role</h3>
        <p className="mt-2 text-slate-500">
          Buat role dulu sebelum input kandidat.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      <div>
        <h3 className="text-2xl font-black text-slate-950">{submitLabel}</h3>
        <p className="mt-2 text-sm text-slate-500">
          Field kandidat mengikuti kerangka Excel recruitment yang dipakai.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Role">
          <select
            value={form.roleId}
            onChange={(event) => handleRoleChange(event.target.value)}
            className="input"
          >
            {roles
              .filter((role) => role.status === "Active")
              .map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
          </select>
        </Field>

        <Field label="Position">
          <input
            value={form.position}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                position: event.target.value,
              }))
            }
            className="input"
          />
        </Field>

        <Field label="Level">
          <input
            value={form.level}
            onChange={(event) =>
              setForm((current) => ({ ...current, level: event.target.value }))
            }
            placeholder="Senior / Staff / Intern"
            className="input"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name of Candidate">
          <input
            value={form.nameOfCandidate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                nameOfCandidate: event.target.value,
              }))
            }
            placeholder="Nama kandidat"
            className="input"
          />
        </Field>

        <Field label="Status">
          <select
            value={form.status}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: event.target.value as CandidateStatus,
              }))
            }
            className="input"
          >
            {candidateStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Interview Date">
          <input
            type="date"
            value={form.interviewDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                interviewDate: event.target.value,
              }))
            }
            className="input"
          />
        </Field>

        <Field label="HR Interview Date">
          <input
            type="date"
            value={form.hrInterviewDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                hrInterviewDate: event.target.value,
              }))
            }
            className="input"
          />
        </Field>

        <Field label="User Interview Date">
          <input
            type="date"
            value={form.userInterviewDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                userInterviewDate: event.target.value,
              }))
            }
            className="input"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="LinkedIn Profile">
          <input
            value={form.linkedInProfile}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                linkedInProfile: event.target.value,
              }))
            }
            placeholder="Link LinkedIn / text"
            className="input"
          />
        </Field>

        <Field label="CV Link">
          <input
            value={form.cvLink}
            onChange={(event) =>
              setForm((current) => ({ ...current, cvLink: event.target.value }))
            }
            placeholder="Google Drive / file name / link"
            className="input"
          />
        </Field>

        <Field label="Portofolio Link">
          <input
            value={form.portfolioLink}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                portfolioLink: event.target.value,
              }))
            }
            placeholder="Behance / website / drive link"
            className="input"
          />
        </Field>

        <Field label="Psychological Test">
          <input
            value={form.psychologicalTest}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                psychologicalTest: event.target.value,
              }))
            }
            placeholder="Link / file name"
            className="input"
          />
        </Field>
      </div>

      <Field label="Summary Interview HR">
        <textarea
          value={form.summaryInterviewHr}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              summaryInterviewHr: event.target.value,
            }))
          }
          rows={5}
          placeholder="+ Kelebihan kandidat&#10;- Catatan minus&#10;Kesimpulan HR..."
          className="input"
        />
      </Field>

      <Field label="Feedback from User">
        <textarea
          value={form.feedbackFromUser}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              feedbackFromUser: event.target.value,
            }))
          }
          rows={4}
          placeholder="Feedback dari user/interviewer..."
          className="input"
        />
      </Field>

      <Field label="Remarks">
        <textarea
          value={form.remarks}
          onChange={(event) =>
            setForm((current) => ({ ...current, remarks: event.target.value }))
          }
          rows={3}
          placeholder="REJECT / ON HOLD / Need review / dll"
          className="input"
        />
      </Field>

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