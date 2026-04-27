"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Check, X, UserCog, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUsers, createUserApi, updateUserApi } from "@/services/messaging";
import { formatDateBR } from "@/lib/format";

interface EditingState {
  id: string | null;
  name: string;
  email: string;
  password: string;
  role: "admin" | "secretary";
}

export default function UsersPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<EditingState | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const createMut = useMutation({
    mutationFn: createUserApi,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setEditing(null); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; email?: string; role?: "admin" | "secretary" } }) =>
      updateUserApi(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); setEditing(null); },
  });

  function handleSave() {
    if (!editing || !editing.name.trim() || !editing.email.trim()) return;
    if (editing.id) {
      updateMut.mutate({ id: editing.id, data: { name: editing.name, email: editing.email, role: editing.role } });
    } else {
      if (!editing.password.trim()) return;
      createMut.mutate({ name: editing.name, email: editing.email, password: editing.password, role: editing.role });
    }
  }

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between animate-fade-up">
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Gerencie os usuários da clínica
          </p>
        </div>
        {!editing && (
          <Button
            onClick={() => setEditing({ id: null, name: "", email: "", password: "", role: "secretary" })}
            className="btn-primary-shimmer gap-2 rounded-lg text-sm font-semibold px-5"
            style={{ color: "var(--primary-foreground)", border: "none" }}
          >
            <Plus className="h-4 w-4" />
            Novo Usuário
          </Button>
        )}
      </div>

      {editing && (
        <div className="animate-fade-up rounded-xl p-6 space-y-4" style={{ background: "var(--cream)", border: "1px solid oklch(0.520 0.120 45 / 0.2)", boxShadow: "var(--shadow-md)" }}>
          <h2 className="text-base font-semibold" style={{ color: "var(--brown-deep)" }}>
            {editing.id ? "Editar Usuário" : "Novo Usuário"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Nome</label>
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Nome completo" className="rounded-lg" />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Email</label>
              <Input value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} placeholder="email@clinica.com" type="email" className="rounded-lg" />
            </div>
            {!editing.id && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Senha</label>
                <Input value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} placeholder="Senha inicial" type="password" className="rounded-lg" />
              </div>
            )}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-1.5 block" style={{ color: "var(--muted-foreground)" }}>Perfil</label>
              <div className="flex gap-2">
                {(["admin", "secretary"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setEditing({ ...editing, role: r })}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all"
                    style={{
                      borderColor: editing.role === r ? "var(--terracotta)" : "var(--border)",
                      background: editing.role === r ? "oklch(0.520 0.120 45 / 0.06)" : "white",
                      color: editing.role === r ? "var(--terracotta)" : "var(--muted-foreground)",
                    }}
                  >
                    {r === "admin" ? <Shield className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                    {r === "admin" ? "Administrador" : "Secretaria"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <Button onClick={handleSave} disabled={isPending || !editing.name.trim() || !editing.email.trim() || (!editing.id && !editing.password.trim())} className="btn-primary-shimmer gap-2 rounded-lg text-sm px-5" style={{ color: "var(--primary-foreground)", border: "none" }}>
              <Check className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)} className="rounded-lg gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              <X className="h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="card-elevated animate-fade-up delay-100 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--border)", animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center">
            <UserCog className="h-8 w-8 mx-auto mb-3" style={{ color: "var(--border)" }} />
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Nenhum usuário cadastrado.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ borderBottom: "1px solid var(--border)", background: "var(--muted)", color: "var(--muted-foreground)" }}>
              <span>Usuário</span>
              <span>Perfil</span>
              <span>Criado em</span>
              <span>Ações</span>
            </div>
            {users.map((u, i) => (
              <div key={u.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4 table-row-hover" style={{ borderBottom: i < users.length - 1 ? "1px solid var(--muted)" : "none" }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--brown-deep)" }}>{u.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{u.email}</p>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full" style={u.role === "admin" ? { background: "oklch(0.520 0.120 45 / 0.08)", color: "var(--terracotta)" } : { background: "var(--muted)", color: "var(--muted-foreground)" }}>
                  {u.role === "admin" ? "Admin" : "Secretaria"}
                </span>
                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  {formatDateBR(u.created_at)}
                </span>
                <button onClick={() => setEditing({ id: u.id, name: u.name, email: u.email, password: "", role: u.role as "admin" | "secretary" })} className="p-1.5 rounded-lg transition-colors hover:bg-orange-50">
                  <Edit2 className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
