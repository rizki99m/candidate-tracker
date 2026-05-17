"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/" },
  { label: "Roles", href: "/roles" },
  { label: "Candidates", href: "/candidates" },
  { label: "Add Candidate", href: "/candidates/new" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/candidates") return pathname === "/candidates";
    if (href === "/roles") return pathname === "/roles";
    return pathname === href;
  }

  return (
    <main className="min-h-screen bg-[#edf4f2]">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white/85 p-6 lg:block">
          <Link href="/">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">
              DOKI
            </p>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
              Recruitment Tracker
            </h1>
          </Link>

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
        </aside>

        <section className="flex-1 p-4 sm:p-6 lg:p-8">
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