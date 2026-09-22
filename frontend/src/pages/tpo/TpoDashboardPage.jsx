import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  GraduationCap,
  Percent,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { StatCard } from "../../components/ui/StatCard";
import { adminService } from "../../services/adminService";

export default function TpoDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService
      .getDashboard()
      .then(setDashboard)
      .catch((requestError) => setError(requestError.message));
  }, []);

  if (!dashboard && !error)
    return <LoadingScreen message="Loading placement overview..." />;
  if (error) return <ErrorPanel message={error} />;

  const stats = [
    {
      title: "Total Students",
      value: dashboard.students,
      icon: Users,
      description: "Current student records",
    },
    {
      title: "Placed Students",
      value: dashboard.placed,
      icon: GraduationCap,
      description: `${dashboard.placementRate}% placement rate`,
    },
    {
      title: "Active Drives",
      value: dashboard.activeDrives,
      icon: BriefcaseBusiness,
      description: "Open or upcoming drives",
    },
    {
      title: "Average Package",
      value: `${dashboard.averagePackage} LPA`,
      icon: TrendingUp,
      description: `${dashboard.applications} applications recorded`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-600">
          Placement overview
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-surface-900">
          Good morning, TPO Admin
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          Track student outcomes and recruitment activity in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Company-wise selections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.companyWiseSelections.map((company) => (
              <div key={company.companyName}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-surface-800">
                    {company.companyName}
                  </span>
                  <span className="font-semibold text-surface-900">
                    {company.selected}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-100">
                  <div
                    className="h-full rounded-full bg-primary-600"
                    style={{ width: `${Math.min(company.selected, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Placement snapshot</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-5">
            <div
              className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#2563eb ${dashboard.placementRate}%, #e2e8f0 0)`,
              }}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-xl font-bold text-surface-900">
                {dashboard.placementRate}%
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2 text-surface-600">
                <span className="h-2.5 w-2.5 rounded-full bg-primary-600" />
                Placed: {dashboard.placed}
              </p>
              <p className="flex items-center gap-2 text-surface-600">
                <span className="h-2.5 w-2.5 rounded-full bg-surface-300" />
                Unplaced: {dashboard.unplaced}
              </p>
              <p className="flex items-center gap-2 text-surface-600">
                <Percent size={15} />
                Placement rate
              </p>
            </div>
          </CardContent>
        </Card>
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
