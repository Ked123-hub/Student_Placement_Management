import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CheckCircle2, MapPin } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { Modal } from "../../components/ui/Modal";
import { applicationService } from "../../services/applicationService";
import { driveService } from "../../services/driveService";

export default function DriveDetailsPage() {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [drive, setDrive] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    driveService
      .getById(driveId)
      .then(setDrive)
      .catch((requestError) => setError(requestError.message));
  }, [driveId]);
  if (!drive && !error)
    return <LoadingScreen message="Loading drive details..." />;
  if (error) return <ErrorPanel message={error} />;
  const apply = async () => {
    setIsApplying(true);
    try {
      await applicationService.apply(driveId);
      setMessage("Application submitted successfully.");
      setConfirmOpen(false);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsApplying(false);
    }
  };
  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate("/student/drives")}
        className="inline-flex items-center gap-2 text-sm font-medium text-surface-600 hover:text-surface-900"
      >
        <ArrowLeft size={16} />
        Back to drives
      </button>
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-sm font-semibold text-primary-600">
                {drive.companyName}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-surface-900">
                {drive.jobRole}
              </h2>
              <p className="mt-2 text-sm text-surface-500">
                {drive.jobDescription}
              </p>
            </div>
            <Badge variant={drive.type === "DREAM" ? "primary" : "default"}>
              {drive.type}
            </Badge>
          </div>
          <div className="grid gap-4 border-y border-surface-200 py-4 sm:grid-cols-3">
            <Info
              icon={CheckCircle2}
              label="Package"
              value={`${drive.package} LPA`}
            />
            <Info icon={MapPin} label="Location" value={drive.location} />
            <Info
              icon={CalendarDays}
              label="Deadline"
              value={new Date(drive.applicationDeadline).toLocaleString()}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                drive.eligibilityStatus === "ELIGIBLE" ? "success" : "danger"
              }
            >
              {drive.eligibilityStatus}
            </Badge>
            {drive.applicationStatus && (
              <Badge variant="primary">{drive.applicationStatus}</Badge>
            )}
          </div>
          {message && (
            <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
            </p>
          )}
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={
              drive.eligibilityStatus !== "ELIGIBLE" ||
              drive.applicationStatus === "APPLIED"
            }
          >
            Apply to drive
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Selection process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {drive.selectionProcess.map((step, index) => (
              <p key={step} className="flex gap-3 text-sm text-surface-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
                  {index + 1}
                </span>
                {step}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Required skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {drive.requiredSkills.map((skill) => (
              <Badge key={skill}>{skill}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm application"
        description="The backend will verify your eligibility, resume, deadline, and placement rules."
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={apply} isLoading={isApplying}>
              Confirm apply
            </Button>
          </>
        }
      >
        <p className="text-sm text-surface-600">
          You are applying for the {drive.jobRole} role at {drive.companyName}.
        </p>
      </Modal>
    </div>
  );
}
function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-2">
      <Icon size={18} className="mt-0.5 text-primary-600" />
      <div>
        <p className="text-xs text-surface-500">{label}</p>
        <p className="text-sm font-semibold text-surface-900">{value}</p>
      </div>
    </div>
  );
}
function ErrorPanel({ message }) {
  return (
    <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
      {message}
    </div>
  );
}
