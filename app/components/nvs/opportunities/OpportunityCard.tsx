"use client";

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
  /** Opportunity description — shown truncated on the card. */
  description?: string;
  /** All match reasons (only first 2 shown on card). */
  matchReasons: MatchReason[];
  tags: readonly string[];
  distanceText: string;
  roleHref?: string;
  onApply?: () => void;
  /** Opens the full-detail modal. */
  onViewDetails?: () => void;
}

function getScoreColor(score: number): string {
  if (score >= 76) return "text-green-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

/** Max chars of description to show on the compact card. */
const DESC_TRUNCATE = 100;

export function OpportunityCard({
  organisationName,
  matchScore,
  isEmergency,
  roleTitle,
  roleRegion,
  description,
  matchReasons,
  distanceText,
  onApply,
  onViewDetails,
}: OpportunityCardProps) {
  const scoreColor = getScoreColor(matchScore);
  const truncatedDesc =
    description && description.length > DESC_TRUNCATE
      ? `${description.slice(0, DESC_TRUNCATE).trimEnd()}…`
      : description;

  // Show at most 2 reasons on the card
  const cardReasons = matchReasons.slice(0, 2);
  const extraReasonCount = Math.max(0, matchReasons.length - 2);

  return (
    <article className="relative w-full flex flex-col gap-3 border border-gray-200 bg-white p-4 sm:p-5">

        <div className="w-full flex flex-col gap-1 pb-3 border-b border-gray-200">
          <h3 className="text-lg sm:text-xl font-bold text-blue-950 leading-tight">{organisationName}</h3>
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

      <p className="text-xs text-blue-950 font-medium line-clamp-2">
        {roleTitle}
        {roleRegion ? ` — ${roleRegion}` : ""}
      </p>

      {truncatedDesc && (
        <p className="text-xs leading-relaxed text-gray-600 line-clamp-2">
          {truncatedDesc}
        </p>
      )}

      {/* Compact match reasons — max 2 */}
      <ul className="space-y-1.5">
        {cardReasons.map((reason, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-900">
            {reason.icon && REASON_ICON_EMOJI[reason.icon] != null && (
              <span className={REASON_ICON_CLASS} aria-hidden>
                {REASON_ICON_EMOJI[reason.icon]}
              </span>
            )}
            <span className="line-clamp-1">{reason.text}</span>
          </li>
        ))}
      </ul>
      {extraReasonCount > 0 && (
        <button
          type="button"
          onClick={onViewDetails}
          className="self-start text-[11px] font-medium text-earth-blue hover:underline cursor-pointer"
        >
          +{extraReasonCount} more reason{extraReasonCount > 1 ? "s" : ""}
        </button>
      )}

      {/* Footer: distance + actions */}
      <div className="-mx-4 mt-auto flex items-center justify-between gap-2 border-t border-gray-200 bg-white px-4 pt-3 sm:-mx-5 sm:px-5">
        <p className="flex items-center gap-1 text-xs text-gray-500">
          <span className="text-xs" aria-hidden>📍</span>
          {distanceText}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewDetails}
            className="shrink-0 px-3 py-1.5 text-xs font-medium text-earth-blue border border-earth-blue hover:bg-blue-50 cursor-pointer transition"
          >
            Details
          </button>
          <Button
            size="sm"
            onClick={onApply}
            className="shrink-0 py-1.5! px-4! text-xs! rounded-none!"
          >
            Apply →
          </Button>
        </div>
      </div>
    </article>
  );
}
