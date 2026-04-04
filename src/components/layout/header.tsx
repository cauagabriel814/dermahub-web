"use client";

import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <header
      className="flex h-16 items-center justify-between px-6"
      style={{
        background: "oklch(0.985 0.004 70)",
        borderBottom: "1px solid oklch(0.900 0.010 65)",
      }}
    >
      <div className="animate-fade-in">
        <p className="text-sm" style={{ color: "oklch(0.520 0.015 60)" }}>
          {greeting},{" "}
          <span style={{ color: "oklch(0.220 0.025 45)", fontWeight: 600 }}>
            {user?.name?.split(" ")[0] ?? "..."}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3 animate-fade-in">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold" style={{ color: "oklch(0.220 0.025 45)" }}>
            {user?.name ?? "..."}
          </p>
          <p className="text-xs capitalize" style={{ color: "oklch(0.520 0.015 60)" }}>
            {user?.role ?? ""}
          </p>
        </div>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shrink-0"
          style={{
            background: "linear-gradient(135deg, oklch(0.520 0.120 45) 0%, oklch(0.480 0.130 44) 100%)",
            color: "oklch(0.985 0.006 60)",
            boxShadow: "0 2px 8px oklch(0.520 0.120 45 / 0.30)",
          }}
        >
          {user?.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
      </div>
    </header>
  );
}
