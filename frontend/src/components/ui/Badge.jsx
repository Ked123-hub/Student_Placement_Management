import { cn } from "../../utils";

export function Badge({ className, variant = "default", children, ...props }) {
  const variants = {
    default: "bg-surface-100 text-surface-800",
    primary: "bg-primary-100 text-primary-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
