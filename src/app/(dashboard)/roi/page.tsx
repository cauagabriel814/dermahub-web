"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, DollarSign, MessageSquare, Target } from "lucide-react";
import { getRoiDashboard } from "@/services/messaging";

const PERIODS = [
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
  { label: "180 dias", value: 180 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value / 100);
}

export default function RoiPage() {
  const [period, setPeriod] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ["roi-dashboard", period],
    queryFn: () => getRoiDashboard(period),
  });

  const stats = [
    { label: "Receita Potencial", value: data ? formatCurrency(data.potential_revenue) : "—", icon: TrendingUp, color: "var(--terracotta)", bg: "oklch(0.520 0.120 45 / 0.08)" },
    { label: "Receita Confirmada", value: data ? formatCurrency(data.confirmed_revenue) : "—", icon: DollarSign, color: "var(--green)", bg: "var(--green-muted)" },
    { label: "Taxa de Resposta", value: data ? `${data.response_rate}%` : "—", icon: MessageSquare, color: "oklch(0.600 0.090 65)", bg: "oklch(0.600 0.090 65 / 0.08)" },
    { label: "Taxa de Conversao", value: data ? `${data.conversion_rate}%` : "—", icon: Target, color: "var(--brown-medium)", bg: "oklch(0.420 0.030 50 / 0.08)" },
  ];

  const funnel = data?.funnel;
  const maxFunnel = funnel?.sent || 1;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between animate-fade-up">
        <div>
          <h1 className="page-title">ROI da Plataforma</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Acompanhe o retorno gerado pelo DermaHub
          </p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={period === p.value
                ? { background: "var(--terracotta)", color: "var(--primary-foreground)" }
                : { background: "var(--muted)", color: "var(--muted-foreground)" }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="card-elevated animate-fade-up rounded-xl overflow-hidden" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="h-[3px] w-full" style={{ background: stat.color }} />
            <div className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg mb-4" style={{ background: stat.bg }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <p className="stat-number" style={{ color: "var(--brown-deep)" }}>{stat.value}</p>
              <p className="text-xs font-medium mt-1.5 tracking-wide" style={{ color: "var(--muted-foreground)" }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {funnel && (
        <div className="card-elevated animate-fade-up delay-300 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-[15px] font-semibold" style={{ color: "var(--brown-deep)" }}>Funil de Conversao</h2>
          </div>
          <div className="p-6 space-y-3">
            {[
              { label: "Enviadas", value: funnel.sent, color: "var(--muted-foreground)" },
              { label: "Entregues", value: funnel.delivered, color: "oklch(0.600 0.090 65)" },
              { label: "Responderam", value: funnel.responded, color: "oklch(0.420 0.030 50)" },
              { label: "Disseram Sim", value: funnel.positive, color: "var(--terracotta)" },
              { label: "Retornaram", value: funnel.returned, color: "var(--green)" },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-4">
                <span className="text-xs font-medium w-28 text-right" style={{ color: "var(--muted-foreground)" }}>{step.label}</span>
                <div className="flex-1 h-8 rounded-lg overflow-hidden" style={{ background: "var(--muted)" }}>
                  <div
                    className="h-full rounded-lg flex items-center px-3 transition-all duration-500"
                    style={{
                      width: `${Math.max((step.value / maxFunnel) * 100, 2)}%`,
                      background: step.color,
                    }}
                  >
                    <span className="text-xs font-bold text-white">{step.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.ranking && data.ranking.length > 0 && (
        <div className="card-elevated animate-fade-up delay-400 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-[15px] font-semibold" style={{ color: "var(--brown-deep)" }}>Ranking por Procedimento</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Procedimento</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Preco</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Enviadas</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Sim</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Retornos</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--terracotta)" }}>Rec. Potencial</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--green)" }}>Rec. Confirmada</th>
                </tr>
              </thead>
              <tbody>
                {data.ranking.map((row, i) => (
                  <tr key={row.procedure} className="table-row-hover" style={{ borderBottom: i < data.ranking.length - 1 ? "1px solid var(--muted)" : "none" }}>
                    <td className="px-6 py-3 font-medium" style={{ color: "var(--brown-deep)" }}>{row.procedure}</td>
                    <td className="text-right px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{formatCurrency(row.price)}</td>
                    <td className="text-right px-4 py-3" style={{ color: "var(--muted-foreground)" }}>{row.sent}</td>
                    <td className="text-right px-4 py-3 font-semibold" style={{ color: "var(--terracotta)" }}>{row.positive}</td>
                    <td className="text-right px-4 py-3 font-semibold" style={{ color: "var(--green)" }}>{row.returned}</td>
                    <td className="text-right px-4 py-3 font-bold" style={{ color: "var(--terracotta)" }}>{formatCurrency(row.potential_revenue)}</td>
                    <td className="text-right px-6 py-3 font-bold" style={{ color: "var(--green)" }}>{formatCurrency(row.confirmed_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
