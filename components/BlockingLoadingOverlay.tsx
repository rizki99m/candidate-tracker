import { LoadingIndicator } from "@/components/LoadingIndicator";

export function BlockingLoadingOverlay({
  open,
  label = "Memproses data...",
}: {
  open: boolean;
  label?: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/55 p-4"
      role="status"
      aria-live="assertive"
      aria-label={label}
    >
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl bg-white px-6 py-5 text-center shadow-2xl">
        <LoadingIndicator label={label} className="font-bold text-slate-800" />
        <p className="text-sm text-slate-500">Mohon tunggu, jangan tutup halaman.</p>
      </div>
    </div>
  );
}
