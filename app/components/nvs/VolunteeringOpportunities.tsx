"use client";

import { useState } from "react";
import { OpportunitiesFilterTags } from "./opportunities/OpportunitiesFilterTags";
import { OpportunitiesHeaderSection } from "./opportunities/OpportunitiesHeaderSection";
import { OpportunityCard } from "./opportunities/OpportunityCard";
import { OpportunityDetailModal } from "./opportunities/OpportunityDetailModal";
import { useOpportunities } from "@/app/lib/hooks/useOpportunities";
import { LoadingScreen } from "@/app/components/LoadingScreen";
import type { MatchedOpportunity } from "@/app/lib/helpers/opportunityMatcher";

export function VolunteeringOpportunities() {
  const { opportunities, isLoading, error, noLocations } = useOpportunities();

  // Modal state — which opportunity is currently open (null = closed)
  const [selectedOpp, setSelectedOpp] = useState<MatchedOpportunity | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-5 py-8 sm:px-10 sm:py-12 over">
      <div className="sticky top-[168px] z-30 -mx-5 bg-himalayan-white px-5 pb-1 pt-1 sm:-mx-10 sm:top-[164px] sm:px-10">
        <OpportunitiesHeaderSection
          subtitle={
            opportunities.length > 0
              ? `${opportunities.length} opportunities matched from your Solid Pod profile`
              : "Based on your live Solid Pod data"
          }
        />
        <OpportunitiesFilterTags />
      </div>

      {/* Loading state */}
      {isLoading && (
        <LoadingScreen className="min-h-[100px]! h-[300px]!" message="Reading your Pod profile and finding opportunities…" />
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
              description={matched.opportunity.description}
              matchReasons={matched.matchReasons}
              tags={matched.tags}
              distanceText={matched.distanceText}
              roleHref={matched.opportunity.applyLink}
              onApply={
                matched.opportunity.applyLink
                  ? () => window.open(matched.opportunity.applyLink!, "_blank")
                  : undefined
              }
              onViewDetails={() => setSelectedOpp(matched)}
            />
          ))}
        </section>
      )}

      {/* Detail modal */}
      {selectedOpp && (
        <OpportunityDetailModal
          open
          onClose={() => setSelectedOpp(null)}
          organisationName={selectedOpp.opportunity.organisationName}
          matchScore={selectedOpp.matchScore}
          roleTitle={selectedOpp.opportunity.title}
          roleRegion={selectedOpp.locationLabel}
          description={selectedOpp.opportunity.description}
          roleHref={selectedOpp.opportunity.applyLink}
          organisationDescription={selectedOpp.opportunity.organisationDescription}
          organisationWebsite={selectedOpp.opportunity.organisationWebsite}
          matchReasons={selectedOpp.matchReasons}
          tags={selectedOpp.tags}
          distanceText={selectedOpp.distanceText}
          onApply={
            selectedOpp.opportunity.applyLink
              ? () => window.open(selectedOpp.opportunity.applyLink!, "_blank")
              : undefined
          }
        />
      )}
    </div>
  );
}
