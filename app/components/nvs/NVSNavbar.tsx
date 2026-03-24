"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

interface NVSNavbarProps {
  title?: string;
  subtitle?: string;
  showUser?: boolean;
  userName?: string;
  userInitials?: string;
}

export function NVSNavbar({
  title = "National Volunteer Services",
  subtitle = "Powered by Solid Pod Technology",
  showUser = true,
  userName = "Alex Morgan",
  userInitials = "AM",
}: NVSNavbarProps) {
  return (
    <header className="w-full shrink-0 font-sora">
      {/* Top bar – GOV.UK branding */}
      <div
        className="w-full flex items-center px-4 sm:px-8 lg:px-15 py-2.5 bg-earth-blue border-b-2 border-b-white"
      >
        <div className="flex items-center gap-4 text-sm">
          <StarIcon className="h-4 w-4 shrink-0 text-white" aria-hidden />
          <Link
            href="https://www.gov.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-white hover:underline"
          >
            GOV.UK
          </Link>
          <p className="text-white text-sm font-normal">Official UK Government Service</p>
        </div>
      </div>


      {/* Main header – service title & user */}
      <div
        className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-8 lg:px-15 py-4 bg-earth-blue text-white"
      >
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold leading-tight sm:text-2xl">
            {title}
          </h1>
          <p className="text-xs text-white sm:text-sm font-normal">
            {subtitle}
          </p>
        </div>
        {showUser && (
          <div className="flex items-center gap-2 text-white">
            <span className="text-xs sm:text-sm font-normal">
              Logged in as {userName}
            </span>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-earth-blue"
              aria-hidden
            >
              {userInitials}
            </div>
          </div>
        )}
      </div>

      {/* Beta feedback bar */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 sm:px-8 lg:px-15 py-2.5 bg-blue-light"
      >
        <span
          className="inline-flex shrink-0 items-center px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white bg-earth-blue"
        >
          BETA
        </span>
        <p className="text-sm text-slate-50">
          This is a new service —{" "}
          <Link
            href="#feedback"
            className="underline decoration-slate-50 underline-offset-2 hover:decoration-slate-50"
          >
            your feedback
          </Link>{" "}
          will help us improve it.
        </p>
      </div>
    </header>
  );
}
