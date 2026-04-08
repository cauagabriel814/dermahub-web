"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, Send, Inbox, Search, ChevronDown } from "lucide-react";
import { getMessageLogs } from "@/services/messaging";

// TODO: Backend should return `patient_name` and `procedure_name` in the
// GET /messages response so we can display them in the table without extra
// round-trips. For now those columns show placeholders.

type DirectionFilter = "all" | "outbound" | "inbound";

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: "var(--muted)",                        color: "var(--muted-foreground)", label: "Pendente" },
  sent:      { bg: "oklch(0.380 0.060 150 / 0.12)",      color: "var(--green)",            label: "Enviado" },
  delivered: { bg: "oklch(0.380 0.060 150 / 0.20)",      color: "var(--green)",            label: "Entregue" },
  read:      { bg: "oklch(0.380 0.060 150 / 0.28)",      color: "var(--green)",            label: "Lido" },
  failed:    { bg: "oklch(0.540 0.200 25 / 0.12)",       color: "var(--destructive)",      label: "Falhou" },
};

function getStatusBadge(status: string) {
  return STATUS_BADGE[status] ?? { bg: "var(--muted)", color: "var(--muted-foreground)", label: status };
}

function truncate(text: string, max = 60) {
  return text.length > max ? text.slice(0, max) + "\u2026" : text;
}

const DIRECTION_OPTIONS: { value: DirectionFilter; label: string }[] = [
  { value: "all",      label: "Todos" },
  { value: "outbound", label: "Enviadas" },
  { value: "inbound",  label: "Recebidas" },
];

