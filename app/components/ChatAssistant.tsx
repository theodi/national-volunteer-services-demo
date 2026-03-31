"use client";

import { useState } from "react";
import { BellAlertIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";

export interface ChatAssistantProps {
  onClick?: () => void;
}

export function ChatAssistant({ onClick }: ChatAssistantProps) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-60">
      <div className="relative flex items-end justify-end">
        <div
          id="chat-assistant-tooltip"
          role="tooltip"
          aria-hidden={!showHint}
          className={`pointer-events-none absolute bottom-18 right-16 w-[min(330px,80vw)] transition-all duration-200 ${
            showHint ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
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
          onClick={onClick}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-custom text-white shadow-lg transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 cursor-pointer"
        >
          <ChatBubbleLeftRightIcon className="h-7 w-7" aria-hidden />
        </button>
      </div>
    </div>
  );
}
