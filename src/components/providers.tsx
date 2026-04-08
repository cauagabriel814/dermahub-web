"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { OnboardingProvider } from "@/components/onboarding/onboarding-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <OnboardingProvider>{children}</OnboardingProvider>
    </QueryClientProvider>
  );
}
