"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, DollarSign, MessageSquare, Target, Star, Zap, Users, BadgeDollarSign, RotateCcw } from "lucide-react";
import { getRoiDashboard } from "@/services/messaging";

const PERIODS = [
  { label: "7 dias", value: 7 },
  { label: "30 dias", value: 30 },
  { label: "90 dias", value: 90 },
  { label: "180 dias", value: 180 },
];

type RankingTab = "revenue" | "sent" | "returned";

const RANKING_TABS: { key: RankingTab; label: string }[] = [
  { key: "revenue", label: "Maior faturamento" },
  { key: "sent", label: "Mais realizados" },
  { key: "returned", label: "Melhor retorno" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function diffDays(from: string, to: string): number {
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / 86400000));
}

export default function RoiPage() {
  const [period, setPeriod] = useState(30);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [rankingTab, setRankingTab] = useState<RankingTab>("revenue");

  // If custom dates are set, derive period from them
  const effectivePeriod = useMemo(() => {
    if (customFrom && customTo) {
      return diffDays(customFrom, customTo);
    }
    return period;
  }, [period, customFrom, customTo]);

  const isCustom = !!(customFrom && customTo);

  const { data } = useQuery({
    queryKey: ["roi-dashboard", effectivePeriod],
    queryFn: () => getRoiDashboard(effectivePeriod),
  });

  /* ---------- Procedimento Destaque ---------- */
  const highlight = useMemo(() => {
    if (!data?.ranking || data.ranking.length === 0) return null;
    return [...data.ranking].sort((a, b) => b.potential_revenue - a.potential_revenue)[0];
  }, [data?.ranking]);

  /* ---------- Sorted ranking ---------- */
  const sortedRanking = useMemo(() => {
    if (!data?.ranking) return [];
    const copy = [...data.ranking];
    switch (rankingTab) {
      case "revenue":
        return copy.sort((a, b) => b.potential_revenue - a.potential_revenue);
      case "sent":
        return copy.sort((a, b) => b.sent - a.sent);
      case "returned":
        return copy.sort((a, b) => b.returned - a.returned);
      default:
        return copy;
    }
  }, [data?.ranking, rankingTab]);

  const stats = [
    { label: "Receita Potencial", value: data ? formatCurrency(data.potential_revenue) : "—", icon: TrendingUp, color: "var(--terracotta)", bg: "oklch(0.520 0.120 45 / 0.08)" },
    { label: "Receita Confirmada", value: data ? formatCurrency(data.confirmed_revenue) : "—", icon: DollarSign, color: "var(--green)", bg: "var(--green-muted)" },
    { label: "Taxa de Resposta", value: data ? `${data.response_rate}%` : "—", icon: MessageSquare, color: "oklch(0.600 0.090 65)", bg: "oklch(0.600 0.090 65 / 0.08)" },
    { label: "Taxa de Conversão", value: data ? `${data.conversion_rate}%` : "—", icon: Target, color: "var(--brown-medium)", bg: "oklch(0.420 0.030 50 / 0.08)" },
  ];

  /* ---------- Insights Inteligentes (themed) ---------- */
  const insights = useMemo(() => {
    if (!data) return [];
    const items: { icon: typeof Star; color: string; label: string; text: string }[] = [];

    if (data.ranking && data.ranking.length > 0) {
      const top = [...data.ranking].sort((a, b) => b.potential_revenue - a.potential_revenue)[0];
      if (top.sent > 0) {
        const rate = Math.round((top.positive / top.sent) * 100);
        items.push({
          icon: Star,
          color: "var(--terracotta)",
          label: "Destaque",
          text: `O procedimento **${top.procedure}** atingiu **${rate}%** de taxa de confirmação.`,
        });
      }
    }

    if (data.conversion_rate > 50) {
      items.push({
        icon: Zap,
        color: "oklch(0.600 0.090 65)",
        label: "Engajamento",
        text: `Taxa de conversão excepcional de **${data.conversion_rate}%** (acima da média de 50%).`,
      });
    }

    if (data.response_rate > 0 && data.funnel) {
      items.push({
        icon: Users,
        color: "var(--brown-deep)",
        label: "Interação",
        text: `**${data.response_rate}%** dos pacientes (${data.funnel.responded} de ${data.funnel.sent}) **responderam** ativamente às mensagens.`,
      });
    }

    if (data.potential_revenue > 0) {
      items.push({
        icon: BadgeDollarSign,
        color: "var(--terracotta)",
        label: "Oportunidade",
        text: `Identificamos **${formatCurrency(data.potential_revenue)}** em receita potencial a ser convertida.`,
      });
    }

    if (data.funnel && data.funnel.returned > 0) {
      items.push({
        icon: RotateCcw,
        color: "var(--green)",
        label: "Fidelização",
        text: `**${data.funnel.returned} paciente${data.funnel.returned !== 1 ? "s" : ""}** já **retornou** para realizar um novo procedimento.`,
      });
    }

    return items.slice(0, 5);
  }, [data]);

  const funnel = data?.funnel;
  const funnelSteps = funnel
    ? [
        { label: "Enviadas", value: funnel.sent, color: "var(--muted-foreground)" },
        { label: "Entregues", value: funnel.delivered, color: "oklch(0.600 0.090 65)" },
        { label: "Responderam", value: funnel.responded, color: "var(--brown-deep)" },
        { label: "Confirmadas", value: funnel.positive, color: "var(--terracotta)" },
        { label: "Retornaram", value: funnel.returned, color: "var(--green)" },
      ]
    : [];
  const maxFunnel = funnel ? Math.max(funnel.sent, funnel.delivered, funnel.responded, funnel.positive, funnel.returned, 1) : 1;
  const BAR_MAX_HEIGHT = 180;
  const BAR_MIN_HEIGHT = 20;

  function renderInsightText(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} style={{ color: "var(--brown-deep)" }}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  return (
    <div className="space-y-8">
      {/* Header + period selector */}
      <div className="flex items-end justify-between animate-fade-up flex-wrap gap-4">
        <div>
          <h1 className="page-title">ROI da Plataforma</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Acompanhe o retorno gerado pelo DermaHub
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => { setPeriod(p.value); setCustomFrom(""); setCustomTo(""); }}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={period === p.value && !isCustom
                ? { background: "var(--terracotta)", color: "var(--primary-foreground)" }
                : { background: "var(--muted)", color: "var(--muted-foreground)" }
              }
            >
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-1.5 ml-1">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="h-8 rounded-lg text-xs px-2 bg-white"
              style={{ border: `1px solid ${isCustom ? "var(--terracotta)" : "var(--border)"}`, color: customFrom ? "inherit" : "var(--muted-foreground)", width: 130 }}
            />
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>—</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="h-8 rounded-lg text-xs px-2 bg-white"
              style={{ border: `1px solid ${isCustom ? "var(--terracotta)" : "var(--border)"}`, color: customTo ? "inherit" : "var(--muted-foreground)", width: 130 }}
            />
            {isCustom && (
              <button
                onClick={() => { setCustomFrom(""); setCustomTo(""); }}
                className="text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
                style={{ color: "oklch(0.540 0.200 25)" }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards — 5 columns when highlight exists */}
      <div className={`grid gap-4 sm:grid-cols-2 ${highlight ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
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

        {/* Procedimento Destaque card */}
        {highlight && (
          <div className="card-elevated animate-fade-up rounded-xl overflow-hidden" style={{ animationDelay: `${stats.length * 80}ms` }}>
            <div className="h-[3px] w-full" style={{ background: "var(--terracotta)" }} />
            <div className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg mb-4" style={{ background: "oklch(0.520 0.120 45 / 0.08)" }}>
                <Star className="h-5 w-5" style={{ color: "var(--terracotta)" }} />
              </div>
              <p className="text-lg font-bold leading-snug" style={{ color: "var(--brown-deep)", fontFamily: "var(--font-brand)" }} title={highlight.procedure}>
                {highlight.procedure}
              </p>
              <p className="text-xs font-medium mt-1.5 tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                Procedimento Destaque
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs font-bold" style={{ color: "var(--terracotta)" }}>{formatCurrency(highlight.potential_revenue)}</span>
                <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>{highlight.sent} envio{highlight.sent !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Funil de Conversão + Insights Inteligentes */}
      {funnel && (
        <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
          {/* Funnel card */}
          <div className="card-elevated animate-fade-up delay-300 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-[15px] font-semibold" style={{ color: "var(--brown-deep)" }}>Funil de Conversão</h2>
            </div>
            <div className="p-6">
              <div className="flex items-end justify-center gap-6 sm:gap-10" style={{ minHeight: BAR_MAX_HEIGHT + 60 }}>
                {funnelSteps.map((step) => {
                  const barHeight = Math.max((step.value / maxFunnel) * BAR_MAX_HEIGHT, BAR_MIN_HEIGHT);
                  return (
                    <div key={step.label} className="flex flex-col items-center gap-2" style={{ width: 64 }}>
                      <span className="text-sm font-bold tabular-nums" style={{ color: step.color }}>
                        {step.value}
                      </span>
                      <div
                        className="w-10 rounded-t-lg transition-all duration-500"
                        style={{
                          height: barHeight,
                          background: step.color,
                          opacity: step.value === 0 ? 0.35 : 1,
                        }}
                      />
                      <span className="text-[11px] font-medium text-center leading-tight" style={{ color: "var(--muted-foreground)" }}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Insights card — themed with icons */}
          {insights.length > 0 && (
            <div className="card-elevated rounded-xl overflow-hidden p-5 space-y-4 animate-fade-up delay-300">
              <h3 className="text-sm font-semibold" style={{ color: "var(--brown-deep)" }}>
                Insights Inteligentes
              </h3>
              <div className="space-y-3.5">
                {insights.map((insight, i) => (
                  <div key={i} className="flex gap-2.5 items-start">
                    <insight.icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color: insight.color }} />
                    <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                      <span className="font-bold" style={{ color: insight.color }}>{insight.label}:</span>{" "}
                      {renderInsightText(insight.text)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranking table */}
      {data?.ranking && data.ranking.length > 0 && (
        <div className="card-elevated animate-fade-up delay-400 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between gap-4 flex-wrap" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-[15px] font-semibold" style={{ color: "var(--brown-deep)" }}>Ranking por Procedimento</h2>
            <div className="flex gap-1.5">
              {RANKING_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setRankingTab(tab.key)}
                  className="px-3 py-1 rounded-md text-[11px] font-semibold transition-colors"
                  style={rankingTab === tab.key
                    ? { background: "var(--terracotta)", color: "var(--primary-foreground)" }
                    : { background: "var(--muted)", color: "var(--muted-foreground)" }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--muted)" }}>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Procedimento</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Preço</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Enviadas</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Confirmadas</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Retornos</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--terracotta)" }}>Rec. Potencial</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--green)" }}>Rec. Confirmada</th>
                </tr>
              </thead>
              <tbody>
                {sortedRanking.map((row, i) => (
                  <tr key={row.procedure} className="table-row-hover" style={{ borderBottom: i < sortedRanking.length - 1 ? "1px solid var(--muted)" : "none" }}>
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
