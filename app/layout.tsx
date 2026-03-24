import type { Metadata } from "next";
import "./globals.css";
import { NVSNavbar } from "@/app/components/nvs/NVSNavbar";
import { NVSFooter } from "@/app/components/nvs/NVSFooter";


export const metadata: Metadata = {
  title: "National Volunteer Services",
  description: "Find volunteering opportunities matched to your skills, availability, and location — powered by Solid Pod technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="antialiased"
    >
      <body className="flex min-h-screen flex-col bg-white font-sora">
        <div className="flex min-h-screen flex-col bg-white font-sora">
          <NVSNavbar />

          <main className="min-h-0 flex-1">{children}</main>

          <NVSFooter />
        </div>
      </body>
    </html>
  );
}
