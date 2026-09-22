import {
  LayoutDashboard,
  Building2,
  BriefcaseBusiness,
  Users,
  ClipboardList,
  Bell,
  UserCircle,
  Settings,
  FileText,
  GraduationCap,
  LogOut,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../utils";
import { useAuth } from "../../contexts/useAuth";

const studentNavigation = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Placement Drives",
    href: "/student/drives",
    icon: BriefcaseBusiness,
  },
  {
    label: "My Applications",
    href: "/student/applications",
    icon: ClipboardList,
  },
  {
    label: "Notifications",
    href: "/student/notifications",
    icon: Bell,
  },
  {
    label: "My Profile",
    href: "/student/profile",
    icon: UserCircle,
  },
  {
    label: "Resume",
    href: "/student/resume",
    icon: FileText,
  },
  {
    label: "My Placement",
    href: "/student/placement",
    icon: GraduationCap,
  },
];

const tpoNavigation = [
  {
    label: "Dashboard",
    href: "/tpo/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    href: "/tpo/students",
    icon: Users,
  },
  {
    label: "Companies",
    href: "/tpo/companies",
    icon: Building2,
  },
  {
    label: "Placement Drives",
    href: "/tpo/drives",
    icon: BriefcaseBusiness,
  },
  {
    label: "Notifications",
    href: "/tpo/notifications",
    icon: Bell,
  },
];

function NavigationItem({ item, onNavigate }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-surface-600 hover:bg-surface-100 hover:text-surface-900",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={19}
            strokeWidth={isActive ? 2.2 : 1.8}
            className="shrink-0"
          />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar({
  role = "student",
  mobileOpen = false,
  onMobileClose,
}) {
  const isStudent = role === "student";
  const navigation = isStudent ? studentNavigation : tpoNavigation;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-surface-200 bg-white lg:flex lg:flex-col">
        <SidebarContent role={role} navigation={navigation} />
      </aside>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {/* Overlay */}
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onMobileClose}
          className={cn(
            "absolute inset-0 bg-surface-900/40 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Drawer */}
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-200",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-surface-200 px-5 py-4">
            <Brand />

            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Close navigation"
              className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-900"
            >
              <X size={20} />
            </button>
          </div>

          <SidebarContent
            role={role}
            navigation={navigation}
            onNavigate={onMobileClose}
            showBrand={false}
          />
        </aside>
      </div>
    </>
  );
}

function SidebarContent({ role, navigation, onNavigate, showBrand = true }) {
  const isStudent = role === "student";
  const { logout } = useAuth();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {showBrand && (
        <div className="border-b border-surface-200 px-5 py-5">
          <Brand />
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-surface-400">
          {isStudent ? "Student Portal" : "Placement Cell"}
        </p>

        <div className="space-y-1">
          {navigation.map((item) => (
            <NavigationItem
              key={item.href}
              item={item}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-surface-200 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900"
        >
          <Settings size={19} strokeWidth={1.8} />
          <span>Settings</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-surface-600 transition-colors hover:bg-surface-100 hover:text-surface-900"
        >
          <LogOut size={19} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
        P
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-surface-900">
          Placement Cell
        </p>
        <p className="truncate text-xs text-surface-500">
          College Placement Portal
        </p>
      </div>
    </div>
  );
}
