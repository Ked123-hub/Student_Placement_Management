import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import StudentLayout from "../layouts/StudentLayout";
import TpoLayout from "../layouts/TpoLayout";
import { useAuth } from "../contexts/useAuth";
import LoginPage from "../pages/auth/LoginPage";
import TpoDashboardPage from "../pages/tpo/TpoDashboardPage";
import StudentsPage from "../pages/tpo/StudentsPage";
import CompaniesPage from "../pages/tpo/CompaniesPage";
import DrivesPage from "../pages/tpo/DrivesPage";
import DriveFormPage from "../pages/tpo/DriveFormPage";
import StudentDashboardPage from "../pages/student/StudentDashboardPage";
import StudentDrivesPage from "../pages/student/StudentDrivesPage";
import DriveDetailsPage from "../pages/student/DriveDetailsPage";
import ApplicationsPage from "../pages/student/ApplicationsPage";
import NotificationsPage from "../pages/student/NotificationsPage";
import ProfilePage from "../pages/student/ProfilePage";
import ResumePage from "../pages/student/ResumePage";
import PlacementPage from "../pages/student/PlacementPage";

function PlaceholderPage({ title }) {
  return (
    <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-surface-900">{title}</h2>

      <p className="mt-1 text-sm text-surface-500">
        This page will be implemented next.
      </p>
    </div>
  );
}

export default function AppRoutes() {
  const { user: authUser, isLoading } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Student routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["STUDENT"]}
              authUser={authUser}
              isLoading={isLoading}
            />
          }
        >
          <Route path="/student" element={<StudentLayout />}>
            <Route
              index
              element={<Navigate to="/student/dashboard" replace />}
            />

            <Route path="dashboard" element={<StudentDashboardPage />} />

            <Route path="drives" element={<StudentDrivesPage />} />

            <Route path="drives/:driveId" element={<DriveDetailsPage />} />

            <Route path="applications" element={<ApplicationsPage />} />

            <Route path="notifications" element={<NotificationsPage />} />

            <Route path="profile" element={<ProfilePage />} />

            <Route path="resume" element={<ResumePage />} />
            <Route path="placement" element={<PlacementPage />} />
          </Route>
        </Route>

        {/* TPO routes */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["TPO"]}
              authUser={authUser}
              isLoading={isLoading}
            />
          }
        >
          <Route path="/tpo" element={<TpoLayout />}>
            <Route index element={<Navigate to="/tpo/dashboard" replace />} />

            <Route path="dashboard" element={<TpoDashboardPage />} />

            <Route path="students" element={<StudentsPage />} />

            <Route path="companies" element={<CompaniesPage />} />

            <Route path="drives" element={<DrivesPage />} />

            <Route path="drives/new" element={<DriveFormPage />} />
            <Route path="drives/:driveId" element={<DriveFormPage />} />

            <Route
              path="notifications"
              element={<PlaceholderPage title="Notifications" />}
            />
          </Route>
        </Route>

        {/* Root */}
        <Route
          path="/"
          element={<Navigate to="/student/dashboard" replace />}
        />

        {/* Unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
