import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn } from "../../utils";

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  accept = ".pdf",
  maxSizeMB = 5,
  onFileSelect,
  file,
  error,
  disabled = false,
  label = "Upload file",
  helperText = "PDF files up to 5 MB",
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState("");

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setLocalError(`File must be smaller than ${maxSizeMB} MB.`);
      return false;
    }

    if (
      accept === ".pdf" &&
      selectedFile.type !== "application/pdf"
    ) {
      setLocalError("Only PDF files are allowed.");
      return false;
    }

    setLocalError("");
    return true;
  };

  const handleFile = (selectedFile) => {
    if (!validateFile(selectedFile)) return;
    onFileSelect?.(selectedFile);
  };

  const displayError = error || localError;

  return (
    <div className="w-full">
      <p className="mb-1.5 text-sm font-medium text-surface-700">
        {label}
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);

          if (!disabled) {
            handleFile(event.dataTransfer.files?.[0]);
          }
        }}
        className={cn(
          "w-full rounded-2xl border-2 border-dashed p-6 text-center transition focus:outline-none focus:ring-4 focus:ring-primary-500/10",
          isDragging
            ? "border-primary-500 bg-primary-50"
            : "border-surface-300 bg-surface-50 hover:border-primary-400 hover:bg-primary-50/50",
          disabled && "cursor-not-allowed opacity-50",
          displayError && "border-danger bg-danger/5",
        )}
      >
        <UploadCloud
          size={28}
          aria-hidden="true"
          className="mx-auto text-primary-600"
        />

        <p className="mt-3 text-sm font-medium text-surface-900">
          Drag and drop your file here
        </p>

        <p className="mt-1 text-xs text-surface-500">
          or click to browse
        </p>

        <p className="mt-2 text-xs text-surface-400">
          {helperText}
        </p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];

          if (selectedFile) {
            handleFile(selectedFile);
          }

          event.target.value = "";
        }}
        className="hidden"
        disabled={disabled}
      />

      {file && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-surface-200 bg-white p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <FileText size={20} aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium text-surface-900">
              {file.name}
            </p>

            <p className="text-xs text-surface-500">
              {formatFileSize(file.size)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onFileSelect?.(null)}
            className="rounded-lg p-2 text-surface-400 hover:bg-surface-100 hover:text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            aria-label="Remove file"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {displayError && (
        <p className="mt-1.5 text-xs text-danger">{displayError}</p>
      )}
    </div>
  );
}