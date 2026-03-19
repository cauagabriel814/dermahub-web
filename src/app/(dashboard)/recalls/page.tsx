"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, XCircle, RotateCcw } from "lucide-react";
import { getScheduledMessages, updateScheduledMessage } from "@/services/messaging";
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

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["scheduled-messages", filterStatus],
    queryFn: () => getScheduledMessages({ status: filterStatus, limit: 100 }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: MessageStatus } }) =>
      updateScheduledMessage(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scheduled-messages"] }),
  });

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="page-title">Recalls Programados</h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.596 0.036 57.9)" }}>
          Mensagens agendadas para envio automático via WhatsApp
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 animate-fade-up delay-75">
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

      {/* List */}
      <div
        className="animate-fade-up delay-100 rounded-2xl overflow-hidden"
        style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.878 0.015 58)", boxShadow: "var(--shadow-warm-sm)" }}
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
              className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-3 text-xs font-medium uppercase tracking-widest"
              style={{ borderBottom: "1px solid oklch(0.878 0.015 58)", background: "oklch(0.975 0.005 60)", color: "oklch(0.596 0.036 57.9)" }}
            >
              <span>Data</span>
              <span>Mensagem</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            {messages.map((msg, i) => {
              const scheduledDate = new Date(msg.scheduled_for);
              return (
                <div
                  key={msg.id}
                  className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-4"
                  style={{ borderBottom: i < messages.length - 1 ? "1px solid oklch(0.920 0.010 60)" : "none" }}
                >
                  <div className="text-center min-w-[52px]">
                    <div className="text-xs font-bold" style={{ color: "oklch(0.327 0.0736 48.0)" }}>
                      {scheduledDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </div>
                    <div className="text-xs" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                      {scheduledDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate" style={{ color: "oklch(0.250 0.026 50.8)" }}>{msg.content}</p>
                    {msg.failure_reason && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: "oklch(0.450 0.150 20)" }}>
                        {msg.failure_reason}
                      </p>
                    )}
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap"
                    style={STATUS_STYLE[msg.status]}>
                    {STATUS_LABELS[msg.status]}
                  </span>
                  <div className="flex gap-1.5">
                    {msg.status === "pending" && (
                      <button
                        onClick={() => updateMut.mutate({ id: msg.id, data: { status: "cancelled" } })}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        title="Cancelar"
                      >
                        <XCircle className="h-4 w-4" style={{ color: "oklch(0.450 0.150 20)" }} />
                      </button>
                    )}
                    {(msg.status === "failed" || msg.status === "cancelled") && (
                      <button
                        onClick={() => updateMut.mutate({ id: msg.id, data: { status: "pending" } })}
                        className="p-1.5 rounded-lg transition-colors hover:bg-green-50"
                        title="Reenviar"
                      >
                        <RotateCcw className="h-4 w-4" style={{ color: "oklch(0.312 0.0434 119.6)" }} />
                      </button>
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
