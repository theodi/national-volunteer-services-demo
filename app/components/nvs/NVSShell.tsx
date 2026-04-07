"use client";

import { usePathname } from "next/navigation";
import { useSolidAuth } from "@ldo/solid-react";
import { NVSNavbar } from "@/app/components/nvs/NVSNavbar";
import { NVSFooter } from "@/app/components/nvs/NVSFooter";
import { ChatAssistant } from "@/app/components/ChatAssistant";
import { useOpportunities } from "@/app/lib/hooks/useOpportunities";

/**
 * Wraps the NVS page shell (navbar + footer). Skipped on the login page
 * so SolidLoginPage renders full-screen.
 */
export function NVSShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session } = useSolidAuth();
  const isLoginPage = pathname === "/login";
  const isLoggedIn = session.isLoggedIn;
  const { opportunities } = useOpportunities();

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <NVSNavbar />
      <main className="min-h-0 flex-1">{children}</main>
      <NVSFooter />
      {isLoggedIn && <ChatAssistant opportunities={opportunities} />}
    </>
  );
}
