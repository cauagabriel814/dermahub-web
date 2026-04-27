"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, XCircle, RotateCcw, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getScheduledMessages, updateScheduledMessage } from "@/services/messaging";
import { formatDateShort } from "@/lib/format";
import type { MessageStatus } from "@/types/api";

const STATUS_LABELS: Record<MessageStatus, string> = {
  pending: "Pendente",
  sent: "Enviado",
  delivered: "Entregue",
  failed: "Falhou",
  cancelled: "Cancelado",
};

const STATUS_STYLE: Record<MessageStatus, { background: string; color: string }> = {
  pending: { background: "oklch(0.327 0.0736 48.0 / 0.12)", color: "oklch(0.327 0.0736 48.0)" },
  sent: { background: "oklch(0.312 0.0434 119.6 / 0.12)", color: "oklch(0.312 0.0434 119.6)" },
  delivered: { background: "oklch(0.312 0.0434 119.6 / 0.20)", color: "oklch(0.250 0.050 118)" },
  failed: { background: "oklch(0.450 0.150 20 / 0.12)", color: "oklch(0.450 0.150 20)" },
  cancelled: { background: "oklch(0.878 0.015 58)", color: "oklch(0.596 0.036 57.9)" },
};

const ALL_STATUSES: MessageStatus[] = ["pending", "sent", "delivered", "failed", "cancelled"];

