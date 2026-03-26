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
  // ===== SKILLS =====

  // — Interpersonal / soft skills —
  CalmnessUnderPressure: ["calm", "calmness", "pressure", "composure"],
  EmpathyAndCompassion: ["empathy", "compassion", "compassionate", "empathetic", "caring"],
  PatienceAndUnderstanding: ["patience", "patient", "understanding"],
  ReliabilityAndTrustworthiness: ["reliable", "reliability", "trustworthy", "dependable"],
  CulturalSensitivity: ["cultural", "diversity", "inclusive", "sensitivity"],
  RespectForProfessionalBoundaries: ["professional", "boundaries", "safeguarding"],
  ActiveListening: ["listening", "listen", "listener"],
  ConfidenceEngagingWithPublicOrGroups: ["confidence", "confident", "engaging", "public"],
  ManagingConflictWithinTeams: ["conflict", "mediation", "teams", "teamwork"],
  SupportingOrMentoringNewVolunteers: ["mentoring", "mentor", "support", "supporting"],

  // — Communication skills —
  ClearSpokenCommunication: ["communication", "speaking", "verbal"],
  AbilityToRelayAccurateInformation: ["information", "relay", "accurate", "briefing"],
  AbilityToWorkCooperatively: ["cooperative", "teamwork", "collaborate", "team"],

  // — Specialist / technical skills —
  TraumaInformedAwareness: ["trauma", "trauma-informed", "safeguarding"],
  ConflictDeescalation: ["de-escalation", "conflict", "deescalation", "mediation"],
  SupportingPeopleViaPhoneOnline: ["phone", "online", "telephone", "remote", "helpline"],
  UseOfRadiosAndWalkieTalkies: ["radio", "walkie talkie", "communication"],
  LeadingSmallGroupsOrTasks: ["leading", "leadership", "leader", "groups"],
  IncidentReporting: ["incident", "reporting", "report"],
  RiskAwareness: ["risk", "risk assessment", "safety", "hazard"],
  BasicSafeguardingKnowledge: ["safeguarding", "child protection", "welfare"],
  UnderstandingEmergencyBriefingsAndInstructions: ["emergency", "briefing", "instructions"],
  BasicFirstAidKnowledge: ["first aid", "first aider", "medical"],
  FireSafetyAwareness: ["fire safety", "fire", "safety"],
  SafeManualHandling: ["manual handling", "lifting", "physical"],
  Logistics: ["logistics", "organising", "coordination", "supply"],
  ShelterSupport: ["shelter", "housing", "accommodation", "refuge"],
  Driving: ["driving", "driver", "transport"],
  PilotLicense: ["pilot", "aviation", "flying"],
  CrowdQueueManagement: ["crowd", "queue", "crowd management", "marshalling", "marshal"],
  NavigationAndOrientation: ["navigation", "orientation", "map", "route"],
  BasicRecordKeeping: ["record keeping", "records", "admin", "administration"],
  SimpleDataEntryAndReporting: ["data entry", "data", "reporting", "admin"],
  BasicITSkills: ["it skills", "computer", "digital", "software"],
  ConfidentSmartphoneUse: ["smartphone", "phone", "mobile", "app"],
  KnowledgeOfLocalRoadsFacilitiesResources: ["local", "roads", "facilities", "resources"],
  AwarenessOfLocalSupportServices: ["support services", "local services", "signposting"],

  // — Previously existing skills —
  FirstAid: ["first aid", "first aider", "medical"],
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

  // ===== CAUSES =====
  AnimalWelfare: ["animal welfare", "animals", "wildlife"],
  ArtsAndCulture: ["arts", "culture", "arts and culture", "creative"],
  ChildrenAndYouth: ["children", "youth", "young people"],
  CommunityDevelopment: ["community development", "community"],
  DisasterRelief: ["disaster relief", "emergency", "disaster", "emergency response"],
  Education: ["education", "learning", "teaching", "school"],
  EducationCause: ["education", "learning", "teaching", "school", "literacy"],
  ElderCare: ["elder care", "elderly", "older people", "senior"],
  Environment: ["environment", "conservation", "nature", "climate", "sustainability"],
  EnvironmentalConservation: ["conservation", "environment", "nature", "wildlife", "ecology"],
  FoodSecurity: ["food security", "food bank", "hunger", "food"],
  HealthAndWellness: ["health", "wellness", "wellbeing", "healthcare"],
  HomelessnessAndHousing: ["homelessness", "housing", "shelter", "homeless"],
  Homelessness: ["homelessness", "homeless", "rough sleeper", "street", "shelter"],
  HumanRights: ["human rights", "rights", "equality", "justice"],
  MentalHealth: ["mental health", "wellbeing", "counselling", "therapy"],
  PhysicalHealth: ["physical health", "health", "fitness", "wellbeing"],
  Poverty: ["poverty", "deprivation", "disadvantage"],
  RefugeeSupport: ["refugee", "asylum", "refugee support", "migrant"],
  ScienceAndTechnology: ["science", "technology", "stem"],
  SportAndRecreation: ["sport", "recreation", "fitness", "exercise"],
  Sports: ["sport", "sports", "fitness", "exercise", "athletic"],
  WomensRights: ["women", "women's rights", "gender equality"],
  YouthDevelopment: ["youth", "young people", "children", "child", "teenager"],
  Literacy: ["literacy", "reading", "writing", "books"],
  WildlifeProtection: ["wildlife", "animals", "conservation", "nature", "ecology"],
  ClimateAction: ["climate", "climate change", "sustainability", "environment", "carbon"],
  SustainableLiving: ["sustainable", "sustainability", "green", "eco", "environment"],
  SocialInclusion: ["inclusion", "inclusive", "social inclusion", "diversity", "belonging"],
  InternationalDevelopment: ["international", "global", "development", "overseas"],

  // ===== EQUIPMENT / REQUIREMENTS =====

  // — Physical readiness —
  PhysicalStamina: ["stamina", "physical", "fitness", "endurance"],
  AbilityToWorkOutdoors: ["outdoor", "outdoors", "outside", "field"],
  PersonalPreparedness: ["prepared", "preparedness", "readiness"],

  // — Comms & power —
  PhoneAndPowerBank: ["phone", "power bank", "mobile", "charged"],
  WalkieTalkiesOrRadios: ["walkie talkie", "radio", "radios", "communication"],
  ConfidentSmartphoneUse2: ["smartphone", "phone", "mobile"],

  // — Clothing & PPE —
  PPE: ["ppe", "protective equipment", "safety equipment"],
  SturdyFootwear: ["footwear", "boots", "shoes", "sturdy"],
  WaterproofsAndWarmLayers: ["waterproof", "warm", "layers", "clothing", "jacket"],
  Gloves: ["gloves", "protective"],
  HighVisibilityVest: ["hi vis", "hi-vis", "high visibility", "visible", "vest"],
  HeadtorchOrFlashlight: ["torch", "flashlight", "headtorch", "light"],

  // — Heavy equipment —
  PortableGeneratorOrPowerStation: ["generator", "power station", "power", "electricity"],
  WaterPump: ["water pump", "pump", "flooding", "flood"],
  ThermalBlankets: ["blanket", "blankets", "thermal", "warmth"],
  LifeJacket: ["life jacket", "buoyancy", "water safety"],
  PortableShelterOrGazebo: ["shelter", "gazebo", "tent", "canopy"],
  Tools: ["tools", "equipment", "hand tools"],
  VehicleWithTowCapability: ["vehicle", "tow", "towing", "car", "van"],
  Boat: ["boat", "watercraft", "vessel", "water rescue"],
  AccessToBicyclesOrCargoBikes: ["bicycle", "bike", "cargo bike", "cycling"],
  Kitchen: ["kitchen", "cooking", "food preparation", "catering"],
  Venue: ["venue", "hall", "space", "room", "premises"],
  WaterBottle: ["water bottle", "water", "hydration"],
  SmallPersonalFirstAidKit: ["first aid kit", "first aid", "medical kit"],

  // — Previously existing equipment —
  OwnCar: ["own car", "car", "vehicle", "4x4"],
  FourByFour: ["4x4", "four by four", "off road", "vehicle"],
  DBS: ["dbs", "dbs check", "criminal record check", "safeguarding"],
  DBSCheck: ["dbs", "dbs check", "criminal record check", "safeguarding"],
  HiVis: ["hi vis", "hi-vis", "high visibility"],
  Laptop: ["laptop", "computer"],
  SmartPhone: ["smartphone", "phone", "mobile"],
  WalkieTalkie: ["walkie talkie", "radio", "communication"],

  // ===== TIME-RELATED =====
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
 * For the fallback path, we produce BOTH the full multi-word phrase
 * (e.g. "trauma informed awareness") AND each individual word that is
 * ≥ 4 characters (e.g. "trauma", "informed", "awareness"). This ensures
 * that even unknown IRIs have a reasonable chance of matching free-text
 * opportunity descriptions.
 *
 * @example iriToKeywords("https://ns.volunteeringdata.io/FirstAid")
 *   → ["first aid", "first aider", "medical"]
 *
 * @example iriToKeywords("https://ns.volunteeringdata.io/SomeNewSkillHere")
 *   → ["some new skill here", "some", "skill", "here"]
 */
export function iriToKeywords(iri: string): string[] {
  const local = iriLocalName(iri);
  if (!local) return [];

  const overrides = LABEL_OVERRIDES[local];
  if (overrides) return overrides;

  // Fallback: split on CamelCase → full phrase + individual words (≥ 4 chars)
  const fullPhrase = camelToWords(local);
  if (!fullPhrase) return [];

  const words = fullPhrase.split(/\s+/).filter((w) => w.length >= 4);
  // Deduplicate: full phrase first, then individual words
  const result = [fullPhrase, ...words.filter((w) => w !== fullPhrase)];
  return [...new Set(result)];
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
