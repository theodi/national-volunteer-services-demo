/**
 * RDF vocabulary IRIs used by the NVS portal.
 *
 * We only read: name (vcard:fn), email (vcard:hasEmail), photo (vcard:hasPhoto),
 * storage (pim:storage / solid:storage), and the volunteer profile container.
 */

export const PIM = {
  storage: "http://www.w3.org/ns/pim/space#storage",
} as const;

export const SOLID = {
  oidcIssuer: "http://www.w3.org/ns/solid/terms#oidcIssuer",
  storage: "http://www.w3.org/ns/solid/terms#storage",
} as const;

export const VCARD = {
  fn: "http://www.w3.org/2006/vcard/ns#fn",
  hasEmail: "http://www.w3.org/2006/vcard/ns#hasEmail",
  /** Standard predicate for the value of an email/telephone/url node (W3C vCard ...#value). */
  value: "http://www.w3.org/2006/vcard/ns#value",
  hasPhoto: "http://www.w3.org/2006/vcard/ns#hasPhoto",
} as const;

/**
 * Volunteer Profile ontology (vp:) — profile predicates and classes.
 * @see https://github.com/theodi/volunteer-profile-manager/blob/main/src/ontology/volunteer.ttl
 */
export const VP = {
  VolunteerProfile: "https://id.volunteeringdata.io/volunteer-profile/VolunteerProfile",
  hasSkill: "https://id.volunteeringdata.io/volunteer-profile/hasSkill",
  preferredCause: "https://id.volunteeringdata.io/volunteer-profile/preferredCause",
  hasRequirement: "https://id.volunteeringdata.io/volunteer-profile/hasRequirement",
  PreferredLocation: "https://id.volunteeringdata.io/volunteer-profile/PreferredLocation",
  Point: "https://id.volunteeringdata.io/volunteer-profile/Point",
  preferredLocation: "https://id.volunteeringdata.io/volunteer-profile/preferredLocation",
  point: "https://id.volunteeringdata.io/volunteer-profile/point",
  /** Radius in kilometres. */
  rad: "https://id.volunteeringdata.io/volunteer-profile/rad",
  preferredTime: "https://id.volunteeringdata.io/volunteer-profile/preferredTime",
} as const;

/**
 * Volunteering Data Model namespace — taxonomy terms (skills, causes,
 * requirements) and pre-composed temporal entities (MondayMorning, etc.).
 * @see https://standard.volunteeringdata.io/ontology/
 */
export const VOLUNTEERING_NS = "https://ns.volunteeringdata.io/" as const;

/** W3C WGS84 Geo Positioning vocabulary. */
export const GEO = {
  lat: "http://www.w3.org/2003/01/geo/wgs84_pos#lat",
  long: "http://www.w3.org/2003/01/geo/wgs84_pos#long",
} as const;

export const RDFS = {
  label: "http://www.w3.org/2000/01/rdf-schema#label",
} as const;

