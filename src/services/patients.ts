import { apiFetch } from "./api";
import type { Patient, PatientCreate, PatientListResponse, PatientUpdate } from "@/types/api";

export async function getPatients(params?: { search?: string; skip?: number; limit?: number }) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.skip !== undefined) query.set("skip", String(params.skip));
  if (params?.limit !== undefined) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch<PatientListResponse>(`/patients${qs ? `?${qs}` : ""}`);
}

export async function getPatient(id: string) {
  return apiFetch<Patient>(`/patients/${id}`);
}

export async function createPatient(data: PatientCreate) {
  return apiFetch<Patient>("/patients", { method: "POST", body: JSON.stringify(data) });
}

export async function updatePatient(id: string, data: PatientUpdate) {
  return apiFetch<Patient>(`/patients/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export async function deletePatient(id: string) {
  return apiFetch<void>(`/patients/${id}`, { method: "DELETE" });
}
