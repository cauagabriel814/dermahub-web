"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProcedureType, getProcedureTypes, updateProcedureType } from "@/services/procedures";

export default function ProcedureTypesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDays, setNewDays] = useState("");

  const { data: types, isLoading } = useQuery({
    queryKey: ["procedure-types-all"],
    queryFn: () => getProcedureTypes(false),
  });

  async function handleCreate() {
    if (!newName || !newDays) return;
    await createProcedureType({ name: newName, default_recall_days: Number(newDays) });
    await queryClient.invalidateQueries({ queryKey: ["procedure-types-all"] });
    setNewName(""); setNewDays(""); setShowForm(false);
  }

  async function handleToggle(id: string, active: boolean) {
    await updateProcedureType(id, { active: !active });
    await queryClient.invalidateQueries({ queryKey: ["procedure-types-all"] });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Procedimento</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os procedimentos oferecidos pela clínica</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Tipo
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Nome do procedimento</Label>
              <Input placeholder="Ex: Botox" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Dias para recall padrão</Label>
              <Input type="number" placeholder="Ex: 90" value={newDays} onChange={(e) => setNewDays(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate}>Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Carregando...</div>
        ) : types?.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Nenhum tipo cadastrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Recall (dias)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {types?.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-gray-600">{t.default_recall_days} dias</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {t.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="text-xs text-gray-400 hover:text-gray-700"
                      onClick={() => handleToggle(t.id, t.active)}
                    >
                      {t.active ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
