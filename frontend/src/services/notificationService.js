import { api } from "./api";
import { MOCKS_ENABLED } from "../config/env";
import { demoNotifications } from "../mocks/studentData";
import { demoTpoNotifications } from "../mocks/tpoData";
import { getAccessToken } from "./api";
import { paginate } from "../mocks/utils";

export const notificationService = {
  list: (params = {}) =>
    MOCKS_ENABLED
      ? getMockNotifications(params)
      : api.get(`/notifications${toQueryString(params)}`),
  markRead: (notificationId) =>
    MOCKS_ENABLED
      ? markMockNotificationRead(notificationId)
      : api.patch(`/notifications/${notificationId}/read`),
};

function getMockNotifications(params) {
  const notifications =
    getAccessToken() === "demo:TPO" ? demoTpoNotifications : demoNotifications;
  const type = params.type ?? "";
  const unreadOnly = params.unread === "true";
  const items = notifications.filter(
    (notification) =>
      (!type || notification.type === type) &&
      (!unreadOnly || !notification.read),
  );

  return Promise.resolve({
    ...paginate(items, params),
    unreadCount: notifications.filter((item) => !item.read).length,
  });
}

function markMockNotificationRead(notificationId) {
  const notifications =
    getAccessToken() === "demo:TPO" ? demoTpoNotifications : demoNotifications;
  const notification = notifications.find((item) => item.id === notificationId);
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
