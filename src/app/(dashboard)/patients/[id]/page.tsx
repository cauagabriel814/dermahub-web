"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, CalendarDays, ClipboardList, MessageSquare, Send, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPatient } from "@/services/patients";
import { getProcedureRecords, getProcedureTypes } from "@/services/procedures";
import { getScheduledMessages, getMessageLogs } from "@/services/messaging";

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: "oklch(0.327 0.0736 48.0 / 0.12)", color: "oklch(0.327 0.0736 48.0)", label: "Pendente" },
  sent:      { bg: "oklch(0.312 0.0434 119.6 / 0.12)", color: "oklch(0.312 0.0434 119.6)", label: "Enviado" },
  delivered: { bg: "oklch(0.312 0.0434 119.6 / 0.20)", color: "oklch(0.250 0.050 118)", label: "Entregue" },
  failed:    { bg: "oklch(0.450 0.150 20 / 0.12)", color: "oklch(0.450 0.150 20)", label: "Falhou" },
  cancelled: { bg: "oklch(0.878 0.015 58)", color: "oklch(0.596 0.036 57.9)", label: "Cancelado" },
};

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatient(id),
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
        <div className="h-1.5" style={{ background: "linear-gradient(90deg, oklch(0.429 0.0306 72.6), oklch(0.327 0.0736 48.0))" }} />
        <div className="p-6 flex gap-5 items-start">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl shrink-0 text-xl font-semibold"
            style={{
              background: "linear-gradient(135deg, oklch(0.429 0.0306 72.6), oklch(0.327 0.0736 48.0))",
              color: "oklch(0.975 0.005 60)",
              fontFamily: "var(--font-brand)",
              boxShadow: "0 4px 16px oklch(0.429 0.0306 72.6 / 0.3)",
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
          <Link href={`/procedures/new?patient_id=${patient.id}`}>
            <Button
              size="sm"
              className="btn-primary-shimmer rounded-xl text-xs gap-1.5"
              style={{ color: "oklch(0.975 0.005 60)", border: "none" }}
            >
              <ClipboardList className="h-3.5 w-3.5" />
              Registrar Procedimento
            </Button>
          </Link>
        </div>
      </div>

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
