import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

export default function ProtectedRoute({
  allowedRoles = [],
  authUser,
  isLoading = false,
}) {
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // User is not authenticated.
  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // User is authenticated but does not have permission
  // to access this route.
  if (allowedRoles.length > 0 && !allowedRoles.includes(authUser.role)) {
    if (authUser.role === "STUDENT") {
      return <Navigate to="/student/dashboard" replace />;
    }

    if (authUser.role === "TPO") {
      return <Navigate to="/tpo/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
