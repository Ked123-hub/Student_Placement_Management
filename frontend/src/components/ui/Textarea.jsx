import { forwardRef, useId } from "react";
import { cn } from "../../utils";

export const Textarea = forwardRef(function Textarea(
  { label, error, helperText, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const describedBy =
    error || helperText ? `${textareaId}-description` : undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="mb-1.5 block text-sm font-medium text-surface-700"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={cn(
          "min-h-32 w-full resize-y rounded-lg border bg-white px-3.5 py-3 text-sm text-surface-900 outline-none transition placeholder:text-surface-400",
          "border-surface-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10",
          error && "border-danger focus:border-danger focus:ring-danger/10",
          className,
        )}
        {...props}
      />

      {(error || helperText) && (
        <p
          id={describedBy}
          role={error ? "alert" : undefined}
          className={cn(
            "mt-1.5 text-xs",
            error ? "text-danger" : "text-surface-500",
          )}
        >
          {error ?? helperText}
        </p>
      )}
    </div>
  );
});
