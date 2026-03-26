/**
 * useOpportunities — React Query hook that orchestrates the full
 * Pod-profile → API → match/score pipeline.
 *
 * 1. Reads the volunteer profile from the Pod (skills, causes, equipment, locations).
 * 2. Calls the Volunteering Data API for each saved location.
 * 3. Deduplicates, scores, and sorts the results.
 *
 * This is the first (and only) consumer of the read*FromPod utilities.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { useSolidAuth } from "@ldo/solid-react";
import { usePodRoot } from "@/app/lib/hooks/usePodRoot";
import {
  readSkillsFromPod,
  readCausesFromPod,
  readEquipmentFromPod,
  readLocationsFromPod,
} from "@/app/lib/helpers/volunteerProfileSkills";
import { fetchOpportunities } from "@/app/lib/helpers/opportunitiesApi";
import {
  scoreAndSortOpportunities,
  type MatchedOpportunity,
  type ProfileKeywords,
} from "@/app/lib/helpers/opportunityMatcher";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseOpportunitiesResult {
  /** Scored + sorted opportunities, highest match first. */
  opportunities: MatchedOpportunity[];
  /** True while reading Pod profile OR fetching API results. */
  isLoading: boolean;
  /** First error encountered (Pod read or API fetch). */
  error: Error | null;
  /** True when profile was read but user has no saved locations. */
  noLocations: boolean;
}

// ---------------------------------------------------------------------------
// Internal: read entire volunteer profile in one query
// ---------------------------------------------------------------------------

interface VolunteerProfileData {
  skillIris: string[];
  causeIris: string[];
  equipmentIris: string[];
  locations: Awaited<ReturnType<typeof readLocationsFromPod>>;
}

async function readVolunteerProfile(
  fetchFn: typeof fetch,
  podRoot: string,
): Promise<VolunteerProfileData> {
  // Read all four in parallel — they all hit the same .ttl doc,
  // but the underlying fetch is deduped by the browser / auth layer.
  const [skillIris, causeIris, equipmentIris, locations] = await Promise.all([
    readSkillsFromPod(fetchFn, podRoot),
    readCausesFromPod(fetchFn, podRoot),
    readEquipmentFromPod(fetchFn, podRoot),
    readLocationsFromPod(fetchFn, podRoot),
  ]);

  return { skillIris, causeIris, equipmentIris, locations };
}

// ---------------------------------------------------------------------------
// Internal: fetch + score for all locations
// ---------------------------------------------------------------------------

async function fetchAndScoreAll(
  profile: VolunteerProfileData,
): Promise<MatchedOpportunity[]> {
  if (profile.locations.length === 0) return [];

  const profileKeywords: ProfileKeywords = {
    skillIris: profile.skillIris,
    causeIris: profile.causeIris,
    equipmentIris: profile.equipmentIris,
  };

  // Fetch API results for each saved location in parallel
  const perLocation = await Promise.all(
    profile.locations.map(async (loc) => {
      const distanceMetres = loc.radiusKm * 1000;
      const opportunities = await fetchOpportunities({
        lat: loc.lat,
        lon: loc.lng,
        distanceMetres,
      });
      return scoreAndSortOpportunities(
        opportunities,
        profileKeywords,
        loc.label || `${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)}`,
      );
    }),
  );

  // Merge all results, deduplicate by title + org name (the API often
  // returns the same opportunity with different activity IDs for
  // different locations). Keep the instance nearest to the user.
  const bestByKey = new Map<string, MatchedOpportunity>();
  for (const batch of perLocation) {
    for (const matched of batch) {
      const dedupKey =
        `${matched.opportunity.title.trim().toLowerCase()}::${matched.opportunity.organisationName.trim().toLowerCase()}`;
      const existing = bestByKey.get(dedupKey);
      if (
        !existing ||
        matched.opportunity.distanceMetres < existing.opportunity.distanceMetres
      ) {
        bestByKey.set(dedupKey, matched);
      }
    }
  }

  // Final sort: score descending, then distance ascending
  return [...bestByKey.values()].sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return a.opportunity.distanceMetres - b.opportunity.distanceMetres;
  });
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useOpportunities(): UseOpportunitiesResult {
  const { podRoot, isLoading: podLoading } = usePodRoot();
  const { fetch: authFetch } = useSolidAuth();
  const fetchFn = typeof authFetch === "function" ? authFetch : fetch;

  // Step 1: Read volunteer profile from Pod
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["volunteerProfile", podRoot],
    queryFn: () => readVolunteerProfile(fetchFn, podRoot!),
    enabled: !!podRoot,
    gcTime: Number.POSITIVE_INFINITY,
  });

  // Step 2: Fetch + score opportunities (depends on profile)
  const hasLocations = (profile?.locations.length ?? 0) > 0;

  const {
    data: opportunities,
    isLoading: oppsLoading,
    error: oppsError,
  } = useQuery({
    queryKey: [
      "opportunities",
      podRoot,
      // Re-fetch if the profile data changes (unlikely within a session)
      profile?.locations.map((l) => l.id).join(","),
    ],
    queryFn: () => fetchAndScoreAll(profile!),
    enabled: !!profile && hasLocations,
    gcTime: Number.POSITIVE_INFINITY,
  });

  const isLoading = podLoading || profileLoading || (hasLocations && oppsLoading);
  const error = profileError ?? oppsError ?? null;

  return {
    opportunities: opportunities ?? [],
    isLoading,
    error: error instanceof Error ? error : null,
    noLocations: !!profile && !hasLocations,
  };
}
