/**
 * Shared types for the chat assistant feature.
 * Used by both the client (ChatAssistant component) and the server (POST /api/chat).
 */

// ---------------------------------------------------------------------------
// Volunteer profile (human-readable, sent to API on first turn)
// ---------------------------------------------------------------------------

export interface ChatProfileLocation {
  label: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

export interface ChatProfile {
  skills: string[];
  causes: string[];
  equipment: string[];
  locations: ChatProfileLocation[];
}

// ---------------------------------------------------------------------------
// OpenAI-compatible conversation message
// ---------------------------------------------------------------------------

export interface ConversationMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// ---------------------------------------------------------------------------
// Client-side chat message (extends ConversationMessage with UI metadata)
// ---------------------------------------------------------------------------

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  opportunities?: OpportunityResult[];
}

// ---------------------------------------------------------------------------
// Opportunity result for in-chat cards
// ---------------------------------------------------------------------------

export interface OpportunityResult {
  id: string;
  title: string;
  organisationName: string;
  description: string;
  distanceText: string;
  applyLink?: string;
}

// ---------------------------------------------------------------------------
// /api/chat request / response
// ---------------------------------------------------------------------------

export interface ChatRequestBody {
  conversation: ConversationMessage[];
  profile?: ChatProfile;
}

export interface ChatResponseBody {
  reply: string;
  opportunities?: OpportunityResult[];
}
