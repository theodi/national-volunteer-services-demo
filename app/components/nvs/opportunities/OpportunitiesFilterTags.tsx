"use client";

import { useState } from "react";

const FILTERS = [
  { id: "nearby", label: "Nearby", icon: "📍" },
  { id: "flexible", label: "Flexible Hours", icon: "⏰" },
  { id: "first-aid", label: "First Aid", icon: "🏥" },
  { id: "emergency", label: "Emergency Response", icon: "🚨" },
  { id: "driving", label: "Driving Required", icon: "🚗" },
] as const;

export interface OpportunitiesFilterTagsProps {
  /** When provided, component is controlled. Omit for uncontrolled with multi-select. */
  selectedIds?: Set<string>;
  /** Called when a filter is clicked; in uncontrolled mode, the filter is toggled on/off. */
  onToggle?: (id: string) => void;
}

export function OpportunitiesFilterTags({
  selectedIds: controlledSelectedIds,
  onToggle,
}: OpportunitiesFilterTagsProps) {
  const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(
    new Set(["nearby"])
  );
  const selectedIds = controlledSelectedIds ?? internalSelectedIds;

  const handleClick = (id: string) => {
    if (onToggle) {
      onToggle(id);
    } else {
      setInternalSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => handleClick(id)}
          className={`inline-flex items-center gap-1.5 border px-4 py-1.5 text-xs font-bold transition focus:outline-none cursor-pointer ${
            selectedIds.has(id)
              ? "border-blue-custom bg-blue-custom text-white"
              : "border-gray-300 bg-white text-blue-custom hover:bg-blue-100"
          }`}
        >
          <span className="shrink-0" aria-hidden>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}
