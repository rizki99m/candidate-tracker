export const pageSizeOptions = [10, 20, 50] as const;

export type PageSize = (typeof pageSizeOptions)[number];

export function PaginationControls({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: PageSize;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing <span className="font-black text-slate-950">{start}</span>-
        <span className="font-black text-slate-950">{end}</span> of{" "}
        <span className="font-black text-slate-950">{totalItems}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 font-bold text-slate-700">
          Rows
          <select
            value={pageSize}
            onChange={(event) => {
              onPageSizeChange(Number(event.target.value) as PageSize);
              onPageChange(1);
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-black text-slate-950"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="secondary-button px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-2 font-black text-slate-950">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="secondary-button px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
