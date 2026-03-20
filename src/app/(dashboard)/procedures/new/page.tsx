"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProcedureRecord, getProcedureTypes } from "@/services/procedures";
import { createPatient, getPatients } from "@/services/patients";
import type { Patient } from "@/types/api";

const schema = z.object({
  patient_search: z.string().min(1, "Busque um paciente"),
  procedure_type_id: z.string().min(1, "Selecione o procedimento"),
  procedure_date: z.string().min(1, "Data obrigatória"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function NewProcedureForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preloadPatientId = searchParams.get("patient_id");

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientPhone, setNewPatientPhone] = useState("");

  const { data: searchResults } = useQuery({
    queryKey: ["patients-search", patientSearch],
    queryFn: () => getPatients({ search: patientSearch, limit: 10 }),
    enabled: patientSearch.length >= 2 && !selectedPatient,
  });

  const { data: procedureTypes } = useQuery({
    queryKey: ["procedure-types"],
    queryFn: () => getProcedureTypes(true),
  });

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { procedure_date: new Date().toISOString().split("T")[0] },
  });

  useEffect(() => {
    if (preloadPatientId && searchResults?.items) {
      const found = searchResults.items.find(p => p.id === preloadPatientId);
      if (found) {
        setSelectedPatient(found);
        setPatientSearch(found.full_name);
        setValue("patient_search", found.full_name);
      }
    }
  }, [preloadPatientId, searchResults, setValue]);

  async function handleCreateInlinePatient() {
    if (!newPatientName || !newPatientPhone) return;
    const p = await createPatient({ full_name: newPatientName, phone: newPatientPhone });
    setSelectedPatient(p);
    setPatientSearch(p.full_name);
    setValue("patient_search", p.full_name);
    setShowNewPatient(false);
  }

  async function onSubmit(data: FormData) {
    if (!selectedPatient) return;
    await createProcedureRecord({
      patient_id: selectedPatient.id,
      procedure_type_id: data.procedure_type_id,
      procedure_date: data.procedure_date,
      notes: data.notes || undefined,
    });
    router.push("/patients");
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-brand font-normal tracking-wide text-foreground">Registrar Procedimento</h1>
        <p className="text-sm text-muted-foreground mt-1">Cadastro rápido — menos de 20 segundos</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-lg border p-6">
        {/* Patient Search */}
        <div className="space-y-1 relative">
          <Label>Paciente *</Label>
          <Input
            placeholder="Nome ou telefone..."
            value={patientSearch}
            {...register("patient_search")}
            onChange={(e) => {
              setPatientSearch(e.target.value);
              setValue("patient_search", e.target.value);
              setSelectedPatient(null);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {errors.patient_search && <p className="text-sm text-red-500">{errors.patient_search.message}</p>}

          {showSuggestions && searchResults && searchResults.items.length > 0 && !selectedPatient && (
            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1">
              {searchResults.items.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm hover:bg-muted/40 first:rounded-t-lg last:rounded-b-lg"
                  onClick={() => {
                    setSelectedPatient(p);
                    setPatientSearch(p.full_name);
                    setValue("patient_search", p.full_name);
                    setShowSuggestions(false);
                  }}
                >
                  <span className="font-medium">{p.full_name}</span>
                  <span className="text-gray-400 ml-2">{p.phone}</span>
                </button>
              ))}
              <button
                type="button"
                className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t"
                onClick={() => { setShowNewPatient(true); setShowSuggestions(false); setNewPatientName(patientSearch); }}
              >
                + Cadastrar novo paciente
              </button>
            </div>
          )}
        </div>

        {/* Inline new patient */}
        {showNewPatient && (
          <div className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-100">
            <p className="text-sm font-medium text-blue-800">Novo paciente</p>
            <Input placeholder="Nome completo" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} />
            <Input placeholder="Telefone (WhatsApp)" value={newPatientPhone} onChange={(e) => setNewPatientPhone(e.target.value)} />
            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={handleCreateInlinePatient}>Adicionar</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowNewPatient(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        {/* Procedure Type */}
        <div className="space-y-1">
          <Label htmlFor="procedure_type_id">Procedimento *</Label>
          <select
            id="procedure_type_id"
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            {...register("procedure_type_id")}
          >
            <option value="">Selecione...</option>
            {procedureTypes?.map((pt) => (
              <option key={pt.id} value={pt.id}>{pt.name}</option>
            ))}
          </select>
          {errors.procedure_type_id && <p className="text-sm text-red-500">{errors.procedure_type_id.message}</p>}
        </div>

        {/* Date */}
        <div className="space-y-1">
          <Label htmlFor="procedure_date">Data *</Label>
          <Input id="procedure_date" type="date" {...register("procedure_date")} />
          {errors.procedure_date && <p className="text-sm text-red-500">{errors.procedure_date.message}</p>}
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <Label htmlFor="notes">Observações</Label>
          <Input id="notes" {...register("notes")} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting || !selectedPatient}>
            {isSubmitting ? "Registrando..." : "Registrar"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}

export default function NewProcedurePage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Carregando...</div>}>
      <NewProcedureForm />
    </Suspense>
  );
}
