"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Users, Syringe, CalendarClock, MessageSquare } from "lucide-react";
import Link from "next/link";
import { getDashboardSummary, getUpcomingRecalls, getMessageLogs } from "@/services/messaging";
import { formatDateShort } from "@/lib/format";

// TODO: backend dashboard API doesn't support period params yet — wire up when available
const PERIOD_OPTIONS = [
  { label: "Este mês", value: "this_month" },
  { label: "Últimos 30 dias", value: "last_30" },
  { label: "Últimos 90 dias", value: "last_90" },
] as const;

type PeriodValue = (typeof PERIOD_OPTIONS)[number]["value"];

export default function DashboardPage() {
  const [period, setPeriod] = useState<PeriodValue>("this_month");

  const { data: summary } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: getDashboardSummary,
  });

  const { data: recalls = [] } = useQuery({
    queryKey: ["upcoming-recalls"],
    queryFn: () => getUpcomingRecalls(7),
  });

  const { data: recentMessages = [] } = useQuery({
    queryKey: ["recent-messages"],
    queryFn: () => getMessageLogs({ limit: 5 }),
  });

  const stats = [
    {
      label: "Pacientes Ativos",
      value: String(summary?.total_patients ?? "—"),
      icon: Users,
      color: "oklch(0.520 0.120 45)",       /* terracota */
      bg: "oklch(0.520 0.120 45 / 0.08)",
    },
    {
      label: "Procedimentos no Mês",
      value: String(summary?.procedures_this_month ?? "—"),
      icon: Syringe,
      color: "oklch(0.380 0.060 150)",       /* verde */
      bg: "oklch(0.380 0.060 150 / 0.08)",
    },
    {
      label: "Recalls Pendentes",
      value: String(summary?.pending_messages ?? "—"),
      icon: CalendarClock,
      color: "oklch(0.600 0.090 65)",        /* cobre claro */
      bg: "oklch(0.600 0.090 65 / 0.08)",
    },
    {
      label: "Mensagens Enviadas",
      value: String(summary?.messages_sent_this_month ?? "—"),
      icon: MessageSquare,
      color: "oklch(0.420 0.030 45)",        /* marrom medio */
      bg: "oklch(0.420 0.030 45 / 0.08)",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="page-title" data-tour="dashboard-title">Visão Geral</h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.520 0.015 60)" }}>
            Acompanhe os indicadores da clínica
          </p>
        </div>

        {/* TODO: wire period filter to backend when API supports period params */}
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: period === opt.value ? "oklch(0.520 0.120 45)" : "oklch(0.520 0.120 45 / 0.08)",
                color: period === opt.value ? "#fff" : "oklch(0.520 0.120 45)",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-tour="dashboard-stats">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="card-elevated animate-fade-up rounded-xl overflow-hidden"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="h-[3px] w-full" style={{ background: stat.color }} />
            <div className="p-5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg mb-4"
                style={{ background: stat.bg }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <p className="stat-number" style={{ color: "oklch(0.220 0.025 45)" }}>{stat.value}</p>
              <p className="text-xs font-medium mt-1.5 tracking-wide" style={{ color: "oklch(0.520 0.015 60)" }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming recalls */}
        <div className="card-elevated animate-fade-up delay-300 rounded-xl overflow-hidden" data-tour="dashboard-recalls">
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "oklch(0.900 0.010 65)" }}>
            <div className="flex items-center gap-3">
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: "oklch(0.380 0.060 150)", boxShadow: "0 0 6px oklch(0.380 0.060 150 / 0.5)" }}
              />
              <h2 className="text-[15px] font-semibold" style={{ color: "oklch(0.220 0.025 45)" }}>
                Próximos Recalls
              </h2>
            </div>
            <Link href="/recalls" className="text-xs font-medium hover:underline" style={{ color: "oklch(0.520 0.120 45)" }}>
              Ver todos
            </Link>
          </div>
          {recalls.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm" style={{ color: "oklch(0.520 0.015 60)" }}>Nenhum recall nos próximos 7 dias.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "oklch(0.940 0.006 70)" }}>
              {recalls.slice(0, 5).map((r) => {
                const d = new Date(r.scheduled_for);
                return (
                  <div key={r.id} className="flex gap-4 items-center px-6 py-3 table-row-hover">
                    <div className="text-center min-w-[44px]">
                      <div className="text-xs font-bold" style={{ color: "oklch(0.520 0.120 45)" }}>
                        {formatDateShort(d)}
                      </div>
                    </div>
                    <p className="text-sm truncate" style={{ color: "oklch(0.220 0.025 45)" }}>{r.content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent messages */}
        <div className="card-elevated animate-fade-up delay-400 rounded-xl overflow-hidden" data-tour="dashboard-messages">
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "oklch(0.900 0.010 65)" }}>
            <div className="flex items-center gap-3">
              <div
                className="h-2 w-2 rounded-full"
                style={{ background: "oklch(0.520 0.120 45)", boxShadow: "0 0 6px oklch(0.520 0.120 45 / 0.5)" }}
              />
              <h2 className="text-[15px] font-semibold" style={{ color: "oklch(0.220 0.025 45)" }}>
                Mensagens Recentes
              </h2>
            </div>
            <Link href="/messages" className="text-xs font-medium hover:underline" style={{ color: "oklch(0.520 0.120 45)" }}>
              Ver todas
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm" style={{ color: "oklch(0.520 0.015 60)" }}>Nenhuma mensagem enviada ainda.</p>
              <p className="text-xs mt-2" style={{ color: "oklch(0.700 0.010 60)" }}>
                Acesse o histórico completo em Mensagens.
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "oklch(0.940 0.006 70)" }}>
              {recentMessages.slice(0, 5).map((m) => {
                const d = m.sent_at ? new Date(m.sent_at) : null;
                return (
                  <div key={m.id} className="flex gap-4 items-center px-6 py-3 table-row-hover">
                    <div className="text-center min-w-[44px]">
                      {d ? (
                        <div className="text-xs font-bold" style={{ color: "oklch(0.520 0.120 45)" }}>
                          {formatDateShort(d)}
                        </div>
                      ) : (
                        <div className="text-xs" style={{ color: "oklch(0.700 0.010 60)" }}>—</div>
                      )}
                    </div>
                    <p className="text-sm truncate" style={{ color: "oklch(0.220 0.025 45)" }}>
                      {m.content.length > 80 ? m.content.slice(0, 80) + "\u2026" : m.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
