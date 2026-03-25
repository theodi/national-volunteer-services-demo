"use client";

import { useMemo } from "react";
import { useAgent } from "@/app/lib/hooks/useAgent";

export type PodRootResult = {
  webId: string | null;
  podRoot: string | null;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Derives the Pod root URL from the shared Agent query (Agent.storageUrls).
 * No separate fetch — reuses the same parsed profile as useUserProfile.
 */
export function usePodRoot(): PodRootResult {
  const { webId, agent, isLoading, error } = useAgent();

  const podRoot = useMemo(() => {
    if (!agent) return null;
    const urls = agent.storageUrls;
    if (urls.size === 0) {
      try {
        return `${new URL(webId!).origin}/`;
      } catch {
        return null;
      }
    }
    const storage = [...urls][0];
    return storage.endsWith("/") ? storage : `${storage}/`;
  }, [agent, webId]);

  return { webId, podRoot, isLoading, error };
}
