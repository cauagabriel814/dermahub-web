"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPatient } from "@/services/patients";
import { getProcedureRecords } from "@/services/procedures";

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatient(id),
  });

  const { data: records } = useQuery({
    queryKey: ["procedure-records", id],
    queryFn: () => getProcedureRecords(id),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Carregando...</div>;
  if (!patient) return <div className="p-8 text-muted-foreground">Paciente não encontrado.</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
        </Link>
        <h1 className="text-2xl font-brand font-normal tracking-wide text-foreground">{patient.full_name}</h1>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-3">
        <h2 className="font-semibold text-gray-700">Dados do Paciente</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Telefone</span><p className="font-medium">{patient.phone}</p></div>
          <div><span className="text-muted-foreground">E-mail</span><p className="font-medium">{patient.email ?? "—"}</p></div>
          <div><span className="text-muted-foreground">Último procedimento</span><p className="font-medium">{patient.last_procedure_date ? new Date(patient.last_procedure_date + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</p></div>
        </div>
        {patient.notes && (
          <div className="text-sm">
            <span className="text-muted-foreground">Observações</span>
            <p className="mt-1">{patient.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold text-gray-700">Histórico de Procedimentos</h2>
          <Link href={`/procedures/new?patient_id=${patient.id}`}>
            <Button size="sm">+ Registrar Procedimento</Button>
          </Link>
        </div>
        {!records || records.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">Nenhum procedimento registrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Procedimento</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Notas</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{new Date(r.procedure_date + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.procedure_type_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
