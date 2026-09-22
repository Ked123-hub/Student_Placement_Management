import { useEffect, useState } from "react";
import { BriefcaseBusiness, Eye, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { SearchBar } from "../../components/ui/SearchBar";
import { Select } from "../../components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { driveService } from "../../services/driveService";

const statusVariant = {
  OPEN: "success",
  DRAFT: "warning",
  CLOSED: "default",
  CANCELLED: "danger",
};

export default function DrivesPage() {
  const navigate = useNavigate();
  const [response, setResponse] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    driveService.admin
      .list()
      .then(setResponse)
      .catch((requestError) => setError(requestError.message));
  }, []);

  if (!response && !error)
    return <LoadingScreen message="Loading placement drives..." />;
  if (error)
    return (
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
        {error}
      </div>
    );

  const drives = response.items.filter(
    (drive) =>
      (!status || drive.status === status) &&
      `${drive.companyName} ${drive.jobRole}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary-600">
            Drive management
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-surface-900">
            Placement drives
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            Create, publish, and manage recruitment opportunities.
          </p>
        </div>
        <Button onClick={() => navigate("/tpo/drives/new")}>
          <Plus size={17} />
          Create drive
        </Button>
      </div>
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search company or role"
          />
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={[
              { value: "DRAFT", label: "Draft" },
              { value: "OPEN", label: "Open" },
              { value: "CLOSED", label: "Closed" },
              { value: "CANCELLED", label: "Cancelled" },
            ]}
            placeholder="All statuses"
          />
        </div>
      </Card>
      {drives.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No drives found"
          description="Create a drive or change the current filters."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Drive</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Eligibility</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drives.map((drive) => (
                  <TableRow key={drive.id}>
                    <TableCell>
                      <p className="font-medium text-surface-900">
                        {drive.jobRole}
                      </p>
                      <p className="text-xs text-surface-500">
                        {drive.companyName} · {drive.location}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">{drive.package} LPA</p>
                      <Badge
                        variant={drive.type === "DREAM" ? "primary" : "default"}
                      >
                        {drive.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(drive.applicationDeadline).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          drive.eligibilityStatus === "FINALIZED"
                            ? "success"
                            : "warning"
                        }
                      >
                        {drive.eligibilityStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[drive.status] ?? "default"}>
                        {drive.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => navigate(`/tpo/drives/${drive.id}`)}
                        className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-primary-600"
                        aria-label={`View ${drive.jobRole}`}
                      >
                        <Eye size={17} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
