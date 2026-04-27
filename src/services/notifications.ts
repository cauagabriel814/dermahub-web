import { apiFetch } from "./api";
import type {
  NotificationRecipient,
  NotificationRecipientCreate,
  NotificationRecipientUpdate,
} from "@/types/api";

export async function getNotificationRecipients() {
  return apiFetch<NotificationRecipient[]>("/notification-recipients");
}

export async function createNotificationRecipient(data: NotificationRecipientCreate) {
  return apiFetch<NotificationRecipient>("/notification-recipients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateNotificationRecipient(
  id: string,
  data: NotificationRecipientUpdate,
) {
  return apiFetch<NotificationRecipient>(`/notification-recipients/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteNotificationRecipient(id: string) {
  return apiFetch(`/notification-recipients/${id}`, { method: "DELETE" });
}

export async function getDefaultNotificationTemplate() {
  return apiFetch<{ template: string }>("/notification-recipients/default-template");
}
