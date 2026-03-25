/**
 * Client for the Volunteering Data API — activity_by_location endpoint.
 *
 * @see https://api.volunteeringdata.io
 *
 * We only read from this API — it's a public endpoint that returns
 * volunteering opportunities near a given coordinate.
 */

// ---------------------------------------------------------------------------
// API response types (mirrored from the live JSON response)
// ---------------------------------------------------------------------------

export interface ApiLocation {
  id: string;
  type: "Location";
  address: string;
  latitude: string; // stringified decimal, e.g. "51.7520209e0"
  longitude: string;
}

export interface ApiSession {
  id: string;
  type: "Session";
  location: ApiLocation[];
}

export interface ApiImage {
  id: string; // URL
}

export interface ApiOrganisation {
  id: string;
  type: "Organisation";
  description?: string;
  image?: ApiImage;
  name: string;
  website?: string;
}

export interface ApiRole {
  id: string;
  type: "Role";
  applyLink?: string;
}

export interface ApiDistance {
  value: string; // stringified decimal, e.g. "2965.2609430358602e0"
  type: string; // XSD double IRI
}

export interface ApiActivity {
  id: string;
  type: "Activity";
  title: string;
  description: string;
  distanceFromSearchLocation: ApiDistance;
  /** May be an inline object or a reference string (org ID). */
  organisation: ApiOrganisation | string;
  role: ApiRole[];
  session: ApiSession[];
}

export interface ApiResponse {
  id: string;
  activities: ApiActivity[];
  "@context": string;
}

// ---------------------------------------------------------------------------
// Normalised types (for internal use after parsing)
// ---------------------------------------------------------------------------

export interface OpportunityLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface Opportunity {
  /** API activity ID. */
  id: string;
  title: string;
  description: string;
  /** Metres from search centre. */
  distanceMetres: number;
  organisationName: string;
  organisationDescription?: string;
  organisationLogoUrl?: string;
  organisationWebsite?: string;
  applyLink?: string;
  locations: OpportunityLocation[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const API_BASE = "https://api.volunteeringdata.io/activity_by_location";

/** Parse the API's stringified scientific-notation number (e.g. "51.7520209e0"). */
function parseApiNumber(val: string): number {
  return Number.parseFloat(val);
}

/** Normalise an ApiActivity into our internal Opportunity shape. */
function normaliseActivity(activity: ApiActivity): Opportunity {
  const org =
    typeof activity.organisation === "string"
      ? { name: "Unknown Organisation" }
      : {
          name: activity.organisation.name,
          description: activity.organisation.description,
          logoUrl: activity.organisation.image?.id,
          website: activity.organisation.website,
        };

  const locations: OpportunityLocation[] = [];
  for (const session of activity.session) {
    for (const loc of session.location) {
      locations.push({
        address: loc.address,
        lat: parseApiNumber(loc.latitude),
        lng: parseApiNumber(loc.longitude),
      });
    }
  }

  return {
    id: activity.id,
    title: activity.title,
    description: activity.description,
    distanceMetres: parseApiNumber(activity.distanceFromSearchLocation.value),
    organisationName: org.name,
    organisationDescription: org.description,
    organisationLogoUrl: org.logoUrl,
    organisationWebsite: org.website,
    applyLink: activity.role[0]?.applyLink,
    locations,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface FetchOpportunitiesParams {
  lat: number;
  lon: number;
  /** Distance in metres. */
  distanceMetres: number;
}

/**
 * Fetches volunteering opportunities near a location from the
 * Volunteering Data API and normalises the response.
 *
 * @returns Normalised Opportunity[] sorted by distance (nearest first).
 */
export async function fetchOpportunities(
  params: FetchOpportunitiesParams,
): Promise<Opportunity[]> {
  const url = new URL(API_BASE);
  url.searchParams.set("lat", params.lat.toString());
  url.searchParams.set("lon", params.lon.toString());
  url.searchParams.set("distance", Math.round(params.distanceMetres).toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Volunteering API error: ${response.status} ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();

  return data.activities
    .map(normaliseActivity)
    .sort((a, b) => a.distanceMetres - b.distanceMetres);
}
