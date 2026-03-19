"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Send, Inbox } from "lucide-react";
import { getMessageLogs } from "@/services/messaging";

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: "oklch(0.878 0.015 58)",              color: "oklch(0.596 0.036 57.9)", label: "Pendente" },
  sent:      { bg: "oklch(0.312 0.0434 119.6 / 0.12)",  color: "oklch(0.312 0.0434 119.6)", label: "Enviado" },
  delivered: { bg: "oklch(0.312 0.0434 119.6 / 0.20)",  color: "oklch(0.250 0.050 118)",    label: "Entregue" },
  read:      { bg: "oklch(0.312 0.0434 119.6 / 0.25)",  color: "oklch(0.200 0.060 118)",    label: "Lido" },
  failed:    { bg: "oklch(0.450 0.150 20 / 0.12)",      color: "oklch(0.450 0.150 20)",    label: "Falhou" },
};

function getStatusBadge(status: string) {
  return STATUS_BADGE[status] ?? { bg: "oklch(0.878 0.015 58)", color: "oklch(0.596 0.036 57.9)", label: status };
}

export default function MessagesPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["message-logs"],
    queryFn: () => getMessageLogs({ limit: 100 }),
  });

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="page-title">Histórico de Mensagens</h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.596 0.036 57.9)" }}>
          Registro de todas as mensagens enviadas e recebidas
        </p>
      </div>

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
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-3" style={{ color: "oklch(0.844 0.024 55.1)" }} />
            <p className="text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>Nenhuma mensagem registrada ainda.</p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.844 0.024 55.1)" }}>
              As mensagens aparecerão aqui após a automação enviar.
            </p>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-[auto_auto_1fr_auto_auto] gap-4 px-5 py-3 text-xs font-medium uppercase tracking-widest"
              style={{ borderBottom: "1px solid oklch(0.878 0.015 58)", background: "oklch(0.975 0.005 60)", color: "oklch(0.596 0.036 57.9)" }}
            >
              <span>Dir.</span>
              <span>Data/Hora</span>
              <span>Conteúdo</span>
              <span>Status</span>
              <span>ID</span>
            </div>
            {logs.map((log, i) => {
              const badge = getStatusBadge(log.delivery_status);
              const sentDate = log.sent_at ? new Date(log.sent_at) : null;
              return (
                <div
                  key={log.id}
                  className="grid grid-cols-[auto_auto_1fr_auto_auto] gap-4 items-center px-5 py-3.5"
                  style={{ borderBottom: i < logs.length - 1 ? "1px solid oklch(0.920 0.010 60)" : "none" }}
                >
                  {/* Direction icon */}
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={log.direction === "outbound"
                      ? { background: "oklch(0.312 0.0434 119.6 / 0.12)" }
                      : { background: "oklch(0.429 0.0306 72.6 / 0.12)" }
                    }
                  >
                    {log.direction === "outbound"
                      ? <Send className="h-3.5 w-3.5" style={{ color: "oklch(0.312 0.0434 119.6)" }} />
                      : <Inbox className="h-3.5 w-3.5" style={{ color: "oklch(0.429 0.0306 72.6)" }} />
                    }
                  </div>

                  {/* Date */}
                  <div className="text-xs whitespace-nowrap" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                    {sentDate
                      ? sentDate.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
                      : "—"
                    }
                  </div>

                  {/* Content */}
                  <p className="text-sm truncate" style={{ color: "oklch(0.250 0.026 50.8)" }}>
                    {log.content}
                  </p>

                  {/* Status */}
                  <span className="text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>

                  {/* Provider ID */}
                  <span className="text-xs font-mono truncate max-w-[80px]" style={{ color: "oklch(0.844 0.024 55.1)" }}>
                    {log.provider_message_id || "—"}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
