"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Phone, ChevronRight, Search, UserCheck, ExternalLink, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getLeads, updateLead } from "@/services/messaging";
import type { Lead } from "@/types/api";

const COLUMNS = [
  { key: "waiting", label: "Aguardando", desc: "Mensagens agendadas para envio", color: "var(--terracotta)", bg: "oklch(0.520 0.120 45 / 0.06)", border: "oklch(0.520 0.120 45 / 0.20)" },
  { key: "sent", label: "Enviado", desc: "Mensagem enviada, aguardando resposta", color: "oklch(0.600 0.090 65)", bg: "oklch(0.600 0.090 65 / 0.06)", border: "oklch(0.600 0.090 65 / 0.20)" },
  { key: "responded", label: "Respondeu", desc: "Demonstrou interesse, falar para agendar", color: "oklch(0.520 0.130 60)", bg: "oklch(0.520 0.130 60 / 0.08)", border: "oklch(0.520 0.130 60 / 0.25)" },
  { key: "scheduled", label: "Agendado", desc: "Confirmou retorno na agenda", color: "var(--green)", bg: "var(--green-muted)", border: "oklch(0.380 0.060 150 / 0.20)" },
  { key: "returned", label: "Retornou", desc: "Compareceu ao procedimento", color: "oklch(0.320 0.060 150)", bg: "oklch(0.380 0.060 150 / 0.10)", border: "oklch(0.380 0.060 150 / 0.25)" },
  { key: "not_interested", label: "Sem interesse", desc: "Respondeu negativamente ou recusou", color: "oklch(0.540 0.020 50)", bg: "oklch(0.540 0.020 50 / 0.06)", border: "oklch(0.540 0.020 50 / 0.20)" },
] as const;

