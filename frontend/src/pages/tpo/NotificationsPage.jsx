import { useEffect, useState } from "react";
import { Bell, Check, Filter } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { SearchBar } from "../../components/ui/SearchBar";
import { Select } from "../../components/ui/Select";
import { notificationService } from "../../services/notificationService";

const typeOptions = [
  { value: "DRIVE", label: "Drive" },
  { value: "SHORTLIST", label: "Shortlist" },
  { value: "ROUND", label: "Round" },
  { value: "ACADEMIC_UPDATE", label: "Academic update" },
];

export default function NotificationsPage() {
  const [response, setResponse] = useState(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    notificationService
      .list({ type, unread: unreadOnly ? "true" : "" })
      .then(setResponse)
      .catch((requestError) => setError(requestError.message));
  }, [type, unreadOnly]);

  if (!response && !error) {
    return <LoadingScreen message="Loading placement-cell notifications..." />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
        {error}
      </div>
    );
  }

  const visibleNotifications = response.items.filter((notification) =>
    `${notification.title} ${notification.message}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const markRead = async (notificationId) => {
    await notificationService.markRead(notificationId);
    setResponse((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === notificationId ? { ...item, read: true } : item,
      ),
      unreadCount: Math.max(0, current.unreadCount - 1),
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-600">Placement cell</p>
        <h2 className="mt-1 text-2xl font-semibold text-surface-900">
          Notifications
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          Review operational updates that need your attention.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[minmax(220px,1fr)_190px_auto]">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search notifications"
          />
          <Select
            value={type}
            onChange={(event) => setType(event.target.value)}
            options={typeOptions}
            placeholder="All types"
          />
          <button
            type="button"
            onClick={() => setUnreadOnly((current) => !current)}
            aria-pressed={unreadOnly}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-primary-500/10 ${unreadOnly ? "border-primary-600 bg-primary-50 text-primary-700" : "border-surface-300 text-surface-600 hover:bg-surface-50"}`}
          >
            <Filter size={16} />
            Unread only
          </button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-surface-500">
        <span>{visibleNotifications.length} notifications</span>
        <span>{response.unreadCount} unread</span>
      </div>

      {visibleNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications found"
          description="Try changing the search or notification filters."
        />
      ) : (
        <div className="space-y-3">
          {visibleNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.read ? "" : "border-primary-200"}
            >
              <CardContent className="flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                  <Bell size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-surface-900">
                      {notification.title}
                    </h3>
                    <Badge variant={notification.read ? "default" : "primary"}>
                      {notification.read ? "Read" : "Unread"}
                    </Badge>
                    <Badge>{notification.type.replaceAll("_", " ")}</Badge>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-surface-600">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-xs text-surface-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    type="button"
                    onClick={() => markRead(notification.id)}
                    className="self-start rounded-lg p-2 text-surface-400 transition hover:bg-surface-100 hover:text-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                    aria-label="Mark notification as read"
                    title="Mark as read"
                  >
                    <Check size={17} />
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
