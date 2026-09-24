import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  XCircle,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { Modal } from "../../components/ui/Modal";
import { Pagination } from "../../components/ui/Pagination";
import { SearchBar } from "../../components/ui/SearchBar";
import { Select } from "../../components/ui/Select";
import { applicationService } from "../../services/applicationService";

const statusVariants = {
  APPLIED: "primary",
  SHORTLISTED: "success",
  IN_PROGRESS: "warning",
  SELECTED: "success",
  REJECTED: "danger",
  WITHDRAWN: "default",
};
const pageSize = 5;

export default function ApplicationsPage() {
  const [applications, setApplications] = useState(null);
  const [selected, setSelected] = useState(null);
  const [progress, setProgress] = useState(null);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sort: "newest",
  });
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    applicationService
      .listMine()
      .then((response) => setApplications(response.items))
      .catch((requestError) => setError(requestError.message));
  }, []);

  if (!applications && !error)
    return <LoadingScreen message="Loading your applications..." />;
  if (error && !applications) return <ErrorPanel message={error} />;

  const visibleApplications = applications
    .filter((application) => {
      const query = filters.search.toLowerCase();
      return (
        (!query ||
          `${application.companyName} ${application.jobRole}`
            .toLowerCase()
            .includes(query)) &&
        (!filters.status || application.status === filters.status)
      );
    })
    .sort((first, second) =>
      filters.sort === "oldest"
        ? new Date(first.appliedAt) - new Date(second.appliedAt)
        : new Date(second.appliedAt) - new Date(first.appliedAt),
    );
  const totalPages = Math.max(
    1,
    Math.ceil(visibleApplications.length / pageSize),
  );
  const pageItems = visibleApplications.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const openProgress = async (application) => {
    setSelected(application);
    setProgress(null);
    try {
      setProgress(await applicationService.getProgress(application.id));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const withdraw = async () => {
    if (!withdrawTarget) return;
    setIsLoading(true);
    try {
      await applicationService.withdraw(withdrawTarget.id);
      setApplications((current) =>
        current.map((application) =>
          application.id === withdrawTarget.id
            ? {
                ...application,
                status: "WITHDRAWN",
                withdrawnAt: new Date().toISOString(),
              }
            : application,
        ),
      );
      setWithdrawTarget(null);
      setMessage("Application withdrawn successfully.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
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
      {message && (
        <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {message}
        </p>
      )}
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(220px,1fr)_180px_160px]">
          <SearchBar
            value={filters.search}
            onChange={(search) => {
              setFilters((current) => ({ ...current, search }));
              setPage(1);
            }}
            placeholder="Search company or role"
          />
          <Select
            value={filters.status}
            onChange={(event) => {
              setFilters((current) => ({
                ...current,
                status: event.target.value,
              }));
              setPage(1);
            }}
            options={Object.keys(statusVariants).map((value) => ({
              value,
              label: value.replaceAll("_", " "),
            }))}
            placeholder="All statuses"
          />
          <Select
            value={filters.sort}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                sort: event.target.value,
              }))
            }
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
            ]}
          />
        </CardContent>
      </Card>
      {pageItems.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No matching applications"
          description="Try changing the search or status filter."
        />
      ) : (
        <div className="space-y-3">
          {pageItems.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onProgress={openProgress}
              onWithdraw={setWithdrawTarget}
            />
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      <ProgressModal
        selected={selected}
        progress={progress}
        onClose={() => setSelected(null)}
      />
      <Modal
        open={Boolean(withdrawTarget)}
        onClose={() => setWithdrawTarget(null)}
        title="Withdraw application?"
        description="This action may not be reversible after the drive deadline."
        footer={
          <>
            <Button variant="secondary" onClick={() => setWithdrawTarget(null)}>
              Keep application
            </Button>
            <Button variant="danger" onClick={withdraw} isLoading={isLoading}>
              Withdraw application
            </Button>
          </>
        }
      >
        <p className="text-sm text-surface-600">
          You are withdrawing your application for {withdrawTarget?.jobRole} at{" "}
          {withdrawTarget?.companyName}.
        </p>
      </Modal>
    </div>
  );
}

function ApplicationCard({ application, onProgress, onWithdraw }) {
  const canWithdraw = ["APPLIED", "SHORTLISTED"].includes(application.status);
  return (
    <Card>
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
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariants[application.status] ?? "default"}>
            {application.status.replaceAll("_", " ")}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onProgress(application)}
          >
            Progress <ChevronRight size={16} />
          </Button>
          {canWithdraw && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onWithdraw(application)}
            >
              Withdraw
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressModal({ selected, progress, onClose }) {
  return (
    <Modal
      open={Boolean(selected)}
      onClose={onClose}
      title="Recruitment progress"
      description={
        selected ? `${selected.companyName} · ${selected.jobRole}` : ""
      }
    >
      {progress ? (
        <div className="space-y-5">
          <div className="rounded-lg bg-primary-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary-700">
              Current status
            </p>
            <p className="mt-1 text-lg font-semibold text-primary-950">
              {progress.currentStatus.replaceAll("_", " ")}
            </p>
            {progress.currentRound && (
              <p className="mt-1 text-sm text-primary-800">
                Current round: {progress.currentRound.name}
              </p>
            )}
          </div>
          <div className="space-y-4">
            {progress.rounds.map((round, index) => (
              <div key={round.name} className="flex gap-3">
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${round.status === "PASSED" ? "bg-emerald-100 text-emerald-700" : "bg-surface-100 text-surface-500"}`}
                >
                  {round.status === "PASSED" ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Clock3 size={16} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900">
                    {index + 1}. {round.name}
                  </p>
                  <p className="text-xs text-surface-500">{round.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <LoadingScreen message="Loading progress..." />
      )}
    </Modal>
  );
}
function ErrorPanel({ message }) {
  return (
    <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
      <XCircle className="mb-2" size={20} />
      {message}
    </div>
  );
}
