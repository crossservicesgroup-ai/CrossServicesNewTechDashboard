"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  Composer,
  MessageList,
  PANEL_SUGGESTIONS,
  useAssistant,
  useFollowScroll,
} from "./Assistant";

/**
 * The assistant in the corner of every page.
 *
 * A docked window rather than a modal: it sits over the corner and leaves the
 * rest of the site readable and scrollable behind it, because the common use
 * is asking about the page you are looking at.
 *
 * It shares one conversation with the full screen at /ask — see
 * AssistantProvider. Anything asked here is waiting there, and the reverse.
 */
export function AssistantPanel() {
  const { messages, send, reset, isPanelOpen, openPanel, closePanel } =
    useAssistant();
  const pathname = usePathname();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useFollowScroll(scrollRef, messages);

  const onAskPage = pathname === "/ask";

  // The full screen is the same conversation. Showing the panel on top of it
  // would be the same chat twice on one screen.
  useEffect(() => {
    if (onAskPage) closePanel();
  }, [onAskPage, closePanel]);

  useEffect(() => {
    if (isPanelOpen) inputRef.current?.focus();
  }, [isPanelOpen]);

  useEffect(() => {
    if (!isPanelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isPanelOpen, closePanel]);

  if (onAskPage) return null;

  /* --- trigger ---------------------------------------------------------- */

  if (!isPanelOpen) {
    return (
      <button
        type="button"
        onClick={openPanel}
        className="no-print fixed right-4 bottom-4 z-40 flex items-center gap-2 border border-line bg-cross-navy px-4 py-3 text-[15px] text-white shadow-lg hover:bg-cross-blue"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <span aria-hidden="true">💬</span>
        Ask a question
        {messages.length > 0 ? (
          <span
            className="type-eyebrow border border-white/40 px-1.5 py-0.5"
            style={{ borderRadius: "2px" }}
          >
            {messages.filter((m) => m.role === "user").length}
          </span>
        ) : null}
      </button>
    );
  }

  /* --- panel ------------------------------------------------------------ */

  return (
    <section
      aria-label="Assistant"
      className="no-print fixed inset-x-0 bottom-0 z-40 flex max-h-[85vh] flex-col border-t border-line bg-surface shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4 sm:h-[38rem] sm:max-h-[calc(100vh-2rem)] sm:w-[26rem] sm:border"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <header className="flex shrink-0 items-start justify-between gap-2 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="type-eyebrow text-muted">Assistant</p>
          <p className="mt-1 font-display text-lg leading-tight text-cross-navy">
            Ask about these systems
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {messages.length > 0 ? (
            <button
              type="button"
              onClick={reset}
              className="border border-line px-2 py-1.5 text-[13px] hover:bg-[#efeeea]"
              style={{ borderRadius: "var(--radius-control)" }}
            >
              New
            </button>
          ) : null}
          <button
            type="button"
            onClick={closePanel}
            aria-label="Close assistant"
            className="border border-line px-2 py-1.5 text-[13px] hover:bg-[#efeeea]"
            style={{ borderRadius: "var(--radius-control)" }}
          >
            Close
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
        // Replies arrive a fragment at a time. Without this a screen reader
        // would announce each fragment as it lands; polite means it waits for
        // a pause and reads the answer.
        aria-live="polite"
        aria-atomic="false"
      >
        {messages.length === 0 ? (
          <div>
            <p className="text-[15px] leading-relaxed text-muted">
              Answers come from this dashboard — the systems, accounts, costs,
              runbooks and open items. It will tell you when something is not
              recorded here rather than guessing.
            </p>
            <p className="type-eyebrow mt-6 mb-2 text-muted">Try</p>
            <ul className="space-y-1.5">
              {PANEL_SUGGESTIONS.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => send(suggestion)}
                    className="w-full border border-line bg-paper px-3 py-2 text-left text-[14px] leading-snug hover:border-cross-blue"
                    style={{ borderRadius: "var(--radius-control)" }}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <MessageList messages={messages} onNavigate={closePanel} />
        )}
      </div>

      <div className="shrink-0 border-t border-line p-3">
        <Composer
          inputRef={inputRef}
          hint={
            <span>
              Enter to send ·{" "}
              <Link href="/ask" className="text-cross-blue underline">
                Open full screen
              </Link>
            </span>
          }
        />
      </div>
    </section>
  );
}
