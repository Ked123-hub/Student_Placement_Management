import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { notificationService } from "../services/notificationService";

const pageTitles = {
  "/tpo/dashboard": "Dashboard",
  "/tpo/students": "Students",
  "/tpo/companies": "Companies",
  "/tpo/drives": "Placement Drives",
  "/tpo/drives/new": "Create Placement Drive",
  "/tpo/notifications": "Notifications",
};

export default function TpoLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    notificationService
      .list()
      .then((response) => setNotificationCount(response.unreadCount ?? 0))
      .catch(() => setNotificationCount(0));
  }, [location.pathname]);

  const title =
    pageTitles[location.pathname] ||
    getTitleFromPath(location.pathname) ||
    "Placement Cell";

  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar
        role="tpo"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={title}
          onMenuClick={() => setMobileOpen(true)}
          notificationCount={notificationCount}
          userName="TPO Admin"
          userRole="Placement Officer"
        />

        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function getTitleFromPath(pathname) {
  const segment = pathname.split("/").filter(Boolean).pop();

  if (!segment) return null;

  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
