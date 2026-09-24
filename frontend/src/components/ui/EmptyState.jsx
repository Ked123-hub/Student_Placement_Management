import { FileSearch } from "lucide-react";
import { cn } from "../../utils";

export function EmptyState({
  icon: Icon = FileSearch,
  title = "Nothing here yet",
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-300 bg-surface-50 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Icon size={22} aria-hidden="true" />
      </div>

      <h3 className="text-sm font-semibold text-surface-900">{title}</h3>

      {description && (
        <p className="mt-1.5 max-w-md text-sm text-surface-500">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
