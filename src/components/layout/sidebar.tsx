"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Compass } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/constants";
import { logout } from "@/services/auth";
import { useAuth } from "@/hooks/use-auth";
import { useOnboardingContext } from "@/components/onboarding/onboarding-provider";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const onboarding = useOnboardingContext();
  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || user?.role === "admin");

  return (
    <aside
      className="relative flex h-screen w-64 flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, oklch(0.220 0.026 45) 0%, oklch(0.180 0.022 44) 100%)",
      }}
    >
      {/* Top terracotta accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, oklch(0.520 0.120 45), oklch(0.600 0.100 50), oklch(0.520 0.120 45))" }}
      />

      {/* Logo */}
      <div className="flex h-20 flex-col justify-center px-6 border-b" style={{ borderColor: "oklch(0.300 0.020 48)" }}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, oklch(0.520 0.120 45) 0%, oklch(0.600 0.100 50) 100%)",
              color: "oklch(0.985 0.006 60)",
              boxShadow: "0 2px 10px oklch(0.520 0.120 45 / 0.4)",
            }}
          >
            DH
          </div>
          <div>
            <h1
              className="text-[15px] tracking-wide font-semibold"
              style={{ color: "oklch(0.940 0.010 60)" }}
            >
              DermaHub
            </h1>
            <p className="text-[10px] tracking-[0.15em] uppercase font-medium" style={{ color: "oklch(0.520 0.120 45)" }}>
              Dermacenter
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-5">
        {visibleItems.map((item) => {
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
                  : "text-sidebar-foreground/50 hover:text-sidebar-foreground/75"
              )}
              style={
                isActive
                  ? {
                      background: "linear-gradient(90deg, oklch(0.520 0.120 45 / 0.18) 0%, oklch(0.520 0.120 45 / 0.05) 100%)",
                      borderLeft: "2.5px solid oklch(0.520 0.120 45)",
                    }
                  : { borderLeft: "2.5px solid transparent" }
              }
            >
              {!isActive && (
                <span
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "oklch(0.280 0.022 48 / 0.6)" }}
                />
              )}

              <item.icon
                className="relative h-[18px] w-[18px] shrink-0 transition-colors duration-200"
                style={{ color: isActive ? "oklch(0.520 0.120 45)" : undefined }}
              />
              <span className="relative text-[13px] font-medium tracking-wide">{item.label}</span>

              {isActive && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "oklch(0.520 0.120 45)", boxShadow: "0 0 6px oklch(0.520 0.120 45 / 0.7)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Tour trigger */}
      <div className="relative px-3 pb-3">
        <button
          onClick={() => { onboarding.startTour(0); if (pathname !== "/") router.push("/"); }}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium tracking-wide transition-all duration-200"
          style={{
            color: "oklch(0.520 0.120 45)",
            background: "oklch(0.520 0.120 45 / 0.08)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "oklch(0.520 0.120 45 / 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "oklch(0.520 0.120 45 / 0.08)";
          }}
        >
          <Compass className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-45" />
          Por Onde Começar
        </button>
      </div>

      {/* Warm brown/gold gradient glow */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0"
        style={{
          height: "55%",
          background: "linear-gradient(180deg, transparent 0%, oklch(0.280 0.045 55 / 0.35) 40%, oklch(0.400 0.070 55 / 0.25) 65%, oklch(0.520 0.120 45 / 0.18) 85%, oklch(0.600 0.100 50 / 0.10) 100%)",
        }}
      />
      {/* Center golden orb */}
      <div
        className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full"
        style={{
          background: "radial-gradient(circle, oklch(0.550 0.100 55 / 0.20) 0%, oklch(0.450 0.080 50 / 0.10) 40%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      {/* Corner warm highlight */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-32 h-32"
        style={{
          background: "radial-gradient(circle at bottom right, oklch(0.600 0.100 50 / 0.15) 0%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />

      {/* Logout */}
      <div className="relative p-3 border-t" style={{ borderColor: "oklch(0.300 0.020 48)" }}>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-[13px] font-medium tracking-wide transition-colors duration-200"
          style={{ color: "oklch(0.560 0.025 55)" }}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
