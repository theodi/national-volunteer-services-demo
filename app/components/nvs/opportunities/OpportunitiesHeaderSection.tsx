"use client";

import { useState } from "react";
import { Dropdown } from "../../Dropdown";
import { HeroText } from "../../HeroText";

const SORT_OPTIONS = [
  { value: "best-match", label: "Sort by: Best Match" },
  { value: "distance", label: "Sort by: Distance" },
  { value: "urgency", label: "Sort by: Urgency" },
] as const;

export interface OpportunitiesHeaderSectionProps {
  title?: string;
  subtitle?: string;
  /** Current sort value (must match SORT_OPTIONS or pass sortOptions + sortValue + onSortChange) */
  sortValue?: string;
  onSortChange?: (value: string) => void;
}

export function OpportunitiesHeaderSection({
  title = "Your Matched Opportunities",
  subtitle = "Based on your live Solid Pod data — Oxford, 10km radius",
  sortValue: controlledSortValue,
  onSortChange,
}: OpportunitiesHeaderSectionProps) {
  const [internalSort, setInternalSort] = useState<string>(SORT_OPTIONS[0].value);
  const sortValue = controlledSortValue ?? internalSort;
  const setSortValue = onSortChange ?? setInternalSort;

  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between pb-[30px] border-b-3 border-blue-custom">
      <div className="min-w-0 flex-1">
        <HeroText
          title={title}
          description={subtitle}
          titleClassName="text-xl !font-bold !text-blue-custom sm:!text-2xl lg:!text-4xl"
          descriptionClassName="!mt-1 !text-sm sm:!text-base lg:!text-lg !leading-relaxed !text-gray-700"
        />
      </div>
      <div className="shrink-0">
        <Dropdown
          options={[...SORT_OPTIONS]}
          value={sortValue}
          onChange={setSortValue}
        />
      </div>
    </header>
  );
}
