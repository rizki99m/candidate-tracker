export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-medium text-slate-400">
          Candidate Tracker
        </p>

        <h1 className="mb-4 text-4xl font-bold tracking-tight">
          HRD Dashboard Starter
        </h1>

        <p className="max-w-2xl text-slate-300">
          Project Next.js sudah berhasil jalan. Setelah ini kita sambungkan ke
          database PostgreSQL dan mulai bikin modul kandidat.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-2 text-xl font-semibold">Status</h2>
          <p className="text-slate-400">
            Localhost aktif. App router aman. Siap lanjut database.
          </p>
        </div>
      </section>
    </main>
  );
}