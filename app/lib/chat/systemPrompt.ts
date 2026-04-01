import type { ChatProfile } from "@/app/lib/chat/types";

const BASE_PROMPT = `You are a helpful volunteering assistant for the UK National Volunteer Services.
The user is already authenticated and has shared their Solid Pod volunteer profile with you.
Your role is to help them find volunteering opportunities that match their interests, skills, and location.

Guidelines:
- Use the user's profile as helpful background context, but let the conversation guide your recommendations.
- When the user asks for opportunities, use the search_opportunities tool to fetch real data. Never fabricate opportunity details.
- Keep responses concise, friendly, and helpful.
- When presenting opportunities, highlight why each one is relevant to the user.
- If the user asks about something unrelated to volunteering, gently guide them back.
- You may ask clarifying questions about preferences (location, type of work, availability) before searching.`;

export function buildSystemPrompt(profile?: ChatProfile): string {
  if (!profile) return BASE_PROMPT;

  const parts = [BASE_PROMPT, "\n\nUser's volunteer profile:"];

  if (profile.skills.length > 0) {
    parts.push(`- Skills: ${profile.skills.join(", ")}`);
  }
  if (profile.causes.length > 0) {
    parts.push(`- Causes they care about: ${profile.causes.join(", ")}`);
  }
  if (profile.equipment.length > 0) {
    parts.push(`- Equipment/requirements: ${profile.equipment.join(", ")}`);
  }
  if (profile.locations.length > 0) {
    const locDescs = profile.locations.map(
      (l) => `${l.label} (${l.lat.toFixed(4)}, ${l.lng.toFixed(4)}, radius ${l.radiusKm}km)`,
    );
    parts.push(`- Preferred locations: ${locDescs.join("; ")}`);
  }

  return parts.join("\n");
}
