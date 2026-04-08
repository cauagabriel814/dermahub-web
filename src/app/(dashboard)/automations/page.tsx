"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ToggleLeft, ToggleRight, Zap, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProcedureTypes } from "@/services/procedures";
import { getMessageTemplates, getAutomationRules, createAutomationRule, updateAutomationRule, deleteAutomationRule } from "@/services/messaging";
import type { AutomationRuleCreate } from "@/types/api";

type EventTypeKey = "post_procedure" | "recall";

const EVENT_LABELS: Record<EventTypeKey, string> = {
  post_procedure: "Pós-procedimento",
  recall: "Recall",
};

interface NewRuleState {
  procedure_type_id: string;
  name: string;
  trigger_offset_days: string;
  message_template_id: string;
  event_type: EventTypeKey;
}

interface EditRuleState {
  name: string;
  trigger_offset_days: string;
  message_template_id: string;
  event_type: EventTypeKey;
}

const defaultNew = (): NewRuleState => ({
  procedure_type_id: "",
  name: "",
  trigger_offset_days: "3",
  message_template_id: "",
  event_type: "post_procedure",
});

export default function AutomationsPage() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [newRule, setNewRule] = useState<NewRuleState>(defaultNew());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditRuleState>({ name: "", trigger_offset_days: "3", message_template_id: "", event_type: "post_procedure" });

  const { data: procedureTypes = [] } = useQuery({
    queryKey: ["procedure-types"],
    queryFn: () => getProcedureTypes(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ["message-templates"],
    queryFn: () => getMessageTemplates(true),
  });

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ["automation-rules"],
    queryFn: () => getAutomationRules(),
  });

  const createMut = useMutation({
    mutationFn: (data: AutomationRuleCreate) => createAutomationRule(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automation-rules"] });
      setCreating(false);
      setNewRule(defaultNew());
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateAutomationRule>[1] }) =>
      updateAutomationRule(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["automation-rules"] });
      setEditingId(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteAutomationRule(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automation-rules"] }),
  });

  function handleCreate() {
    if (!newRule.procedure_type_id || !newRule.name || !newRule.message_template_id) return;
    createMut.mutate({
      procedure_type_id: newRule.procedure_type_id,
      name: newRule.name,
      trigger_offset_days: Number(newRule.trigger_offset_days),
      message_template_id: newRule.message_template_id,
      event_type: newRule.event_type,
    });
  }

  function startEdit(rule: typeof rules[number]) {
    setEditingId(rule.id);
    setEditState({
      name: rule.name,
      trigger_offset_days: String(rule.trigger_offset_days),
      message_template_id: rule.message_template_id,
      event_type: rule.event_type as EventTypeKey,
    });
  }

  function handleEditSave() {
    if (!editingId || !editState.name || !editState.message_template_id) return;
    updateMut.mutate({
      id: editingId,
      data: {
        name: editState.name,
        trigger_offset_days: Number(editState.trigger_offset_days),
        message_template_id: editState.message_template_id,
        event_type: editState.event_type,
      },
    });
  }

  function handleDelete(ruleId: string) {
    if (!window.confirm("Tem certeza?")) return;
    deleteMut.mutate(ruleId);
  }

  // Group rules by procedure_type_id
  const grouped = rules.reduce<Record<string, typeof rules>>((acc, r) => {
    if (!acc[r.procedure_type_id]) acc[r.procedure_type_id] = [];
    acc[r.procedure_type_id].push(r);
    return acc;
  }, {});

  const ptMap = Object.fromEntries(procedureTypes.map((p) => [p.id, p.name]));
  const tplMap = Object.fromEntries(templates.map((t) => [t.id, t.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between animate-fade-up">
        <div>
          <h1 className="page-title" data-tour="automations-title">Automações</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Configure quando mensagens são enviadas automaticamente
          </p>
        </div>
        {!creating && (
          <Button
            onClick={() => setCreating(true)}
            className="btn-primary-shimmer gap-2 rounded-xl text-sm font-medium px-5"
            style={{ color: "var(--primary-foreground)", border: "none" }}
            data-tour="automations-add-btn"
          >
            <Plus className="h-4 w-4" />
            Nova Regra
          </Button>
        )}
      </div>

      {/* Create form */}
      {creating && (
        <div
          className="animate-fade-up rounded-2xl p-5 space-y-4"
          style={{ background: "var(--cream)", border: "1px solid oklch(0.312 0.0434 119.6 / 0.3)", boxShadow: "var(--shadow-warm-sm)" }}
        >
          <h2 className="text-base font-light" style={{ fontFamily: "var(--font-brand)", color: "oklch(0.250 0.026 50.8)" }}>
            Nova Regra de Automação
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                Nome da regra
              </label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="Ex: Botox D+3"
                className="rounded-xl"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                Tipo de procedimento
              </label>
              <select
                value={newRule.procedure_type_id}
                onChange={(e) => setNewRule({ ...newRule, procedure_type_id: e.target.value })}
                className="w-full h-10 px-3 rounded-xl text-sm border focus:outline-none focus:ring-2"
                style={{ borderColor: "var(--border)", color: "oklch(0.250 0.026 50.8)", background: "var(--cream)" }}
              >
                <option value="">Selecione...</option>
                {procedureTypes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                Tipo de evento
              </label>
              <select
                value={newRule.event_type}
                onChange={(e) => setNewRule({ ...newRule, event_type: e.target.value as EventTypeKey })}
                className="w-full h-10 px-3 rounded-xl text-sm border focus:outline-none"
                style={{ borderColor: "var(--border)", color: "oklch(0.250 0.026 50.8)", background: "var(--cream)" }}
              >
                <option value="post_procedure">Pós-procedimento</option>
                <option value="recall">Recall</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                Disparar em D+
              </label>
              <Input
                type="number"
                min={0}
                value={newRule.trigger_offset_days}
                onChange={(e) => setNewRule({ ...newRule, trigger_offset_days: e.target.value })}
                className="rounded-xl"
                style={{ borderColor: "var(--border)" }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
                Modelo de mensagem
              </label>
              <select
                value={newRule.message_template_id}
                onChange={(e) => setNewRule({ ...newRule, message_template_id: e.target.value })}
                className="w-full h-10 px-3 rounded-xl text-sm border focus:outline-none"
                style={{ borderColor: "var(--border)", color: "oklch(0.250 0.026 50.8)", background: "var(--cream)" }}
              >
                <option value="">Selecione um modelo...</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              onClick={handleCreate}
              disabled={createMut.isPending || !newRule.name || !newRule.procedure_type_id || !newRule.message_template_id}
              className="btn-primary-shimmer gap-2 rounded-xl text-sm px-5"
              style={{ color: "var(--primary-foreground)", border: "none" }}
            >
              {createMut.isPending ? "Criando..." : "Criar Regra"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setCreating(false); setNewRule(defaultNew()); }}
              className="rounded-xl text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {isLoading ? (
        <div className="py-16 text-center animate-fade-up">
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: "oklch(0.844 0.024 55.1)", animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      ) : rules.length === 0 ? (
        <div className="py-16 text-center animate-fade-up rounded-2xl"
          style={{ background: "var(--cream)", border: "1px solid var(--border)" }}>
          <Zap className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--border)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Nenhuma regra criada ainda.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up delay-100">
          {Object.entries(grouped).map(([ptId, ptRules]) => (
            <div key={ptId}
              className="rounded-2xl overflow-hidden"
              style={{ background: "var(--cream)", border: "1px solid var(--border)", boxShadow: "var(--shadow-warm-sm)" }}
            >
              <div className="px-5 py-3 flex items-center gap-2"
                style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                <div className="h-2 w-2 rounded-full"
                  style={{ background: ptRules.some(r => r.active) ? "var(--green)" : "var(--border)", boxShadow: ptRules.some(r => r.active) ? "0 0 6px oklch(0.380 0.060 150 / 0.5)" : "none" }} />
                <h3 className="text-sm font-medium" style={{ color: "var(--brown-deep)" }}>
                  {ptMap[ptId] ?? "Procedimento desconhecido"}
                </h3>
              </div>
              {ptRules.sort((a, b) => a.sort_order - b.sort_order).map((rule, i) => (
                <div key={rule.id}
                  style={{ borderBottom: i < ptRules.length - 1 ? "1px solid var(--muted)" : "none" }}
                >
                  {editingId === rule.id ? (
                    /* ---- Inline edit form ---- */
                    <div className="px-5 py-4 space-y-3"
                      style={{ background: "oklch(0.97 0.005 55 / 0.6)" }}
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-medium uppercase tracking-widest mb-1 block" style={{ color: "var(--muted-foreground)" }}>
                            Nome
                          </label>
                          <Input
                            value={editState.name}
                            onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                            className="rounded-xl h-9 text-sm"
                            style={{ borderColor: "var(--border)" }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-widest mb-1 block" style={{ color: "var(--muted-foreground)" }}>
                            Tipo de evento
                          </label>
                          <select
                            value={editState.event_type}
                            onChange={(e) => setEditState({ ...editState, event_type: e.target.value as EventTypeKey })}
                            className="w-full h-9 px-3 rounded-xl text-sm border focus:outline-none"
                            style={{ borderColor: "var(--border)", color: "oklch(0.250 0.026 50.8)", background: "var(--cream)" }}
                          >
                            <option value="post_procedure">Pós-procedimento</option>
                            <option value="recall">Recall</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-widest mb-1 block" style={{ color: "var(--muted-foreground)" }}>
                            Disparar em D+
                          </label>
                          <Input
                            type="number"
                            min={0}
                            value={editState.trigger_offset_days}
                            onChange={(e) => setEditState({ ...editState, trigger_offset_days: e.target.value })}
                            className="rounded-xl h-9 text-sm"
                            style={{ borderColor: "var(--border)" }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium uppercase tracking-widest mb-1 block" style={{ color: "var(--muted-foreground)" }}>
                            Modelo de mensagem
                          </label>
                          <select
                            value={editState.message_template_id}
                            onChange={(e) => setEditState({ ...editState, message_template_id: e.target.value })}
                            className="w-full h-9 px-3 rounded-xl text-sm border focus:outline-none"
                            style={{ borderColor: "var(--border)", color: "oklch(0.250 0.026 50.8)", background: "var(--cream)" }}
                          >
                            <option value="">Selecione um modelo...</option>
                            {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleEditSave}
                          disabled={updateMut.isPending || !editState.name || !editState.message_template_id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                          style={{ background: "var(--green)", color: "#fff" }}
                        >
                          <Check className="h-3.5 w-3.5" />
                          {updateMut.isPending ? "Salvando..." : "Salvar"}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-orange-50"
                          style={{ color: "var(--muted-foreground)" }}
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ---- Normal display row ---- */
                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-3 items-center px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="text-sm font-medium" style={{ color: "var(--brown-deep)" }}>{rule.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                          {tplMap[rule.message_template_id] ?? rule.message_template_id}
                        </p>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full"
                        style={{ background: "var(--green-muted)", color: "var(--green)" }}>
                        {EVENT_LABELS[rule.event_type as EventTypeKey]}
                      </span>
                      <span className="text-xs font-medium font-mono"
                        style={{ color: "var(--green)" }}>
                        D+{rule.trigger_offset_days}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full"
                        style={rule.active
                          ? { background: "var(--green-muted)", color: "var(--green)" }
                          : { background: "var(--muted)", color: "var(--muted-foreground)" }
                        }
                      >
                        {rule.active ? "Ativo" : "Inativo"}
                      </span>
                      <button
                        onClick={() => startEdit(rule)}
                        className="p-1.5 rounded-lg transition-colors hover:bg-orange-50"
                        title="Editar regra"
                      >
                        <Pencil className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        disabled={deleteMut.isPending}
                        className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                        title="Excluir regra"
                      >
                        <Trash2 className="h-4 w-4" style={{ color: "oklch(0.55 0.15 27)" }} />
                      </button>
                      <button
                        onClick={() => updateMut.mutate({ id: rule.id, data: { active: !rule.active } })}
                        className="p-1.5 rounded-lg transition-colors hover:bg-orange-50"
                      >
                        {rule.active
                          ? <ToggleRight className="h-5 w-5" style={{ color: "var(--green)" }} />
                          : <ToggleLeft className="h-5 w-5" style={{ color: "var(--border)" }} />
                        }
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
