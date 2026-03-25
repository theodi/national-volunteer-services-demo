import { Suspense } from "react";
import { NVSVolunteerLanding } from "./components/nvs/NVSVolunteerLanding";

export default function NationalVolunteerServicesPage() {
  return (
    <main className="mx-auto w-full py-4 sm:py-8">
      <Suspense>
        <NVSVolunteerLanding />
      </Suspense>
    </main>
  );
}
