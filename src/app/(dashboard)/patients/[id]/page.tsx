"use client";

import { use, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, CalendarDays, ClipboardList, MessageSquare, Send, Inbox, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPatient, updatePatient } from "@/services/patients";
import { getProcedureRecords, getProcedureTypes } from "@/services/procedures";
import { getScheduledMessages, getMessageLogs } from "@/services/messaging";

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: "oklch(0.520 0.120 45 / 0.10)", color: "oklch(0.520 0.120 45)", label: "Pendente" },
  sent:      { bg: "oklch(0.380 0.060 150 / 0.10)", color: "oklch(0.380 0.060 150)", label: "Enviado" },
  delivered: { bg: "oklch(0.380 0.060 150 / 0.18)", color: "oklch(0.320 0.060 150)", label: "Entregue" },
  failed:    { bg: "oklch(0.540 0.200 25 / 0.10)", color: "oklch(0.540 0.200 25)", label: "Falhou" },
  cancelled: { bg: "var(--muted)", color: "var(--muted-foreground)", label: "Cancelado" },
};

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", notes: "" });
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatient(id),
  });

  useEffect(() => {
    if (patient) {
      setForm({
        full_name: patient.full_name || "",
        phone: patient.phone || "",
        email: patient.email || "",
        notes: patient.notes || "",
      });
    }
  }, [patient]);

  const updateMut = useMutation({
    mutationFn: () => updatePatient(id, {
      full_name: form.full_name || undefined,
      phone: form.phone || undefined,
      email: form.email || undefined,
      notes: form.notes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient", id] });
      qc.invalidateQueries({ queryKey: ["patients"] });
      setEditing(false);
      setSaveError(null);
    },
    onError: () => setSaveError("Erro ao salvar. Verifique os dados e tente novamente."),
  });

  const { data: records = [] } = useQuery({
    queryKey: ["procedure-records", id],
    queryFn: () => getProcedureRecords(id),
    enabled: !!id,
  });

  const { data: procedureTypes = [] } = useQuery({
    queryKey: ["procedure-types"],
    queryFn: () => getProcedureTypes(),
  });

  const { data: scheduledMsgs = [] } = useQuery({
    queryKey: ["scheduled-messages", id],
    queryFn: () => getScheduledMessages({ patient_id: id, limit: 20 }),
    enabled: !!id,
  });

  const { data: messageLogs = [] } = useQuery({
    queryKey: ["message-logs", id],
    queryFn: () => getMessageLogs({ patient_id: id, limit: 20 }),
    enabled: !!id,
  });

  const ptMap = Object.fromEntries(procedureTypes.map((p) => [p.id, p.name]));

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-2 w-2 rounded-full animate-pulse"
              style={{ background: "oklch(0.844 0.024 55.1)", animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!patient) return <div className="p-8 text-center" style={{ color: "oklch(0.596 0.036 57.9)" }}>Paciente não encontrado.</div>;

  const initials = patient.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 animate-fade-up">
        <Link href="/patients">
          <Button variant="ghost" size="sm" className="gap-1.5 rounded-xl text-xs"
            style={{ color: "oklch(0.596 0.036 57.9)" }}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Patient card */}
      <div
        className="animate-fade-up rounded-2xl overflow-hidden"
        style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.878 0.015 58)", boxShadow: "var(--shadow-warm-sm)" }}
      >
        <div className="h-[3px]" style={{ background: "linear-gradient(90deg, var(--terracotta), oklch(0.600 0.100 50))" }} />
        <div className="p-6 flex gap-5 items-start">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl shrink-0 text-xl font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--terracotta), oklch(0.480 0.130 44))",
              color: "var(--primary-foreground)",
              fontFamily: "var(--font-brand)",
              boxShadow: "0 4px 16px oklch(0.520 0.120 45 / 0.3)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="page-title">{patient.full_name}</h1>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                <Phone className="h-3.5 w-3.5" />
                {patient.phone}
              </div>
              {patient.email && (
                <div className="flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                  <Mail className="h-3.5 w-3.5" />
                  {patient.email}
                </div>
              )}
              {patient.last_procedure_date && (
                <div className="flex items-center gap-1.5 text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                  <CalendarDays className="h-3.5 w-3.5" />
                  Último: {new Date(patient.last_procedure_date + "T00:00:00").toLocaleDateString("pt-BR")}
                </div>
              )}
            </div>
            {patient.notes && (
              <p className="text-sm mt-3 italic" style={{ color: "oklch(0.596 0.036 57.9)" }}>{patient.notes}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Link href={`/procedures/new?patient_id=${patient.id}`}>
              <Button
                className="btn-primary-shimmer rounded-xl text-sm gap-2 px-5 py-2.5 font-semibold w-full"
                style={{ color: "var(--primary-foreground)", border: "none" }}
              >
                <ClipboardList className="h-4 w-4" />
                Registrar Procedimento
              </Button>
            </Link>
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-medium px-3 py-1.5 transition-colors"
              style={{
                background: "oklch(0.520 0.120 45 / 0.08)",
                color: "var(--terracotta)",
                border: "1px solid oklch(0.520 0.120 45 / 0.15)",
              }}
            >
              <Pencil className="h-3 w-3" />
              Editar dados
            </button>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 animate-fade-in"
            style={{ background: "oklch(0.180 0.022 44 / 0.55)", backdropFilter: "blur(8px)" }}
            onClick={() => setEditing(false)}
          />
          <div
            className="relative w-full max-w-md animate-fade-up rounded-2xl overflow-hidden"
            style={{
              background: "var(--cream)",
              border: "1px solid oklch(0.520 0.120 45 / 0.12)",
              boxShadow: "0 24px 80px oklch(0.220 0.025 45 / 0.18)",
            }}
          >
            <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, var(--terracotta), oklch(0.600 0.100 50))" }} />
            <button
              onClick={() => setEditing(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
              style={{ color: "var(--muted-foreground)" }}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="px-7 py-6">
              <h2
                className="text-lg font-semibold mb-5"
                style={{ color: "var(--brown-deep)", fontFamily: "var(--font-brand)" }}
              >
                Editar dados da paciente
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                    Nome completo
                  </Label>
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                    Telefone (WhatsApp)
                  </Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="55419..."
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                    E-mail
                  </Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                    Observações
                  </Label>
                  <Input
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="rounded-lg"
                  />
                </div>
                {saveError && <p className="text-xs text-red-500">{saveError}</p>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-7 py-4" style={{ borderTop: "1px solid oklch(0.520 0.120 45 / 0.06)" }}>
              <button
                onClick={() => { setEditing(false); setSaveError(null); }}
                className="rounded-lg px-4 py-2 text-xs font-medium transition-colors"
                style={{ color: "var(--muted-foreground)" }}
              >
                Cancelar
              </button>
              <button
                onClick={() => updateMut.mutate()}
                disabled={updateMut.isPending || !form.full_name || !form.phone}
                className="btn-primary-shimmer rounded-lg px-5 py-2 text-xs disabled:opacity-50"
              >
                {updateMut.isPending ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Procedure history */}
      <div
        className="animate-fade-up delay-100 rounded-2xl overflow-hidden"
        style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.878 0.015 58)", boxShadow: "var(--shadow-warm-sm)" }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "oklch(0.878 0.015 58)", background: "oklch(0.975 0.005 60)" }}>
          <ClipboardList className="h-4 w-4" style={{ color: "oklch(0.429 0.0306 72.6)" }} />
          <h2 className="text-sm font-medium" style={{ color: "oklch(0.250 0.026 50.8)" }}>Histórico de Procedimentos</h2>
          <span className="ml-auto text-xs" style={{ color: "oklch(0.596 0.036 57.9)" }}>{records.length} registros</span>
        </div>
        {records.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>Nenhum procedimento registrado.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "oklch(0.920 0.010 60)" }}>
            {records.map((r) => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                  style={{ background: "oklch(0.327 0.0736 48.0 / 0.10)" }}
                >
                  <CalendarDays className="h-3.5 w-3.5" style={{ color: "oklch(0.327 0.0736 48.0)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: "oklch(0.250 0.026 50.8)" }}>
                    {ptMap[r.procedure_type_id] ?? "Procedimento"}
                  </p>
                  {r.notes && <p className="text-xs truncate" style={{ color: "oklch(0.596 0.036 57.9)" }}>{r.notes}</p>}
                </div>
                <span className="text-xs whitespace-nowrap" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                  {new Date(r.procedure_date + "T00:00:00").toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message timeline */}
      <div
        className="animate-fade-up delay-200 rounded-2xl overflow-hidden"
        style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.878 0.015 58)", boxShadow: "var(--shadow-warm-sm)" }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "oklch(0.878 0.015 58)", background: "oklch(0.975 0.005 60)" }}>
          <MessageSquare className="h-4 w-4" style={{ color: "oklch(0.312 0.0434 119.6)" }} />
          <h2 className="text-sm font-medium" style={{ color: "oklch(0.250 0.026 50.8)" }}>Timeline de Mensagens</h2>
        </div>
        {scheduledMsgs.length === 0 && messageLogs.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>Nenhuma mensagem agendada.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "oklch(0.920 0.010 60)" }}>
            {/* Scheduled messages */}
            {scheduledMsgs.map((m) => {
              const badge = STATUS_STYLE[m.status] ?? STATUS_STYLE.pending;
              return (
                <div key={m.id} className="flex gap-4 items-center px-5 py-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                    style={{ background: "oklch(0.312 0.0434 119.6 / 0.10)" }}>
                    <Send className="h-3.5 w-3.5" style={{ color: "oklch(0.312 0.0434 119.6)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: "oklch(0.250 0.026 50.8)" }}>{m.content}</p>
                    <p className="text-xs mt-0.5" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                      {new Date(m.scheduled_for).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                </div>
              );
            })}
            {/* Sent/received logs */}
            {messageLogs.map((log) => (
              <div key={log.id} className="flex gap-4 items-center px-5 py-3.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                  style={log.direction === "outbound"
                    ? { background: "oklch(0.312 0.0434 119.6 / 0.10)" }
                    : { background: "oklch(0.429 0.0306 72.6 / 0.10)" }
                  }>
                  {log.direction === "outbound"
                    ? <Send className="h-3.5 w-3.5" style={{ color: "oklch(0.312 0.0434 119.6)" }} />
                    : <Inbox className="h-3.5 w-3.5" style={{ color: "oklch(0.429 0.0306 72.6)" }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: "oklch(0.250 0.026 50.8)" }}>{log.content}</p>
                  <p className="text-xs mt-0.5" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                    {log.sent_at ? new Date(log.sent_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    {" · "}{log.delivery_status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
