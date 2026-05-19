"use client";

import { useState } from "react";
import {
  Candidate,
  CandidateProgress,
  CandidateStatus,
  candidateProgresses,
  CandidateProgressLookup,
  CandidateStatusLookup,
  Role,
  candidateStatuses,
  todayString,
} from "@/lib/recruitment";

export function CandidateForm({
  roles,
  candidateStatusesLookup = [],
  candidateProgressesLookup = [],
  initialCandidate,
  submitLabel,
  onSubmit,
}: {
  roles: Role[];
  candidateStatusesLookup?: CandidateStatusLookup[];
  candidateProgressesLookup?: CandidateProgressLookup[];
  initialCandidate?: Partial<Candidate>;
  submitLabel: string;
  onSubmit: (
    data: Omit<
      Candidate,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "roleName"
      | "statusName"
      | "statusColorHex"
      | "progressName"
    >
  ) => void;
}) {
  const defaultStatusId =
    initialCandidate?.statusId || candidateStatusesLookup[0]?.id || "";
  const [form, setForm] = useState({
    roleId: initialCandidate?.roleId || "",
    position: initialCandidate?.position || "",
    level: initialCandidate?.level || "",
    nameOfCandidate: initialCandidate?.nameOfCandidate || "",
    email: initialCandidate?.email || "",
    phoneNumber: initialCandidate?.phoneNumber || "",
    department: initialCandidate?.department || "",
    source: initialCandidate?.source || "",
    poolDate: initialCandidate?.poolDate || todayString(),
    workExperienceYears: initialCandidate?.workExperienceYears || "",
    education: initialCandidate?.education || "",
    university: initialCandidate?.university || "",
    major: initialCandidate?.major || "",
    location: initialCandidate?.location || "",
    rating: initialCandidate?.rating || "",
    linkedInProfile: initialCandidate?.linkedInProfile || "",
    summaryInterviewHr: initialCandidate?.summaryInterviewHr || "",
    cvLink: initialCandidate?.cvLink || "",
    portfolioLink: initialCandidate?.portfolioLink || "",
    psychologicalTest: initialCandidate?.psychologicalTest || "",
    feedbackFromUser: initialCandidate?.feedbackFromUser || "",
    remarks: initialCandidate?.remarks || "",
    statusId: defaultStatusId,
    progressId: initialCandidate?.progressId || "",
    status: (initialCandidate?.status || candidateStatusesLookup[0]?.name || "HR Interview") as CandidateStatus,
    progress: (initialCandidate?.progress || "") as CandidateProgress,
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
      department: selectedRole?.department || current.department,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      department: form.department.trim(),
      source: form.source.trim(),
      poolDate: form.poolDate,
      workExperienceYears: form.workExperienceYears.trim(),
      education: form.education.trim(),
      university: form.university.trim(),
      major: form.major.trim(),
      location: form.location.trim(),
      rating: form.rating.trim(),
      linkedInProfile: form.linkedInProfile.trim(),
      summaryInterviewHr: form.summaryInterviewHr.trim(),
      cvLink: form.cvLink.trim(),
      portfolioLink: form.portfolioLink.trim(),
      psychologicalTest: form.psychologicalTest.trim(),
      feedbackFromUser: form.feedbackFromUser.trim(),
      remarks: form.remarks.trim(),
      statusId: form.statusId,
      progressId: form.progressId,
      status: form.status,
      progress: form.progress,
      interviewDate: form.interviewDate,
      hrInterviewDate: form.hrInterviewDate,
      userInterviewDate: form.userInterviewDate,
    });
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
            <option value="">No Role / Talent Pool</option>
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

        <Field label="Department">
          <input
            value={form.department}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                department: event.target.value,
              }))
            }
            placeholder="Department / Division"
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

        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="email@domain.com"
            className="input"
          />
        </Field>

        <Field label="No. HP">
          <input
            value={form.phoneNumber}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                phoneNumber: event.target.value,
              }))
            }
            placeholder="0812719979830"
            className="input"
          />
        </Field>

        <Field label="Status">
          <select
            value={form.statusId}
            onChange={(event) => {
              const selected = candidateStatusesLookup.find(
                (item) => item.id === event.target.value,
              );
              setForm((current) => ({
                ...current,
                statusId: event.target.value,
                status: (selected?.name || event.target.value) as CandidateStatus,
              }));
            }}
            className="input"
          >
            {(candidateStatusesLookup.length
              ? candidateStatusesLookup
              : candidateStatuses.map((status) => ({ id: status, name: status }))
            ).map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Progress">
          <select
            value={form.progressId}
            onChange={(event) => {
              const selected = candidateProgressesLookup.find(
                (item) => item.id === event.target.value,
              );
              setForm((current) => ({
                ...current,
                progressId: event.target.value,
                progress: (selected?.name || "") as CandidateProgress,
              }));
            }}
            className="input"
          >
            <option value="">No Progress</option>
            {(candidateProgressesLookup.length
              ? candidateProgressesLookup
              : candidateProgresses
                  .filter(Boolean)
                  .map((progress) => ({ id: progress, name: progress }))
            ).map((progress) => (
              <option key={progress.id} value={progress.id}>
                {progress.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Source">
          <input
            value={form.source}
            onChange={(event) =>
              setForm((current) => ({ ...current, source: event.target.value }))
            }
            placeholder="Form Applicant / Referral / LinkedIn"
            className="input"
          />
        </Field>

        <Field label="Pool Date">
          <input
            type="date"
            value={form.poolDate}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                poolDate: event.target.value,
              }))
            }
            className="input"
          />
        </Field>

        <Field label="Rating (1-5)">
          <input
            value={form.rating}
            onChange={(event) =>
              setForm((current) => ({ ...current, rating: event.target.value }))
            }
            placeholder="1-5"
            className="input"
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Pengalaman Kerja (Tahun)">
          <input
            value={form.workExperienceYears}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                workExperienceYears: event.target.value,
              }))
            }
            className="input"
          />
        </Field>

        <Field label="Pendidikan">
          <input
            value={form.education}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                education: event.target.value,
              }))
            }
            className="input"
          />
        </Field>

        <Field label="Universitas">
          <input
            value={form.university}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                university: event.target.value,
              }))
            }
            className="input"
          />
        </Field>

        <Field label="Jurusan">
          <input
            value={form.major}
            onChange={(event) =>
              setForm((current) => ({ ...current, major: event.target.value }))
            }
            className="input"
          />
        </Field>

        <Field label="Lokasi">
          <input
            value={form.location}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                location: event.target.value,
              }))
            }
            className="input"
          />
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
