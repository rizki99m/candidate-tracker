"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Candidate,
  DateFilter,
  Role,
  candidateStatuses,
  filterCandidates,
  getRoleName,
  loadCandidates,
  loadRoles,
  resetDemoData,
  statusClass,
  statusColor,
} from "@/lib/recruitment";

export default function DashboardPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    setRoles(loadRoles());
    setCandidates(loadCandidates());
  }, []);

  const filteredCandidates = useMemo(() => {
    return filterCandidates(candidates, {
      roleFilter,
      statusFilter,
      dateFilter,
      customStart,
      customEnd,
    });
  }, [candidates, roleFilter, statusFilter, dateFilter, customStart, customEnd]);

  const totalCandidates = filteredCandidates.length;
  const totalInProcess = filteredCandidates.filter(
    (candidate) =>
      !["Hired", "Rejected", "Withdraw"].includes(candidate.status)
  ).length;
  const totalHired = filteredCandidates.filter(
    (candidate) => candidate.status === "Hired"
  ).length;
  const totalRejected = filteredCandidates.filter(
    (candidate) => candidate.status === "Rejected"
  ).length;

  const statusSummary = candidateStatuses.map((status) => ({
    status,
    count: filteredCandidates.filter((candidate) => candidate.status === status)
      .length,
  }));

  const roleSummary = roles.map((role) => ({
    role,
    count: filteredCandidates.filter((candidate) => candidate.roleId === role.id)
      .length,
  }));

  function handleReset() {
    const ok = window.confirm("Reset semua demo data ke data awal?");
    if (!ok) return;

    resetDemoData();
    setRoles(loadRoles());
    setCandidates(loadCandidates());
  }

  return (
    <section className="space-y-6">
      <div className="card">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Date Range">
            <select
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(event.target.value as DateFilter)
              }
              className="input"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </Field>

          <Field label="Role">
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="input"
            >
              <option value="all">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              {candidateStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Custom Start">
            <input
              type="date"
              value={customStart}
              disabled={dateFilter !== "custom"}
              onChange={(event) => setCustomStart(event.target.value)}
              className="input"
            />
          </Field>

          <Field label="Custom End">
            <input
              type="date"
              value={customEnd}
              disabled={dateFilter !== "custom"}
              onChange={(event) => setCustomEnd(event.target.value)}
              className="input"
            />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Candidates" value={totalCandidates} />
        <MetricCard label="In Process" value={totalInProcess} />
        <MetricCard label="Hired" value={totalHired} />
        <MetricCard label="Rejected" value={totalRejected} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="card">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black">Status Distribution</h3>
              <p className="text-sm text-slate-500">Pie chart status kandidat</p>
            </div>
          </div>

          <DonutChart data={statusSummary} />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {statusSummary.map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: statusColor(item.status) }}
                />
                <span className="text-sm font-semibold text-slate-700">
                  {item.status}
                </span>
                <span className="ml-auto text-sm font-black">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="mb-5">
            <h3 className="text-xl font-black">Candidates by Role</h3>
            <p className="text-sm text-slate-500">Bar chart berdasarkan role</p>
          </div>

          <BarChart
            data={roleSummary.map((item) => ({
              label: item.role.name,
              value: item.count,
            }))}
          />
        </div>
      </div>

      <div className="card">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black">Latest Candidates</h3>
            <p className="text-sm text-slate-500">
              Kandidat terbaru sesuai filter dashboard
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button onClick={handleReset} className="secondary-button">
              Reset Demo Data
            </button>
            <Link href="/candidates/new" className="primary-button">
              Add Candidate
            </Link>
          </div>
        </div>

        <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Interview Date</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredCandidates.slice(0, 8).map((candidate) => (
                <tr key={candidate.id}>
                  <td className="px-4 py-4">
                    <p className="font-black">{candidate.nameOfCandidate}</p>
                    <p className="text-xs text-slate-500">
                      {candidate.position}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {getRoleName(roles, candidate.roleId)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClass(
                        candidate.status
                      )}`}
                    >
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {candidate.interviewDate || "-"}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {candidate.remarks || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {filteredCandidates.slice(0, 8).map((candidate) => (
            <div
              key={candidate.id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <p className="font-black">{candidate.nameOfCandidate}</p>
              <p className="mt-1 text-sm text-slate-500">
                {candidate.position} · {getRoleName(roles, candidate.roleId)}
              </p>
              <span
                className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-black ${statusClass(
                  candidate.status
                )}`}
              >
                {candidate.status}
              </span>
              <p className="mt-3 text-sm text-slate-600">
                {candidate.remarks || "-"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-4 text-4xl font-black text-slate-950">{value}</p>
    </div>
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

function DonutChart({
  data,
}: {
  data: { status: Candidate["status"]; count: number }[];
}) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (total === 0) {
    return (
      <div className="grid h-64 place-items-center rounded-3xl bg-slate-100 text-sm font-bold text-slate-500">
        No data
      </div>
    );
  }

  let current = 0;
  const gradient = data
    .filter((item) => item.count > 0)
    .map((item) => {
      const start = (current / total) * 100;
      current += item.count;
      const end = (current / total) * 100;
      return `${statusColor(item.status)} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="flex justify-center">
      <div
        className="grid h-64 w-64 place-items-center rounded-full"
        style={{ background: `conic-gradient(${gradient})` }}
      >
        <div className="grid h-36 w-36 place-items-center rounded-full bg-white shadow-inner">
          <div className="text-center">
            <p className="text-4xl font-black">{total}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Candidates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-5">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-slate-700">{item.label}</span>
            <span className="font-black text-slate-950">{item.value}</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-950"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}