"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/constants";
import { logout } from "@/services/auth";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="relative flex h-screen w-64 flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, oklch(0.220 0.024 50) 0%, oklch(0.170 0.020 48) 100%)",
      }}
    >
      {/* Decorative green accent line top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: "linear-gradient(90deg, transparent, oklch(0.380 0.048 118), transparent)" }}
      />

      {/* Logo */}
      <div className="flex h-20 flex-col justify-center px-6 border-b" style={{ borderColor: "oklch(0.300 0.022 50)" }}>
        <div className="flex items-center gap-2.5">
          {/* Monogram mark */}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold shrink-0"
            style={{
              background: "linear-gradient(135deg, oklch(0.380 0.048 118) 0%, oklch(0.312 0.0434 119.6) 100%)",
              color: "oklch(0.930 0.008 58)",
              boxShadow: "0 2px 8px oklch(0.312 0.0434 119.6 / 0.4)",
            }}
          >
            DH
          </div>
          <div>
            <h1
              className="text-base tracking-wider font-medium"
              style={{ color: "oklch(0.930 0.008 58)", fontFamily: "var(--font-brand)" }}
            >
              DermaHub
            </h1>
            <p className="text-xs tracking-widest uppercase" style={{ color: "oklch(0.596 0.036 57.9)", fontSize: "0.6rem" }}>
              Clínica
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-5">
        {NAV_ITEMS.map((item, i) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                isActive
                  ? "text-sidebar-foreground"
                  : "text-sidebar-foreground/50 hover:text-sidebar-foreground/80"
              )}
              style={
                isActive
                  ? {
                      background: "linear-gradient(90deg, oklch(0.380 0.048 118 / 0.20) 0%, oklch(0.312 0.0434 119.6 / 0.08) 100%)",
                      borderLeft: "2px solid oklch(0.380 0.048 118)",
                    }
                  : { borderLeft: "2px solid transparent" }
              }
            >
              {/* Hover background */}
              {!isActive && (
                <span
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "oklch(0.300 0.022 50 / 0.5)" }}
                />
              )}

              <item.icon
                className="relative h-4 w-4 shrink-0 transition-colors duration-200"
                style={{ color: isActive ? "oklch(0.380 0.048 118)" : undefined }}
              />
              <span className="relative text-xs font-medium tracking-wide">{item.label}</span>

              {isActive && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "oklch(0.380 0.048 118)", boxShadow: "0 0 6px oklch(0.380 0.048 118 / 0.8)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t" style={{ borderColor: "oklch(0.300 0.022 50)" }}>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-xs font-medium tracking-wide transition-colors duration-200"
          style={{ color: "oklch(0.596 0.036 57.9)" }}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>

      {/* Bottom decorative */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, oklch(0.312 0.0434 119.6 / 0.4), transparent)" }}
      />
    </aside>
  );
}
