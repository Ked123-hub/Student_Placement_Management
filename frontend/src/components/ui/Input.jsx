import { forwardRef } from "react";
import { cn } from "../../utils";

export const Input = forwardRef(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-surface-900">
            {label}
          </label>
        )}
        <input
          className={cn(
            "flex h-10 w-full rounded-md border border-surface-200 bg-white px-3 py-2 text-sm placeholder:text-surface-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-danger focus-visible:ring-danger",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
