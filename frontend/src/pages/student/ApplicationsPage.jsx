import { useEffect, useState } from "react";
import { ClipboardList, ChevronRight } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { Modal } from "../../components/ui/Modal";
import { applicationService } from "../../services/applicationService";

const variants = {
  APPLIED: "primary",
  SHORTLISTED: "success",
  IN_PROGRESS: "warning",
  SELECTED: "success",
  REJECTED: "danger",
  WITHDRAWN: "default",
};

export default function ApplicationsPage() {
  const [response, setResponse] = useState(null);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    applicationService
      .listMine()
      .then(setResponse)
      .catch((requestError) => setError(requestError.message));
  }, []);
  if (!response && !error)
    return <LoadingScreen message="Loading your applications..." />;
  if (error) return <ErrorPanel message={error} />;
  const openProgress = async (application) => {
    setSelected(application);
    try {
      setProgress(await applicationService.getProgress(application.id));
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-600">Your activity</p>
        <h2 className="mt-1 text-2xl font-semibold text-surface-900">
          My applications
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          Follow every application from submission to final result.
        </p>
      </div>
      {response.items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          description="Explore placement drives to get started."
        />
      ) : (
        <div className="space-y-3">
          {response.items.map((application) => (
            <Card key={application.id}>
              <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                    {application.companyName}
                  </p>
                  <h3 className="mt-1 font-semibold text-surface-900">
                    {application.jobRole}
                  </h3>
                  <p className="mt-1 text-sm text-surface-500">
                    {application.package} LPA · Applied{" "}
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={variants[application.status] ?? "default"}>
                    {application.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openProgress(application)}
                  >
                    View progress
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Recruitment progress"
        description={
          selected ? `${selected.companyName} · ${selected.jobRole}` : ""
        }
      >
        {progress ? (
          <div className="space-y-4">
            {progress.rounds.map((round, index) => (
              <div key={round.name} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900">
                    {round.name}
                  </p>
                  <p className="text-xs text-surface-500">{round.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <LoadingScreen message="Loading progress..." />
        )}
      </Modal>
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
