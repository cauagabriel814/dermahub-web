import { apiFetch } from "./api";
import type { ProcedureRecord, ProcedureRecordCreate, ProcedureType, ProcedureTypeCreate, ProcedureTypeUpdate } from "@/types/api";

export async function getProcedureTypes(activeOnly = false) {
  return apiFetch<ProcedureType[]>(`/procedure-types?active_only=${activeOnly}`);
}

export async function createProcedureType(data: ProcedureTypeCreate) {
  return apiFetch<ProcedureType>("/procedure-types", { method: "POST", body: JSON.stringify(data) });
}

export async function updateProcedureType(id: string, data: ProcedureTypeUpdate) {
  return apiFetch<ProcedureType>(`/procedure-types/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function getProcedureRecords(patientId?: string) {
  const qs = patientId ? `?patient_id=${patientId}` : "";
  return apiFetch<ProcedureRecord[]>(`/procedure-records${qs}`);
}

export async function createProcedureRecord(data: ProcedureRecordCreate) {
  return apiFetch<ProcedureRecord>("/procedure-records", { method: "POST", body: JSON.stringify(data) });
}
