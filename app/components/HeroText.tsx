"use client";

export interface HeroTextProps {
  /** Full headline text */
  title: string;
  /** Supporting paragraph */
  description: string;
  /** Optional substring of title to highlight with a different color */
  highlightedText?: string;
  /** Color for the highlighted segment (e.g. "#2563eb") */
  highlightedColor?: string;
  /** Color for non-highlighted title segments (default "#1d70b8") */
  defaultTitleColor?: string;
  /** Extra or override classes for the title (h1) */
  titleClassName?: string;
  /** Extra or override classes for the description (p) */
  descriptionClassName?: string;
}

const defaultTitleClasses =
  "text-2xl font-bold text-blue-custom leading-tight tracking-tight sm:text-4xl";
const defaultDescriptionClasses =
  "mt-3 max-w-lg text-base leading-relaxed tranquil-black sm:text-lg";

export function HeroText({
  title,
  description,
  highlightedText,
  highlightedColor = "#1D70B8",
  defaultTitleColor = "#003078",
  titleClassName = "",
  descriptionClassName = "",
}: HeroTextProps) {
  const useInlineTitleColor = !titleClassName;
  const titleColorStyle = useInlineTitleColor ? { color: defaultTitleColor } : undefined;

  const renderTitle = () => {
    if (!highlightedText || !title.includes(highlightedText)) {
      return <span style={titleColorStyle}>{title}</span>;
    }
    const i = title.indexOf(highlightedText);
    const before = title.slice(0, i);
    const after = title.slice(i + highlightedText.length);
    return (
      <>
        <span style={titleColorStyle}>{before}</span>
        <span style={{ color: highlightedColor }}>{highlightedText}</span>
        <span style={titleColorStyle}>{after}</span>
      </>
    );
  };

  return (
    <div className="flex flex-col justify-center">
      <h1
        className={`${defaultTitleClasses} ${titleClassName}`.trim()}
      >
        {renderTitle()}
      </h1>
      <p
        className={`${defaultDescriptionClasses} ${descriptionClassName}`.trim()}
      >
        {description}
      </p>
    </div>
  );
}
