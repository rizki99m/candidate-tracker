"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Roles", href: "/roles" },
  { label: "Candidates", href: "/candidates" },
  { label: "Hire Request", href: "/hire-requests" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/candidates") return pathname === "/candidates";
    if (href === "/roles") return pathname === "/roles";
    if (href === "/hire-requests") return pathname.startsWith("/hire-requests");
    return pathname === href;
  }

  return (
    <main className="min-h-screen bg-[#edf4f2]">
      <div className="flex min-h-screen">
        <aside
          className={`hidden lg:block overflow-hidden border-r border-slate-200 bg-white/85 p-6 transition-all duration-300 ${
            sidebarOpen ? "w-72" : "w-0"
          }`}
        >
          <div className={`h-full ${sidebarOpen ? "opacity-100" : "opacity-0"}`}>
            <div className="flex items-start justify-between gap-4">
              <Link href="/">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">
                  DOKI
                </p>
                <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                  Recruitment Tracker
                </h1>
              </Link>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Minimize menu"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 hover:text-slate-950"
              >
                <span aria-hidden="true">{"<"}</span>
              </button>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Track kandidat interview berdasarkan role, status, dan tanggal.
            </p>

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
              <p className="text-sm font-semibold">Frontend Mode</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Data sementara masih di localStorage. Nanti kita sambungkan ke
                database.
              </p>
            </div>

          </div>
        </aside>

        <section className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Expand menu"
              className="mb-4 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-sm transition hover:bg-slate-100 lg:inline-flex"
            >
              <span
                aria-hidden="true"
                className="flex items-center gap-0.5 text-xs font-black leading-none"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="block h-0.5 w-3 rounded-full bg-current" />
                  <span className="block h-0.5 w-3 rounded-full bg-current" />
                  <span className="block h-0.5 w-3 rounded-full bg-current" />
                </span>
                <span>{">"}</span>
              </span>
            </button>
          )}

          <header className="mb-6 rounded-[2rem] border border-white bg-white/80 p-5 shadow-sm backdrop-blur">
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
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
