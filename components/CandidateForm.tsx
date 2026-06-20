"use client";

import { useState } from "react";
import { FormValidationDialog } from "@/components/FormValidationDialog";
import {
  Candidate,
  CandidateStatus,
  CandidateStatusLookup,
  Role,
  todayString,
} from "@/lib/recruitment";

const educationOptions = ["SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"];
const sourceOptions = [
  "Google Form",
  "LinkedIn",
  "Kalibrr",
  "Glints",
  "Email",
  "Referral",
  "Others",
];

type CandidateFormData = Omit<
  Candidate,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "roleName"
  | "statusName"
  | "statusColorHex"
>;

export function CandidateForm({
  roles,
  candidateStatusesLookup = [],
  initialCandidate,
  submitLabel,
  onSubmit,
}: {
  roles: Role[];
  candidateStatusesLookup?: CandidateStatusLookup[];
  initialCandidate?: Partial<Candidate>;
  submitLabel: string;
  onSubmit: (data: CandidateFormData) => void;
}) {
  const defaultStatusId =
    initialCandidate?.statusId || candidateStatusesLookup[0]?.id || "";
  const [form, setForm] = useState<CandidateFormData>({
    roleId: initialCandidate?.roleId || "",
    position: initialCandidate?.position || "",
    level: initialCandidate?.level || "",
    nameOfCandidate: initialCandidate?.nameOfCandidate || "",
    email: initialCandidate?.email || "",
    phoneNumber: initialCandidate?.phoneNumber || "",
    department: initialCandidate?.department || "",
    source: initialCandidate?.source || "",
    poolDate: initialCandidate?.poolDate || todayString(),
    education: initialCandidate?.education || "",
    university: initialCandidate?.university || "",
    major: initialCandidate?.major || "",
    gpa: initialCandidate?.gpa || "",
    location: initialCandidate?.location || "",
    currentSalary: formatRupiah(initialCandidate?.currentSalary || ""),
    expectedSalary: formatRupiah(initialCandidate?.expectedSalary || ""),
    linkedInProfile: initialCandidate?.linkedInProfile || "",
    summaryInterviewHr: initialCandidate?.summaryInterviewHr || "",
    cvLink: initialCandidate?.cvLink || "",
    portfolioLink: initialCandidate?.portfolioLink || "",
    psychologicalTest: initialCandidate?.psychologicalTest || "",
    feedbackFromUser: initialCandidate?.feedbackFromUser || "",
    statusId: defaultStatusId,
    status: (initialCandidate?.status ||
      candidateStatusesLookup[0]?.name ||
      "") as CandidateStatus,
    hrInterviewDate: initialCandidate?.hrInterviewDate || "",
    userInterviewDate: initialCandidate?.userInterviewDate || "",
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  function updateField<K extends keyof CandidateFormData>(
    key: K,
    value: CandidateFormData[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

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

  function handleSalaryChange(
    key: "currentSalary" | "expectedSalary",
    value: string,
  ) {
    updateField(key, formatRupiah(value));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors = validateCandidateForm(form, candidateStatusesLookup.length > 0);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    onSubmit({
      ...form,
      roleId: form.roleId,
      position: form.position.trim(),
      level: form.level.trim(),
      nameOfCandidate: form.nameOfCandidate.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      department: form.department.trim(),
      source: form.source.trim(),
      poolDate: form.poolDate,
      education: form.education.trim(),
      university: form.university.trim(),
      major: form.major.trim(),
      gpa: form.gpa.trim(),
      location: form.location.trim(),
      currentSalary: form.currentSalary.trim(),
      expectedSalary: form.expectedSalary.trim(),
      linkedInProfile: form.linkedInProfile.trim(),
      summaryInterviewHr: form.summaryInterviewHr.trim(),
      cvLink: form.cvLink.trim(),
      portfolioLink: form.portfolioLink.trim(),
      psychologicalTest: form.psychologicalTest.trim(),
      feedbackFromUser: form.feedbackFromUser.trim(),
      statusId: form.statusId,
      status: form.status,
      hrInterviewDate: form.hrInterviewDate,
      userInterviewDate: form.userInterviewDate,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-5">
      <div>
        <h3 className="text-2xl font-black text-slate-950">{submitLabel}</h3>
        <p className="mt-2 text-sm text-slate-500">
          Field kandidat sudah disesuaikan dengan struktur database terbaru.
        </p>
      </div>

      <FormSection title="Role" defaultOpen>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Field label="Role Applied">
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
              onChange={(event) => updateField("position", event.target.value)}
              className="input"
            />
          </Field>

          <Field label="Level">
            <input
              value={form.level}
              onChange={(event) => updateField("level", event.target.value)}
              placeholder="Senior / Staff / Intern"
              className="input"
            />
          </Field>

          <Field label="Department">
            <input
              value={form.department}
              onChange={(event) => updateField("department", event.target.value)}
              placeholder="Department / Division"
              className="input"
            />
          </Field>

          <Field label="Source">
            <select
              value={form.source}
              onChange={(event) => updateField("source", event.target.value)}
              className="input"
            >
              <option value="">Select source</option>
              {sourceOptions.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Biodata" defaultOpen>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name">
            <input
              value={form.nameOfCandidate}
              onChange={(event) =>
                updateField("nameOfCandidate", event.target.value)
              }
              placeholder="Nama kandidat"
              className="input"
            />
          </Field>

          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="email@domain.com"
              className="input"
            />
          </Field>

          <Field label="No. HP">
            <input
              value={form.phoneNumber}
              onChange={(event) =>
                updateField("phoneNumber", event.target.value)
              }
              placeholder="0812719979830"
              className="input"
            />
          </Field>

          <Field label="Lokasi">
            <input
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              className="input"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Education">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Pendidikan">
            <select
              value={form.education}
              onChange={(event) => updateField("education", event.target.value)}
              className="input"
            >
              <option value="">Select education</option>
              {educationOptions.map((education) => (
                <option key={education} value={education}>
                  {education}
                </option>
              ))}
            </select>
          </Field>

          <Field label="University">
            <input
              value={form.university}
              onChange={(event) => updateField("university", event.target.value)}
              className="input"
            />
          </Field>

          <Field label="Major">
            <input
              value={form.major}
              onChange={(event) => updateField("major", event.target.value)}
              className="input"
            />
          </Field>

          <Field label="IPK / GPA">
            <input
              value={form.gpa}
              onChange={(event) => updateField("gpa", event.target.value)}
              placeholder="3.75"
              className="input"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Resume">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Resume / CV">
            <input
              value={form.cvLink}
              onChange={(event) => updateField("cvLink", event.target.value)}
              placeholder="Google Drive / file name / link"
              className="input"
            />
          </Field>

          <Field label="Portofolio">
            <input
              value={form.portfolioLink}
              onChange={(event) =>
                updateField("portfolioLink", event.target.value)
              }
              placeholder="Behance / website / drive link"
              className="input"
            />
          </Field>

          <Field label="LinkedIn">
            <input
              value={form.linkedInProfile}
              onChange={(event) =>
                updateField("linkedInProfile", event.target.value)
              }
              placeholder="Link LinkedIn / text"
              className="input"
            />
          </Field>
        </div>
      </FormSection>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Field label="Current Salary">
          <input
            inputMode="numeric"
            value={form.currentSalary}
            onChange={(event) =>
              handleSalaryChange("currentSalary", event.target.value)
            }
            placeholder="Rp 8.000.000"
            className="input"
          />
        </Field>

        <Field label="Expected Salary">
          <input
            inputMode="numeric"
            value={form.expectedSalary}
            onChange={(event) =>
              handleSalaryChange("expectedSalary", event.target.value)
            }
            placeholder="Rp 10.000.000"
            className="input"
          />
        </Field>

        <Field label="Pool Date">
          <input
            type="date"
            value={form.poolDate}
            onChange={(event) => updateField("poolDate", event.target.value)}
            className="input"
          />
        </Field>

        <Field label="HR Interview Date">
          <input
            type="date"
            value={form.hrInterviewDate}
            onChange={(event) =>
              updateField("hrInterviewDate", event.target.value)
            }
            className="input"
          />
        </Field>

        <Field label="User Interview Date">
          <input
            type="date"
            value={form.userInterviewDate}
            onChange={(event) =>
              updateField("userInterviewDate", event.target.value)
            }
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
            disabled={candidateStatusesLookup.length === 0}
          >
            {candidateStatusesLookup.length === 0 && (
              <option value="">No status from database</option>
            )}
            {candidateStatusesLookup.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Summary HR">
        <textarea
          value={form.summaryInterviewHr}
          onChange={(event) =>
            updateField("summaryInterviewHr", event.target.value)
          }
          rows={5}
          placeholder="+ Kelebihan kandidat&#10;- Catatan minus&#10;Kesimpulan HR..."
          className="input"
        />
      </Field>

      <Field label="Summary User">
        <textarea
          value={form.feedbackFromUser}
          onChange={(event) =>
            updateField("feedbackFromUser", event.target.value)
          }
          rows={4}
          placeholder="Feedback dari user/interviewer..."
          className="input"
        />
      </Field>

      <Field label="Psychological Test">
        <input
          value={form.psychologicalTest}
          onChange={(event) =>
            updateField("psychologicalTest", event.target.value)
          }
          placeholder="Link / file name"
          className="input"
        />
      </Field>

      <button type="submit" className="primary-button w-full sm:w-auto">
        {submitLabel}
      </button>

      <FormValidationDialog
        open={validationErrors.length > 0}
        title="Candidate belum bisa disimpan"
        description="Ada input yang kurang atau formatnya belum sesuai."
        errors={validationErrors}
        onClose={() => setValidationErrors([])}
      />
    </form>
  );
}

function validateCandidateForm(
  form: CandidateFormData,
  hasStatusLookup: boolean,
) {
  const errors: string[] = [];

  if (!form.nameOfCandidate.trim()) {
    errors.push("Name wajib diisi dengan nama lengkap kandidat.");
  }

  if (!form.position.trim()) {
    errors.push("Position wajib diisi dengan posisi yang dilamar.");
  }

  if (form.email.trim() && !isValidEmail(form.email.trim())) {
    errors.push("Email harus memakai format yang valid, contoh: nama@domain.com.");
  }

  if (form.phoneNumber.trim() && !isValidPhoneNumber(form.phoneNumber.trim())) {
    errors.push("No. HP hanya boleh berisi angka, spasi, +, -, atau tanda kurung, minimal 8 digit.");
  }

  if (form.gpa.trim() && !isValidGpa(form.gpa.trim())) {
    errors.push("IPK / GPA harus berupa angka antara 0 sampai 4, contoh: 3.75.");
  }

  if (!form.poolDate) {
    errors.push("Pool Date wajib diisi.");
  }

  if (!isValidDateInput(form.poolDate)) {
    errors.push("Pool Date harus memakai format tanggal yang valid.");
  }

  if (form.hrInterviewDate && !isValidDateInput(form.hrInterviewDate)) {
    errors.push("HR Interview Date harus memakai format tanggal yang valid.");
  }

  if (form.userInterviewDate && !isValidDateInput(form.userInterviewDate)) {
    errors.push("User Interview Date harus memakai format tanggal yang valid.");
  }

  if (hasStatusLookup && !form.statusId) {
    errors.push("Status wajib dipilih dari lookup database.");
  }

  return errors;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && /^[\d\s()+-]+$/.test(value);
}

function isValidGpa(value: string) {
  const normalized = value.replace(",", ".");
  const gpa = Number(normalized);
  return Number.isFinite(gpa) && gpa >= 0 && gpa <= 4;
}

function isValidDateInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return (
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day)
  );
}

function FormSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="rounded-2xl border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
    >
      <summary className="cursor-pointer select-none rounded-2xl bg-slate-50 px-4 py-3 text-sm font-black text-slate-800">
        {title}
      </summary>
      <div className="border-t border-slate-200 p-4">{children}</div>
    </details>
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

function formatRupiah(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return `Rp ${Number(digits).toLocaleString("id-ID")}`;
}
