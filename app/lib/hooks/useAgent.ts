"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSolidAuth } from "@ldo/solid-react";
import { fetchAndParseProfile } from "@/app/lib/helpers/profileUtils";
import type { Agent } from "@/app/lib/class/Agent";

export type UseAgentResult = {
  webId: string | null;
  agent: Agent | null;
  isLoading: boolean;
  error: Error | null;
};

/**
 * Single shared query that fetches and parses the WebID profile into an Agent.
 * Both usePodRoot and useUserProfile derive from this — the profile is only
 * fetched and parsed once per login.
 */
export function useAgent(): UseAgentResult {
  const queryClient = useQueryClient();
  const { session, fetch: authFetch } = useSolidAuth();
  const webId = session.isLoggedIn && session.webId ? session.webId : null;
  const fetchFn = typeof authFetch === "function" ? authFetch : fetch;

  const { data: agent, isLoading, error } = useQuery({
    queryKey: ["agent", webId],
    queryFn: () => fetchAndParseProfile(webId!, fetchFn),
    enabled: !!webId,
    gcTime: Number.POSITIVE_INFINITY,
  });

  useEffect(() => {
    if (!webId) {
      queryClient.clear();
    }
  }, [webId, queryClient]);

  return {
    webId,
    agent: agent ?? null,
    isLoading,
    error: error instanceof Error ? error : null,
  };
}
