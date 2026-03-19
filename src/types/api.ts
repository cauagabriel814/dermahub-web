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