const NEXT_STATUS: Record<string, string[]> = {
  waiting: [],
  sent: [],
  responded: ["scheduled", "not_interested"],
  scheduled: [],
  returned: [],
  not_interested: [],
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function StaleIndicator({ days }: { days: number | null }) {
  if (!days || days < 3) return null;
  const label = days >= 7 ? `+${days}d sem resposta` : `+${days}d`;
  const color = days >= 7 ? "oklch(0.540 0.200 25)" : "oklch(0.600 0.090 65)";
  return (
    <div className="flex items-center gap-1 mt-1">
      <Clock className="h-3 w-3" style={{ color }} />
      <span className="text-[10px] font-medium" style={{ color }}>{label}</span>
    </div>
  );
}

function LeadCard({ lead, onMove }: { lead: Lead; onMove: (id: string, status: string) => void }) {
  const col = COLUMNS.find((c) => c.key === lead.lead_status) || COLUMNS[0];
  const nextStatuses = NEXT_STATUS[lead.lead_status] || [];

  const dateLabel = lead.lead_status === "waiting" && lead.scheduled_for
    ? new Date(lead.scheduled_for).toLocaleDateString("pt-BR")
    : lead.responded_at
      ? new Date(lead.responded_at).toLocaleDateString("pt-BR")
      : lead.sent_at
        ? new Date(lead.sent_at).toLocaleDateString("pt-BR")
        : null;

  return (
    <div
      className="rounded-lg p-4 space-y-2 transition-all hover:shadow-md"
      style={{ background: "white", border: `1px solid ${col.border}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/patients/${lead.patient_id}`}
            className="text-sm font-semibold hover:underline flex items-center gap-1"
            style={{ color: "var(--brown-deep)" }}
          >
            {lead.patient_name}
            <ExternalLink className="h-3 w-3 opacity-40" />
          </Link>
          <a
            href={`https://wa.me/${lead.patient_phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs flex items-center gap-1 mt-0.5"
            style={{ color: col.color }}
          >
            <Phone className="h-3 w-3" />
            {lead.patient_phone}
          </a>
        </div>
        {lead.procedure_price > 0 && (
          <span className="text-xs font-bold whitespace-nowrap" style={{ color: col.color }}>
            {formatCurrency(lead.procedure_price)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
        <span className="font-medium">{lead.procedure_name}</span>
        {dateLabel && (
          <>
            <span>·</span>
            <span>{dateLabel}</span>
          </>
        )}
      </div>

      {lead.lead_status === "sent" && (
        <StaleIndicator days={lead.days_since_contact} />
      )}

      {nextStatuses.length > 0 && (
        <div className="flex gap-2 pt-1">
          {nextStatuses.map((status) => {
            const target = COLUMNS.find((c) => c.key === status)!;
            const isNeg = status === "not_interested";
            return (
              <button
                key={status}
                onClick={() => onMove(lead.id, status)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] font-semibold transition-colors"
                style={{ background: target.bg, color: target.color, border: `1px solid ${target.border}` }}
              >
                {isNeg ? <X className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                {target.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterProcedure, setFilterProcedure] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["leads", search],
    queryFn: () => getLeads({ search: search || undefined, limit: 200 }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateLead(id, { lead_status: status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  const rawItems = data?.items || [];
  const summary = data?.summary;

  const procedureNames = Array.from(new Set(rawItems.map((l) => l.procedure_name).filter(Boolean))).sort();

  const items = rawItems.filter((lead) => {
    if (filterProcedure && lead.procedure_name !== filterProcedure) return false;
    if (filterDateFrom || filterDateTo) {
      const refDate = (lead.scheduled_for || lead.sent_at || "").slice(0, 10);
      if (!refDate) return false;
      if (filterDateFrom && refDate < filterDateFrom) return false;
      if (filterDateTo && refDate > filterDateTo) return false;
    }
    return true;
  });

  function handleMove(id: string, status: string) {
    updateMut.mutate({ id, status });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between animate-fade-up flex-wrap gap-4">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Acompanhe o funil completo de mensagens e retornos
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar paciente..."
              className="pl-9 rounded-lg text-sm h-9"
            />
          </div>
          <select
            value={filterProcedure}
            onChange={(e) => setFilterProcedure(e.target.value)}
            className="h-9 rounded-lg text-sm px-3 bg-white min-w-[180px]"
            style={{ border: "1px solid var(--border)", color: filterProcedure ? "inherit" : "var(--muted-foreground)" }}
          >
            <option value="">Procedimento</option>
            {procedureNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
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
          {(filterProcedure || filterDateFrom || filterDateTo) && (
            <button
              onClick={() => { setFilterProcedure(""); setFilterDateFrom(""); setFilterDateTo(""); }}
              className="h-9 px-3 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: "oklch(0.540 0.200 25 / 0.08)", color: "oklch(0.540 0.200 25)", border: "1px solid oklch(0.540 0.200 25 / 0.2)" }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center animate-fade-up">
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--border)", animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      ) : rawItems.length === 0 && !search ? (
        <div className="py-16 text-center animate-fade-up rounded-xl" style={{ background: "var(--cream)", border: "1px solid var(--border)" }}>
          <UserCheck className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--border)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Nenhum lead ainda. Quando procedimentos forem registrados, o funil aparecerá aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-3 animate-fade-up delay-100" style={{ minHeight: "60vh" }}>
          {COLUMNS.map((col) => {
            const colItems = items.filter((l) => l.lead_status === col.key);
            const colCount = summary?.[col.key as keyof typeof summary] ?? colItems.length;

            return (
              <div key={col.key} className="flex flex-col">
                <div
                  className="flex items-center justify-between px-3 py-2.5 rounded-t-xl"
                  style={{ background: col.bg, borderBottom: `2px solid ${col.color}` }}
                >
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wide block" style={{ color: col.color }}>
                      {col.label}
                    </span>
                    <span className="text-[10px] block leading-tight" style={{ color: "var(--muted-foreground)" }}>
                      {col.desc}
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: col.color, color: "white" }}
                  >
                    {colCount}
                  </span>
                </div>

                <div
                  className="flex-1 space-y-2 p-2 rounded-b-xl overflow-y-auto"
                  style={{ background: col.bg, maxHeight: "calc(60vh - 70px)" }}
                >
                  {colItems.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Nenhum lead</p>
                    </div>
                  ) : (
                    colItems.map((lead) => (
                      <LeadCard key={lead.id} lead={lead} onMove={handleMove} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
