"use client";

export interface TagListProps {
  items: readonly string[];
  /** Class for the wrapper (flex container) */
  className?: string;
  /** Class for each tag */
  itemClassName?: string;
  /** Inline style for each tag (e.g. when using custom colors) */
  itemStyle?: React.CSSProperties;
}

export function TagList({
  items,
  className = "",
  itemClassName = "",
  itemStyle,
}: TagListProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {items.map((item) => (
        <span
          key={item}
          className={itemClassName}
          style={itemStyle}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
