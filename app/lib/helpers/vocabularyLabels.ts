/**
 * Vocabulary-label mapping: converts volunteering-namespace IRIs to
 * human-readable lowercase keywords for text matching against the
 * Volunteering Data API responses.
 *
 * The volunteer profile stores values like:
 *   https://ns.volunteeringdata.io/FirstAid
 *   https://ns.volunteeringdata.io/AnimalWelfare
 *
 * We split on CamelCase boundaries and lowercase to produce keywords
 * such as "first aid" and "animal welfare", which can be matched
 * against opportunity `title` and `description` text.
 *
 * An explicit lookup table overrides the generic CamelCase splitter
 * for terms that benefit from aliases (e.g. "4x4" for FourByFour).
 */

import { VOLUNTEERING_NS } from "@/app/lib/class/Vocabulary";

// ---------------------------------------------------------------------------
// Explicit overrides — when the camelCase split isn't enough
// ---------------------------------------------------------------------------

const LABEL_OVERRIDES: Record<string, string[]> = {
  // Skills
  FirstAid: ["first aid", "first aider", "medical"],
  Driving: ["driving", "driver", "transport"],
  ManualHandling: ["manual handling", "physical", "lifting"],
  ITSkills: ["it skills", "it", "computer", "digital", "software"],
  CookingCatering: ["cooking", "catering", "food preparation"],
  Fundraising: ["fundraising", "fundraiser", "fund raising"],
  EventPlanning: ["event planning", "event management", "organising events"],
  Teaching: ["teaching", "tutoring", "education", "instructor"],
  Counselling: ["counselling", "counseling", "mental health support"],
  PublicSpeaking: ["public speaking", "communication", "presenting"],
  ProjectManagement: ["project management", "project manager"],
  Gardening: ["gardening", "horticulture", "landscaping"],
  DIY: ["diy", "maintenance", "repairs", "building"],
  Photography: ["photography", "photographer"],
  Translating: ["translating", "translation", "interpreter", "language"],
  SignLanguage: ["sign language", "bsl"],
  AnimalCare: ["animal care", "animal welfare", "animals"],
  SportCoaching: ["sport coaching", "sports", "coaching", "fitness"],
  Mentoring: ["mentoring", "mentor"],
  Administration: ["administration", "admin", "clerical"],
  SocialMedia: ["social media", "marketing", "online"],
  HealthAndSafety: ["health and safety", "health safety", "risk assessment"],

  // Equipment / requirements
  OwnCar: ["own car", "car", "vehicle", "4x4"],
  FourByFour: ["4x4", "four by four", "off road", "vehicle"],
  PPE: ["ppe", "protective equipment", "safety equipment"],
  DBS: ["dbs", "dbs check", "criminal record check", "safeguarding"],
  HiVis: ["hi vis", "hi-vis", "high visibility"],
  Laptop: ["laptop", "computer"],
  SmartPhone: ["smartphone", "phone", "mobile"],
  WalkieTalkie: ["walkie talkie", "radio", "communication"],

  // Causes
  AnimalWelfare: ["animal welfare", "animals", "wildlife"],
  ArtsAndCulture: ["arts", "culture", "arts and culture", "creative"],
  ChildrenAndYouth: ["children", "youth", "young people"],
  CommunityDevelopment: ["community development", "community"],
  DisasterRelief: ["disaster relief", "emergency", "disaster", "emergency response"],
  Education: ["education", "learning", "teaching", "school"],
  ElderCare: ["elder care", "elderly", "older people", "senior"],
  Environment: ["environment", "conservation", "nature", "climate", "sustainability"],
  FoodSecurity: ["food security", "food bank", "hunger", "food"],
  HealthAndWellness: ["health", "wellness", "wellbeing", "healthcare"],
  HomelessnessAndHousing: ["homelessness", "housing", "shelter", "homeless"],
  HumanRights: ["human rights", "rights", "equality", "justice"],
  MentalHealth: ["mental health", "wellbeing", "counselling"],
  Poverty: ["poverty", "deprivation"],
  RefugeeSupport: ["refugee", "asylum", "refugee support", "migrant"],
  ScienceAndTechnology: ["science", "technology", "stem"],
  SportAndRecreation: ["sport", "recreation", "fitness", "exercise"],
  WomensRights: ["women", "women's rights", "gender equality"],

  // Time-related (not typically matched against text, but included for completeness)
  MondayMorning: ["monday morning"],
  MondayAfternoon: ["monday afternoon"],
  MondayEvening: ["monday evening"],
  TuesdayMorning: ["tuesday morning"],
  TuesdayAfternoon: ["tuesday afternoon"],
  TuesdayEvening: ["tuesday evening"],
  WednesdayMorning: ["wednesday morning"],
  WednesdayAfternoon: ["wednesday afternoon"],
  WednesdayEvening: ["wednesday evening"],
  ThursdayMorning: ["thursday morning"],
  ThursdayAfternoon: ["thursday afternoon"],
  ThursdayEvening: ["thursday evening"],
  FridayMorning: ["friday morning"],
  FridayAfternoon: ["friday afternoon"],
  FridayEvening: ["friday evening"],
  SaturdayMorning: ["saturday morning"],
  SaturdayAfternoon: ["saturday afternoon"],
  SaturdayEvening: ["saturday evening"],
  SundayMorning: ["sunday morning"],
  SundayAfternoon: ["sunday afternoon"],
  SundayEvening: ["sunday evening"],
};

// ---------------------------------------------------------------------------
// Generic CamelCase → "human words" fallback
// ---------------------------------------------------------------------------

/**
 * Splits "CamelCaseWord" → "camel case word".
 * Handles sequences of capitals like "ITSkills" → "it skills".
 */
function camelToWords(str: string): string {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .trim();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Extracts the local name from a VOLUNTEERING_NS IRI.
 * Returns null if the IRI doesn't belong to the namespace.
 *
 * @example iriLocalName("https://ns.volunteeringdata.io/FirstAid") → "FirstAid"
 */
export function iriLocalName(iri: string): string | null {
  if (!iri.startsWith(VOLUNTEERING_NS)) return null;
  return iri.slice(VOLUNTEERING_NS.length) || null;
}

/**
 * Returns human-readable keyword aliases for a volunteering namespace IRI.
 * Falls back to CamelCase splitting if no explicit override exists.
 *
 * @example iriToKeywords("https://ns.volunteeringdata.io/FirstAid")
 *   → ["first aid", "first aider", "medical"]
 */
export function iriToKeywords(iri: string): string[] {
  const local = iriLocalName(iri);
  if (!local) return [];

  const overrides = LABEL_OVERRIDES[local];
  if (overrides) return overrides;

  // Fallback: split on CamelCase
  const fallback = camelToWords(local);
  return fallback ? [fallback] : [];
}

/**
 * Converts a set of IRIs into a flat set of lowercase keywords.
 * Useful for building a keyword bag from the user's Pod profile.
 *
 * @example irisToKeywordSet(new Set(["https://ns.volunteeringdata.io/FirstAid", ...]))
 *   → Set {"first aid", "first aider", "medical", ...}
 */
export function irisToKeywordSet(iris: Iterable<string>): Set<string> {
  const keywords = new Set<string>();
  for (const iri of iris) {
    for (const kw of iriToKeywords(iri)) {
      keywords.add(kw);
    }
  }
  return keywords;
}
