import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { ToastContext } from "./toastContext";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (toast) => {
      const id = `${Date.now()}-${Math.random()}`;
      const item = { id, type: "info", duration: 4500, ...toast };
      setToasts((current) => [...current.slice(-3), item]);
      window.setTimeout(() => dismiss(id), item.duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show, dismiss }), [dismiss, show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col items-end gap-2 sm:left-auto sm:w-96"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.type] ?? Info;
          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex w-full items-start gap-3 rounded-lg border border-surface-200 bg-white p-4 shadow-lg"
            >
              <Icon
                size={19}
                className={
                  toast.type === "error"
                    ? "text-danger"
                    : toast.type === "success"
                      ? "text-emerald-600"
                      : "text-primary-600"
                }
              />
              <p className="min-w-0 flex-1 text-sm text-surface-700">
                {toast.message}
              </p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-md p-1 text-surface-400 hover:bg-surface-100"
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
