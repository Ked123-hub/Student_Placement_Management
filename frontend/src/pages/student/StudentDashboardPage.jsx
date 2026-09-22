import { useEffect, useState } from "react";
import {
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { StatCard } from "../../components/ui/StatCard";
import { Badge } from "../../components/ui/Badge";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { studentService } from "../../services/studentService";

export default function StudentDashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    studentService
      .getDashboard()
      .then(setData)
      .catch((requestError) => setError(requestError.message));
  }, []);
  if (!data && !error)
    return <LoadingScreen message="Loading your dashboard..." />;
  if (error) return <ErrorPanel message={error} />;
  const stats = [
    {
      title: "Active drives",
      value: data.activeDrives,
      icon: BriefcaseBusiness,
      description: "Opportunities you can explore",
    },
    {
      title: "Applications",
      value: data.applications,
      icon: ClipboardList,
      description: "Applications submitted",
    },
    {
      title: "Shortlisted",
      value: data.shortlisted,
      icon: UserCheck,
      description: "Moving through recruitment",
    },
    {
      title: "Selected",
      value: data.selected,
      icon: GraduationCap,
      description: "Final selections",
    },
  ];
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-600">Student portal</p>
        <h2 className="mt-1 text-2xl font-semibold text-surface-900">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          Keep track of your placement journey and upcoming opportunities.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Placement status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <GraduationCap size={30} />
            </div>
            <div>
              <Badge
                variant={
                  data.placementStatus === "PLACED" ? "success" : "warning"
                }
              >
                {data.placementStatus}
              </Badge>
              <p className="mt-2 text-sm text-surface-500">
                Your final placement status will update here.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentNotifications?.length ? (
              <div className="space-y-3">
                {data.recentNotifications.map((item) => (
                  <p key={item.id} className="text-sm text-surface-700">
                    {item.title}
                  </p>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-sm text-surface-500">
                <Bell size={18} />
                No new activity right now.
              </div>
            )}
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
