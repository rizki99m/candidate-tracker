"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Roles", href: "/roles" },
  { label: "Candidates", href: "/candidates" },
  { label: "Hire Request", href: "/hire-requests" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const [user, setUser] = useState<{
    fullName: string;
    username: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    if (pathname === "/login") return;
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setUser(payload?.user || null))
      .catch(() => setUser(null));
  }, [pathname]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/candidates") return pathname === "/candidates";
    if (href === "/roles") return pathname === "/roles";
    if (href === "/hire-requests") return pathname.startsWith("/hire-requests");
    return pathname === href;
  }

  function handleShellTouchStart(event: React.TouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleShellTouchEnd(event: React.TouchEvent<HTMLElement>) {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX === null) return;

    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;

    if (!mobileMenuOpen && startX < 28 && deltaX > 70) {
      setMobileMenuOpen(true);
    }

    if (mobileMenuOpen && deltaX < -70) {
      setMobileMenuOpen(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-[#edf4f2]"
      onTouchStart={handleShellTouchStart}
      onTouchEnd={handleShellTouchEnd}
    >
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/doki-logo-yellow.png"
              alt="DOKI"
              width={144}
              height={54}
              className="h-auto w-20"
            />
            <span className="text-sm font-black tracking-tight text-slate-950">
              Recruitment Tracker
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileMenuOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative flex h-full w-[min(20rem,85vw)] flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Image
                  src="/doki-logo-yellow.png"
                  alt="DOKI"
                  width={192}
                  height={72}
                  className="h-auto w-24"
                />
                <p className="mt-3 text-xl font-black tracking-tight text-slate-950">
                  Recruitment Tracker
                </p>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              >
                <CloseIcon />
              </button>
            </div>

            <nav className="mt-8 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-sm font-black transition ${
                    isActive(item.href)
                      ? "bg-slate-950 !text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-semibold">
                {user?.fullName || "Signed in"}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                {user?.role || "user"}
              </p>
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/login";
                }}
                className="mt-4 w-full rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen">
        <aside
          className={`hidden lg:block overflow-hidden border-r border-slate-200 bg-white/85 p-6 transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-0"
          }`}
        >
          <div
            className={`h-full ${sidebarOpen ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <Link href="/">
                <Image
                  src="/doki-logo-yellow.png"
                  alt="DOKI"
                  width={192}
                  height={72}
                  className="h-auto w-24"
                />
                <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                  Recruitment Tracker
                </h1>
              </Link>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              >
                <PanelCollapseIcon />
              </button>
            </div>

            <nav className="mt-10 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-black transition ${
                    isActive(item.href)
                      ? "bg-slate-950 !text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-10 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm font-semibold">
                {user?.fullName || "Signed in"}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
                {user?.role || "user"}
              </p>
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/login";
                }}
                className="mt-4 w-full rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="mb-4 hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 lg:inline-flex"
            >
              <PanelExpandIcon />
            </button>
          )}

          {/* <header className="mb-6 rounded-[2rem] border border-white bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-emerald-700">
                  Recruitment Dashboard
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                  Interview Candidate Tracker
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                  Summary kandidat yang sudah masuk interview, bisa difilter
                  berdasarkan tanggal, status, dan role spesifik.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl px-3 py-2 text-center text-xs font-black transition ${
                      isActive(item.href)
                        ? "bg-slate-950 !text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </header> */}

          {children}
        </section>
      </div>
    </main>
  );
}

function PanelCollapseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="m15 9-3 3 3 3" />
    </svg>
  );
}

function PanelExpandIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="m12 9 3 3-3 3" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
