import { cn } from "../../utils";
import { Loader2 } from "lucide-react";

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  children,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-sm",
    secondary: "bg-surface-100 text-surface-900 hover:bg-surface-200",
    outline:
      "border border-surface-200 bg-transparent hover:bg-surface-100 text-surface-900",
    ghost: "hover:bg-surface-100 text-surface-900",
    danger: "bg-danger text-white hover:bg-red-600 shadow-sm",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? "true" : undefined}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
