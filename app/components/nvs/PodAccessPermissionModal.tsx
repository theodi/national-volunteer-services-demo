"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { Button } from "@/app/components/Button";
import { ModalWrapper } from "@/app/components/ModalWrapper";
import { HeroText } from "@/app/components/HeroText";

const PERMISSIONS = [
  {
    title: "Skills & Experience",
    description:
      "First Aid, Driving, Social Care and other listed skills",
  },
  {
    title: "Availability",
    description: "Your weekly calendar availability (read-only)",
  },
  {
    title: "Location & Radius",
    description: "Oxford home pin and deployment radius",
  },
  {
    title: "Equipment & Requirements",
    description: "PPE, 4x4 vehicle, training certifications",
  },
] as const;

export interface PodAccessPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow?: () => void;
  onDecline?: () => void;
}

export function PodAccessPermissionModal({
  isOpen,
  onClose,
  onAllow,
  onDecline,
}: PodAccessPermissionModalProps) {
  const handleAllow = () => {
    onAllow?.();
    onClose();
  };

  const handleDecline = () => {
    onDecline?.();
    onClose();
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-[580px]! w-full p-5 sm:p-10">
      <main className="w-full flex flex-col gap-10">
        <section className="w-full flex flex-col gap-5">

          <HeroText
            title="We'd like to access your Pod data"
            description="National Volunteer Services is requesting permission to read the
              following data from your Solid Pod to find you relevant volunteering
              opportunities."
            titleClassName="text-xl !font-bold !text-blue-custom sm:!text-2xl"
            descriptionClassName="!mt-1.5 !text-sm !leading-relaxed !text-gray-700"
          />


          <div className="w-full rounded-xl bg-himalayan-white p-4 sm:p-5">
            <ul className="space-y-3.5">
              {PERMISSIONS.map((item) => (
                <li key={item.title} className="flex gap-2">
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center sm:h-6 sm:w-6"
                    aria-hidden
                  >
                    <CheckCircleIcon className="h-4 w-4 text-blue-custom sm:h-6 sm:w-6" />
                  </span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-blue-custom text-sm sm:text-base">{item.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs leading-relaxed text-gray-700 sm:text-sm">
            Processed under the{" "}
            <strong>Volunteering & Civil Society Act 2024</strong> and UK{" "}
            <strong>GDPR</strong>. Not shared with third parties without explicit
            consent. Revoke access anytime from Pod settings.
          </p>
        </section>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleAllow}
            className="w-full sm:w-auto rounded-none!"
          >
            Allow Access
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={handleDecline}
            className="w-full sm:w-auto rounded-none!"
          >
            Decline
          </Button>
        </div>
      </main>
    </ModalWrapper>
  );
}
