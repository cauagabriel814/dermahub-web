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
        background: "oklch(1 0 0)",
        borderBottom: "1px solid oklch(0.878 0.015 58)",
        boxShadow: "0 1px 0 oklch(0.250 0.026 50.8 / 0.04)",
      }}
    >
      {/* Greeting */}
      <div className="animate-fade-in">
        <p
          className="text-sm"
          style={{ fontFamily: "var(--font-brand)", color: "oklch(0.596 0.036 57.9)", letterSpacing: "0.01em" }}
        >
          {greeting},{" "}
          <span style={{ color: "oklch(0.250 0.026 50.8)", fontWeight: 500 }}>
            {user?.name?.split(" ")[0] ?? "..."}
          </span>
        </p>
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium" style={{ color: "oklch(0.250 0.026 50.8)" }}>
            {user?.name ?? "..."}
          </p>
          <p className="text-xs capitalize" style={{ color: "oklch(0.596 0.036 57.9)" }}>
            {user?.role ?? ""}
          </p>
        </div>

        {/* Avatar */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold shrink-0"
          style={{
            background: "linear-gradient(135deg, oklch(0.429 0.0306 72.6) 0%, oklch(0.327 0.0736 48.0) 100%)",
            color: "oklch(0.975 0.005 60)",
            boxShadow: "0 2px 8px oklch(0.429 0.0306 72.6 / 0.35)",
            fontFamily: "var(--font-brand)",
            fontSize: "1rem",
          }}
        >
          {user?.name?.charAt(0).toUpperCase() ?? "?"}
        </div>
      </div>
    </header>
  );
}
