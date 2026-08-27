import api from "./api";

export interface NotificationItemDTO {
  id: string;
  category: "COMMISSIONS" | "NETWORK" | "SECURITY" | "SYSTEM";
  title: string;
  message: string;
  actionUrl?: string | null;
  actionLabel?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItemDTO[];
  unreadCount: number;
}

export const getNotifications = async (): Promise<{
  success: boolean;
  data: NotificationsResponse;
}> => {
  const res = await api.get("/notifications");
  return res.data;
};

export const markNotificationAsRead = async (
  notificationId: string,
): Promise<{ success: boolean }> => {
  const res = await api.patch("/notifications", { notificationId });
  return res.data;
};

export const markAllNotificationsAsRead = async (): Promise<{
  success: boolean;
}> => {
  const res = await api.patch("/notifications", { markAll: true });
  return res.data;
};

export const deleteNotification = async (
  notificationId: string,
): Promise<{ success: boolean }> => {
  const res = await api.delete(`/notifications?id=${notificationId}`);
  return res.data;
};
