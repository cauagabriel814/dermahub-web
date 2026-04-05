"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCheck, Phone, Clock, CalendarCheck, CheckCircle2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getLeads, updateLead } from "@/services/messaging";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  waiting: { label: "Aguardando", bg: "oklch(0.520 0.120 45 / 0.10)", color: "var(--terracotta)" },
  contacted: { label: "Contatado", bg: "oklch(0.600 0.090 65 / 0.10)", color: "oklch(0.600 0.090 65)" },
  scheduled: { label: "Agendado", bg: "var(--green-muted)", color: "var(--green)" },
  returned: { label: "Retornou", bg: "oklch(0.380 0.060 150 / 0.18)", color: "oklch(0.320 0.060 150)" },
};

const FILTERS: { label: string; value: string | undefined }[] = [
  { label: "Todos", value: undefined },
  { label: "Aguardando", value: "waiting" },
  { label: "Contatado", value: "contacted" },
  { label: "Agendado", value: "scheduled" },
  { label: "Retornou", value: "returned" },
];

export default function LeadsPage() {
  const qc = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["leads", filterStatus, search],
    queryFn: () => getLeads({ status: filterStatus, search: search || undefined }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateLead(id, { lead_status: status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  const summary = data?.summary;
  const items = data?.items || [];

  const summaryCards = [
    { label: "Aguardando contato", value: summary?.waiting ?? 0, icon: Clock, color: "var(--terracotta)", bg: "oklch(0.520 0.120 45 / 0.08)" },
    { label: "Contatados hoje", value: summary?.contacted_today ?? 0, icon: Phone, color: "oklch(0.600 0.090 65)", bg: "oklch(0.600 0.090 65 / 0.08)" },
    { label: "Agendados", value: summary?.scheduled ?? 0, icon: CalendarCheck, color: "var(--green)", bg: "var(--green-muted)" },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-up">
        <h1 className="page-title">Leads</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Pacientes que demonstraram interesse em retornar
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card, i) => (
          <div key={card.label} className="card-elevated animate-fade-up rounded-xl p-5" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: card.bg }}>
                <card.icon className="h-5 w-5" style={{ color: card.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "var(--brown-deep)" }}>{card.value}</p>
                <p className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 animate-fade-up delay-100">
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setFilterStatus(f.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={filterStatus === f.value
                ? { background: "var(--terracotta)", color: "var(--primary-foreground)" }
                : { background: "var(--muted)", color: "var(--muted-foreground)" }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar paciente..."
            className="pl-9 rounded-lg text-sm h-9"
          />
        </div>
      </div>

      <div className="card-elevated animate-fade-up delay-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--border)", animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <UserCheck className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--border)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Nenhum lead encontrado.</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--muted)" }}>
            {items.map((lead) => {
              const cfg = STATUS_CONFIG[lead.lead_status] || STATUS_CONFIG.waiting;
              return (
                <div key={lead.id} className="flex items-center gap-4 px-6 py-4 table-row-hover">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: "var(--brown-deep)" }}>{lead.patient_name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <a href={`tel:${lead.patient_phone}`} className="text-xs flex items-center gap-1" style={{ color: "var(--terracotta)" }}>
                        <Phone className="h-3 w-3" />
                        {lead.patient_phone}
                      </a>
                      <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{lead.procedure_name}</span>
                      {lead.responded_at && (
                        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                          {new Date(lead.responded_at).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                  <div className="flex gap-1.5">
                    {lead.lead_status === "waiting" && (
                      <button
                        onClick={() => updateMut.mutate({ id: lead.id, status: "contacted" })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{ background: "oklch(0.600 0.090 65 / 0.10)", color: "oklch(0.600 0.090 65)" }}
                      >
                        Contatado
                      </button>
                    )}
                    {(lead.lead_status === "waiting" || lead.lead_status === "contacted") && (
                      <button
                        onClick={() => updateMut.mutate({ id: lead.id, status: "scheduled" })}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        style={{ background: "var(--green-muted)", color: "var(--green)" }}
                      >
                        Agendado
                      </button>
                    )}
                    {lead.lead_status === "returned" && (
                      <CheckCircle2 className="h-5 w-5" style={{ color: "var(--green)" }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