export default function MessagesPage() {
  const [search, setSearch] = useState("");
  const [dirFilter, setDirFilter] = useState<DirectionFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["message-logs"],
    queryFn: () => getMessageLogs({ limit: 200 }),
  });

  const filtered = useMemo(() => {
    let result = logs;
    if (dirFilter !== "all") {
      result = result.filter((l) => l.direction === dirFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l.content.toLowerCase().includes(q) ||
          (l.patient_name && l.patient_name.toLowerCase().includes(q)) ||
          l.patient_id.toLowerCase().includes(q)
      );
    }
    if (dateFrom) {
      result = result.filter((l) => l.sent_at && l.sent_at.slice(0, 10) >= dateFrom);
    }
    if (dateTo) {
      result = result.filter((l) => l.sent_at && l.sent_at.slice(0, 10) <= dateTo);
    }
    return result;
  }, [logs, dirFilter, search, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-up">
        <h1 className="page-title" data-tour="messages-title">Histórico de Mensagens</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Registro de todas as mensagens enviadas e recebidas
        </p>
      </div>

      {/* Filters */}
      <div className="animate-fade-up delay-75 flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm" data-tour="messages-search">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: "var(--muted-foreground)" }}
          />
          <input
            type="text"
            placeholder="Buscar por paciente ou conteúdo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl py-2 pl-9 pr-3 text-sm outline-none transition-shadow"
            style={{
              background: "var(--cream)",
              border: "1px solid var(--border)",
              color: "var(--brown-deep)",
            }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px var(--terracotta-glow)")}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          />
        </div>

        {/* Direction pills */}
        <div className="flex gap-1.5 rounded-xl p-1" style={{ background: "var(--muted)" }} data-tour="messages-direction-filter">
          {DIRECTION_OPTIONS.map((opt) => {
            const active = dirFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setDirFilter(opt.value)}
                className="rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all"
                style={{
                  background: active ? "var(--cream)" : "transparent",
                  color: active ? "var(--terracotta)" : "var(--muted-foreground)",
                  boxShadow: active ? "var(--shadow-sm)" : "none",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Date filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>De</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 rounded-lg text-sm px-2 bg-white"
              style={{ border: "1px solid var(--border)", color: dateFrom ? "inherit" : "var(--muted-foreground)" }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs whitespace-nowrap" style={{ color: "var(--muted-foreground)" }}>Até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 rounded-lg text-sm px-2 bg-white"
              style={{ border: "1px solid var(--border)", color: dateTo ? "inherit" : "var(--muted-foreground)" }}
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
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
        className="card-elevated animate-fade-up delay-100 rounded-2xl overflow-hidden"
      >
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: "var(--border)", animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--border)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {logs.length === 0
                ? "Nenhuma mensagem registrada ainda."
                : "Nenhuma mensagem encontrada com esses filtros."}
            </p>
            {logs.length === 0 && (
              <p className="text-xs mt-1" style={{ color: "var(--border)" }}>
                As mensagens aparecerão aqui após a automação enviar.
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div
              className="hidden sm:grid grid-cols-[40px_110px_1fr_1fr_1fr_90px] gap-3 px-5 py-3 text-xs font-medium uppercase tracking-widest"
              style={{
                borderBottom: "1px solid var(--border)",
                background: "var(--muted)",
                color: "var(--muted-foreground)",
              }}
            >
              <span>Dir.</span>
              <span>Data/Hora</span>
              <span>Paciente</span>
              <span>Procedimento</span>
              <span>Conteúdo</span>
              <span>Status</span>
            </div>

            {/* Rows */}
            {filtered.map((log, i) => {
              const badge = getStatusBadge(log.delivery_status);
              const sentDate = log.sent_at ? new Date(log.sent_at) : null;
              const isExpanded = expandedId === log.id;

              return (
                <div key={log.id}>
                  {/* Main row */}
                  <div
                    className="table-row-hover grid grid-cols-1 sm:grid-cols-[40px_110px_1fr_1fr_1fr_90px] gap-3 items-center px-5 py-3.5 cursor-pointer select-none"
                    style={{
                      borderBottom:
                        i < filtered.length - 1 && !isExpanded
                          ? "1px solid var(--border)"
                          : isExpanded
                          ? "none"
                          : "none",
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  >
                    {/* Direction icon */}
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{
                        background:
                          log.direction === "outbound"
                            ? "var(--green-muted)"
                            : "oklch(0.520 0.120 45 / 0.10)",
                      }}
                    >
                      {log.direction === "outbound" ? (
                        <Send className="h-3.5 w-3.5" style={{ color: "var(--green)" }} />
                      ) : (
                        <Inbox className="h-3.5 w-3.5" style={{ color: "var(--terracotta)" }} />
                      )}
                    </div>

                    {/* Date */}
                    <div
                      className="text-xs whitespace-nowrap"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {sentDate
                        ? sentDate.toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "\u2014"}
                    </div>

                    {/* Patient name */}
                    <p
                      className="text-sm truncate font-medium"
                      style={{ color: "var(--brown-deep)" }}
                    >
                      {log.patient_name || log.patient_id.slice(0, 8)}
                    </p>

                    {/* Procedure */}
                    <p
                      className="text-sm truncate hidden sm:block"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {log.procedure_name || "—"}
                    </p>

                    {/* Content (truncated) */}
                    <div className="flex items-center gap-2 min-w-0">
                      <p
                        className="text-sm truncate flex-1"
                        style={{ color: "var(--brown-deep)" }}
                      >
                        {isExpanded ? truncate(log.content, 40) : truncate(log.content, 60)}
                      </p>
                      <ChevronDown
                        className="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
                        style={{
                          color: "var(--muted-foreground)",
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </div>

                    {/* Status */}
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full whitespace-nowrap w-fit"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div
                      className="px-5 pb-4 animate-fade-in"
                      style={{
                        borderBottom:
                          i < filtered.length - 1
                            ? "1px solid var(--border)"
                            : "none",
                      }}
                    >
                      <div
                        className="rounded-xl px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap"
                        style={{
                          background: "var(--muted)",
                          color: "var(--brown-deep)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div
                          className="flex items-center gap-2 mb-2 text-xs font-medium uppercase tracking-wide"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          {log.direction === "outbound" ? (
                            <>
                              <Send className="h-3 w-3" />
                              Mensagem enviada
                            </>
                          ) : (
                            <>
                              <Inbox className="h-3 w-3" />
                              Mensagem recebida
                            </>
                          )}
                          {sentDate && (
                            <span style={{ color: "var(--muted-foreground)" }}>
                              &mdash;{" "}
                              {sentDate.toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                        {log.content}
                      </div>

                      {/* TODO: show related response (thread) once the backend
                          supports linking inbound replies to outbound messages */}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Count footer */}
      {!isLoading && filtered.length > 0 && (
        <p
          className="text-xs text-right animate-fade-up delay-200"
          style={{ color: "var(--muted-foreground)" }}
        >
          {filtered.length} mensage{filtered.length === 1 ? "m" : "ns"}
          {filtered.length !== logs.length && ` de ${logs.length} no total`}
        </p>
      )}
    </div>
  );
}
