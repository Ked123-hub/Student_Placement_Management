import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { Pagination } from "../../components/ui/Pagination";
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
import { adminService } from "../../services/adminService";

const branchOptions = [
  { value: "Computer Engineering", label: "Computer Engineering" },
  { value: "Information Technology", label: "Information Technology" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering" },
  { value: "Electronics Engineering", label: "Electronics Engineering" },
];

export default function StudentsPage() {
  const [filters, setFilters] = useState({
    search: "",
    branch: "",
    year: "",
    placementStatus: "",
  });
  const [students, setStudents] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .listStudents(filters)
      .then((response) => setStudents(response))
      .catch((requestError) => setError(requestError.message));
  }, [filters]);

  if (!students && !error)
    return <LoadingScreen message="Loading students..." />;
  if (error)
    return (
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
        {error}
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-primary-600">
            Student management
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-surface-900">
            Students
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            Search academic records and placement status.
          </p>
        </div>
        <p className="text-sm text-surface-500">
          {students.pagination.total} records
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(220px,1.5fr)_1fr_0.6fr_1fr]">
          <SearchBar
            value={filters.search}
            onChange={(search) =>
              setFilters((current) => ({ ...current, search }))
            }
            placeholder="Search name or PRN"
          />
          <Select
            value={filters.branch}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                branch: event.target.value,
              }))
            }
            options={branchOptions}
            placeholder="All branches"
          />
          <Select
            value={filters.year}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                year: event.target.value,
              }))
            }
            options={[
              { value: "3", label: "Year 3" },
              { value: "4", label: "Year 4" },
            ]}
            placeholder="All years"
          />
          <Select
            value={filters.placementStatus}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                placementStatus: event.target.value,
              }))
            }
            options={[
              { value: "PLACED", label: "Placed" },
              { value: "UNPLACED", label: "Unplaced" },
            ]}
            placeholder="All statuses"
          />
        </CardContent>
      </Card>

      {students.items.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          description="Try changing the search or filters."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>PRN</TableHead>
                  <TableHead>Branch / Year</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Backlogs</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.items.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-surface-900">
                          {student.name}
                        </p>
                        <p className="text-xs text-surface-500">
                          Roll no. {student.rollNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {student.prn}
                    </TableCell>
                    <TableCell>
                      <p>{student.branch}</p>
                      <p className="text-xs text-surface-500">
                        Year {student.year}
                      </p>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {student.cgpa.toFixed(1)}
                    </TableCell>
                    <TableCell>{student.backlogs}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.placementStatus === "PLACED"
                            ? "success"
                            : "default"
                        }
                      >
                        {student.placementStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="border-t border-surface-200 p-4">
            <Pagination
              page={students.pagination.page}
              totalPages={Math.max(
                1,
                Math.ceil(
                  students.pagination.total / students.pagination.limit,
                ),
              )}
              onPageChange={() => {}}
            />
          </div>
        </Card>
      )}
    </div>
  );
}
