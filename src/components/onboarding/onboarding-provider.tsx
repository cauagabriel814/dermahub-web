"use client";

import { createContext, useContext } from "react";
import { useOnboarding } from "./use-onboarding";

type OnboardingState = ReturnType<typeof useOnboarding>;

const OnboardingContext = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const onboarding = useOnboarding();

  return (
    <OnboardingContext.Provider value={onboarding}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingContext() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboardingContext must be used within OnboardingProvider");
  }
  return ctx;
}
