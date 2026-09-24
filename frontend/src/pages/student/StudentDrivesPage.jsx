import { useEffect, useState } from "react";
import { BriefcaseBusiness, Heart, MapPin, Search, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardContent } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { Pagination } from "../../components/ui/Pagination";
import { SearchBar } from "../../components/ui/SearchBar";
import { Select } from "../../components/ui/Select";
import { driveService } from "../../services/driveService";

const pageSize = 4;

export default function StudentDrivesPage() {
  const navigate = useNavigate();
  const [response, setResponse] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    eligibility: "",
    location: "",
    packageRange: "",
    sort: "deadline",
  });
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
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

  const filteredDrives = response.items
    .filter((drive) => {
      const query = filters.search.toLowerCase();
      const matchesSearch =
        !query ||
        `${drive.companyName} ${drive.jobRole} ${drive.location}`
          .toLowerCase()
          .includes(query);
      const matchesType = !filters.type || drive.type === filters.type;
      const matchesEligibility =
        !filters.eligibility || drive.eligibilityStatus === filters.eligibility;
      const matchesLocation =
        !filters.location || drive.location === filters.location;
      const matchesPackage =
        !filters.packageRange ||
        (filters.packageRange === "under10"
          ? drive.package < 10
          : filters.packageRange === "10to20"
            ? drive.package >= 10 && drive.package < 20
            : drive.package >= 20);
      return (
        matchesSearch &&
        matchesType &&
        matchesEligibility &&
        matchesLocation &&
        matchesPackage
      );
    })
    .sort((first, second) =>
      filters.sort === "package"
        ? second.package - first.package
        : filters.sort === "company"
          ? first.companyName.localeCompare(second.companyName)
          : new Date(first.applicationDeadline) -
            new Date(second.applicationDeadline),
    );
  const totalPages = Math.max(1, Math.ceil(filteredDrives.length / pageSize));
  const drives = filteredDrives.slice((page - 1) * pageSize, page * pageSize);
  const locations = [
    ...new Set(response.items.map((drive) => drive.location).filter(Boolean)),
  ].map((location) => ({ value: location, label: location }));
  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };
  const toggleFavorite = (driveId) =>
    setFavorites((current) =>
      current.includes(driveId)
        ? current.filter((id) => id !== driveId)
        : [...current, driveId],
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary-600">Opportunities</p>
          <h2 className="mt-1 text-2xl font-semibold text-surface-900">
            Placement drives
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            Explore active opportunities and check your eligibility.
          </p>
        </div>
        <p className="text-sm text-surface-500">
          {filteredDrives.length} opportunities
        </p>
      </div>
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SearchBar
            value={filters.search}
            onChange={(value) => updateFilter("search", value)}
            placeholder="Search drives"
          />
          <Select
            value={filters.type}
            onChange={(event) => updateFilter("type", event.target.value)}
            options={[
              { value: "DREAM", label: "Dream" },
              { value: "ORDINARY", label: "Ordinary" },
            ]}
            placeholder="All types"
          />
          <Select
            value={filters.eligibility}
            onChange={(event) =>
              updateFilter("eligibility", event.target.value)
            }
            options={[
              { value: "ELIGIBLE", label: "Eligible" },
              { value: "NOT_ELIGIBLE", label: "Not eligible" },
            ]}
            placeholder="Eligibility"
          />
          <Select
            value={filters.location}
            onChange={(event) => updateFilter("location", event.target.value)}
            options={locations}
            placeholder="All locations"
          />
          <Select
            value={filters.packageRange}
            onChange={(event) =>
              updateFilter("packageRange", event.target.value)
            }
            options={[
              { value: "under10", label: "Under 10 LPA" },
              { value: "10to20", label: "10–20 LPA" },
              { value: "20plus", label: "20+ LPA" },
            ]}
            placeholder="Package range"
          />
          <Select
            value={filters.sort}
            onChange={(event) => updateFilter("sort", event.target.value)}
            options={[
              { value: "deadline", label: "Deadline soon" },
              { value: "package", label: "Highest package" },
              { value: "company", label: "Company A–Z" },
            ]}
          />
        </CardContent>
      </Card>
      {drives.length === 0 ? (
        <EmptyState
          icon={BriefcaseBusiness}
          title="No matching drives"
          description="Try changing your filters or search."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {drives.map((drive) => (
            <DriveCard
              key={drive.id}
              drive={drive}
              favorite={favorites.includes(drive.id)}
              onFavorite={() => toggleFavorite(drive.id)}
              onView={() => navigate(`/student/drives/${drive.id}`)}
            />
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function DriveCard({ drive, favorite, onFavorite, onView }) {
  return (
    <Card>
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
          <div className="flex items-center gap-1">
            <Badge variant={drive.type === "DREAM" ? "primary" : "default"}>
              {drive.type}
            </Badge>
            <button
              type="button"
              onClick={onFavorite}
              className={`rounded-lg p-2 transition focus:outline-none focus:ring-4 focus:ring-primary-500/10 ${favorite ? "text-danger" : "text-surface-400 hover:text-danger"}`}
              aria-label={
                favorite
                  ? "Remove drive from favorites"
                  : "Add drive to favorites"
              }
              title={favorite ? "Remove favorite" : "Add favorite"}
            >
              {favorite ? (
                <Heart size={18} fill="currentColor" />
              ) : (
                <Heart size={18} />
              )}
            </button>
          </div>
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
          <Badge>
            <Star size={12} /> {drive.openings} openings
          </Badge>
        </div>
        <div className="flex items-center justify-between border-t border-surface-200 pt-4">
          <p className="text-xs text-surface-500">
            Apply by {new Date(drive.applicationDeadline).toLocaleDateString()}
          </p>
          <Button size="sm" onClick={onView}>
            <Search size={15} />
            View details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
function ErrorPanel({ message }) {
  return (
    <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
      {message}
    </div>
  );
}
