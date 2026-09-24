import { forwardRef, useId } from "react";
import { cn } from "../../utils";

export const Select = forwardRef(
  ({ className, label, error, options = [], placeholder, ...props }, ref) => {
    const generatedId = useId();
    const selectId = props.id ?? props.name ?? generatedId;
    const errorId = error && selectId ? `${selectId}-error` : undefined;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-surface-900"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={errorId}
          className={cn(
            "flex h-10 w-full appearance-none rounded-md border border-surface-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-danger focus-visible:ring-danger",
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p id={errorId} role="alert" className="mt-1.5 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
