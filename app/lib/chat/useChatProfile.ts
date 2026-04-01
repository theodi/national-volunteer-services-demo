"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePodRoot } from "@/app/lib/hooks/usePodRoot";
import { serializeChatProfile } from "@/app/lib/chat/profileSerializer";
import type { ChatProfile } from "@/app/lib/chat/types";
import type { SavedLocation } from "@/app/lib/helpers/volunteerProfileSkills";

interface VolunteerProfileData {
  skillIris: string[];
  causeIris: string[];
  equipmentIris: string[];
  locations: SavedLocation[];
}

/**
 * Reads the volunteer profile from the existing React Query cache
 * (populated by useOpportunities) and serializes it into a ChatProfile.
 */
export function useChatProfile(): ChatProfile | null {
  const { podRoot } = usePodRoot();
  const queryClient = useQueryClient();

  return useMemo(() => {
    if (!podRoot) return null;
    const cached = queryClient.getQueryData<VolunteerProfileData>([
      "volunteerProfile",
      podRoot,
    ]);
    if (!cached) return null;
    return serializeChatProfile(
      cached.skillIris,
      cached.causeIris,
      cached.equipmentIris,
      cached.locations,
    );
  }, [podRoot, queryClient]);
}
