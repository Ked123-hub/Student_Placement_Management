import { Search, X } from "lucide-react";
import { cn } from "../../utils";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  label = placeholder,
  className,
  onClear,
}) {
  return (
    <div className={cn("relative", className)}>
      <Search
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
      />

      <input
        type="text"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="h-11 w-full rounded-lg border border-surface-300 bg-white pl-10 pr-10 text-sm text-surface-900 outline-none transition placeholder:text-surface-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
      />

      {value && (
        <button
          type="button"
          onClick={() => (onClear ? onClear() : onChange?.(""))}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-surface-400 hover:bg-surface-100 hover:text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          aria-label="Clear search"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
