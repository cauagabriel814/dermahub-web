"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, X, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProcedureType, deleteProcedureType, getProcedureTypes, updateProcedureType } from "@/services/procedures";
import type { ProcedureType } from "@/types/api";

type EditState = { name: string; default_recall_days: string; price: string };

export default function ProcedureTypesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDays, setNewDays] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({ name: "", default_recall_days: "", price: "" });

  const { data: types, isLoading } = useQuery({
    queryKey: ["procedure-types-all"],
    queryFn: () => getProcedureTypes(false),
  });

  async function handleCreate() {
    if (!newName || !newDays) return;
    await createProcedureType({
      name: newName,
      default_recall_days: Number(newDays),
      price: newPrice ? Number(newPrice) : undefined,
    });
    await queryClient.invalidateQueries({ queryKey: ["procedure-types-all"] });
    setNewName(""); setNewDays(""); setNewPrice(""); setShowForm(false);
  }

  function startEdit(t: ProcedureType) {
    setEditingId(t.id);
    setEditState({ name: t.name, default_recall_days: String(t.default_recall_days), price: t.price ? String(t.price) : "" });
  }

  async function saveEdit(id: string) {
    await updateProcedureType(id, {
      name: editState.name,
      default_recall_days: Number(editState.default_recall_days),
      price: editState.price ? Number(editState.price) : undefined,
    });
    await queryClient.invalidateQueries({ queryKey: ["procedure-types-all"] });
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Tem certeza que deseja excluir este procedimento?")) return;
    await deleteProcedureType(id);
    await queryClient.invalidateQueries({ queryKey: ["procedure-types-all"] });
  }

  async function handleToggle(id: string, active: boolean) {
    await updateProcedureType(id, { active: !active });
    await queryClient.invalidateQueries({ queryKey: ["procedure-types-all"] });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-brand font-normal tracking-wide text-foreground" data-tour="procedures-title">Tipos de Procedimento</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {types?.length ?? 0} procedimentos cadastrados
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} data-tour="procedures-add-btn">
          <Plus className="h-4 w-4 mr-2" />
          Novo Tipo
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Novo procedimento</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1 col-span-1">
              <Label>Nome</Label>
              <Input placeholder="Ex: Botox" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Valor (R$)</Label>
              <Input type="number" placeholder="Ex: 1300" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Recall (dias)</Label>
              <Input type="number" placeholder="Ex: 120" value={newDays} onChange={(e) => setNewDays(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate}>Salvar</Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border" data-tour="procedures-table">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">Carregando...</div>
        ) : types?.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">Nenhum tipo cadastrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Valor</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Recall</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {types?.map((t) =>
                editingId === t.id ? (
                  <tr key={t.id} className="border-b bg-blue-50">
                    <td className="px-4 py-2">
                      <Input className="h-7 text-sm" value={editState.name} onChange={(e) => setEditState(s => ({ ...s, name: e.target.value }))} />
                    </td>
                    <td className="px-4 py-2">
                      <Input className="h-7 text-sm w-24" type="number" value={editState.price} onChange={(e) => setEditState(s => ({ ...s, price: e.target.value }))} />
                    </td>
                    <td className="px-4 py-2">
                      <Input className="h-7 text-sm w-20" type="number" value={editState.default_recall_days} onChange={(e) => setEditState(s => ({ ...s, default_recall_days: e.target.value }))} />
                    </td>
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => saveEdit(t.id)} className="p-1 text-green-600 hover:text-green-800">
                          <Check className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-muted-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={t.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {t.price ? `R$ ${t.price.toLocaleString("pt-BR")}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{t.default_recall_days} dias</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => handleToggle(t.id, t.active)}>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer ${t.active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-muted/60 text-muted-foreground hover:bg-gray-200"}`}>
                          {t.active ? "Ativo" : "Inativo"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button type="button" onClick={() => startEdit(t)} className="p-1 text-gray-400 hover:text-gray-700">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(t.id)} className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
