"use client";

import { Button } from "../../Button";
import { ModalWrapper } from "../../ModalWrapper";
import type { MatchReason } from "./OpportunityCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OpportunityDetailModalProps {
  open: boolean;
  onClose: () => void;

  // Header
  organisationName: string;
  matchScore: number;
  isEmergency?: boolean;

  // Role
  roleTitle: string;
  roleRegion: string;
  description?: string;
  roleHref?: string;

  // Organisation
  organisationDescription?: string;
  organisationWebsite?: string;

  // Match data
  matchReasons: MatchReason[];
  tags: readonly string[];
  distanceText: string;

  onApply?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function getScoreColor(score: number): string {
  if (score >= 76) return "text-green-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OpportunityDetailModal({
  open,
  onClose,
  organisationName,
  matchScore,
  isEmergency,
  roleTitle,
  roleRegion,
  description,
  roleHref,
  organisationDescription,
  organisationWebsite,
  matchReasons,
  tags,
  distanceText,
  onApply,
}: OpportunityDetailModalProps) {
  const scoreColor = getScoreColor(matchScore);

  return (
    <ModalWrapper isOpen={open} onClose={onClose} className="max-w-2xl! w-full p-0! rounded-none! border-gray-200!">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer transition"
        aria-label="Close"
      >
        ✕
      </button>

      {/* ---- Header ---- */}
      <div className="border-b border-gray-200 px-6 pt-6 pb-4">
        <div className="flex items-start gap-3 pr-8">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-blue-950 leading-tight">
              {organisationName}
            </h2>
            <p className={`mt-1 text-xs font-semibold uppercase tracking-wide ${scoreColor}`}>
              Match score: {matchScore}%
            </p>
          </div>
          {isEmergency && (
            <span className="shrink-0 bg-red-500 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              🚨 Emergency
            </span>
          )}
        </div>
      </div>

      {/* ---- Scrollable body ---- */}
      <div className="flex flex-col gap-5 px-6 py-5 max-h-[65vh] overflow-y-auto">

        {/* Role title */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
            Role
          </p>
          <p className="text-sm font-medium text-blue-950">{roleTitle}</p>
          {roleRegion && (
            <p className="mt-0.5 text-xs text-gray-500">📍 {roleRegion}</p>
          )}
        </div>

        {/* Description */}
        {description && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
              About this opportunity
            </p>
            <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
              {description}
            </p>
          </div>
        )}

        {/* Why you match */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">
            Why you match
          </p>
          <ul className="space-y-2">
            {matchReasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-900">
                {reason.icon && REASON_ICON_EMOJI[reason.icon] != null && (
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs"
                    aria-hidden
                  >
                    {REASON_ICON_EMOJI[reason.icon]}
                  </span>
                )}
                <span>{reason.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">
              Matched skills &amp; interests
            </p>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-gray-300 bg-stone-100 px-3 py-0.5 text-[11px] font-semibold text-stone-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Organisation */}
        {organisationDescription && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">
              About the organisation
            </p>
            <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
              {organisationDescription}
            </p>
            {organisationWebsite && (
              <a
                href={organisationWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-block text-xs text-earth-blue underline underline-offset-2 hover:text-blue-custom"
              >
                Visit website →
              </a>
            )}
          </div>
        )}

        {/* Distance */}
        <p className="flex items-center gap-1.5 text-sm text-gray-500">
          <span aria-hidden>📍</span>
          {distanceText}
        </p>
      </div>

      {/* ---- Footer ---- */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 cursor-pointer transition"
        >
          Close
        </button>
        {onApply && (
          <Button
            size="sm"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="py-2! px-5! text-sm! rounded-none!"
          >
            Apply →
          </Button>
        )}
      </div>
    </ModalWrapper>
  );
}
