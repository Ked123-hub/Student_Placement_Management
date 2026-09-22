import { api } from "./api";
import { MOCKS_ENABLED } from "../config/env";
import { demoNotifications } from "../mocks/studentData";

export const notificationService = {
  list: (params = {}) =>
    MOCKS_ENABLED
      ? Promise.resolve({
          items: demoNotifications,
          pagination: { page: 1, limit: 20, total: demoNotifications.length },
          unreadCount: demoNotifications.filter((item) => !item.read).length,
        })
      : api.get(`/notifications${toQueryString(params)}`),
  markRead: (notificationId) =>
    MOCKS_ENABLED
      ? markDemoNotificationRead(notificationId)
      : api.patch(`/notifications/${notificationId}/read`),
};

function markDemoNotificationRead(notificationId) {
  const notification = demoNotifications.find(
    (item) => item.id === notificationId,
  );
  if (notification) notification.read = true;
  return Promise.resolve(notification);
}

function toQueryString(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}
