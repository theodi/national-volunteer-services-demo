/**
 * Opportunity matcher: scores API opportunities against the user's
 * Pod volunteer profile (skills, causes, equipment).
 *
 * For each opportunity we scan `title` + `description` for keyword
 * matches derived from the user's profile IRIs (via vocabularyLabels).
 * The match score is a percentage of how many profile categories matched.
 *
 * Output is shaped to feed directly into OpportunityCard props.
 */

import type { Opportunity } from "@/app/lib/helpers/opportunitiesApi";
import type { MatchReason } from "@/app/components/nvs/opportunities/OpportunityCard";
import { iriToKeywords, iriLocalName } from "@/app/lib/helpers/vocabularyLabels";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** The user's Pod profile distilled into keyword sets for matching. */
export interface ProfileKeywords {
  /** Skill IRIs from the Pod (e.g. "https://ns.volunteeringdata.io/FirstAid"). */
  skillIris: string[];
  /** Cause IRIs from the Pod. */
  causeIris: string[];
  /** Equipment / requirement IRIs from the Pod. */
  equipmentIris: string[];
}

/** An opportunity enriched with match data, ready for the card UI. */
export interface MatchedOpportunity {
  /** Original opportunity data. */
  opportunity: Opportunity;
  /** 0–100 percentage. */
  matchScore: number;
  /** Human-readable match explanations with icons. */
  matchReasons: MatchReason[];
  /** Short tags derived from matched keywords + location. */
  tags: string[];
  /** e.g. "2.4 miles away" */
  distanceText: string;
  /** Label of the user's location pin that produced this result. */
  locationLabel: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const METRES_PER_MILE = 1609.344;

function metresToMilesText(metres: number): string {
  const miles = metres / METRES_PER_MILE;
  if (miles < 0.1) return "Less than 0.1 miles away";
  return `${miles.toFixed(1)} miles away`;
}

/**
 * Checks if ANY keyword from the set appears in the haystack.
 * Returns the first matching keyword or null.
 */
function findKeywordMatch(
  haystack: string,
  keywords: string[],
): string | null {
  for (const kw of keywords) {
    // Word-boundary-ish match: the keyword must appear as a standalone
    // substring (not inside another word). We use a simple regex.
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(haystack)) {
      return kw;
    }
  }
  return null;
}

/** Maps a profile category to a card icon. */
type MatchCategory = "skill" | "cause" | "equipment" | "location";

const CATEGORY_ICON: Record<MatchCategory, MatchReason["icon"]> = {
  skill: "bolt",
  cause: "handshake",
  equipment: "wrench",
  location: "pin",
};

/** Pretty-print an IRI local name: "FirstAid" → "First Aid". */
function prettyLocalName(iri: string): string {
  const local = iriLocalName(iri);
  if (!local) return iri;
  return local
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2");
}

// ---------------------------------------------------------------------------
// Matching engine
// ---------------------------------------------------------------------------

interface CategoryMatch {
  category: MatchCategory;
  iri: string;
  matchedKeyword: string;
}

