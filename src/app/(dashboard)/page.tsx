import { Users, Syringe, CalendarClock, MessageSquare } from "lucide-react";

const stats = [
  {
    label: "Pacientes Ativos",
    value: "0",
    icon: Users,
    gradient: "linear-gradient(135deg, oklch(0.429 0.0306 72.6) 0%, oklch(0.480 0.035 68) 100%)",
    glow: "oklch(0.429 0.0306 72.6 / 0.25)",
  },
  {
    label: "Procedimentos no Mês",
    value: "0",
    icon: Syringe,
    gradient: "linear-gradient(135deg, oklch(0.312 0.0434 119.6) 0%, oklch(0.380 0.048 118) 100%)",
    glow: "oklch(0.312 0.0434 119.6 / 0.25)",
  },
  {
    label: "Recalls Programados",
    value: "0",
    icon: CalendarClock,
    gradient: "linear-gradient(135deg, oklch(0.327 0.0736 48.0) 0%, oklch(0.380 0.060 52) 100%)",
    glow: "oklch(0.327 0.0736 48.0 / 0.25)",
  },
  {
    label: "Mensagens Enviadas",
    value: "0",
    icon: MessageSquare,
    gradient: "linear-gradient(135deg, oklch(0.596 0.0361 57.9) 0%, oklch(0.650 0.030 58) 100%)",
    glow: "oklch(0.596 0.0361 57.9 / 0.25)",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <h1 className="page-title">Visão Geral</h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.596 0.036 57.9)" }}>
          Acompanhe os indicadores da clínica
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="card-elevated animate-fade-up rounded-2xl overflow-hidden"
            style={{ animationDelay: `${i * 80}ms`, background: "oklch(1 0 0)", border: "1px solid oklch(0.878 0.015 58)" }}
          >
            <div className="h-1 w-full" style={{ background: stat.gradient }} />
            <div className="p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-4"
                style={{ background: stat.gradient, boxShadow: `0 4px 12px ${stat.glow}` }}>
                <stat.icon className="h-5 w-5" style={{ color: "oklch(0.975 0.005 60)" }} />
              </div>
              <p className="stat-number" style={{ color: "oklch(0.250 0.026 50.8)" }}>{stat.value}</p>
              <p className="text-xs font-medium mt-1 tracking-wide" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-elevated animate-fade-up delay-300 rounded-2xl overflow-hidden"
          style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.878 0.015 58)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "oklch(0.878 0.015 58)" }}>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full"
                style={{ background: "oklch(0.380 0.048 118)", boxShadow: "0 0 6px oklch(0.380 0.048 118 / 0.6)" }} />
              <h2 className="text-base font-light tracking-wide"
                style={{ fontFamily: "var(--font-brand)", color: "oklch(0.250 0.026 50.8)" }}>
                Próximos Recalls
              </h2>
            </div>
            <CalendarClock className="h-4 w-4" style={{ color: "oklch(0.596 0.036 57.9)" }} />
          </div>
          <div className="px-6 py-8 text-center">
            <p className="text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>Nenhum recall programado ainda.</p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.844 0.024 55.1)" }}>
              Os recalls aparecerão aqui após cadastrar procedimentos.
            </p>
          </div>
        </div>

        <div className="card-elevated animate-fade-up delay-400 rounded-2xl overflow-hidden"
          style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.878 0.015 58)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "oklch(0.878 0.015 58)" }}>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full"
                style={{ background: "oklch(0.429 0.0306 72.6)", boxShadow: "0 0 6px oklch(0.429 0.0306 72.6 / 0.6)" }} />
              <h2 className="text-base font-light tracking-wide"
                style={{ fontFamily: "var(--font-brand)", color: "oklch(0.250 0.026 50.8)" }}>
                Respostas Recentes
              </h2>
            </div>
            <MessageSquare className="h-4 w-4" style={{ color: "oklch(0.596 0.036 57.9)" }} />
          </div>
          <div className="px-6 py-8 text-center">
            <p className="text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>Nenhuma resposta recebida ainda.</p>
            <p className="text-xs mt-1" style={{ color: "oklch(0.844 0.024 55.1)" }}>
              As respostas via WhatsApp aparecerão aqui.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
