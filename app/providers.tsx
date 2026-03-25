"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserSolidLdoProvider } from "@ldo/solid-react";
import { queryClient } from "@/app/lib/queryClient";

export function SolidProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserSolidLdoProvider>{children}</BrowserSolidLdoProvider>
    </QueryClientProvider>
  );
}
