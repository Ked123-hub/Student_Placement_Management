import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils";

function getPages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}) {
  if (totalPages <= 1) return null;

  const pages = getPages(page, totalPages);

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <button
        type="button"
        onClick={() => onPageChange?.(page - 1)}
        disabled={page <= 1}
        className="flex items-center gap-1 rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-700 transition hover:bg-surface-50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Previous
      </button>

      <div className="hidden items-center gap-1 sm:flex">
        {pages.map((item, index) =>
          item === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-surface-400"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange?.(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "h-9 min-w-9 rounded-lg px-2 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                item === page
                  ? "bg-primary-600 text-white"
                  : "text-surface-600 hover:bg-surface-100",
              )}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange?.(page + 1)}
        disabled={page >= totalPages}
        className="flex items-center gap-1 rounded-lg border border-surface-300 px-3 py-2 text-sm text-surface-700 transition hover:bg-surface-50 focus:outline-none focus:ring-4 focus:ring-primary-500/10 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  );
}