import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt } from "@/app/lib/chat/systemPrompt";
import { fetchOpportunities } from "@/app/lib/helpers/opportunitiesApi";
import type {
  ChatRequestBody,
  ChatResponseBody,
  OpportunityResult,
} from "@/app/lib/chat/types";

// ---------------------------------------------------------------------------
// OpenAI client (server-side only)
// ---------------------------------------------------------------------------

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

// ---------------------------------------------------------------------------
// Volunteering API cache (in-memory, 5-min TTL)
// ---------------------------------------------------------------------------

interface CachedEntry {
  data: OpportunityResult[];
  expiresAt: number;
}

const opportunityCache = new Map<string, CachedEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function cacheKey(lat: number, lon: number, distance: number): string {
  return `${lat.toFixed(4)},${lon.toFixed(4)},${distance}`;
}

const METRES_PER_MILE = 1609.344;

function metresToMilesText(metres: number): string {
  const miles = metres / METRES_PER_MILE;
  if (miles < 0.1) return "Less than 0.1 miles away";
  return `${miles.toFixed(1)} miles away`;
}

async function fetchCachedOpportunities(
  lat: number,
  lon: number,
  distanceMetres: number,
): Promise<OpportunityResult[]> {
  const key = cacheKey(lat, lon, distanceMetres);
  const cached = opportunityCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const raw = await fetchOpportunities({ lat, lon, distanceMetres });
  const results: OpportunityResult[] = raw.slice(0, 15).map((opp) => ({
    id: opp.id,
    title: opp.title,
    organisationName: opp.organisationName,
    description:
      opp.description.length > 200
        ? `${opp.description.slice(0, 200).trimEnd()}…`
        : opp.description,
    distanceText: metresToMilesText(opp.distanceMetres),
    applyLink: opp.applyLink,
  }));

  opportunityCache.set(key, {
    data: results,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });

  return results;
}

// ---------------------------------------------------------------------------
// Tool definition for OpenAI function calling
// ---------------------------------------------------------------------------

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_opportunities",
      description:
        "Search for volunteering opportunities near a location. Returns a list of opportunities sorted by distance.",
      parameters: {
        type: "object",
        properties: {
          lat: { type: "number", description: "Latitude of search centre" },
          lon: { type: "number", description: "Longitude of search centre" },
          distance_metres: {
            type: "number",
            description: "Search radius in metres (e.g. 10000 for 10km)",
          },
        },
        required: ["lat", "lon", "distance_metres"],
      },
    },
  },
];

// ---------------------------------------------------------------------------
// POST /api/chat
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { reply: "Chat assistant is not configured. Please set OPENAI_API_KEY.", opportunities: [] },
      { status: 503 },
    );
  }

  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.conversation) || body.conversation.length === 0) {
    return NextResponse.json({ error: "conversation must be a non-empty array" }, { status: 400 });
  }

  const validRoles = new Set(["user", "assistant", "system"]);
  const isValid = body.conversation.every(
    (m) => validRoles.has(m.role) && typeof m.content === "string",
  );
  if (!isValid) {
    return NextResponse.json(
      { error: "Each message must have a valid role and string content" },
      { status: 400 },
    );
  }

  const systemMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
    role: "system",
    content: buildSystemPrompt(body.profile),
  };

  const conversationMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
    body.conversation.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    systemMessage,
    ...conversationMessages,
  ];

  try {
    let collectedOpportunities: OpportunityResult[] | undefined;

    let completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1024,
    });

    let choice = completion.choices[0];

    // Handle tool calls (may loop if model chains calls)
    let iterations = 0;
    while (choice?.finish_reason === "tool_calls" && choice.message.tool_calls && iterations < 3) {
      iterations++;
      const toolCalls = choice.message.tool_calls;

      messages.push(choice.message);

      for (const toolCall of toolCalls) {
        if (!("function" in toolCall)) continue;
        if (toolCall.function.name === "search_opportunities") {
          let args: { lat: number; lon: number; distance_metres: number };
          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch {
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify({ error: "Invalid arguments" }),
            });
            continue;
          }

          const opportunities = await fetchCachedOpportunities(
            args.lat,
            args.lon,
            args.distance_metres,
          );
          collectedOpportunities = opportunities;

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(opportunities),
          });
        }
      }

      completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        tools: TOOLS,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 1024,
      });

      choice = completion.choices[0];
    }

    const reply = choice?.message?.content ?? "I couldn't generate a response. Please try again.";

    const responseBody: ChatResponseBody = {
      reply,
      opportunities: collectedOpportunities,
    };

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error("Chat API error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      {
        reply: "Sorry, I encountered an error. Please try again shortly.",
      } satisfies ChatResponseBody,
      { status: 500 },
    );
  }
}
