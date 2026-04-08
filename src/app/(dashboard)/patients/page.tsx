"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, UserPlus, ChevronRight, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPatients } from "@/services/patients";

type SortOption = "name-asc" | "name-desc" | "proc-desc" | "proc-asc";

const SORT_LABELS: Record<SortOption, string> = {
  "name-asc": "Nome (A\u2013Z)",
  "name-desc": "Nome (Z\u2013A)",
  "proc-desc": "Último proced. (recente)",
  "proc-asc": "Último proced. (antigo)",
};

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, oklch(0.429 0.0306 72.6), oklch(0.327 0.0736 48.0))",
  "linear-gradient(135deg, oklch(0.312 0.0434 119.6), oklch(0.380 0.048 118))",
  "linear-gradient(135deg, oklch(0.596 0.0361 57.9), oklch(0.429 0.0306 72.6))",
  "linear-gradient(135deg, oklch(0.327 0.0736 48.0), oklch(0.250 0.026 50.8))",
];

function getGradient(name: string) {
  const code = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[code];
}

function PatientAvatar({ name }: { name: string }) {
  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-full shrink-0 text-sm font-semibold"
      style={{
        background: getGradient(name),
        color: "oklch(0.975 0.005 60)",
        fontFamily: "var(--font-brand)",
        fontSize: "1rem",
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("name-asc");

  const { data, isLoading } = useQuery({
    queryKey: ["patients", search],
    queryFn: () => getPatients({ search: search || undefined, limit: 100 }),
  });

  const sortedItems = useMemo(() => {
    if (!data?.items) return [];
    const items = [...data.items];
    switch (sort) {
      case "name-asc":
        return items.sort((a, b) => a.full_name.localeCompare(b.full_name, "pt-BR"));
      case "name-desc":
        return items.sort((a, b) => b.full_name.localeCompare(a.full_name, "pt-BR"));
      case "proc-desc":
        return items.sort((a, b) => {
          if (!a.last_procedure_date && !b.last_procedure_date) return 0;
          if (!a.last_procedure_date) return 1;
          if (!b.last_procedure_date) return -1;
          return b.last_procedure_date.localeCompare(a.last_procedure_date);
        });
      case "proc-asc":
        return items.sort((a, b) => {
          if (!a.last_procedure_date && !b.last_procedure_date) return 0;
          if (!a.last_procedure_date) return 1;
          if (!b.last_procedure_date) return -1;
          return a.last_procedure_date.localeCompare(b.last_procedure_date);
        });
      default:
        return items;
    }
  }, [data?.items, sort]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between animate-fade-up">
        <div>
          <h1 className="page-title" data-tour="patients-title">Pacientes</h1>
          <p className="text-sm mt-1" style={{ color: "oklch(0.596 0.036 57.9)" }}>
            {data?.total ?? 0} paciente{(data?.total ?? 0) !== 1 ? "s" : ""} cadastrado{(data?.total ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/patients/new" data-tour="patients-add-btn">
          <Button
            className="btn-primary-shimmer gap-2 rounded-xl text-sm font-medium px-5"
            style={{ color: "oklch(0.975 0.005 60)", border: "none" }}
          >
            <UserPlus className="h-4 w-4" />
            Nova Paciente
          </Button>
        </Link>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-3 animate-fade-up delay-75 flex-wrap">
        <div className="relative max-w-sm flex-1 min-w-[200px]" data-tour="patients-search">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "oklch(0.596 0.036 57.9)" }} />
          <Input
            placeholder="Buscar por nome ou telefone..."
            className="pl-10 rounded-xl bg-white border text-sm"
            style={{ borderColor: "oklch(0.878 0.015 58)", height: "2.5rem" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="relative">
          <ArrowUpDown
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color: "oklch(0.596 0.036 57.9)" }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="appearance-none rounded-xl bg-white border text-sm pl-9 pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{
              borderColor: "oklch(0.878 0.015 58)",
              height: "2.5rem",
              color: "oklch(0.429 0.0306 72.6)",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23998a7a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.75rem center",
            }}
          >
            {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div
        className="animate-fade-up delay-100 rounded-2xl overflow-hidden"
        style={{
          background: "oklch(1 0 0)",
          border: "1px solid oklch(0.878 0.015 58)",
          boxShadow: "var(--shadow-warm-sm)",
        }}
      >
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ background: "oklch(0.844 0.024 55.1)", animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>Nenhuma paciente encontrada.</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div
              className="grid grid-cols-[1fr_180px_130px_32px] gap-4 px-5 py-3 text-xs font-medium uppercase tracking-widest"
              style={{
                borderBottom: "1px solid oklch(0.878 0.015 58)",
                background: "oklch(0.975 0.005 60)",
                color: "oklch(0.596 0.036 57.9)",
              }}
            >
              <span>Nome</span>
              <span className="hidden md:block">Telefone</span>
              <span>Último Proced.</span>
              <span />
            </div>

            {/* Rows */}
            {sortedItems.map((p, i) => {
              const isFutureProc = p.last_procedure_date
                ? new Date(p.last_procedure_date + "T00:00:00") > new Date()
                : false;

              return (
                <Link
                  key={p.id}
                  href={`/patients/${p.id}`}
                  className="group grid grid-cols-[1fr_180px_130px_32px] gap-4 items-center px-5 py-3.5 transition-all duration-150 table-row-hover"
                  style={{
                    borderBottom: i < sortedItems.length - 1 ? "1px solid oklch(0.920 0.010 60)" : "none",
                  }}
                >
                  {/* Name + avatar */}
                  <div className="flex items-center gap-3 min-w-0">
                    <PatientAvatar name={p.full_name} />
                    <span className="text-sm font-medium truncate" style={{ color: "oklch(0.250 0.026 50.8)" }}>
                      {p.full_name}
                    </span>
                  </div>

                  {/* Phone */}
                  <span className="hidden md:block text-sm" style={{ color: "oklch(0.596 0.036 57.9)" }}>
                    {p.phone}
                  </span>

                  {/* Last procedure — green if scheduled (future date) */}
                  <span
                    className="text-sm"
                    style={{
                      color: isFutureProc ? "var(--green)" : "oklch(0.596 0.036 57.9)",
                      fontWeight: isFutureProc ? 600 : undefined,
                    }}
                  >
                    {p.last_procedure_date
                      ? new Date(p.last_procedure_date + "T00:00:00").toLocaleDateString("pt-BR")
                      : "—"}
                  </span>

                  {/* Arrow */}
                  <ChevronRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    style={{ color: "oklch(0.844 0.024 55.1)" }}
                  />
                </Link>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
