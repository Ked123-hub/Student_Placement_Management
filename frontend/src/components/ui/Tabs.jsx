import { cn } from "../../utils";

export function Tabs({ tabs = [], value, onChange, className }) {
  return (
    <div className={cn("border-b border-surface-200", className)}>
      <div className="flex gap-1 overflow-x-auto" role="tablist">
        {tabs.map((tab) => {
          const isActive = value === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange?.(tab.id)}
              disabled={tab.disabled}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                isActive
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-surface-500 hover:border-surface-300 hover:text-surface-800",
                tab.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {Icon && <Icon size={16} aria-hidden="true" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="rounded-full bg-surface-100 px-2 py-0.5 text-xs text-surface-600">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
