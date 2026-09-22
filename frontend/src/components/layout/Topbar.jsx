import {
  Bell,
  Menu,
  ChevronDown,
  UserCircle,
} from "lucide-react";

export default function Topbar({
  title,
  onMenuClick,
  notificationCount = 0,
  userName = "User",
  userRole = "Student",
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-surface-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-surface-600 hover:bg-surface-100 hover:text-surface-900 lg:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-surface-900 sm:text-lg">
            {title}
          </h1>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-900"
        >
          <Bell size={20} strokeWidth={1.9} />

          {notificationCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="hidden h-7 w-px bg-surface-200 sm:block" />

        {/* User */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-surface-100"
        >
          <UserCircle
            size={32}
            strokeWidth={1.6}
            className="text-surface-500"
          />

          <div className="hidden text-left sm:block">
            <p className="max-w-32 truncate text-sm font-medium text-surface-800">
              {userName}
            </p>
            <p className="text-xs text-surface-500">{userRole}</p>
          </div>

          <ChevronDown
            size={16}
            className="hidden text-surface-400 sm:block"
          />
        </button>
      </div>
    </header>
  );
}