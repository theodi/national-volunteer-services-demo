"use client";

import { Button } from "@/app/components/Button";
import { TagList } from "@/app/components/TagList";
import { ModalWrapper } from "@/app/components/ModalWrapper";
import { HeroText } from "@/app/components/HeroText";

const ORGANISATIONS = ["British Red Cross", "Habitat for Humanity"] as const;

export interface EmergencyContactPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOptIn?: () => void;
  onSearchOnly?: () => void;
}

export function EmergencyContactPermissionModal({
  isOpen,
  onClose,
  onOptIn,
  onSearchOnly,
}: EmergencyContactPermissionModalProps) {
  const handleOptIn = () => {
    onOptIn?.();
    onClose();
  };

  const handleSearchOnly = () => {
    onSearchOnly?.();
    onClose();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[580px]! w-full p-5 sm:p-10"
    >
      <main className="w-full flex flex-col gap-10">
        <section className="w-full flex flex-col gap-5">
          <div className="w-full flex flex-col gap-2.5">
            {/* Tag */}
            <span
              className="w-fit rounded-md px-2.5 py-1.5 text-xs font-semibold bg-orange-50 border border-orange-400 text-orange-400"
            >
              Emergency Response Network
            </span>

            <HeroText
              title="Enable Emergency Response?"
              description="This allows the following organisations to contact you directly during
            declared emergencies such as floods, wildfires, or mass casualty
            events:"
              titleClassName="text-xl !font-bold !text-blue-custom sm:!text-2xl"
              descriptionClassName="!mt-1.5 !text-sm !leading-relaxed !text-gray-700"
            />
          </div>

          <div className="w-full flex flex-col gap-2.5">
            {/* Organisation tags */}
            <TagList
              items={ORGANISATIONS}
              itemClassName="rounded border border-blue-custom bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-custom"

            />

            {/* What this means box */}
            <div
              className="rounded-xl bg-orange-50 p-2.5 sm:p-5"
            >
              <p
                className="text-xs leading-relaxed text-orange-950 sm:text-sm"
              > <span className="font-semibold text-orange-700 pr-1">What this means:</span>
                Your name, skills (First Aid, Driving), and general location
                (Oxford, 10km) may be shared with these organisations during
                declared emergency situations only. Opt-in is voluntary.
              </p>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-gray-700 sm:text-sm">
            Governed by the <strong>Civil Contingencies Act 2004</strong>. You
            will always be notified before contact is made.
          </p>
        </section>

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleOptIn}
            className="w-full sm:w-auto rounded-none!"
          >
            Yes Opt-in
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={handleSearchOnly}
            className="w-full sm:w-auto rounded-none!"
          >
            Search Only
          </Button>
        </div>
      </main>
    </ModalWrapper>
  );
}
