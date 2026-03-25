"use client";

import { usePathname } from "next/navigation";
import { NVSNavbar } from "@/app/components/nvs/NVSNavbar";
import { NVSFooter } from "@/app/components/nvs/NVSFooter";

/**
 * Wraps the NVS page shell (navbar + footer). Skipped on the login page
 * so SolidLoginPage renders full-screen.
 */
export function NVSShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <>
      <NVSNavbar />
      <main className="min-h-0 flex-1">{children}</main>
      <NVSFooter />
    </>
  );
}
