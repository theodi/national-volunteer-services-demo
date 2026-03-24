"use client";

import Link from "next/link";
import { Button } from "../../Button";

export interface MatchReason {
  text: string;
  icon?: "bolt" | "alarm" | "pin" | "car" | "clock" | "handshake" | "wrench" | "safety";
}

const REASON_ICON_EMOJI: Record<NonNullable<MatchReason["icon"]>, string> = {
  bolt: "⚡",
  pin: "📍",
  car: "🚗",
  clock: "⏰",
  handshake: "🤝",
  wrench: "🛠️",
  safety: "🦺",
  alarm: "🚨",
};

const REASON_ICON_CLASS =
  "w-[18px] h-[18px] flex items-center justify-center p-2 rounded-full bg-blue-50 text-xs";

export interface OpportunityCardProps {
  organisationName: string;
  matchScore: number;
  isEmergency?: boolean;
  roleTitle: string;
  roleRegion: string;
  matchReasons: MatchReason[];
  tags: readonly string[];
  distanceText: string;
  roleHref?: string;
  onApply?: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 76) return "text-green-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

export function OpportunityCard({
  organisationName,
  matchScore,
  isEmergency,
  roleTitle,
  roleRegion,
  matchReasons,
  tags,
  distanceText,
  roleHref = "#",
  onApply,
}: OpportunityCardProps) {
  const scoreColor = getScoreColor(matchScore);

  return (
    <article className="relative w-full flex flex-col gap-3.5 border border-gray-200 bg-white p-4 sm:p-5">

        <div className="w-full flex flex-col gap-1 pb-3.5 border-b border-gray-200">
          <h3 className="text-lg sm:text-2xl font-bold text-blue-950">{organisationName}</h3>
          <p className={`text-[10px] font-semibold uppercase tracking-wide ${scoreColor}`}>
            Match score: <span>{matchScore}%</span>
          </p>
        </div>
        {isEmergency && (
          <span className="absolute top-1 right-0 shrink-0 space-x-1 bg-red-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            <span className="text-[8px]" aria-hidden>🚨</span>
            Emergency
          </span>
        )}


      <Link
        href={roleHref}
        className="text-xs text-earth-blue underline underline-offset-2 hover:text-blue-custom"
      >
        {roleTitle}
        {roleRegion ? ` — ${roleRegion}` : ""}
      </Link>

      <div className="space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
          Why you match
        </p>
        <ul className="space-y-2">
          {matchReasons.map((reason, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-900">
              {reason.icon && REASON_ICON_EMOJI[reason.icon] != null && (
                <span className={REASON_ICON_CLASS} aria-hidden>
                  {REASON_ICON_EMOJI[reason.icon]}
                </span>
              )}
              <span>{reason.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap gap-2.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="border border-gray-300 bg-stone-100 px-3 py-0.5 text-[10px] font-semibold text-stone-500"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="-mx-4 flex flex-1 items-center justify-between gap-2 border-t border-gray-200 bg-white px-4 pt-5 sm:-mx-5 sm:px-5">
        <p className="flex items-center gap-1 text-xs text-gray-500">
          <span className="text-xs" aria-hidden>📍</span>
          {distanceText}
        </p>
        <Button
          size="sm"
          onClick={onApply}
          className="shrink-0 py-1.5! px-4! text-xs! rounded-none!"
        >
          Apply →
        </Button>
      </div>
    </article>
  );
}
