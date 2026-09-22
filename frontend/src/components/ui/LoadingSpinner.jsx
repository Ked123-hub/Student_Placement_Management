import { LoaderCircle } from "lucide-react";
import { cn } from "../../utils";

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading",
}) {
  return (
    <LoaderCircle
      aria-label={label}
      role="status"
      className={cn(
        "animate-spin text-primary-600",
        sizeClasses[size] ?? sizeClasses.md,
        className,
      )}
    />
  );
}

export function LoadingScreen({ message = "Loading..." }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-surface-500">{message}</p>
    </div>
  );
}