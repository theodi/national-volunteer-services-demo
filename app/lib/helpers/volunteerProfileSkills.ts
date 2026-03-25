/**
 * Volunteer profile: read-only access to the volunteer profile document at
 * {pod}/volunteer/profile.ttl.
 *
 * NVS only reads volunteer data — writing is handled by the
 * Volunteer Profile Manager app.
 *
 * Uses @rdfjs/wrapper VolunteerProfile for clean RDF access; N3 for parsing.
 * All functions are pure async — caching is handled by React Query at the hook layer.
 */

import { Parser, Store, DataFactory } from "n3";
import { wrapVolunteerProfile } from "@/app/lib/class/VolunteerProfile";
import { VOLUNTEERING_NS } from "@/app/lib/class/Vocabulary";

/** Location as read from the volunteer profile. */
export type SavedLocation = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  radiusKm: number;
};

/** Constructs the volunteer profile doc URL and subject IRI from the pod root. */
function volunteerProfileDoc(podRoot: string): { docUrl: string; subjectIri: string } {
  const base = podRoot.endsWith("/") ? podRoot : `${podRoot}/`;
  const docUrl = `${base}volunteer/profile.ttl`;
  return { docUrl, subjectIri: `${docUrl}#me` };
}

/** Parses turtle content into an N3 Store. Returns null on failure. */
function parseTurtle(content: string, baseIRI: string): Store | null {
  const store = new Store();
  try {
    store.addQuads(new Parser({ baseIRI }).parse(content));
    return store;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Generic read for any VolunteerProfile IRI-set property
// ---------------------------------------------------------------------------

type ProfileProperty = "skills" | "causes" | "equipment" | "preferredTimes";

async function readPropertyFromPod(
  fetchFn: typeof fetch,
  podRoot: string,
  property: ProfileProperty,
): Promise<string[]> {
  const { docUrl, subjectIri } = volunteerProfileDoc(podRoot);

  let response: Response;
  try {
    response = await fetchFn(docUrl, {
      method: "GET",
      headers: { Accept: "text/turtle, application/turtle" },
    });
  } catch {
    return [];
  }

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Failed to read ${property}: ${response.status}`);
  }

  const text = await response.text();
  if (!text.trim()) return [];

  const store = parseTurtle(text, docUrl);
  if (!store) return [];

  const profile = wrapVolunteerProfile(subjectIri, store, DataFactory);
  return [...profile[property]];
}

// ---------------------------------------------------------------------------
// Public API — read-only
// ---------------------------------------------------------------------------

export const readSkillsFromPod = (fetchFn: typeof fetch, podRoot: string) =>
  readPropertyFromPod(fetchFn, podRoot, "skills");

export const readCausesFromPod = (fetchFn: typeof fetch, podRoot: string) =>
  readPropertyFromPod(fetchFn, podRoot, "causes");

export const readEquipmentFromPod = (fetchFn: typeof fetch, podRoot: string) =>
  readPropertyFromPod(fetchFn, podRoot, "equipment");

/**
 * Reads locations from {pod}/volunteer/profile.ttl.
 */
export async function readLocationsFromPod(
  fetchFn: typeof fetch,
  podRoot: string,
): Promise<SavedLocation[]> {
  const { docUrl, subjectIri } = volunteerProfileDoc(podRoot);

  let response: Response;
  try {
    response = await fetchFn(docUrl, {
      method: "GET",
      headers: { Accept: "text/turtle, application/turtle" },
    });
  } catch {
    return [];
  }

  if (!response.ok) {
    if (response.status === 404) return [];
    throw new Error(`Failed to read locations: ${response.status}`);
  }

  const text = await response.text();
  if (!text.trim()) return [];

  const store = parseTurtle(text, docUrl);
  if (!store) return [];

  const profile = wrapVolunteerProfile(subjectIri, store, DataFactory);
  const locations: SavedLocation[] = [];
  for (const locNode of profile.locationNodes) {
    const pt = locNode.point;
    if (!pt) continue;
    const lat = pt.lat;
    const lon = pt.long;
    if (lat == null || lon == null) continue;
    locations.push({
      id: `${lat.toFixed(5)},${lon.toFixed(5)}`,
      label: locNode.label ?? "",
      lat,
      lng: lon,
      radiusKm: locNode.rad ?? 10,
    });
  }
  return locations;
}

// ---------------------------------------------------------------------------
// Availability helpers (read-only)
// ---------------------------------------------------------------------------

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const PERIOD_NAMES = ["Morning", "Afternoon", "Evening"] as const;

const PERIOD_HOURS: Record<string, number[]> = {
  Morning: [6, 7, 8, 9, 10, 11],
  Afternoon: [12, 13, 14, 15, 16, 17],
  Evening: [18, 19, 20, 21, 22, 23, 0],
};

const TIME_IRI_LOOKUP = new Map<string, { dayIdx: number; hours: number[] }>();
for (let d = 0; d < 7; d++) {
  for (const period of PERIOD_NAMES) {
    TIME_IRI_LOOKUP.set(`${VOLUNTEERING_NS}${DAY_NAMES[d]}${period}`, { dayIdx: d, hours: PERIOD_HOURS[period] });
  }
}

/** Expands composed time IRIs back into scheduler slot keys. */
export function timeIrisToSlots(iris: string[]): Set<string> {
  const slots = new Set<string>();
  for (const iri of iris) {
    const entry = TIME_IRI_LOOKUP.get(iri);
    if (!entry) continue;
    for (const h of entry.hours) {
      slots.add(`${entry.dayIdx}-${h}`);
    }
  }
  return slots;
}

/**
 * Reads preferred times from {pod}/volunteer/profile.ttl and returns
 * scheduler slot keys (Set<"dayIdx-hour">).
 */
export async function readTimesFromPod(
  fetchFn: typeof fetch,
  podRoot: string,
): Promise<Set<string>> {
  const iris = await readPropertyFromPod(fetchFn, podRoot, "preferredTimes");
  return timeIrisToSlots(iris);
}