export default function RecallsPage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<MessageStatus | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const { data: rawMessages = [], isLoading } = useQuery({
    queryKey: ["scheduled-messages", filterStatus],
    queryFn: () => getScheduledMessages({ status: filterStatus, limit: 200 }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: MessageStatus } }) =>
      updateScheduledMessage(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-messages"] }),
  });

  const messages = useMemo(() => {
    let result = rawMessages;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (m) =>
          (m.patient_name && m.patient_name.toLowerCase().includes(q)) ||
          (m.procedure_name && m.procedure_name.toLowerCase().includes(q)) ||
          m.content.toLowerCase().includes(q)
      );
    }
    if (filterDateFrom) {
      result = result.filter((m) => m.scheduled_for.slice(0, 10) >= filterDateFrom);
    }
    if (filterDateTo) {
      result = result.filter((m) => m.scheduled_for.slice(0, 10) <= filterDateTo);
    }
    return result;
  }, [rawMessages, search, filterDateFrom, filterDateTo]);

  const hasFilters = search || filterDateFrom || filterDateTo;

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="page-title" data-tour="recalls-title">Recalls Programados</h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.596 0.036 57.9)" }}>
          Mensagens agendadas para envio automático via WhatsApp
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3 animate-fade-up delay-75" data-tour="recalls-filters">
        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus(undefined)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={filterStatus === undefined
              ? { background: "oklch(0.429 0.0306 72.6)", color: "oklch(0.975 0.005 60)" }
              : { background: "oklch(0.975 0.005 60)", color: "oklch(0.596 0.036 57.9)", border: "1px solid oklch(0.878 0.015 58)" }
            }
          >
            Todos
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s === filterStatus ? undefined : s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={filterStatus === s
                ? { background: "oklch(0.429 0.0306 72.6)", color: "oklch(0.975 0.005 60)" }
                : { background: "oklch(0.975 0.005 60)", color: "oklch(0.596 0.036 57.9)", border: "1px solid oklch(0.878 0.015 58)" }
              }
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Search + Date filters */}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar paciente..."
              className="pl-9 rounded-lg text-sm h-9"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>De</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="h-9 rounded-lg text-sm px-2 bg-white"
              style={{ border: "1px solid var(--border)", color: filterDateFrom ? "inherit" : "var(--muted-foreground)" }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>Até</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="h-9 rounded-lg text-sm px-2 bg-white"
              style={{ border: "1px solid var(--border)", color: filterDateTo ? "inherit" : "var(--muted-foreground)" }}
            />
          </div>
          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setFilterDateFrom(""); setFilterDateTo(""); }}
              className="h-9 px-3 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: "oklch(0.540 0.200 25 / 0.08)", color: "oklch(0.540 0.200 25)", border: "1px solid oklch(0.540 0.200 25 / 0.2)" }}
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="animate-fade-up delay-100 rounded-2xl overflow-hidden"
        style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.878 0.015 58)", boxShadow: "var(--shadow-warm-sm)" }}
        data-tour="recalls-table"
      >
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: "oklch(0.844 0.024 55.1)", animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarClock className="h-8 w-8 mx-auto mb-3" style={{ color: "oklch(0.844 0.024 55.1)" }} />
            <p className="text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>Nenhum recall encontrado.</p>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-[70px_1fr_200px_1fr_90px_44px] gap-3 px-5 py-3 text-xs font-medium uppercase tracking-widest"
              style={{ borderBottom: "1px solid oklch(0.878 0.015 58)", background: "oklch(0.975 0.005 60)", color: "oklch(0.596 0.036 57.9)" }}
            >
              <span>Data</span>
              <span>Paciente</span>
              <span className="text-center">Procedimento</span>
              <span>Mensagem</span>
              <span className="text-center">Status</span>
              <span className="text-center">Ações</span>
            </div>
            {messages.map((msg, i) => {
              const scheduledDate = new Date(msg.scheduled_for);
              const hasAction = msg.status === "pending" || msg.status === "failed" || msg.status === "cancelled";

              return (
                <div
                  key={msg.id}
                  className="grid grid-cols-[70px_1fr_200px_1fr_90px_44px] gap-3 items-center px-5 py-3.5"
                  style={{ borderBottom: i < messages.length - 1 ? "1px solid oklch(0.920 0.010 60)" : "none" }}
                >
                  {/* Date */}
                  <div className="text-center min-w-0">
                    <div className="text-xs font-bold" style={{ color: "oklch(0.327 0.0736 48.0)" }}>
                      {formatDateShort(scheduledDate)}
                    </div>
                    <div className="text-[11px]" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                      {scheduledDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>

                  {/* Patient */}
                  <p className="text-sm font-medium truncate" style={{ color: "oklch(0.250 0.026 50.8)" }}>
                    {msg.patient_name ?? "—"}
                  </p>

                  {/* Procedure — centered */}
                  <p className="text-sm truncate text-center" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                    {msg.procedure_name ?? "—"}
                  </p>

                  {/* Message */}
                  <div className="min-w-0">
                    <p className="text-sm truncate" style={{ color: "oklch(0.250 0.026 50.8)" }}>{msg.content}</p>
                    {msg.failure_reason && (
                      <p
                        className="text-xs mt-0.5 truncate"
                        style={{
                          color: msg.status === "sent" || msg.status === "delivered"
                            ? "var(--muted-foreground)" : "oklch(0.540 0.200 25)",
                          textDecoration: msg.status === "sent" || msg.status === "delivered"
                            ? "line-through" : "none",
                        }}
                      >
                        {msg.failure_reason}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex justify-center">
                    <span className="text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap"
                      style={STATUS_STYLE[msg.status]}>
                      {STATUS_LABELS[msg.status]}
                    </span>
                  </div>

                  {/* Actions — gray placeholder when no action */}
                  <div className="flex justify-center">
                    {msg.status === "pending" ? (
                      <button
                        onClick={() => updateMut.mutate({ id: msg.id, data: { status: "cancelled" } })}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        title="Cancelar"
                      >
                        <XCircle className="h-4 w-4" style={{ color: "oklch(0.450 0.150 20)" }} />
                      </button>
                    ) : (msg.status === "failed" || msg.status === "cancelled") ? (
                      <button
                        onClick={() => updateMut.mutate({ id: msg.id, data: { status: "pending" } })}
                        className="p-1.5 rounded-lg transition-colors hover:bg-green-50"
                        title="Reenviar"
                      >
                        <RotateCcw className="h-4 w-4" style={{ color: "oklch(0.312 0.0434 119.6)" }} />
                      </button>
                    ) : (
                      <div className="p-1.5" title="Já enviado">
                        <CheckCircle2 className="h-4 w-4" style={{ color: "oklch(0.878 0.015 58)" }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
