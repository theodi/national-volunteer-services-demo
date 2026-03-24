"use client";

import Link from "next/link";

const CURRENT_YEAR = new Date().getFullYear();

const footerLinks = [
  { label: "Accessibility", href: "#accessibility" },
  { label: "Privacy policy", href: "#privacy" },
  { label: "Cookie preferences", href: "#cookies" },
  { label: "Contact us", href: "#contact" },
] as const;

export function NVSFooter() {
  return (
    <footer
      className="shrink-0 border-t border-stone-200 px-4 py-6 sm:px-6 lg:px-8 bg-stone-100 font-sora"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-center text-sm sm:text-left">
          <p className="font-bold text-blue-custom">
            National Volunteer Services
          </p>
          <span className="text-gray-500 text-xs font-normal">•</span>
          <p className="text-gray-500 text-xs font-normal">
            {" "}
            © Crown copyright {CURRENT_YEAR}
          </p>
        </div>
        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:justify-end"
          aria-label="Footer"
        >
          {footerLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-earth-blue underline underline-offset-2 hover:text-blue-custom focus:outline-none focus:ring-2 focus:ring-blue-custom focus:ring-offset-2"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
