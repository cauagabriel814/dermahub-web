"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Check, X, ToggleLeft, ToggleRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
} from "@/services/messaging";
import type { MessageTemplate } from "@/types/api";

const VARS = ["{nome}", "{procedimento}", "{data}"];

function VarBadge({ v }: { v: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-mono"
      style={{
        background: "oklch(0.312 0.0434 119.6 / 0.12)",
        color: "oklch(0.312 0.0434 119.6)",
        border: "1px solid oklch(0.312 0.0434 119.6 / 0.25)",
      }}
    >
      {v}
    </span>
  );
}

function PreviewContent({ content }: { content: string }) {
  const rendered = content
    .replace(/{nome}/g, "Maria Silva")
    .replace(/{procedimento}/g, "Botox")
    .replace(/{data}/g, "20/03/2026");
  return (
    <p className="text-xs italic mt-2 whitespace-pre-wrap" style={{ color: "oklch(0.596 0.036 57.9)" }}>
      {rendered || "Pré-visualização aparecerá aqui…"}
    </p>
  );
}

interface EditingState {
  id: string | null; // null = new
  name: string;
  content: string;
}

export default function MessageTemplatesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<EditingState | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["message-templates"],
    queryFn: () => getMessageTemplates(),
  });

  const createMut = useMutation({
    mutationFn: createMessageTemplate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["message-templates"] }); setEditing(null); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMessageTemplate>[1] }) =>
      updateMessageTemplate(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["message-templates"] }); setEditing(null); },
  });

  function handleSave() {
    if (!editing) return;
    if (!editing.name.trim() || !editing.content.trim()) return;
    if (editing.id) {
      updateMut.mutate({ id: editing.id, data: { name: editing.name, content: editing.content } });
    } else {
      createMut.mutate({ name: editing.name, content: editing.content });
    }
  }

  function toggleActive(t: MessageTemplate) {
    updateMut.mutate({ id: t.id, data: { active: !t.active } });
  }

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between animate-fade-up">
        <div>
          <h1 className="page-title">Modelos de Mensagem</h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.596 0.036 57.9)" }}>
            Crie mensagens com variáveis dinâmicas para WhatsApp
          </p>
        </div>
        {!editing && (
          <Button
            onClick={() => setEditing({ id: null, name: "", content: "" })}
            className="btn-primary-shimmer gap-2 rounded-xl text-sm font-medium px-5"
            style={{ color: "oklch(0.975 0.005 60)", border: "none" }}
          >
            <Plus className="h-4 w-4" />
            Novo Modelo
          </Button>
        )}
      </div>

      {/* Variable helper */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl animate-fade-up delay-75"
        style={{ background: "oklch(0.975 0.005 60)", border: "1px solid oklch(0.878 0.015 58)" }}
      >
        <span className="text-xs font-medium" style={{ color: "oklch(0.596 0.036 57.9)" }}>
          Variáveis disponíveis:
        </span>
        {VARS.map((v) => <VarBadge key={v} v={v} />)}
      </div>

      {/* Create/Edit form */}
      {editing && (
        <div
          className="animate-fade-up rounded-2xl p-5 space-y-4"
          style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.312 0.0434 119.6 / 0.3)", boxShadow: "var(--shadow-warm-sm)" }}
        >
          <h2 className="text-base font-light" style={{ fontFamily: "var(--font-brand)", color: "oklch(0.250 0.026 50.8)" }}>
            {editing.id ? "Editar Modelo" : "Novo Modelo"}
          </h2>
          <div>
            <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: "oklch(0.596 0.036 57.9)" }}>
              Nome
            </label>
            <Input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Ex: Pós-procedimento D+3"
              className="rounded-xl"
              style={{ borderColor: "oklch(0.878 0.015 58)" }}
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-widest mb-1.5 block" style={{ color: "oklch(0.596 0.036 57.9)" }}>
              Conteúdo
            </label>
            <textarea
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              rows={5}
              placeholder="Olá {nome}, passando para saber como você está após o procedimento de {procedimento} realizado em {data}..."
              className="w-full px-3 py-2.5 rounded-xl text-sm resize-none focus:outline-none focus:ring-2"
              style={{
                border: "1px solid oklch(0.878 0.015 58)",
                color: "oklch(0.250 0.026 50.8)",
                background: "oklch(1 0 0)",
                fontFamily: "var(--font-sans)",
              }}
            />
            <PreviewContent content={editing.content} />
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              onClick={handleSave}
              disabled={isPending || !editing.name.trim() || !editing.content.trim()}
              className="btn-primary-shimmer gap-2 rounded-xl text-sm px-5"
              style={{ color: "oklch(0.975 0.005 60)", border: "none" }}
            >
              <Check className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setEditing(null)}
              className="rounded-xl gap-2 text-sm"
              style={{ color: "oklch(0.596 0.036 57.9)" }}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Templates list */}
      <div
        className="animate-fade-up delay-100 rounded-2xl overflow-hidden"
        style={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.878 0.015 58)", boxShadow: "var(--shadow-warm-sm)" }}
      >
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: "oklch(0.844 0.024 55.1)", animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        ) : templates.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="h-8 w-8 mx-auto mb-3" style={{ color: "oklch(0.844 0.024 55.1)" }} />
            <p className="text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>Nenhum modelo criado ainda.</p>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 text-xs font-medium uppercase tracking-widest"
              style={{ borderBottom: "1px solid oklch(0.878 0.015 58)", background: "oklch(0.975 0.005 60)", color: "oklch(0.596 0.036 57.9)" }}
            >
              <span>Modelo</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            {templates.map((t, i) => (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-4"
                style={{ borderBottom: i < templates.length - 1 ? "1px solid oklch(0.920 0.010 60)" : "none" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: "oklch(0.250 0.026 50.8)" }}>{t.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "oklch(0.596 0.036 57.9)" }}>{t.content}</p>
                </div>
                <span
                  className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={t.active
                    ? { background: "oklch(0.312 0.0434 119.6 / 0.12)", color: "oklch(0.312 0.0434 119.6)" }
                    : { background: "oklch(0.878 0.015 58)", color: "oklch(0.596 0.036 57.9)" }
                  }
                >
                  {t.active ? "Ativo" : "Inativo"}
                </span>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setEditing({ id: t.id, name: t.name, content: t.content })}
                    className="p-1.5 rounded-lg transition-colors hover:bg-orange-50"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" style={{ color: "oklch(0.596 0.036 57.9)" }} />
                  </button>
                  <button
                    onClick={() => toggleActive(t)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-orange-50"
                    title={t.active ? "Desativar" : "Ativar"}
                  >
                    {t.active
                      ? <ToggleRight className="h-5 w-5" style={{ color: "oklch(0.312 0.0434 119.6)" }} />
                      : <ToggleLeft className="h-5 w-5" style={{ color: "oklch(0.844 0.024 55.1)" }} />
                    }
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
