import { useEffect, useState } from "react";
import { BriefcaseBusiness, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { SearchBar } from "../../components/ui/SearchBar";
import { driveService } from "../../services/driveService";

export default function StudentDrivesPage() {
  const navigate = useNavigate();
  const [response, setResponse] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    driveService
      .getCurrent()
      .then(setResponse)
      .catch((requestError) => setError(requestError.message));
  }, []);
  if (!response && !error)
    return <LoadingScreen message="Loading placement drives..." />;
  if (error) return <ErrorPanel message={error} />;
  const drives = response.items.filter((drive) =>
    `${drive.companyName} ${drive.jobRole} ${drive.location}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-600">Opportunities</p>
        <h2 className="mt-1 text-2xl font-semibold text-surface-900">
          Placement drives
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          Explore active opportunities and check your eligibility.
        </p>
      </div>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search company, role, or location"
      />
      {drives.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No matching drives"
          description="Try a different search."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {drives.map((drive) => (
            <Card key={drive.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                      {drive.companyName}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-surface-900">
                      {drive.jobRole}
                    </h3>
                  </div>
                  <Badge
                    variant={drive.type === "DREAM" ? "primary" : "default"}
                  >
                    {drive.type}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p className="font-semibold text-surface-900">
                    {drive.package} LPA
                    <span className="block text-xs font-normal text-surface-500">
                      Package
                    </span>
                  </p>
                  <p className="flex items-center gap-1 text-surface-700">
                    <MapPin size={15} />
                    {drive.location}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-surface-200 pt-4">
                  <Badge
                    variant={
                      drive.eligibilityStatus === "ELIGIBLE"
                        ? "success"
                        : "danger"
                    }
                  >
                    {drive.eligibilityStatus}
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/student/drives/${drive.id}`)}
                  >
                    <Search size={15} />
                    View details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
