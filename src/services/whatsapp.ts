import { apiFetch } from "./api";

export type WhatsAppStatus = "connected" | "disconnected" | "connecting" | "unknown";

export interface WhatsAppStatusResponse {
  status: WhatsAppStatus;
  raw: unknown;
}

export interface WhatsAppQRResponse {
  qrcode: string | null;
  raw: unknown;
}

export async function getWhatsAppStatus() {
  return apiFetch<WhatsAppStatusResponse>("/whatsapp/status");
}

export async function connectWhatsApp() {
  return apiFetch<WhatsAppQRResponse>("/whatsapp/connect", { method: "POST" });
}
