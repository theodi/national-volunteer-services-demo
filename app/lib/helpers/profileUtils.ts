import { Parser, Store, DataFactory } from "n3";
import { WebIdDataset } from "@/app/lib/class/WebIdDataset";
import type { Agent } from "@/app/lib/class/Agent";

/**
 * Fetches the WebID profile document, parses it as Turtle, and returns the
 * main Agent via @rdfjs/wrapper. Returns null if the fetch or parse fails.
 *
 * Pure async — caching and dedup are handled by React Query (useAgent hook).
 */
export async function fetchAndParseProfile(
  webId: string,
  fetchFn: typeof fetch = fetch,
): Promise<Agent | null> {
  const docUrl = webId.split("#")[0];

  let content: string;
  try {
    const res = await fetchFn(docUrl, {
      method: "GET",
      headers: { Accept: "text/turtle, application/turtle, text/n3, application/n3" },
    });
    if (!res.ok) return null;
    content = await res.text();
  } catch {
    return null;
  }

  const store = new Store();
  try {
    store.addQuads(new Parser({ baseIRI: docUrl }).parse(content));
  } catch {
    return null;
  }

  return new WebIdDataset(store, DataFactory).mainSubject ?? null;
}
