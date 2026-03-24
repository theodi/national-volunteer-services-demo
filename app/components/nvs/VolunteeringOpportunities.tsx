"use client";

import type { MatchReason } from "./opportunities/OpportunityCard";
import { OpportunitiesFilterTags } from "./opportunities/OpportunitiesFilterTags";
import { OpportunitiesHeaderSection } from "./opportunities/OpportunitiesHeaderSection";
import { OpportunityCard } from "./opportunities/OpportunityCard";

const OPPORTUNITIES_DATA: Array<{
  organisationName: string;
  matchScore: number;
  isEmergency?: boolean;
  roleTitle: string;
  roleRegion: string;
  matchReasons: MatchReason[];
  tags: readonly string[];
  distanceText: string;
}> = [
  {
    organisationName: "British Red Cross",
    matchScore: 94,
    isEmergency: true,
    roleTitle: "Emergency Response Coordinator",
    roleRegion: "Oxford Region",
    matchReasons: [
      { text: "Your First Aid certification matches requirement", icon: "bolt" },
      { text: "You opted into emergency response network", icon: "alarm" },
      { text: "Within your preferred 10km Oxford radius", icon: "pin" },
    ],
    tags: ["Emergency", "First Aid Required", "4x4 Needed"],
    distanceText: "2.4 miles from your Oxford pin",
  },
  {
    organisationName: "Oxford Community Trust",
    matchScore: 75,
    roleTitle: "Community Support Driver — Weekly Rounds",
    roleRegion: "",
    matchReasons: [
      { text: "Driving skill matches transport requirements", icon: "car" },
      { text: "Flexible scheduling aligns with your availability", icon: "clock" },
      { text: "Social care experience in your profile", icon: "handshake" },
    ],
    tags: ["Driving Required", "Flexible Hours", "Social Care"],
    distanceText: "1.1 miles from your Oxford pin",
  },
  {
    organisationName: "Habitat for Humanity UK",
    matchScore: 25,
    roleTitle: "Disaster Relief — Build Team Member",
    roleRegion: "",
    matchReasons: [
      { text: "Physical work capability matches role needs", icon: "wrench" },
      { text: "Weekend availability aligns perfectly", icon: "clock" },
      { text: "PPE training and equipment certified", icon: "safety" },
    ],
    tags: ["Physical Work", "PPE Provided", "Weekends"],
    distanceText: "4.7 miles from your Oxford pin",
  },
];

export function VolunteeringOpportunities() {
  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 px-5 py-8 sm:px-10 sm:py-12">
      <OpportunitiesHeaderSection />
      <OpportunitiesFilterTags />
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {OPPORTUNITIES_DATA.map((opp) => (
          <OpportunityCard
            key={opp.organisationName}
            organisationName={opp.organisationName}
            matchScore={opp.matchScore}
            isEmergency={opp.isEmergency}
            roleTitle={opp.roleTitle}
            roleRegion={opp.roleRegion}
            matchReasons={opp.matchReasons}
            tags={opp.tags}
            distanceText={opp.distanceText}
          />
        ))}
      </section>
    </div>
  );
}
