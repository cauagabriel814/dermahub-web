"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ToggleLeft, ToggleRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProcedureTypes } from "@/services/procedures";
import { getMessageTemplates, getAutomationRules, createAutomationRule, updateAutomationRule } from "@/services/messaging";
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
          <h1 className="page-title">Automações</h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.596 0.036 57.9)" }}>
            Configure quando mensagens são enviadas automaticamente
          </p>
        </div>
        {!creating && (
          <Button
            onClick={() => setCreating(true)}
            className="btn-primary-shimmer gap-2 rounded-xl text-sm font-medium px-5"
            style={{ color: "oklch(0.975 0.005 60)", border: "none" }}
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
          style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.312 0.0434 119.6 / 0.3)", boxShadow: "var(--shadow-warm-sm)" }}
        >
          <h2 className="text-base font-light" style={{ fontFamily: "var(--font-brand)", color: "oklch(0.250 0.026 50.8)" }}>
            Nova Regra de Automação
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                Nome da regra
              </label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="Ex: Botox D+3"
                className="rounded-xl"
                style={{ borderColor: "oklch(0.878 0.015 58)" }}
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                Tipo de procedimento
              </label>
              <select
                value={newRule.procedure_type_id}
                onChange={(e) => setNewRule({ ...newRule, procedure_type_id: e.target.value })}
                className="w-full h-10 px-3 rounded-xl text-sm border focus:outline-none focus:ring-2"
                style={{ borderColor: "oklch(0.878 0.015 58)", color: "oklch(0.250 0.026 50.8)", background: "oklch(1 0 0)" }}
              >
                <option value="">Selecione...</option>
                {procedureTypes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                Tipo de evento
              </label>
              <select
                value={newRule.event_type}
                onChange={(e) => setNewRule({ ...newRule, event_type: e.target.value as EventTypeKey })}
                className="w-full h-10 px-3 rounded-xl text-sm border focus:outline-none"
                style={{ borderColor: "oklch(0.878 0.015 58)", color: "oklch(0.250 0.026 50.8)", background: "oklch(1 0 0)" }}
              >
                <option value="post_procedure">Pós-procedimento</option>
                <option value="recall">Recall</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                Disparar em D+
              </label>
              <Input
                type="number"
                min={0}
                value={newRule.trigger_offset_days}
                onChange={(e) => setNewRule({ ...newRule, trigger_offset_days: e.target.value })}
                className="rounded-xl"
                style={{ borderColor: "oklch(0.878 0.015 58)" }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                Modelo de mensagem
              </label>
              <select
                value={newRule.message_template_id}
                onChange={(e) => setNewRule({ ...newRule, message_template_id: e.target.value })}
                className="w-full h-10 px-3 rounded-xl text-sm border focus:outline-none"
                style={{ borderColor: "oklch(0.878 0.015 58)", color: "oklch(0.250 0.026 50.8)", background: "oklch(1 0 0)" }}
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
              style={{ color: "oklch(0.975 0.005 60)", border: "none" }}
            >
              {createMut.isPending ? "Criando..." : "Criar Regra"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setCreating(false); setNewRule(defaultNew()); }}
              className="rounded-xl text-sm"
              style={{ color: "oklch(0.596 0.036 57.9)" }}
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
          style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.878 0.015 58)" }}>
          <Zap className="h-8 w-8 mx-auto mb-3" style={{ color: "oklch(0.844 0.024 55.1)" }} />
          <p className="text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>Nenhuma regra criada ainda.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-up delay-100">
          {Object.entries(grouped).map(([ptId, ptRules]) => (
            <div key={ptId}
              className="rounded-2xl overflow-hidden"
              style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.878 0.015 58)", boxShadow: "var(--shadow-warm-sm)" }}
            >
              <div className="px-5 py-3 flex items-center gap-2"
                style={{ background: "oklch(0.975 0.005 60)", borderBottom: "1px solid oklch(0.878 0.015 58)" }}>
                <div className="h-2 w-2 rounded-full"
                  style={{ background: "oklch(0.429 0.0306 72.6)", boxShadow: "0 0 6px oklch(0.429 0.0306 72.6 / 0.5)" }} />
                <h3 className="text-sm font-medium" style={{ color: "oklch(0.250 0.026 50.8)" }}>
                  {ptMap[ptId] ?? "Procedimento desconhecido"}
                </h3>
              </div>
              {ptRules.sort((a, b) => a.sort_order - b.sort_order).map((rule, i) => (
                <div key={rule.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5"
                  style={{ borderBottom: i < ptRules.length - 1 ? "1px solid oklch(0.920 0.010 60)" : "none" }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: "oklch(0.250 0.026 50.8)" }}>{rule.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                      {tplMap[rule.message_template_id] ?? rule.message_template_id}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full"
                    style={{ background: "oklch(0.312 0.0434 119.6 / 0.10)", color: "oklch(0.312 0.0434 119.6)" }}>
                    {EVENT_LABELS[rule.event_type as EventTypeKey]}
                  </span>
                  <span className="text-xs font-medium font-mono"
                    style={{ color: "oklch(0.429 0.0306 72.6)" }}>
                    D+{rule.trigger_offset_days}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full"
                    style={rule.active
                      ? { background: "oklch(0.312 0.0434 119.6 / 0.12)", color: "oklch(0.312 0.0434 119.6)" }
                      : { background: "oklch(0.878 0.015 58)", color: "oklch(0.596 0.036 57.9)" }
                    }
                  >
                    {rule.active ? "Ativo" : "Inativo"}
                  </span>
                  <button
                    onClick={() => updateMut.mutate({ id: rule.id, data: { active: !rule.active } })}
                    className="p-1.5 rounded-lg transition-colors hover:bg-orange-50"
                  >
                    {rule.active
                      ? <ToggleRight className="h-5 w-5" style={{ color: "oklch(0.312 0.0434 119.6)" }} />
                      : <ToggleLeft className="h-5 w-5" style={{ color: "oklch(0.844 0.024 55.1)" }} />
                    }
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
