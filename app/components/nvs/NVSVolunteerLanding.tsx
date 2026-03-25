"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSolidAuth } from "@ldo/solid-react";
import { Button } from "@/app/components/Button";
import { HeroText } from "@/app/components/HeroText";
import { TagList } from "@/app/components/TagList";
import { PodAccessPermissionModal } from "./PodAccessPermissionModal";
import { EmergencyContactPermissionModal } from "./EmergencyContactPermissionModal";
import { StepProgress } from "@/app/components/StepProgress";
import { ModalWrapper } from "@/app/components/ModalWrapper";

const STEPS = [
  { id: 1, label: "Share Pod" },
  { id: 2, label: "Confirm" },
  { id: 3, label: "View Matches" },
] as const;

const ATTRIBUTE_TAGS = [
  "Skills & Experience",
  "Availability",
  "Location",
  "Equipment",
] as const;

export function NVSVolunteerLanding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, ranInitialAuthCheck = true } = useSolidAuth();
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // True while the OAuth callback is still being processed by @ldo/solid-react.
  const isOAuthCallback =
    (searchParams.has("code") || searchParams.has("state")) &&
    !ranInitialAuthCheck;

  // After login redirect: if ?showEmergencyModal=true and user is logged in,
  // auto-open the emergency contact modal and advance to step 2.
  useEffect(() => {
    if (
      session.isLoggedIn &&
      searchParams.get("showEmergencyModal") === "true"
    ) {
      setCurrentStep(2);
      setIsEmergencyModalOpen(true);
      // Clean the query param from the URL without a full navigation
      router.replace("/", { scroll: false });
    }
  }, [session.isLoggedIn, searchParams, router]);

  const handleCompleteToOpportunities = () => {
    setCurrentStep(3);
    setIsEmergencyModalOpen(false);
    router.push("/opportunities");
  };

  return (
    <main
      className="max-w-[1320px] w-full mx-auto px-5 py-[30px] sm:px-10 sm:py-[60px] bg-himalayan-white rounded-md"
    >
      <section className="w-full flex flex-col items-center gap-10 sm:items-start sm:justify-between sm:flex-row">

        {/* Left: Hero content */}
        <HeroText
          title="Find Volunteering opportunities near you."
          description="Connect your Solid Pod to instantly match your skills, availability, and location with organisations that need you most."
          highlightedText="Volunteering"
          highlightedColor="#1D70B8"
          defaultTitleColor="#003078"
        />

        {/* Right: Progress + Card */}
        <section className="w-full flex flex-col gap-5 sm:gap-18">
          <StepProgress steps={STEPS} currentStep={currentStep} />

          {/* Card */}
          <div className="rounded-2xl border border-earth-blue bg-white p-5 sm:p-10 shadow-lg">
            <HeroText
              title="Find Volunteering Opportunities"
              description="Share your Solid Pod data securely to receive personalised
              matches based on your skills, availability, and location."
              titleClassName="text-xl !font-bold !text-blue-custom sm:!text-2xl"
              descriptionClassName="!mt-3 !text-sm !leading-relaxed !text-tranquil-black"
            />

            <TagList
              items={ATTRIBUTE_TAGS}
              className="mt-5 gap-3.5"
              itemClassName="rounded border border-blue-custom bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-custom"
            />
            <div className="w-fit mt-6 flex flex-col gap-2.5">
              <Button
                fullWidth
                size="md"
                className="rounded-none!"
                onClick={() => setIsPodModalOpen(true)}
              >
                Share Pod Data & Get Matched
              </Button>
              <Link
                href="#how-it-works"
                className="text-xs text-black underline underline-offset-2 hover:text-blue-custom"
              >
                How does this work?
              </Link>
            </div>
          </div>
        </section>
      </section>

      <PodAccessPermissionModal
        isOpen={isPodModalOpen}
        onClose={() => setIsPodModalOpen(false)}
        onAllow={() => {
          setCurrentStep(2);
          setIsEmergencyModalOpen(true);
        }}
      />
      <EmergencyContactPermissionModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onOptIn={handleCompleteToOpportunities}
        onSearchOnly={handleCompleteToOpportunities}
      />

      {/* Overlay while OAuth callback is being processed */}
      <ModalWrapper isOpen={isOAuthCallback} onClose={() => {}}>
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-earth-blue/20 border-t-earth-blue" />
          </div>
          <p className="text-sm font-medium text-blue-custom">
            Accessing your Pod…
          </p>
        </div>
      </ModalWrapper>
    </main>
  );
}
