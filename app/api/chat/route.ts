import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSystemPrompt } from "@/app/lib/chat/systemPrompt";
import type {
  ChatRequestBody,
  ChatResponseBody,
  OpportunityResult,
} from "@/app/lib/chat/types";

// ---------------------------------------------------------------------------
// OpenAI client (server-side only)
// ---------------------------------------------------------------------------

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });

/**
 * How many opportunity summaries to include in the GPT tool response.
 * Keeps token usage sane — the client already has the full list.
 */
const GPT_CONTEXT_LIMIT = 20;

// ---------------------------------------------------------------------------
// Tool definition for OpenAI function calling
// ---------------------------------------------------------------------------

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_opportunities",
      description:
        "Retrieve the volunteering opportunities that have already been loaded and matched for the user. Call this whenever the user asks to see, search, or browse opportunities.",
      parameters: { type: "object", properties: {} },
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

  // Client-provided opportunities (already fetched + matched on the client)
  const clientOpportunities: OpportunityResult[] = body.opportunities ?? [];

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
    let shouldReturnOpportunities = false;

    // Detect if the user's latest message looks like an opportunity request.
    const lastUserContent = body.conversation
      .filter((m) => m.role === "user")
      .at(-1)?.content?.toLowerCase() ?? "";
    const looksLikeOppRequest = /\b(opportunit|recommend|find|show|search|more|another|different|suggest|looking for|need|want)\b/i.test(lastUserContent);

    let completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.7,
      max_tokens: 1024,
    });

    let choice = completion.choices[0];

    // Handle tool calls — GPT calls get_opportunities, we return client data
    let iterations = 0;
    while (choice?.finish_reason === "tool_calls" && choice.message.tool_calls && iterations < 3) {
      iterations++;
      messages.push(choice.message);

      for (const toolCall of choice.message.tool_calls) {
        if (!("function" in toolCall)) continue;
        if (toolCall.function.name === "get_opportunities") {
          shouldReturnOpportunities = true;
          // Feed GPT a subset of the client opportunities so it can write a reply
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(clientOpportunities.slice(0, GPT_CONTEXT_LIMIT)),
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

    // Safety net: if the user asked for opportunities but GPT didn't call the
    // tool, force a retry with tool_choice: "required".
    if (looksLikeOppRequest && !shouldReturnOpportunities && clientOpportunities.length > 0) {
      completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        tools: TOOLS,
        tool_choice: "required",
        temperature: 0.7,
        max_tokens: 1024,
      });
      choice = completion.choices[0];

      if (choice?.message?.tool_calls) {
        messages.push(choice.message);
        for (const toolCall of choice.message.tool_calls) {
          if (!("function" in toolCall)) continue;
          if (toolCall.function.name === "get_opportunities") {
            shouldReturnOpportunities = true;
            messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(clientOpportunities.slice(0, GPT_CONTEXT_LIMIT)),
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
    }

    const reply = choice?.message?.content ?? "I couldn't generate a response. Please try again.";

    const responseBody: ChatResponseBody = {
      reply,
      // Return the full client opportunity set when GPT triggered the tool
      opportunities: shouldReturnOpportunities ? clientOpportunities : undefined,
    };

    return NextResponse.json(responseBody);
  } catch (err) {
    console.error("Chat API error:", err instanceof Error ? err.stack ?? err.message : err);
    return NextResponse.json(
      {
        reply: "Sorry, I encountered an error. Please try again shortly.",
      } satisfies ChatResponseBody,
      { status: 500 },
    );
  }
}
