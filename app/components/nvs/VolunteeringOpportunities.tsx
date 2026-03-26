"use client";

import { OpportunitiesFilterTags } from "./opportunities/OpportunitiesFilterTags";
import { OpportunitiesHeaderSection } from "./opportunities/OpportunitiesHeaderSection";
import { OpportunityCard } from "./opportunities/OpportunityCard";
import { useOpportunities } from "@/app/lib/hooks/useOpportunities";
import { LoadingScreen } from "@/app/components/LoadingScreen";

export function VolunteeringOpportunities() {
  const { opportunities, isLoading, error, noLocations } = useOpportunities();

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-5 py-8 sm:px-10 sm:py-12">
      <OpportunitiesHeaderSection
        subtitle={
          opportunities.length > 0
            ? `${opportunities.length} opportunities matched from your Solid Pod profile`
            : "Based on your live Solid Pod data"
        }
      />
      <OpportunitiesFilterTags />

      {/* Loading state */}
      {isLoading && (
        <LoadingScreen message="Reading your Pod profile and finding opportunities…" />
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-lg font-bold text-blue-custom">
            Something went wrong
          </h3>
          <p className="max-w-md text-sm text-gray-600">
            We couldn&apos;t load opportunities right now. Please try refreshing
            the page.
          </p>
          <p className="text-xs text-gray-400">{error.message}</p>
        </div>
      )}

      {/* No locations in profile */}
      {!isLoading && !error && noLocations && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-3xl">📍</span>
          <h3 className="text-lg font-bold text-blue-custom">
            No locations in your profile
          </h3>
          <p className="max-w-md text-sm text-gray-600">
            Add a preferred location in the Volunteer Profile Manager so we can
            find opportunities near you.
          </p>
        </div>
      )}

      {/* Empty results (has locations but no API results) */}
      {!isLoading && !error && !noLocations && opportunities.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-3xl">🔍</span>
          <h3 className="text-lg font-bold text-blue-custom">
            No opportunities found
          </h3>
          <p className="max-w-md text-sm text-gray-600">
            We couldn&apos;t find volunteering opportunities near your saved
            locations. Try increasing your search radius in the Volunteer Profile
            Manager.
          </p>
        </div>
      )}

      {/* Results grid */}
      {!isLoading && !error && opportunities.length > 0 && (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((matched) => (
            <OpportunityCard
              key={matched.opportunity.id}
              organisationName={matched.opportunity.organisationName}
              matchScore={matched.matchScore}
              roleTitle={matched.opportunity.title}
              roleRegion={matched.locationLabel}
              matchReasons={matched.matchReasons}
              tags={matched.tags}
              distanceText={matched.distanceText}
              roleHref={matched.opportunity.applyLink}
              onApply={
                matched.opportunity.applyLink
                  ? () => window.open(matched.opportunity.applyLink!, "_blank")
                  : undefined
              }
            />
          ))}
        </section>
      )}
    </div>
  );
}
