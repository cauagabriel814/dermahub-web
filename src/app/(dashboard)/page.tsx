import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Syringe, CalendarClock, MessageSquare } from "lucide-react";

const stats = [
  { label: "Pacientes Ativos", value: "0", icon: Users },
  { label: "Procedimentos no Mês", value: "0", icon: Syringe },
  { label: "Recalls Programados", value: "0", icon: CalendarClock },
  { label: "Mensagens Enviadas", value: "0", icon: MessageSquare },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Recalls</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Nenhum recall programado ainda.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Respostas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Nenhuma resposta recebida ainda.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
