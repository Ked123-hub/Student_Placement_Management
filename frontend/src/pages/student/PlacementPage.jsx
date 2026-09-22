import { useEffect, useState } from "react";
import { Building2, GraduationCap } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent } from "../../components/ui/Card";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { studentService } from "../../services/studentService";

export default function PlacementPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    studentService
      .getPlacement()
      .then(setData)
      .catch((requestError) => setError(requestError.message));
  }, []);
  if (!data && !error)
    return <LoadingScreen message="Loading placement status..." />;
  if (error)
    return (
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
        {error}
      </div>
    );
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-600">Outcome</p>
        <h2 className="mt-1 text-2xl font-semibold text-surface-900">
          My placement
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          Your final placement record will appear here.
        </p>
      </div>
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          {data.placement ? (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <Building2 size={26} />
              </div>
              <div>
                <Badge variant="success">PLACED</Badge>
                <h3 className="mt-2 font-semibold text-surface-900">
                  {data.placement.companyName}
                </h3>
                <p className="text-sm text-surface-500">
                  {data.placement.jobRole} · {data.placement.package} LPA
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <GraduationCap size={26} />
              </div>
              <div>
                <Badge variant="warning">UNPLACED</Badge>
                <p className="mt-2 text-sm text-surface-500">
                  Keep exploring drives and tracking your applications.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
