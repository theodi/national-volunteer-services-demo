import type { Metadata } from "next";
import "./globals.css";
import { SolidProviders } from "./providers";
import { NVSNavbar } from "@/app/components/nvs/NVSNavbar";
import { NVSFooter } from "@/app/components/nvs/NVSFooter";

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
          <NVSNavbar />
          <main className="min-h-0 flex-1">{children}</main>
          <NVSFooter />
        </SolidProviders>
      </body>
    </html>
  );
}
