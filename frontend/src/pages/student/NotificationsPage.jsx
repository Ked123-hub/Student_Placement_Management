import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card, CardContent } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingScreen } from "../../components/ui/LoadingSpinner";
import { notificationService } from "../../services/notificationService";

export default function NotificationsPage() {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    notificationService
      .list()
      .then(setResponse)
      .catch((requestError) => setError(requestError.message));
  }, []);
  if (!response && !error)
    return <LoadingScreen message="Loading notifications..." />;
  if (error) return <ErrorPanel message={error} />;
  const markRead = async (id) => {
    await notificationService.markRead(id);
    setResponse((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
      unreadCount: Math.max(0, current.unreadCount - 1),
    }));
  };
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-600">Updates</p>
        <h2 className="mt-1 text-2xl font-semibold text-surface-900">
          Notifications
        </h2>
        <p className="mt-1 text-sm text-surface-500">
          You have {response.unreadCount} unread updates.
        </p>
      </div>
      {response.items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are all caught up."
        />
      ) : (
        <div className="space-y-3">
          {response.items.map((notification) => (
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
                    {!notification.read && <Badge variant="primary">New</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-surface-600">
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
                    className="self-start rounded-lg p-2 text-surface-400 hover:bg-surface-100 hover:text-primary-600"
                    aria-label="Mark notification as read"
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
function ErrorPanel({ message }) {
  return (
    <div className="rounded-xl border border-danger/20 bg-danger/5 p-6 text-sm text-danger">
      {message}
    </div>
  );
}
