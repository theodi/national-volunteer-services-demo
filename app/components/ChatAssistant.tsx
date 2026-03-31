"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BellAlertIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

export interface ChatAssistantProps {
  onClick?: () => void;
}

type Sender = "bot" | "user";

interface ChatMessage {
  id: string;
  sender: Sender;
  text: string;
}

const BOT_RESPONSES: Record<string, string> = {
  "How do I find opportunities near me?":
    "Go to Opportunities, then choose 'Sort by: Distance'. Roles closest to your saved Pod location appear first.",
  "How is my match score calculated?":
    "Your score blends profile relevance and proximity. Skills, causes, and requirements from your Solid profile are compared to each role.",
  "Can I apply directly from here?":
    "Yes. Open any role and select Apply. The role link opens in a new tab so you can come back easily.",
  "What data are you using from my Pod?":
    "This demo reads volunteer profile details like skills, causes, and preferred locations to personalise matches.",
};

export function ChatAssistant({ onClick }: ChatAssistantProps) {
  const [showHint, setShowHint] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Hi, I am your assistant. Ask me anything about finding opportunities.",
    },
  ]);
  const panelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isBotTyping, isOpen]);

  const addBotReply = (prompt: string) => {
    const reply =
      BOT_RESPONSES[prompt] ??
      "Great question. In this prototype I can answer common onboarding queries. Try one of the quick questions.";

    setIsBotTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, sender: "bot", text: reply },
      ]);
      setIsBotTyping(false);
    }, 650);
  };

  const sendUserMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBotTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, sender: "user", text: trimmed },
    ]);
    setInputValue("");
    addBotReply(trimmed);
  };

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

            <div className="max-h-[340px] space-y-3 overflow-y-auto bg-linear-to-b from-blue-50/40 to-white px-4 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <p
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "rounded-br-md bg-blue-custom text-white"
                        : "rounded-bl-md border border-blue-100 bg-white text-slate-700"
                    }`}
                  >
                    {msg.text}
                  </p>
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

            <div className="space-y-3 border-t border-slate-100 px-4 py-3">
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
          onClick={() => {
            setIsOpen((prev) => !prev);
            onClick?.();
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-custom text-white shadow-lg transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 cursor-pointer"
        >
          <ChatBubbleLeftRightIcon className="h-7 w-7" aria-hidden />
        </button>
      </div>
    </div>
  );
}
