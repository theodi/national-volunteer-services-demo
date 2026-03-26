"use client";

import { useState } from "react";

export type ExpandableTextProps = {
  /** Text shown when collapsed (e.g. with trailing "..."). */
  truncated: string;
  /** Full text shown when expanded. */
  full: string;
  /** Optional class for the wrapper paragraph. */
  className?: string;
  /** Optional class for the more/less control (button). */
  controlClassName?: string;
};

export function ExpandableText({
  truncated,
  full,
  className = "",
  controlClassName = "font-medium text-tranquil-black hover:underline cursor-pointer",
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <p className={className}>
      {expanded ? full : truncated}{" "}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className={controlClassName}
      >
        {expanded ? "less" : "more"}
      </button>
    </p>
  );
}
