"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Candidate,
  Role,
  candidateStatuses,
  filterCandidates,
  getRoleName,
  loadCandidates,
  loadRoles,
  saveCandidates,
  statusClass,
} from "@/lib/recruitment";

export default function CandidatesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null
  );

  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setRoles(loadRoles());
    setCandidates(loadCandidates());
  }, []);

  const filteredCandidates = useMemo(() => {
    return filterCandidates(candidates, {
      roleFilter,
      statusFilter,
      dateFilter: "all",
      customStart: "",
      customEnd: "",
    });
  }, [candidates, roleFilter, statusFilter]);

  function deleteCandidate() {
    if (!selectedCandidate) return;

    const updated = candidates.filter(
      (candidate) => candidate.id !== selectedCandidate.id
    );

    saveCandidates(updated);
    setCandidates(updated);
    setSelectedCandidate(null);
  }

  return (
    <section className="space-y-6">
      <div className="card flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-2xl font-black">Candidates</h3>
          <p className="mt-1 text-sm text-slate-500">
            Data kandidat berdasarkan kolom Excel recruitment.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[680px]">
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

          <Link href="/candidates/new" className="primary-button">
            Add Candidate
          </Link>
        </div>
      </div>

      <div className="hidden overflow-x-auto rounded-[2rem] border border-white bg-white shadow-sm lg:block">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Interview</th>
              <th className="px-4 py-3">CV</th>
              <th className="px-4 py-3">Portfolio</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id} className="align-top">
                <td className="px-4 py-4">
                  <p className="font-black">{candidate.nameOfCandidate}</p>
                  <p className="text-xs text-slate-500">
                    {candidate.position} · {candidate.level || "-"}
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
                  <p>Main: {candidate.interviewDate || "-"}</p>
                  <p className="text-xs text-slate-400">
                    HR: {candidate.hrInterviewDate || "-"} · User:{" "}
                    {candidate.userInterviewDate || "-"}
                  </p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {candidate.cvLink || "-"}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {candidate.portfolioLink || "-"}
                </td>
                <td className="max-w-xs px-4 py-4 text-slate-600">
                  {candidate.remarks || "-"}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/candidates/${candidate.id}/edit`}
                      className="secondary-button px-3 py-2 text-xs"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="danger-button px-3 py-2 text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredCandidates.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  Belum ada kandidat.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {filteredCandidates.map((candidate) => (
          <div key={candidate.id} className="card">
            <p className="text-lg font-black">{candidate.nameOfCandidate}</p>
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

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Interview: {candidate.interviewDate || "-"}</p>
              <p>CV: {candidate.cvLink || "-"}</p>
              <p>Portfolio: {candidate.portfolioLink || "-"}</p>
              <p>Remarks: {candidate.remarks || "-"}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href={`/candidates/${candidate.id}/edit`}
                className="secondary-button text-sm"
              >
                Edit
              </Link>
              <button
                onClick={() => setSelectedCandidate(candidate)}
                className="danger-button text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!selectedCandidate}
        title="Delete Candidate?"
        description={`Kandidat "${selectedCandidate?.nameOfCandidate}" akan dihapus. Action ini tidak bisa dibatalkan.`}
        confirmText="Delete Candidate"
        onClose={() => setSelectedCandidate(null)}
        onConfirm={deleteCandidate}
      />
    </section>
  );
}