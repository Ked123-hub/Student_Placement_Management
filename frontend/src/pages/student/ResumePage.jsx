import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { FileUpload } from "../../components/ui/FileUpload";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { studentService } from "../../services/studentService";

export default function ResumePage() {
  const [resume, setResume] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    studentService
      .getResume()
      .then(setResume)
      .catch((requestError) => setError(requestError.message));
  }, []);
  if (!resume && !error)
    return <LoadingScreen message="Loading your resume..." />;
  const upload = async () => {
    if (!file) return;
    setIsUploading(true);
    setMessage("");
    try {
      setResume(await studentService.uploadResume(file));
      setFile(null);
      setMessage("Resume uploaded successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-600">Documents</p>
        <h2 className="mt-1 text-2xl font-semibold text-surface-900">Resume</h2>
        <p className="mt-1 text-sm text-surface-500">
          Keep your current resume ready for new applications.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current resume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {resume && (
            <div className="flex items-center gap-3 rounded-xl border border-surface-200 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">
                  {resume.fileName}
                </p>
                <p className="text-xs text-surface-500">
                  Uploaded{" "}
                  {resume.uploadedAt
                    ? new Date(resume.uploadedAt).toLocaleDateString()
                    : "recently"}
                </p>
              </div>
            </div>
          )}
          <FileUpload
            file={file}
            onFileSelect={setFile}
            label="Upload replacement resume"
            helperText="PDF files up to 5 MB"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex items-center gap-3">
            <Button onClick={upload} isLoading={isUploading} disabled={!file}>
              Upload resume
            </Button>
            {message && <p className="text-sm text-emerald-700">{message}</p>}
          </div>
          <p className="text-xs text-surface-500">
            Applications preserve the resume version used at application time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
