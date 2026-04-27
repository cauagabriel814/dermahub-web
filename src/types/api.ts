export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  clinic_id: string;
  name: string;
  email: string;
  role: "admin" | "secretary";
}

// Patient
export interface Patient {
  id: string;
  clinic_id: string;
  full_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  last_procedure_date: string | null;
  updated_at: string;
}
export interface PatientListResponse { items: Patient[]; total: number; }
export interface PatientCreate { full_name: string; phone: string; email?: string; notes?: string; }
export interface PatientUpdate { full_name?: string; phone?: string; email?: string; notes?: string; }

// ProcedureType
export interface ProcedureType {
  id: string;
  clinic_id: string;
  name: string;
  default_recall_days: number;
  price: number | null;
  active: boolean;
}
export interface ProcedureTypeCreate { name: string; default_recall_days: number; price?: number; }
export interface ProcedureTypeUpdate { name?: string; default_recall_days?: number; price?: number; active?: boolean; }

// ProcedureRecord
export interface ProcedureRecord {
  id: string;
  clinic_id: string;
  patient_id: string;
  procedure_type_id: string;
  procedure_date: string;
  notes: string | null;
  created_by_user_id: string;
}
export interface ProcedureRecordCreate {
  patient_id: string;
  procedure_type_id: string;
  procedure_date: string;
  notes?: string;
}

// MessageTemplate
export type MessageType = "text" | "buttons" | "carousel";
export interface TemplateButton {
  id: string;
  text: string;
  type: "REPLY" | "URL" | "COPY" | "CALL";
}
export interface CarouselItem {
  text: string;
  image?: string;
  buttons: TemplateButton[];
}
export interface TemplateComponents {
  buttons?: TemplateButton[];
  carousel?: CarouselItem[];
  image?: string;
}
export interface MessageTemplate {
  id: string;
  clinic_id: string;
  name: string;
  content: string;
  message_type: MessageType;
  components: TemplateComponents | null;
  active: boolean;
}
export interface MessageTemplateCreate {
  name: string;
  content: string;
  message_type?: MessageType;
  components?: TemplateComponents | null;
}
export interface MessageTemplateUpdate {
  name?: string;
  content?: string;
  message_type?: MessageType;
  components?: TemplateComponents | null;
  active?: boolean;
}

// AutomationRule
export type EventType = "post_procedure" | "recall";
export interface AutomationRule {
  id: string;
  clinic_id: string;
  procedure_type_id: string;
  name: string;
  trigger_offset_days: number;
  message_template_id: string;
  event_type: EventType;
  sort_order: number;
  active: boolean;
}
export interface AutomationRuleCreate {
  procedure_type_id: string;
  name: string;
  trigger_offset_days: number;
  message_template_id: string;
  event_type?: EventType;
  sort_order?: number;
}
export interface AutomationRuleUpdate {
  name?: string;
  trigger_offset_days?: number;
  message_template_id?: string;
  event_type?: EventType;
  sort_order?: number;
  active?: boolean;
}

// ScheduledMessage
export type MessageStatus = "pending" | "sent" | "delivered" | "failed" | "cancelled";
export interface ScheduledMessage {
  id: string;
  clinic_id: string;
  patient_id: string;
  procedure_record_id: string;
  automation_rule_id: string;
  content: string;
  scheduled_for: string;
  status: MessageStatus;
  sent_at: string | null;
  failure_reason: string | null;
  patient_name: string | null;
  patient_phone: string | null;
  procedure_name: string | null;
}

// Dashboard
export interface DashboardSummary {
  total_patients: number;
  procedures_this_month: number;
  pending_messages: number;
  messages_sent_this_month: number;
}

// MessageLog
export interface MessageLog {
  id: string;
  clinic_id: string;
  patient_id: string;
  patient_name: string | null;
  procedure_name: string | null;
  scheduled_message_id: string | null;
  direction: "outbound" | "inbound";
  content: string;
  provider_message_id: string;
  sent_at: string | null;
  delivery_status: string;
}

// ROI Dashboard
export interface RoiFunnel {
  sent: number;
  delivered: number;
  responded: number;
  positive: number;
  returned: number;
}
export interface RoiRanking {
  procedure: string;
  price: number;
  sent: number;
  positive: number;
  returned: number;
  potential_revenue: number;
  confirmed_revenue: number;
}
export interface RoiDashboard {
  period_days: number;
  funnel: RoiFunnel;
  potential_revenue: number;
  confirmed_revenue: number;
  response_rate: number;
  conversion_rate: number;
  ranking: RoiRanking[];
}

// Notification Recipients
export interface NotificationRecipient {
  id: string;
  clinic_id: string;
  name: string;
  phone: string;
  message_template: string;
  active: boolean;
}
export interface NotificationRecipientCreate {
  name: string;
  phone: string;
  message_template?: string;
  active?: boolean;
}
export interface NotificationRecipientUpdate {
  name?: string;
  phone?: string;
  message_template?: string;
  active?: boolean;
}

// Leads
export type LeadStatus = "waiting" | "sent" | "responded" | "scheduled" | "returned" | "not_interested";
export interface Lead {
  id: string;
  patient_name: string;
  patient_phone: string;
  patient_id: string;
  procedure_name: string;
  procedure_price: number;
  scheduled_for: string | null;
  sent_at: string | null;
  responded_at: string | null;
  lead_status: LeadStatus;
  lead_contacted_at: string | null;
  days_since_contact: number | null;
}
export interface LeadsSummary {
  waiting: number;
  sent: number;
  responded: number;
  scheduled: number;
  returned: number;
  not_interested: number;
}
export interface LeadsResponse {
  summary: LeadsSummary;
  items: Lead[];
}

// User Management
export interface UserInfo {
  id: string;
  clinic_id: string;
  name: string;
  email: string;
  role: "admin" | "secretary";
  created_at: string;
}
export interface UserCreateData {
  name: string;
  email: string;
  password: string;
  role: "admin" | "secretary";
}
export interface UserUpdateData {
  name?: string;
  email?: string;
  role?: "admin" | "secretary";
}
