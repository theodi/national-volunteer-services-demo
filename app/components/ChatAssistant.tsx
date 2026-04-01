"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BellAlertIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";
import { useChatProfile } from "@/app/lib/chat/useChatProfile";
import type {
  ChatMessage,
  ChatRequestBody,
  ChatResponseBody,
  ConversationMessage,
} from "@/app/lib/chat/types";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi, I'm your volunteering assistant. Ask me anything about finding opportunities or about your profile.",
};

export function ChatAssistant() {
  const [showHint, setShowHint] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [profileSent, setProfileSent] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatProfile = useChatProfile();

  const canSend = useMemo(
    () => inputValue.trim().length > 0 && !isBotTyping,
    [inputValue, isBotTyping],
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isBotTyping, isOpen]);

  const buildConversation = useCallback(
    (allMessages: ChatMessage[]): ConversationMessage[] => {
      return allMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));
    },
    [],
  );

  const callChatApi = useCallback(
    async (allMessages: ChatMessage[]) => {
      const conversation = buildConversation(allMessages);
      const body: ChatRequestBody = { conversation };

      if (!profileSent && chatProfile) {
        body.profile = chatProfile;
        setProfileSent(true);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Chat API error: ${res.status}`);
      }

      return (await res.json()) as ChatResponseBody;
    },
    [buildConversation, chatProfile, profileSent],
  );

  const sendUserMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isBotTyping) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInputValue("");
      setIsBotTyping(true);

      try {
        const data = await callChatApi(updatedMessages);
        const botMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          opportunities: data.opportunities,
        };
        setMessages((prev) => [...prev, botMsg]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content:
              "Sorry, something went wrong. Please try again.",
          },
        ]);
      } finally {
        setIsBotTyping(false);
      }
    },
    [isBotTyping, messages, callChatApi],
  );

  return (
    <div className="fixed bottom-6 right-6 z-60">
      <div className="relative flex items-end justify-end">
        {isOpen && (
          <section
            ref={panelRef}
            aria-label="Chat assistant"
            className="absolute bottom-18 right-0 w-[min(380px,92vw)] overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between bg-blue-custom px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <BellAlertIcon className="h-5 w-5" aria-hidden />
                <p className="text-sm font-semibold">Chat Assistant</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                aria-label="Close chat assistant"
              >
                <XMarkIcon className="h-5 w-5" aria-hidden />
              </button>
            </header>

            <div
              aria-live="polite"
              aria-relevant="additions"
              className="max-h-[340px] space-y-3 overflow-y-auto bg-linear-to-b from-blue-50/40 to-white px-4 py-4"
            >
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <p
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "rounded-br-md bg-blue-custom text-white"
                          : "rounded-bl-md border border-blue-100 bg-white text-slate-700"
                      }`}
                    >
                      {msg.content}
                    </p>
                  </div>

                  {msg.opportunities && msg.opportunities.length > 0 && (
                    <div className="space-y-2 pl-1">
                      {msg.opportunities.slice(0, 3).map((opp) => (
                        <article
                          key={opp.id}
                          className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm"
                        >
                          <h4 className="text-xs font-bold text-blue-custom leading-tight">
                            {opp.title}
                          </h4>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {opp.organisationName}
                          </p>
                          <p className="mt-1 text-[11px] leading-relaxed text-slate-600 line-clamp-2">
                            {opp.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[10px] text-slate-400">
                              <MapPinIcon className="h-3 w-3" aria-hidden />
                              {opp.distanceText}
                            </span>
                            {opp.applyLink && (
                              <a
                                href={opp.applyLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded bg-blue-custom px-2 py-1 text-[10px] font-semibold text-white hover:brightness-95"
                              >
                                Apply
                              </a>
                            )}
                          </div>
                        </article>
                      ))}
                      {msg.opportunities.length > 3 && (
                        <Link
                          href="/opportunities"
                          className="block text-center text-xs font-medium text-blue-custom underline underline-offset-2 hover:text-earth-blue"
                        >
                          View all {msg.opportunities.length} opportunities
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isBotTyping && (
                <div className="flex justify-start">
                  <p className="rounded-2xl rounded-bl-md border border-blue-100 bg-white px-3 py-2 text-sm text-slate-500">
                    Assistant is typing...
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-100 px-4 py-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendUserMessage(inputValue);
                }}
                className="flex items-center gap-2"
              >
                <label htmlFor="chat-assistant-input" className="sr-only">
                  Type your question
                </label>
                <input
                  ref={inputRef}
                  id="chat-assistant-input"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your question..."
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-custom text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                  aria-label="Send message"
                >
                  <PaperAirplaneIcon className="h-4 w-4 -rotate-45" aria-hidden />
                </button>
              </form>
            </div>
          </section>
        )}

        <div
          id="chat-assistant-tooltip"
          role="tooltip"
          aria-hidden={!showHint}
          className={`pointer-events-none absolute bottom-18 right-16 w-[min(330px,80vw)] transition-all duration-200 ${
            showHint && !isOpen ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          <div className="relative rounded-2xl bg-blue-custom px-5 py-4 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <BellAlertIcon className="h-7 w-7 shrink-0 text-white" aria-hidden />
              <p className="text-sm font-semibold leading-6 sm:text-[1.05rem]">
                Hi, how are you doing? What can I help you with?
              </p>
            </div>
            <div
              aria-hidden
              className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 bg-blue-custom"
            />
          </div>
        </div>

        <button
          type="button"
          aria-label="Open chat assistant"
          aria-describedby="chat-assistant-tooltip"
          onMouseEnter={() => setShowHint(true)}
          onMouseLeave={() => setShowHint(false)}
          onFocus={() => setShowHint(true)}
          onBlur={() => setShowHint(false)}
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-custom text-white shadow-lg transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 cursor-pointer"
        >
          <ChatBubbleLeftRightIcon className="h-7 w-7" aria-hidden />
        </button>
      </div>
    </div>
  );
}
