"use client";

import { Composer, MessageList, useAssistant, useFollowWindowScroll } from "./Assistant";

/**
 * The full-screen assistant at /ask.
 *
 * Deliberately bare: a line of explanation, the conversation, and the box you
 * type into. Nothing else.
 *
 * The page scrolls normally and the composer is `sticky` to the bottom of the
 * viewport, rather than the whole thing being a fixed-height column with its
 * own internal scrollbar.
 *
 * That is deliberate. A fixed-height column has to be told how tall the
 * viewport is, and on a phone there is no honest answer — the browser's own
 * toolbars appear and disappear as you scroll, so any number is wrong half
 * the time and the composer ends up either short of the bottom or just off
 * the screen. Sticky positioning needs no such number: the composer stays
 * against the bottom edge of whatever is actually visible, on every device.
 */
export function AskScreen() {
  const { messages } = useAssistant();

  useFollowWindowScroll(messages);

  return (
    <main
      id="main"
      className="flex min-h-[calc(100dvh-3.75rem)] flex-col md:min-h-screen"
    >
      {/* Conversation */}
      <div
        className="flex-1 px-5 py-8 sm:px-8"
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="mx-auto max-w-3xl">
          <h1 className="font-display text-2xl leading-tight sm:text-3xl">Ask</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            Ask anything about the systems built for Cross Services Group — what
            they do, who owns them, what they cost, what to do when one breaks.
            Answers come from this dashboard.
          </p>

          {messages.length > 0 ? (
            <div className="mt-8">
              <MessageList messages={messages} size="roomy" />
            </div>
          ) : null}
        </div>
      </div>

      {/* Composer — sticky, so it is against the bottom of the screen whether
          the conversation is empty or forty messages long. */}
      <div className="sticky bottom-0 border-t border-line bg-surface px-5 py-4 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <Composer
            autoFocus
            rows={3}
            placeholder="Ask anything about these systems…"
          />
        </div>
      </div>
    </main>
  );
}
