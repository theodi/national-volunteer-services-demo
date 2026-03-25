"use client";

import { useMemo } from "react";
import { useAgent } from "@/app/lib/hooks/useAgent";
import type { Agent } from "@/app/lib/class/Agent";

/**
 * Minimal user profile for the NVS portal.
 * We only need name, email, photo, and webId from the WebID profile.
 */
export interface UserProfile {
  name: string | null;
  email: string | null;
  photoUrl: string | null;
  webId: string | null;
}

const emptyProfile: UserProfile = {
  name: null,
  email: null,
  photoUrl: null,
  webId: null,
};

function agentToProfile(agent: Agent, webId: string): UserProfile {
  return {
    name: agent.name ?? null,
    email: agent.email ?? null,
    photoUrl: agent.photoUrl ?? null,
    webId,
  };
}

export interface UseUserProfileResult {
  profile: UserProfile | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Derives the UserProfile from the shared Agent query.
 * No separate fetch — reuses the same parsed profile as usePodRoot.
 */
export function useUserProfile(): UseUserProfileResult {
  const { webId, agent, isLoading, error } = useAgent();

  const profile = useMemo(() => {
    if (!webId) return emptyProfile;
    if (!agent) return { ...emptyProfile, webId };
    return agentToProfile(agent, webId);
  }, [agent, webId]);

  return { profile, isLoading, error };
}
