"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Check, X, ToggleLeft, ToggleRight, FileText, Trash2, MessageSquare, MousePointerClick, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getMessageTemplates,
  createMessageTemplate,
  updateMessageTemplate,
} from "@/services/messaging";
import type { MessageTemplate, MessageType, TemplateButton, CarouselItem, TemplateComponents } from "@/types/api";

const VARS = ["{nome}", "{procedimento}", "{data}"];
const BUTTON_TYPES = [
  { value: "REPLY", label: "Resposta rapida" },
  { value: "URL", label: "Link" },
  { value: "COPY", label: "Copiar texto" },
  { value: "CALL", label: "Ligar" },
] as const;

const MSG_TYPES: { value: MessageType; label: string; icon: typeof MessageSquare; desc: string }[] = [
  { value: "text", label: "Texto", icon: MessageSquare, desc: "Mensagem simples" },
  { value: "buttons", label: "Botoes", icon: MousePointerClick, desc: "Texto + botoes interativos" },
  { value: "carousel", label: "Carrossel", icon: LayoutGrid, desc: "Cards com imagens e botoes" },
];

function VarBadge({ v, onClick }: { v: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-block px-2 py-0.5 rounded text-xs font-mono cursor-pointer transition-colors"
      style={{
        background: "var(--green-muted)",
        color: "var(--green)",
        border: "1px solid oklch(0.380 0.060 150 / 0.25)",
      }}
    >
      {v}
    </button>
  );
}

function PreviewContent({ content }: { content: string }) {
  const rendered = content
    .replace(/{nome}/g, "Maria Silva")
    .replace(/{procedimento}/g, "Botox")
    .replace(/{data}/g, "20/03/2026");
  return (
    <p className="text-xs italic mt-2 whitespace-pre-wrap" style={{ color: "var(--muted-foreground)" }}>
      {rendered || "Pre-visualizacao aparecera aqui..."}
    </p>
  );
}

function ButtonEditor({
  buttons,
  onChange,
}: {
  buttons: TemplateButton[];
  onChange: (buttons: TemplateButton[]) => void;
}) {
  function addButton() {
    onChange([...buttons, { id: "", text: "", type: "REPLY" }]);
  }
  function removeButton(idx: number) {
    onChange(buttons.filter((_, i) => i !== idx));
  }
  function updateButton(idx: number, field: keyof TemplateButton, value: string) {
    const updated = buttons.map((b, i) => (i === idx ? { ...b, [field]: value } : b));
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          Botoes
        </label>
        <button
          type="button"
          onClick={addButton}
          className="text-xs font-medium flex items-center gap-1 transition-colors"
          style={{ color: "var(--terracotta)" }}
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar
        </button>
      </div>
      {buttons.map((btn, i) => (
        <div key={i} className="flex gap-2 items-start p-3 rounded-lg" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
          <div className="flex-1 space-y-2">
            <Input
              value={btn.text}
              onChange={(e) => updateButton(i, "text", e.target.value)}
              placeholder="Texto do botao"
              className="text-sm h-9"
            />
            <div className="flex gap-2">
              <select
                value={btn.type}
                onChange={(e) => updateButton(i, "type", e.target.value)}
                className="text-xs h-8 px-2 rounded-md border bg-white"
                style={{ borderColor: "var(--border)" }}
              >
                {BUTTON_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <Input
                value={btn.id}
                onChange={(e) => updateButton(i, "id", e.target.value)}
                placeholder={btn.type === "URL" ? "https://..." : btn.type === "CALL" ? "5534999..." : "id_resposta"}
                className="text-xs h-8 flex-1"
              />
            </div>
          </div>
          <button type="button" onClick={() => removeButton(i)} className="p-1.5 rounded-md hover:bg-red-50 transition-colors">
            <Trash2 className="h-4 w-4 text-red-400" />
          </button>
        </div>
      ))}
      {buttons.length === 0 && (
        <p className="text-xs text-center py-3" style={{ color: "var(--muted-foreground)" }}>
          Nenhum botao adicionado
        </p>
      )}
    </div>
  );
}

function CarouselEditor({
  items,
  onChange,
}: {
  items: CarouselItem[];
  onChange: (items: CarouselItem[]) => void;
}) {
  function addItem() {
    onChange([...items, { text: "", image: "", buttons: [] }]);
  }
  function removeItem(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }
  function updateItem(idx: number, field: string, value: string) {
    const updated = items.map((item, i) => (i === idx ? { ...item, [field]: value } : item));
    onChange(updated);
  }
  function updateItemButtons(idx: number, buttons: TemplateButton[]) {
    const updated = items.map((item, i) => (i === idx ? { ...item, buttons } : item));
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
          Cards do Carrossel
        </label>
        <button
          type="button"
          onClick={addItem}
          className="text-xs font-medium flex items-center gap-1 transition-colors"
          style={{ color: "var(--terracotta)" }}
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar Card
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="p-4 rounded-lg space-y-3" style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: "var(--brown-deep)" }}>Card {i + 1}</span>
            <button type="button" onClick={() => removeItem(i)} className="p-1 rounded-md hover:bg-red-50 transition-colors">
              <Trash2 className="h-4 w-4 text-red-400" />
            </button>
          </div>
          <Input
            value={item.text}
            onChange={(e) => updateItem(i, "text", e.target.value)}
            placeholder="Texto do card"
            className="text-sm h-9"
          />
          <Input
            value={item.image || ""}
            onChange={(e) => updateItem(i, "image", e.target.value)}
            placeholder="URL da imagem (opcional)"
            className="text-sm h-9"
          />
          <ButtonEditor buttons={item.buttons} onChange={(btns) => updateItemButtons(i, btns)} />
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-xs text-center py-3" style={{ color: "var(--muted-foreground)" }}>
          Nenhum card adicionado
        </p>
      )}
    </div>
  );
}

