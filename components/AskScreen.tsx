"use client";

import Link from "next/link";
import {
  Composer,
  MessageList,
  SUGGESTION_GROUPS,
  useAssistant,
  useFollowWindowScroll,
} from "./Assistant";

/**
 * The full-screen assistant at /ask.
 *
 * The page scrolls normally and the box you type into is `sticky` to the
 * bottom of the viewport, rather than the whole thing being a fixed-height
 * column with its own internal scrollbar.
 *
 * That is deliberate. A fixed-height column has to be told how tall the
 * viewport is, and on a phone there is no honest answer — the browser's own
 * toolbars appear and disappear as you scroll, so any number is wrong half
 * the time and the composer ends up either short of the bottom or just off
 * the screen. Sticky positioning needs no such number: the composer stays
 * against the bottom edge of whatever is actually visible, on every device.
 */
export function AskScreen() {
  const { messages, isStreaming, send, reset } = useAssistant();

  useFollowWindowScroll(messages);

  const isEmpty = messages.length === 0;

  return (
    <main
      id="main"
      className="flex min-h-[calc(100dvh-3.75rem)] flex-col md:min-h-screen"
    >
      {/* Header */}
      <div className="border-b border-line px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-3xl items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="type-eyebrow text-muted">Assistant</p>
            <h1 className="mt-1 font-display text-2xl leading-tight sm:text-3xl">
              Ask
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-muted">
              Ask anything about the systems built for Cross Services Group —
              what they do, who owns them, what they cost, what to do when one
              breaks. Answers come from this dashboard, with links to the page,
              the account or the vault entry you need.
            </p>
          </div>

          {!isEmpty ? (
            <button
              type="button"
              onClick={reset}
              className="shrink-0 border border-line px-3 py-2 text-[14px] hover:bg-[#efeeea]"
              style={{ borderRadius: "var(--radius-control)" }}
            >
              New conversation
            </button>
          ) : null}
        </div>
      </div>

      {/* Conversation */}
      <div
        className="flex-1 px-5 py-6 sm:px-8"
        aria-live="polite"
        aria-atomic="false"
      >
        <div className="mx-auto max-w-3xl">
          {isEmpty ? (
            <EmptyState onPick={send} />
          ) : (
            <MessageList messages={messages} size="roomy" />
          )}
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
            hint={
              <span>
                {isStreaming
                  ? "Answering…"
                  : "Enter to send · Shift+Enter for a new line"}
              </span>
            }
          />
          <p className="mt-2 text-[13px] leading-snug text-muted">
            This assistant reads the dashboard. It does not have access to
            passwords, and it cannot change anything — it can only tell you and
            point you at where to go.
          </p>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------
   Empty state

   The hardest part of a blank chat box is knowing what it is for. These are
   real questions with real answers in the content, grouped by the reason
   somebody would be here.
   ------------------------------------------------------------------------- */

function EmptyState({ onPick }: { onPick: (question: string) => void }) {
  return (
    <div>
      <p className="type-eyebrow mb-4 text-muted">Try one of these</p>

      <div className="grid gap-6 sm:grid-cols-2">
        {SUGGESTION_GROUPS.map((group) => (
          <section key={group.heading}>
            <h2 className="mb-2 text-[15px] font-semibold text-ink">
              {group.heading}
            </h2>
            <ul className="space-y-1.5">
              {group.questions.map((question) => (
                <li key={question}>
                  <button
                    type="button"
                    onClick={() => onPick(question)}
                    className="w-full border border-line bg-surface px-3 py-2 text-left text-[14px] leading-snug hover:border-cross-blue hover:bg-[#eaeef4]"
                    style={{ borderRadius: "var(--radius-control)" }}
                  >
                    {question}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div
        className="mt-8 border border-line bg-surface px-4 py-3"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <p className="type-eyebrow text-muted">What it will not do</p>
        <p className="mt-2 text-[15px] leading-relaxed">
          It will not guess. If the dashboard does not record who owns an
          account or when something renews, it says so and points you at the
          page where that answer belongs — rather than inventing one that
          somebody then acts on. Where something is unconfirmed or overdue, it
          tells you that first.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed">
          If an answer looks wrong, the dashboard itself is the record — check{" "}
          <Link href="/todos" className="text-cross-blue underline">
            the to-do list
          </Link>{" "}
          for what is known to be unconfirmed.
        </p>
      </div>
    </div>
  );
}
