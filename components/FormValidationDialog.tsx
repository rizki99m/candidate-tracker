"use client";

export function FormValidationDialog({
  open,
  title = "Input belum valid",
  description = "Perbaiki item berikut sebelum menyimpan data.",
  errors,
  onClose,
}: {
  open: boolean;
  title?: string;
  description?: string;
  errors: string[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3">
          <h3 className="text-2xl font-black text-slate-950">{title}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-rose-700">
            {description}
          </p>
        </div>

        <ul className="mt-5 space-y-2 text-sm font-semibold text-slate-700">
          {errors.map((error) => (
            <li key={error} className="rounded-2xl bg-slate-50 px-4 py-3">
              - {error}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="primary-button">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
