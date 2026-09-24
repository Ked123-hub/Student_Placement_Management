import { useEffect, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { FileUpload } from "../../components/ui/FileUpload";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { Modal } from "../../components/ui/Modal";
import { studentService } from "../../services/studentService";

export default function ResumePage() {
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    studentService
      .getResume()
      .then(setResume)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingScreen message="Loading your resume..." />;

  const upload = async () => {
    if (!file) return;
    setIsUploading(true);
    setMessage("");
    setError("");
    try {
      const uploaded = await studentService.uploadResume(file);
      setResume({ ...uploaded, fileSizeBytes: file.size, mimeType: file.type });
      setFile(null);
      setConfirmOpen(false);
      setMessage("Resume uploaded successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsUploading(false);
    }
  };

  const openResume = () => {
    if (resume?.downloadUrl)
      window.open(resume.downloadUrl, "_blank", "noopener,noreferrer");
    else
      setMessage(
        "Preview will be available when the backend returns a secure download URL.",
      );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-600">Documents</p>
        <h2 className="mt-1 text-2xl font-semibold text-surface-900">Resume</h2>
        <p className="mt-1 text-sm text-surface-500">
          Keep one current resume ready for placement applications.
        </p>
      </div>
      {message && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Current resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {resume ? (
            <div className="flex flex-col gap-4 rounded-lg border border-surface-200 p-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <FileText size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-surface-900">
                  {resume.fileName}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-surface-500">
                  <span>
                    Uploaded{" "}
                    {resume.uploadedAt
                      ? new Date(resume.uploadedAt).toLocaleDateString()
                      : "recently"}
                  </span>
                  {resume.fileSizeBytes && (
                    <span>{formatBytes(resume.fileSizeBytes)}</span>
                  )}
                  {resume.mimeType && <span>{resume.mimeType}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={openResume}>
                  <Eye size={15} />
                  Preview
                </Button>
                {resume.downloadUrl && (
                  <Button size="sm" variant="ghost" onClick={openResume}>
                    <Download size={15} />
                    Download
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-surface-300 bg-surface-50 p-6 text-center text-sm text-surface-500">
              No resume uploaded yet.
            </div>
          )}
          <div className="rounded-lg bg-primary-50 p-4">
            <div className="flex gap-3">
              <ShieldCheck size={19} className="shrink-0 text-primary-600" />
              <p className="text-sm leading-6 text-primary-900">
                Applications preserve the exact resume version used when you
                apply. Replacing your current resume will not change existing
                applications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Replace resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <FileUpload
            file={file}
            onFileSelect={setFile}
            disabled={isUploading}
            label="Choose a PDF resume"
            helperText="PDF files up to 5 MB"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={!file || isUploading}
            >
              <UploadCloud size={16} />
              {resume ? "Replace resume" : "Upload resume"}
            </Button>
            {isUploading && (
              <div className="min-w-48 flex-1">
                <div className="mb-1 flex justify-between text-xs text-surface-500">
                  <span>Uploading securely...</span>
                  <span>Please wait</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-200">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-primary-600" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={resume ? "Replace current resume?" : "Upload resume?"}
        description="The new file will become your current resume."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={upload} isLoading={isUploading}>
              {resume ? "Replace resume" : "Upload resume"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-surface-600">
          {file?.name} will be validated and stored by the backend. Existing
          application snapshots remain unchanged.
        </p>
      </Modal>
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
