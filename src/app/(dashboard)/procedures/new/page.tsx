"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProcedureRecord, getProcedureTypes } from "@/services/procedures";
import { createPatient, getPatients } from "@/services/patients";
import type { Patient } from "@/types/api";

interface ProcedureLine {
  id: string; // local uid for React key
  procedure_type_id: string;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

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

  const [procedureLines, setProcedureLines] = useState<ProcedureLine[]>([
    { id: uid(), procedure_type_id: "" },
  ]);
  const [procedureDate, setProcedureDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: searchResults } = useQuery({
    queryKey: ["patients-search", patientSearch],
    queryFn: () => getPatients({ search: patientSearch, limit: 10 }),
    enabled: patientSearch.length >= 2 && !selectedPatient,
  });

  const { data: procedureTypes } = useQuery({
    queryKey: ["procedure-types"],
    queryFn: () => getProcedureTypes(true),
  });

  useEffect(() => {
    if (preloadPatientId && searchResults?.items) {
      const found = searchResults.items.find((p) => p.id === preloadPatientId);
      if (found) {
        setSelectedPatient(found);
        setPatientSearch(found.full_name);
      }
    }
  }, [preloadPatientId, searchResults]);

  async function handleCreateInlinePatient() {
    if (!newPatientName || !newPatientPhone) return;
    const p = await createPatient({ full_name: newPatientName, phone: newPatientPhone });
    setSelectedPatient(p);
    setPatientSearch(p.full_name);
    setShowNewPatient(false);
  }

  function addLine() {
    setProcedureLines((lines) => [...lines, { id: uid(), procedure_type_id: "" }]);
  }

  function removeLine(id: string) {
    setProcedureLines((lines) => (lines.length > 1 ? lines.filter((l) => l.id !== id) : lines));
  }

  function updateLine(id: string, procedure_type_id: string) {
    setProcedureLines((lines) => lines.map((l) => (l.id === id ? { ...l, procedure_type_id } : l)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedPatient) {
      setError("Selecione um paciente");
      return;
    }
    if (!procedureDate) {
      setError("Informe a data");
      return;
    }
    const validLines = procedureLines.filter((l) => l.procedure_type_id);
    if (validLines.length === 0) {
      setError("Selecione ao menos um procedimento");
      return;
    }
    // Detect duplicates
    const ids = validLines.map((l) => l.procedure_type_id);
    if (new Set(ids).size !== ids.length) {
      setError("Não pode repetir o mesmo procedimento");
      return;
    }

    setIsSubmitting(true);
    try {
      for (const line of validLines) {
        await createProcedureRecord({
          patient_id: selectedPatient.id,
          procedure_type_id: line.procedure_type_id,
          procedure_date: procedureDate,
          notes: notes || undefined,
        });
      }
      router.push("/patients");
    } catch (err) {
      setError("Erro ao registrar procedimento(s). Tente novamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Procedure types not yet picked — to avoid duplicates in selects
  const pickedIds = new Set(procedureLines.map((l) => l.procedure_type_id).filter(Boolean));

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-brand font-normal tracking-wide text-foreground" data-tour="new-procedure-title">
          Registrar Procedimento
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Cadastro rápido — você pode adicionar vários procedimentos de uma vez
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg border p-6">
        {/* Patient Search */}
        <div className="space-y-1 relative" data-tour="new-procedure-patient">
          <Label>Paciente *</Label>
          <Input
            placeholder="Nome ou telefone..."
            value={patientSearch}
            onChange={(e) => {
              setPatientSearch(e.target.value);
              setSelectedPatient(null);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />

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
                onClick={() => {
                  setShowNewPatient(true);
                  setShowSuggestions(false);
                  setNewPatientName(patientSearch);
                }}
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
              <Button type="button" size="sm" onClick={handleCreateInlinePatient}>
                Adicionar
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setShowNewPatient(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Procedure lines */}
        <div className="space-y-2" data-tour="new-procedure-type">
          <div className="flex items-center justify-between">
            <Label>Procedimentos *</Label>
            <button
              type="button"
              onClick={addLine}
              className="inline-flex items-center gap-1 text-xs font-semibold transition-colors"
              style={{ color: "var(--terracotta)" }}
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar outro
            </button>
          </div>
          {procedureLines.map((line, i) => (
            <div key={line.id} className="flex gap-2 items-start">
              <select
                value={line.procedure_type_id}
                onChange={(e) => updateLine(line.id, e.target.value)}
                className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="">Selecione...</option>
                {procedureTypes?.map((pt) => (
                  <option
                    key={pt.id}
                    value={pt.id}
                    disabled={pickedIds.has(pt.id) && line.procedure_type_id !== pt.id}
                  >
                    {pt.name}
                  </option>
                ))}
              </select>
              {procedureLines.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLine(line.id)}
                  className="p-2 rounded-md hover:bg-red-50 transition-colors"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" style={{ color: "oklch(0.55 0.15 27)" }} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Date */}
        <div className="space-y-1">
          <Label htmlFor="procedure_date">Data *</Label>
          <Input
            id="procedure_date"
            type="date"
            value={procedureDate}
            onChange={(e) => setProcedureDate(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <Label htmlFor="notes">Observações</Label>
          <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting || !selectedPatient} data-tour="new-procedure-submit">
            {isSubmitting ? "Registrando..." : "Registrar"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
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