function matchIrisAgainstText(
  haystack: string,
  iris: string[],
  category: MatchCategory,
): CategoryMatch[] {
  const matches: CategoryMatch[] = [];
  for (const iri of iris) {
    const keywords = iriToKeywords(iri);
    const hit = findKeywordMatch(haystack, keywords);
    if (hit) {
      matches.push({ category, iri, matchedKeyword: hit });
    }
  }
  return matches;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Scores a single opportunity against the user's profile keywords.
 *
 * Scoring:
 * - Each category (skills, causes, equipment) that has ≥1 keyword match
 *   contributes equally to the score.
 * - 3 categories = 100%, 2 = 66%, 1 = 33%, 0 = 0%.
 * - A small bonus (up to 10%) is added for multiple matches within categories.
 *
 * @param locationLabel  The user's saved location label (e.g. "Oxford")
 */
export function scoreOpportunity(
  opp: Opportunity,
  profile: ProfileKeywords,
  locationLabel: string,
): MatchedOpportunity {
  const haystack = `${opp.title} ${opp.description}`.toLowerCase();

  // Collect all matches across categories
  const skillMatches = matchIrisAgainstText(haystack, profile.skillIris, "skill");
  const causeMatches = matchIrisAgainstText(haystack, profile.causeIris, "cause");
  const equipmentMatches = matchIrisAgainstText(haystack, profile.equipmentIris, "equipment");

  const allMatches = [...skillMatches, ...causeMatches, ...equipmentMatches];

  // Count how many categories matched (0–3)
  const categoriesMatched = [
    skillMatches.length > 0,
    causeMatches.length > 0,
    equipmentMatches.length > 0,
  ].filter(Boolean).length;

  // Base score: each category worth ~30 points (max 90 from categories)
  const baseScore = categoriesMatched * 30;

  // Bonus: up to 10 points for depth of matching (many hits across categories)
  const totalHits = allMatches.length;
  const depthBonus = Math.min(10, totalHits * 2);

  const matchScore = Math.min(100, baseScore + depthBonus);

  // Build match reasons (up to 3, one per category, plus location)
  const matchReasons: MatchReason[] = [];

  if (skillMatches.length > 0) {
    const names = [...new Set(skillMatches.map((m) => prettyLocalName(m.iri)))];
    const label = names.length === 1
      ? `Your ${names[0]} skill matches this role`
      : `Your skills (${names.slice(0, 2).join(", ")}) match this role`;
    matchReasons.push({ text: label, icon: CATEGORY_ICON.skill });
  }

  if (causeMatches.length > 0) {
    const names = [...new Set(causeMatches.map((m) => prettyLocalName(m.iri)))];
    const label = names.length === 1
      ? `Aligns with your ${names[0]} interest`
      : `Aligns with your interests (${names.slice(0, 2).join(", ")})`;
    matchReasons.push({ text: label, icon: CATEGORY_ICON.cause });
  }

  if (equipmentMatches.length > 0) {
    const names = [...new Set(equipmentMatches.map((m) => prettyLocalName(m.iri)))];
    const label = names.length === 1
      ? `Your ${names[0]} meets the requirement`
      : `Your equipment (${names.slice(0, 2).join(", ")}) matches`;
    matchReasons.push({ text: label, icon: CATEGORY_ICON.equipment });
  }

  // Always add a location reason
  matchReasons.push({
    text: locationLabel
      ? `Within your ${locationLabel} search area`
      : "Within your preferred search area",
    icon: CATEGORY_ICON.location,
  });

  // Build tags from matched IRIs (deduplicated, max 5)
  const tagSet = new Set<string>();
  for (const m of allMatches) {
    tagSet.add(prettyLocalName(m.iri));
  }
  // Add organisation as a tag if we have room
  if (tagSet.size < 5 && opp.locations[0]?.address) {
    tagSet.add(opp.locations[0].address.split(",")[0].trim());
  }
  const tags = [...tagSet].slice(0, 5);

  return {
    opportunity: opp,
    matchScore,
    matchReasons,
    tags,
    distanceText: metresToMilesText(opp.distanceMetres),
    locationLabel,
  };
}

/**
 * Scores and sorts a list of opportunities against the user's profile.
 * Returns highest match score first; ties broken by distance (nearest first).
 */
export function scoreAndSortOpportunities(
  opportunities: Opportunity[],
  profile: ProfileKeywords,
  locationLabel: string,
): MatchedOpportunity[] {
  return opportunities
    .map((opp) => scoreOpportunity(opp, profile, locationLabel))
    .sort((a, b) => {
      // Primary: higher score first
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      // Secondary: nearer first
      return a.opportunity.distanceMetres - b.opportunity.distanceMetres;
    });
}
