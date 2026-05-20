export type AppRole = "admin" | "user" | "guest" | string;

export type SessionUser = {
  fullName: string;
  username: string;
  role: AppRole;
};

export function normalizeRole(role?: string | null) {
  return (role || "guest").toLowerCase();
}

export function canManageData(role?: string | null) {
  return ["admin", "user"].includes(normalizeRole(role));
}

export function canAddCandidate(role?: string | null) {
  return normalizeRole(role) === "admin";
}

export function canAddRole(role?: string | null) {
  return normalizeRole(role) === "admin";
}

export function canImportCandidates(role?: string | null) {
  return canManageData(role);
}

export function canSeeSalary(role?: string | null) {
  return normalizeRole(role) !== "guest";
}

export function canAccessSection(role: string | null | undefined, path: string) {
  const normalized = normalizeRole(role);
  if (normalized !== "guest") return true;
  return path === "/" || path.startsWith("/candidates");
}
