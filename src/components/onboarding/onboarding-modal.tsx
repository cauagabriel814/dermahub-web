"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { TOUR_PAGES } from "./onboarding-steps";
import { useOnboardingContext } from "./onboarding-provider";

export function OnboardingModal() {
  const {
    tourState,
    shouldAutoStart,
    startTour,
    advancePage,
    completeTour,
    cancelTour,
  } = useOnboardingContext();

  const router = useRouter();
  const pathname = usePathname();
  const driverRef = useRef<Driver | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // Auto-start: show welcome modal on first visit
  useEffect(() => {
    if (shouldAutoStart) {
      setShowWelcome(true);
    }
  }, [shouldAutoStart]);

  const runTourForPage = useCallback(
    (pageIndex: number) => {
      const page = TOUR_PAGES[pageIndex];
      if (!page) {
        completeTour();
        return;
      }

      // Check if we're on the right page
      if (pathname !== page.route) {
        advancePage(pageIndex);
        router.push(page.route);
        return;
      }

      // Wait for DOM elements to render
      const timeout = setTimeout(() => {
        const isLast = pageIndex >= TOUR_PAGES.length - 1;

        const steps: DriveStep[] = page.steps.map((step, i) => {
          const isLastStep = i === page.steps.length - 1;
          return {
            element: step.element,
            popover: {
              title: step.title,
              description: step.description,
              side: step.side || "bottom",
              ...(isLastStep && !isLast
                ? { nextBtnText: "Próxima tela →" }
                : isLastStep && isLast
                  ? { nextBtnText: "Finalizar! ✓" }
                  : {}),
            },
          };
        });

        // Destroy previous instance if exists
        if (driverRef.current) {
          driverRef.current.destroy();
        }

        const driverInstance = driver({
          steps,
          animate: true,
          showProgress: true,
          progressText: "{{current}} de {{total}}",
          nextBtnText: "Próximo",
          prevBtnText: "Anterior",
          doneBtnText: "Finalizar! ✓",
          popoverClass: "dermahub-tour-popover",
          stagePadding: 8,
          stageRadius: 12,
          overlayColor: "oklch(0.180 0.022 44 / 0.45)",
          onDestroyStarted: () => {
            if (!driverInstance.hasNextStep()) {
              // Finished all steps on this page
              if (isLast) {
                driverInstance.destroy();
                completeTour();
              } else {
                driverInstance.destroy();
                const nextPageIndex = pageIndex + 1;
                advancePage(nextPageIndex);
                router.push(TOUR_PAGES[nextPageIndex].route);
              }
            } else {
              // User clicked X or pressed Escape
              driverInstance.destroy();
              cancelTour();
            }
          },
        });

        driverRef.current = driverInstance;
        driverInstance.drive();
      }, 600);

      return () => clearTimeout(timeout);
    },
    [pathname, router, advancePage, completeTour, cancelTour]
  );

  // Run tour when tourState changes or page navigates
  useEffect(() => {
    if (!tourState?.active) return;

    const page = TOUR_PAGES[tourState.pageIndex];
    if (!page) return;

    if (pathname === page.route) {
      const cleanup = runTourForPage(tourState.pageIndex);
      return cleanup;
    }
  }, [tourState, pathname, runTourForPage]);

  // Cleanup driver on unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  const handleStartTour = () => {
    setShowWelcome(false);
    startTour(0);
    if (pathname !== "/") {
      router.push("/");
    }
  };

  const handleSkipTour = () => {
    setShowWelcome(false);
    completeTour();
  };

  if (!showWelcome) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-fade-in"
        style={{
          background: "oklch(0.180 0.022 44 / 0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onClick={handleSkipTour}
      />

      {/* Welcome card */}
      <div
        className="relative w-full max-w-md animate-fade-up overflow-hidden rounded-2xl"
        style={{
          background: "var(--cream)",
          border: "1px solid oklch(0.520 0.120 45 / 0.12)",
          boxShadow:
            "0 24px 80px oklch(0.220 0.025 45 / 0.18), 0 8px 24px oklch(0.220 0.025 45 / 0.08)",
        }}
      >
        {/* Terracotta bar */}
        <div
          className="h-[3px] w-full"
          style={{ background: "linear-gradient(90deg, var(--terracotta), oklch(0.600 0.100 50))" }}
        />

        <div className="px-8 py-8 text-center">
          {/* Icon */}
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, var(--terracotta) 0%, oklch(0.600 0.100 50) 100%)",
              boxShadow: "0 4px 20px var(--terracotta-glow)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="oklch(0.985 0.006 60)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              <path d="M20 3v4" />
              <path d="M22 5h-4" />
            </svg>
          </div>

          <h2
            className="text-2xl font-semibold mb-2"
            style={{
              color: "var(--brown-deep)",
              fontFamily: "var(--font-brand)",
              letterSpacing: "-0.01em",
            }}
          >
            Bem-vinda ao DermaHub!
          </h2>

          <p
            className="text-[15px] leading-relaxed mb-2"
            style={{ color: "var(--brown-medium)" }}
          >
            Vamos fazer um tour rápido pelas telas do sistema.
            Você vai aprender a ordem certa de configuração!
          </p>

          <p
            className="text-[13px] leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            O tour vai te guiar por 7 passos, mostrando cada botão e funcionalidade.
            Leva menos de 2 minutos.
          </p>
        </div>

        {/* Actions */}
        <div
          className="flex items-center justify-between px-8 py-5"
          style={{ borderTop: "1px solid oklch(0.520 0.120 45 / 0.06)" }}
        >
          <button
            onClick={handleSkipTour}
            className="rounded-lg px-4 py-2 text-[13px] font-medium transition-colors duration-200"
            style={{ color: "var(--muted-foreground)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--brown-deep)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted-foreground)"; }}
          >
            Pular tour
          </button>

          <button
            onClick={handleStartTour}
            className="btn-primary-shimmer flex items-center gap-2 rounded-lg px-6 py-2.5 text-[13px]"
          >
            Começar o tour
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
