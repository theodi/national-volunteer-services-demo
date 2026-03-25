import type { Metadata } from "next";
import "./globals.css";
import { SolidProviders } from "./providers";
import { NVSShell } from "@/app/components/nvs/NVSShell";

export const metadata: Metadata = {
  title: "National Volunteer Services",
  description:
    "Find volunteering opportunities matched to your skills, availability, and location — powered by Solid.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className="flex min-h-screen flex-col bg-white font-sora">
        <SolidProviders>
          <NVSShell>{children}</NVSShell>
        </SolidProviders>
      </body>
    </html>
  );
}
