import { apiFetch } from "./api";
import type {
  AutomationRule,
  AutomationRuleCreate,
  AutomationRuleUpdate,
  DashboardSummary,
  MessageLog,
  MessageTemplate,
  MessageTemplateCreate,
  MessageTemplateUpdate,
  ScheduledMessage,
  MessageStatus,
} from "@/types/api";

// --- Message Templates ---
export async function getMessageTemplates(activeOnly = false) {
  return apiFetch<MessageTemplate[]>(`/message-templates?active_only=${activeOnly}`);
}
export async function getMessageTemplate(id: string) {
  return apiFetch<MessageTemplate>(`/message-templates/${id}`);
}
export async function createMessageTemplate(data: MessageTemplateCreate) {
  return apiFetch<MessageTemplate>("/message-templates", { method: "POST", body: JSON.stringify(data) });
}
export async function updateMessageTemplate(id: string, data: MessageTemplateUpdate) {
  return apiFetch<MessageTemplate>(`/message-templates/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

// --- Automation Rules ---
export async function getAutomationRules(procedureTypeId?: string, activeOnly = false) {
  const q = new URLSearchParams();
  if (procedureTypeId) q.set("procedure_type_id", procedureTypeId);
  if (activeOnly) q.set("active_only", "true");
  const qs = q.toString();
  return apiFetch<AutomationRule[]>(`/automations${qs ? `?${qs}` : ""}`);
}
export async function createAutomationRule(data: AutomationRuleCreate) {
  return apiFetch<AutomationRule>("/automations", { method: "POST", body: JSON.stringify(data) });
}
export async function updateAutomationRule(id: string, data: AutomationRuleUpdate) {
  return apiFetch<AutomationRule>(`/automations/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

// --- Scheduled Messages ---
export async function getScheduledMessages(params?: { patient_id?: string; status?: MessageStatus; skip?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.patient_id) q.set("patient_id", params.patient_id);
  if (params?.status) q.set("status", params.status);
  if (params?.skip !== undefined) q.set("skip", String(params.skip));
  if (params?.limit !== undefined) q.set("limit", String(params.limit));
  const qs = q.toString();
  return apiFetch<ScheduledMessage[]>(`/scheduled-messages${qs ? `?${qs}` : ""}`);
}
export async function updateScheduledMessage(id: string, data: { scheduled_for?: string; status?: MessageStatus }) {
  return apiFetch<ScheduledMessage>(`/scheduled-messages/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

// --- Dashboard ---
export async function getDashboardSummary() {
  return apiFetch<DashboardSummary>("/dashboard/summary");
}
export async function getUpcomingRecalls(days = 7) {
  return apiFetch<Array<{ id: string; patient_id: string; scheduled_for: string; content: string; status: string }>>(
    `/dashboard/upcoming-recalls?days=${days}`
  );
}

// --- Messages ---
export async function getMessageLogs(params?: { patient_id?: string; skip?: number; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.patient_id) q.set("patient_id", params.patient_id);
  if (params?.skip !== undefined) q.set("skip", String(params.skip));
  if (params?.limit !== undefined) q.set("limit", String(params.limit));
  const qs = q.toString();
  return apiFetch<MessageLog[]>(`/messages${qs ? `?${qs}` : ""}`);
}