interface EditingState {
  id: string | null;
  name: string;
  content: string;
  message_type: MessageType;
  components: TemplateComponents;
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

    const payload = {
      name: editing.name,
      content: editing.content,
      message_type: editing.message_type,
      components: editing.message_type === "text" ? null : editing.components,
    };

    if (editing.id) {
      updateMut.mutate({ id: editing.id, data: payload });
    } else {
      createMut.mutate(payload);
    }
  }

  function toggleActive(t: MessageTemplate) {
    updateMut.mutate({ id: t.id, data: { active: !t.active } });
  }

  function startEditing(t?: MessageTemplate) {
    if (t) {
      setEditing({
        id: t.id,
        name: t.name,
        content: t.content,
        message_type: t.message_type || "text",
        components: t.components || {},
      });
    } else {
      setEditing({ id: null, name: "", content: "", message_type: "text", components: {} });
    }
  }

  function insertVar(v: string) {
    if (!editing) return;
    setEditing({ ...editing, content: editing.content + v });
  }

  const isPending = createMut.isPending || updateMut.isPending;
  const typeLabel = (t: MessageType) => MSG_TYPES.find((m) => m.value === t)?.label || "Texto";

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between animate-fade-up">
        <div>
          <h1 className="page-title">Modelos de Mensagem</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Crie mensagens com variaveis dinamicas para WhatsApp
          </p>
        </div>
        {!editing && (
          <Button
            onClick={() => startEditing()}
            className="btn-primary-shimmer gap-2 rounded-lg text-sm font-semibold px-5"
            style={{ color: "var(--primary-foreground)", border: "none" }}
          >
            <Plus className="h-4 w-4" />
            Novo Modelo
          </Button>
        )}
      </div>

      {/* Variable helper */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-lg animate-fade-up delay-75"
        style={{ background: "var(--cream)", border: "1px solid var(--border)" }}
      >
        <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
          Variaveis disponiveis:
        </span>
        {VARS.map((v) => <VarBadge key={v} v={v} onClick={() => insertVar(v)} />)}
      </div>

      {/* Create/Edit form */}
      {editing && (
        <div
          className="animate-fade-up rounded-xl p-6 space-y-5"
          style={{ background: "var(--cream)", border: "1px solid oklch(0.520 0.120 45 / 0.2)", boxShadow: "var(--shadow-md)" }}
        >
          <h2 className="text-base font-semibold" style={{ color: "var(--brown-deep)" }}>
            {editing.id ? "Editar Modelo" : "Novo Modelo"}
          </h2>

          {/* Message type selector */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-2 block" style={{ color: "var(--muted-foreground)" }}>
              Tipo de mensagem
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MSG_TYPES.map((mt) => {
                const active = editing.message_type === mt.value;
                return (
                  <button
                    key={mt.value}
                    type="button"
                    onClick={() => setEditing({ ...editing, message_type: mt.value, components: {} })}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: active ? "var(--terracotta)" : "var(--border)",
                      background: active ? "oklch(0.520 0.120 45 / 0.06)" : "white",
                    }}
                  >
                    <mt.icon className="h-5 w-5" style={{ color: active ? "var(--terracotta)" : "var(--muted-foreground)" }} />
                    <span className="text-xs font-semibold" style={{ color: active ? "var(--terracotta)" : "var(--brown-deep)" }}>
                      {mt.label}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>{mt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
              Nome
            </label>
            <Input
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              placeholder="Ex: Pos-procedimento D+3"
              className="rounded-lg"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>
              Conteudo da mensagem
            </label>
            <textarea
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              rows={4}
              placeholder="Ola {nome}, passando para saber como voce esta apos o procedimento de {procedimento} realizado em {data}..."
              className="w-full px-3 py-2.5 rounded-lg text-sm resize-none focus:outline-none focus:ring-2"
              style={{
                border: "1px solid var(--border)",
                color: "var(--foreground)",
                background: "white",
                fontFamily: "var(--font-sans)",
              }}
            />
            <PreviewContent content={editing.content} />
          </div>

          {/* Buttons editor */}
          {editing.message_type === "buttons" && (
            <ButtonEditor
              buttons={editing.components.buttons || []}
              onChange={(buttons) => setEditing({ ...editing, components: { ...editing.components, buttons } })}
            />
          )}

          {/* Carousel editor */}
          {editing.message_type === "carousel" && (
            <CarouselEditor
              items={editing.components.carousel || []}
              onChange={(carousel) => setEditing({ ...editing, components: { ...editing.components, carousel } })}
            />
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              onClick={handleSave}
              disabled={isPending || !editing.name.trim() || !editing.content.trim()}
              className="btn-primary-shimmer gap-2 rounded-lg text-sm px-5"
              style={{ color: "var(--primary-foreground)", border: "none" }}
            >
              <Check className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setEditing(null)}
              className="rounded-lg gap-2 text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Templates list */}
      <div
        className="animate-fade-up delay-100 rounded-xl overflow-hidden"
        style={{ background: "var(--cream)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
      >
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: "var(--border)", animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        ) : templates.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--border)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Nenhum modelo criado ainda.</p>
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em]"
              style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              <span>Modelo</span>
              <span>Tipo</span>
              <span>Status</span>
              <span>Acoes</span>
            </div>
            {templates.map((t, i) => (
              <div
                key={t.id}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 table-row-hover"
                style={{ borderBottom: i < templates.length - 1 ? "1px solid var(--muted)" : "none" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--brown-deep)" }}>{t.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>{t.content}</p>
                </div>
                <span
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{
                    background: t.message_type === "carousel" ? "oklch(0.520 0.120 45 / 0.08)"
                      : t.message_type === "buttons" ? "oklch(0.380 0.060 150 / 0.08)"
                      : "var(--muted)",
                    color: t.message_type === "carousel" ? "var(--terracotta)"
                      : t.message_type === "buttons" ? "var(--green)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {typeLabel(t.message_type || "text")}
                </span>
                <span
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={t.active
                    ? { background: "var(--green-muted)", color: "var(--green)" }
                    : { background: "var(--muted)", color: "var(--muted-foreground)" }
                  }
                >
                  {t.active ? "Ativo" : "Inativo"}
                </span>
                <div className="flex gap-1 items-center">
                  <button
                    onClick={() => startEditing(t)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-orange-50"
                    title="Editar"
                  >
                    <Edit2 className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                  </button>
                  <button
                    onClick={() => toggleActive(t)}
                    className="p-1.5 rounded-lg transition-colors hover:bg-orange-50"
                    title={t.active ? "Desativar" : "Ativar"}
                  >
                    {t.active
                      ? <ToggleRight className="h-5 w-5" style={{ color: "var(--green)" }} />
                      : <ToggleLeft className="h-5 w-5" style={{ color: "var(--border)" }} />
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
