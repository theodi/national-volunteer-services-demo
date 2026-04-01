/**
 * Converts raw Pod volunteer profile data (IRI arrays + locations)
 * into the human-readable ChatProfile shape for the /api/chat route.
 */

import { iriLocalName } from "@/app/lib/helpers/vocabularyLabels";
import type { SavedLocation } from "@/app/lib/helpers/volunteerProfileSkills";
import type { ChatProfile, ChatProfileLocation } from "@/app/lib/chat/types";

function iriToLabel(iri: string): string {
  const local = iriLocalName(iri);
  if (!local) return iri;
  return local
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2");
}

function locationToChat(loc: SavedLocation): ChatProfileLocation {
  return {
    label: loc.label || `${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)}`,
    lat: loc.lat,
    lng: loc.lng,
    radiusKm: loc.radiusKm,
  };
}

export function serializeChatProfile(
  skillIris: string[],
  causeIris: string[],
  equipmentIris: string[],
  locations: SavedLocation[],
): ChatProfile {
  return {
    skills: skillIris.map(iriToLabel),
    causes: causeIris.map(iriToLabel),
    equipment: equipmentIris.map(iriToLabel),
    locations: locations.map(locationToChat),
  };
}
