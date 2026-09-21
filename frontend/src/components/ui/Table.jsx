import React from 'react';
import { cn } from '../../utils';

export function Table({ className, ...props }) {
  return (
    <div className="relative w-full overflow-auto rounded-md border border-surface-200 bg-white">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={cn("[&_tr]:border-b border-surface-200 bg-surface-50", className)} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }) {
  return (
    <tr
      className={cn(
        "border-b border-surface-200 transition-colors hover:bg-surface-50/50 data-[state=selected]:bg-surface-50",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-surface-500 has-[[role=checkbox]]:pr-0",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return (
    <td
      className={cn("p-4 align-middle has-[[role=checkbox]]:pr-0", className)}
      {...props}
    />
  );
}
