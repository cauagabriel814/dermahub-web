"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getNotificationRecipients,
  createNotificationRecipient,
  updateNotificationRecipient,
  deleteNotificationRecipient,
  getDefaultNotificationTemplate,
} from "@/services/notifications";
import type { NotificationRecipient } from "@/types/api";

interface FormState {
  name: string;
  phone: string;
  message_template: string;
}

const EMPTY_FORM: FormState = { name: "", phone: "", message_template: "" };

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data: recipients = [], isLoading } = useQuery({
    queryKey: ["notification-recipients"],
    queryFn: getNotificationRecipients,
  });

  const { data: defaultTpl } = useQuery({
    queryKey: ["notification-default-template"],
    queryFn: getDefaultNotificationTemplate,
  });

  const createMut = useMutation({
    mutationFn: createNotificationRecipient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-recipients"] });
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateNotificationRecipient>[1] }) =>
      updateNotificationRecipient(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notification-recipients"] });
      setEditingId(null);
      setForm(EMPTY_FORM);
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteNotificationRecipient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-recipients"] }),
  });

  function startNew() {
    setEditingId("new");
    setForm({ name: "", phone: "", message_template: defaultTpl?.template || "" });
  }

  function startEdit(r: NotificationRecipient) {
    setEditingId(r.id);
    setForm({ name: r.name, phone: r.phone, message_template: r.message_template });
  }

  function cancel() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function save() {
    if (!form.name || !form.phone) return;
    if (editingId === "new") {
      createMut.mutate({ name: form.name, phone: form.phone, message_template: form.message_template });
    } else if (editingId) {
      updateMut.mutate({ id: editingId, data: form });
    }
  }

  function handleDelete(id: string) {
    if (window.confirm("Excluir este destinatário?")) deleteMut.mutate(id);
  }

  function toggleActive(r: NotificationRecipient) {
    updateMut.mutate({ id: r.id, data: { active: !r.active } });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-end justify-between animate-fade-up">
        <div>
          <h1 className="page-title">Notificações</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Receba avisos no WhatsApp quando pacientes responderem aos recalls
          </p>
        </div>
        {editingId === null && (
          <Button
            onClick={startNew}
            className="btn-primary-shimmer gap-2 rounded-xl text-sm font-medium px-5"
            style={{ color: "var(--primary-foreground)", border: "none" }}
          >
            <Plus className="h-4 w-4" />
            Novo Destinatário
          </Button>
        )}
      </div>

      {/* Info card */}
      <div
        className="rounded-xl px-5 py-4 flex gap-3 animate-fade-up delay-75"
        style={{
          background: "oklch(0.520 0.120 45 / 0.06)",
          border: "1px solid oklch(0.520 0.120 45 / 0.15)",
        }}
      >
        <Bell className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "var(--terracotta)" }} />
        <div className="text-sm" style={{ color: "var(--brown-medium)" }}>
          Quando uma paciente responder <strong>SIM</strong> a uma mensagem de <strong>recall</strong>,
          os números abaixo recebem uma notificação no WhatsApp para tomar a ação.
          Mensagens de <strong>pós-procedimento</strong> não disparam notificação.
          <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
            Variáveis disponíveis: <code className="px-1.5 py-0.5 rounded bg-white">{"{patient_name}"}</code>,
            <code className="px-1.5 py-0.5 rounded bg-white ml-1">{"{patient_phone}"}</code>,
            <code className="px-1.5 py-0.5 rounded bg-white ml-1">{"{procedure_name}"}</code>
          </p>
        </div>
      </div>

      {/* Form (new or edit) */}
      {editingId !== null && (
        <div
          className="animate-fade-up rounded-2xl p-5 space-y-4"
          style={{ background: "var(--cream)", border: "1px solid oklch(0.520 0.120 45 / 0.18)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--brown-deep)" }}>
            {editingId === "new" ? "Novo Destinatário" : "Editar Destinatário"}
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                Nome
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Secretária Maria"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                Telefone (WhatsApp)
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="55419..."
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
              Mensagem de Notificação
            </Label>
            <textarea
              value={form.message_template}
              onChange={(e) => setForm({ ...form, message_template: e.target.value })}
              rows={6}
              className="w-full rounded-lg px-3 py-2 text-sm font-mono"
              style={{ border: "1px solid var(--border)", background: "white" }}
            />
            <p className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
              Use {"{patient_name}"}, {"{patient_phone}"} e {"{procedure_name}"} para substituições automáticas.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={!form.name || !form.phone || createMut.isPending || updateMut.isPending}
              className="btn-primary-shimmer gap-2 rounded-xl text-sm px-5 py-2 inline-flex items-center disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              {createMut.isPending || updateMut.isPending ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={cancel}
              className="rounded-xl text-sm px-4 py-2 inline-flex items-center gap-2 transition-colors hover:bg-black/5"
              style={{ color: "var(--muted-foreground)" }}
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="py-16 text-center animate-fade-up">
          <div className="flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: "var(--border)", animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      ) : recipients.length === 0 && editingId === null ? (
        <div className="py-16 text-center animate-fade-up rounded-2xl"
          style={{ background: "var(--cream)", border: "1px solid var(--border)" }}>
          <Bell className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--border)" }} />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Nenhum destinatário cadastrado ainda.
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
            Adicione um número para receber notificações de leads.
          </p>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-up delay-100">
          {recipients.map((r) => (
            <div
              key={r.id}
              className="rounded-xl p-4 flex items-start justify-between gap-4"
              style={{ background: "var(--cream)", border: "1px solid var(--border)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold" style={{ color: "var(--brown-deep)" }}>{r.name}</p>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={r.active
                      ? { background: "var(--green-muted)", color: "var(--green)" }
                      : { background: "var(--muted)", color: "var(--muted-foreground)" }}
                  >
                    {r.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>{r.phone}</p>
                <p className="text-xs mt-2 whitespace-pre-wrap line-clamp-3" style={{ color: "var(--muted-foreground)" }}>
                  {r.message_template}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startEdit(r)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-orange-50"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                </button>
                <button
                  onClick={() => toggleActive(r)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-orange-50"
                  title={r.active ? "Desativar" : "Ativar"}
                >
                  {r.active
                    ? <ToggleRight className="h-5 w-5" style={{ color: "var(--green)" }} />
                    : <ToggleLeft className="h-5 w-5" style={{ color: "var(--border)" }} />
                  }
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="p-1.5 rounded-lg transition-colors hover:bg-red-50"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" style={{ color: "oklch(0.55 0.15 27)" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
