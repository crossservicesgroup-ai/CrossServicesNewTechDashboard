"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * The assistant's state and its shared pieces.
 *
 * There is one conversation, held here, and two ways into it: the docked
 * panel in the corner of every page, and the full screen at /ask. Somebody
 * who asks a question in the corner and then opens the full screen must find
 * their conversation waiting — two chat windows that each remember something
 * different read as a bug, not a feature.
 *
 * This provider sits in the shell, which is part of the dashboard layout, so
 * it survives navigation between pages. sessionStorage covers a reload on top
 * of that.
 */

type Role = "user" | "assistant";

export type Message = {
  role: Role;
  content: string;
  /** Set instead of content when the request failed. Never sent back to the API. */
  error?: string;
};

/** Survives a page reload, but not a new tab or a closed browser. This is a
 *  working conversation about a document, not something to keep. */
const STORAGE_KEY = "csg-assistant-thread";

type AssistantValue = {
  messages: Message[];
  isStreaming: boolean;
  send: (text: string) => void;
  stop: () => void;
  reset: () => void;
  isPanelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
};

const AssistantContext = createContext<AssistantValue | null>(null);

export function useAssistant(): AssistantValue {
  const value = useContext(AssistantContext);
  if (!value) {
    throw new Error("useAssistant must be used inside <AssistantProvider>");
  }
  return value;
}

/* -------------------------------------------------------------------------
   Provider
   ------------------------------------------------------------------------- */

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  /**
   * A mirror of `messages` that `send` can read without depending on it.
   * Without this, `send` would be rebuilt on every streamed fragment, and
   * every component reading this context would rerender with it.
   */
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Restored after mount rather than during render: sessionStorage does not
  // exist on the server, and reading it during render would make the first
  // client paint disagree with the server HTML.
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved) as Message[]);
    } catch {
      // A corrupt or unreadable store is not worth failing over. Start empty.
    }
  }, []);

  useEffect(() => {
    try {
      if (messages.length === 0) sessionStorage.removeItem(STORAGE_KEY);
      else sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Private browsing and full quotas both throw here. The conversation
      // still works, it just will not survive a reload.
    }
  }, [messages]);

  // Abandon an in-flight request if this ever unmounts, so the stream is not
  // left reading into a component that no longer exists.
  useEffect(() => () => abortRef.current?.abort(), []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setMessages([]);
  }, [stop]);

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);

  const send = useCallback(
    (text: string) => {
      const question = text.trim();
      if (!question) return;

      // One request at a time. Both entry points call this, so without the
      // guard the panel and the full screen could each start a stream.
      if (abortRef.current) return;

      // Errored turns are dropped from what goes to the API — a failed request
      // has no assistant reply, and sending the history with a gap in it would
      // be rejected as two user turns in a row.
      const history = messagesRef.current
        .filter((m) => !m.error)
        .map((m) => ({ role: m.role, content: m.content }));

      const outgoing = [...history, { role: "user" as const, content: question }];

      setMessages((prev) => [
        ...prev,
        { role: "user", content: question },
        { role: "assistant", content: "" },
      ]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      /**
       * Replaces the trailing (empty) assistant turn as text arrives.
       *
       * Does nothing if that turn is no longer there. Starting a new
       * conversation mid-stream empties the list while this request is still
       * unwinding, and writing into the end of an empty array would crash.
       */
      const updateReply = (mutate: (current: Message) => Message) =>
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== "assistant") return prev;
          const next = [...prev];
          next[next.length - 1] = mutate(last);
          return next;
        });

      void (async () => {
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: outgoing }),
            signal: controller.signal,
          });

          if (!response.ok || !response.body) {
            const detail = await response
              .json()
              .then((d: { error?: string }) => d.error)
              .catch(() => undefined);
            updateReply((m) => ({
              ...m,
              error: detail ?? `The assistant is unavailable (${response.status}).`,
            }));
            return;
          }

          // Newline-delimited JSON. A chunk can split a line in half, so
          // whatever follows the last newline is held back until more arrives.
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.trim()) continue;
              let event: { type: string; text?: string; message?: string };
              try {
                event = JSON.parse(line);
              } catch {
                continue; // Not a whole line yet, or not ours. Skip it.
              }

              if (event.type === "text" && event.text) {
                const chunk = event.text;
                updateReply((m) => ({ ...m, content: m.content + chunk }));
              } else if (event.type === "error") {
                const message = event.message ?? "Something went wrong.";
                updateReply((m) => ({ ...m, error: message }));
              }
            }
          }
        } catch (error) {
          // An abort is somebody pressing Stop, not a failure. Whatever had
          // already streamed in stays on screen.
          if (error instanceof DOMException && error.name === "AbortError") return;
          updateReply((m) => ({
            ...m,
            error: "Lost the connection to the assistant. Try again.",
          }));
        } finally {
          // Nothing came back at all — say so rather than leaving a blank bubble.
          updateReply((m) =>
            m.content || m.error
              ? m
              : { ...m, error: "The assistant returned nothing. Try again." },
          );
          setIsStreaming(false);
          abortRef.current = null;
        }
      })();
    },
    [],
  );

  const value = useMemo(
    () => ({
      messages,
      isStreaming,
      send,
      stop,
      reset,
      isPanelOpen,
      openPanel,
      closePanel,
    }),
    [messages, isStreaming, send, stop, reset, isPanelOpen, openPanel, closePanel],
  );

  return (
    <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
  );
}

/* -------------------------------------------------------------------------
   Suggested questions

   Only the corner panel offers these. The full screen at /ask is a plain
   chat box with nothing in it but the conversation.
   ------------------------------------------------------------------------- */

/** The handful shown in the corner panel. */
export const PANEL_SUGGESTIONS = [
  "What breaks first if I do nothing?",
  "Which accounts are not owned by CSG?",
  "What does all of this cost per month?",
  "The website is down — what do I do?",
];

/* -------------------------------------------------------------------------
   Reply rendering
   ------------------------------------------------------------------------- */

/**
 * Links are the point of the assistant, not decoration on it — an answer that
 * names the Vercel account is half an answer; one that hands over the vault
 * item is the whole thing. So the three kinds behave differently:
 *
 *   /systems/…   a page of this dashboard, routed client-side, instantly
 *   https://…    Bitwarden, Vercel, a spreadsheet — a new tab, so the
 *                conversation is not lost behind it
 *   #…           an anchor, left alone
 *
 * `onNavigate` lets the corner panel close itself when an internal link is
 * followed, since the page underneath is about to change.
 */
function linkRenderer(onNavigate?: () => void): Components["a"] {
  return function AssistantLink({ href, children, ...rest }) {
    const target = typeof href === "string" ? href : "";

    if (target.startsWith("/")) {
      return (
        <Link
          href={target}
          onClick={onNavigate}
          className="text-cross-blue underline underline-offset-2 hover:text-cross-blue-hover"
        >
          {children}
        </Link>
      );
    }

    const external = /^https?:/i.test(target);
    return (
      <a
        href={target}
        className="text-cross-blue underline underline-offset-2 hover:text-cross-blue-hover"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  };
}

/**
 * The same visual rules as the main document renderer, tightened up — the
 * spacing that suits a page of handover documentation leaves a three-line
 * chat reply full of holes.
 */
function replyComponents(onNavigate?: () => void): Components {
  return {
    p: (props) => (
      <p className="my-2 leading-relaxed first:mt-0 last:mb-0" {...props} />
    ),
    ul: (props) => <ul className="my-2 list-disc space-y-1 pl-5" {...props} />,
    ol: (props) => <ol className="my-2 list-decimal space-y-1 pl-5" {...props} />,
    li: (props) => <li className="leading-relaxed" {...props} />,

    h1: (props) => (
      <p className="mt-3 mb-1 font-semibold text-cross-navy" {...props} />
    ),
    h2: (props) => (
      <p className="mt-3 mb-1 font-semibold text-cross-navy" {...props} />
    ),
    h3: (props) => <p className="mt-3 mb-1 font-semibold text-ink" {...props} />,

    a: linkRenderer(onNavigate),

    code: ({ children, ...rest }) => (
      <code
        className="bg-[#eeeeec] px-1 py-0.5 font-mono text-[0.85em] [overflow-wrap:anywhere]"
        style={{ borderRadius: "2px" }}
        {...rest}
      >
        {children}
      </code>
    ),

    pre: ({ children, ...rest }) => (
      <pre
        className="my-2 overflow-x-auto border border-line bg-[#f4f4f2] p-3 font-mono text-[12px] leading-relaxed"
        style={{ borderRadius: "var(--radius-control)" }}
        {...rest}
      >
        {children}
      </pre>
    ),

    // Same reason as the document renderer: a wide table scrolls inside
    // itself rather than pushing the layout sideways.
    table: ({ children, ...rest }) => (
      <div className="my-3 max-w-full overflow-x-auto">
        <table className="w-full border-collapse text-[14px]" {...rest}>
          {children}
        </table>
      </div>
    ),
    thead: (props) => <thead className="border-b border-rule" {...props} />,
    th: (props) => (
      <th
        className="px-2 py-1 text-left align-bottom text-[12px] font-semibold"
        {...props}
      />
    ),
    td: (props) => (
      <td className="border-t border-line px-2 py-1 align-top" {...props} />
    ),

    blockquote: (props) => (
      <blockquote
        className="my-2 border-l-2 border-cross-navy pl-3 text-muted"
        {...props}
      />
    ),

    hr: () => <hr className="my-3 border-t border-line" />,
  };
}

export function Reply({
  children,
  onNavigate,
}: {
  children: string;
  onNavigate?: () => void;
}) {
  // Rebuilt only when the navigate handler changes, not on every streamed
  // fragment — this component rerenders many times per answer.
  const components = useMemo(() => replyComponents(onNavigate), [onNavigate]);

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}

/* -------------------------------------------------------------------------
   Shared message list
   ------------------------------------------------------------------------- */

export function MessageList({
  messages,
  onNavigate,
  size = "compact",
}: {
  messages: Message[];
  onNavigate?: () => void;
  /** The full screen has room to breathe; the corner panel does not. */
  size?: "compact" | "roomy";
}) {
  const text = size === "roomy" ? "text-[16px]" : "text-[15px]";
  const gap = size === "roomy" ? "space-y-6" : "space-y-4";

  return (
    <ul className={gap}>
      {messages.map((message, i) => (
        <li key={i}>
          {message.role === "user" ? (
            <div className="flex justify-end">
              <p
                className={`max-w-[85%] bg-[#eaeef4] px-3 py-2 leading-relaxed whitespace-pre-wrap ${text}`}
                style={{ borderRadius: "var(--radius-card)" }}
              >
                {message.content}
              </p>
            </div>
          ) : message.error ? (
            <div
              className="callout border-l-4 border-signal-risk bg-signal-risk-tint px-3 py-2"
              style={{ borderRadius: "var(--radius-control)" }}
            >
              {message.content ? (
                <div className={`mb-2 ${text}`}>
                  <Reply onNavigate={onNavigate}>{message.content}</Reply>
                </div>
              ) : null}
              <p className="type-eyebrow text-signal-risk">Failed</p>
              <p className="mt-1 text-[14px] leading-snug">{message.error}</p>
            </div>
          ) : message.content ? (
            <div className={text}>
              <Reply onNavigate={onNavigate}>{message.content}</Reply>
            </div>
          ) : (
            <p className={`text-muted ${text}`}>Thinking…</p>
          )}
        </li>
      ))}
    </ul>
  );
}

/* -------------------------------------------------------------------------
   Shared composer
   ------------------------------------------------------------------------- */

export function Composer({
  autoFocus = false,
  placeholder = "Ask about a system, an account, a cost…",
  hint,
  rows = 2,
  inputRef,
}: {
  autoFocus?: boolean;
  placeholder?: string;
  hint?: React.ReactNode;
  rows?: number;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const { send, stop, isStreaming } = useAssistant();
  const [draft, setDraft] = useState("");
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = inputRef ?? localRef;

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus, ref]);

  const submit = () => {
    if (!draft.trim() || isStreaming) return;
    send(draft);
    setDraft("");
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          // Enter sends, Shift+Enter starts a new line. The same convention as
          // every other chat window, so nobody has to learn it.
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        rows={rows}
        placeholder={placeholder}
        aria-label="Your question"
        className="w-full resize-none border border-line bg-paper px-3 py-2 text-[15px] outline-none focus:border-cross-blue"
        style={{ borderRadius: "var(--radius-control)" }}
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="type-eyebrow min-w-0 text-muted">{hint}</div>
        {isStreaming ? (
          <button
            type="button"
            onClick={stop}
            className="shrink-0 border border-line px-3 py-1.5 text-[14px] hover:bg-[#efeeea]"
            style={{ borderRadius: "var(--radius-control)" }}
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!draft.trim()}
            className="shrink-0 bg-cross-navy px-4 py-1.5 text-[14px] text-white hover:bg-cross-blue disabled:cursor-not-allowed disabled:bg-signal-none"
            style={{ borderRadius: "var(--radius-control)" }}
          >
            Send
          </button>
        )}
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------
   Scroll following

   Used by both surfaces: follow a streaming reply, but only when the reader
   is already at the bottom. Yanking the view down while somebody is
   re-reading an earlier answer is worse than letting new text arrive
   off-screen.
   ------------------------------------------------------------------------- */

export function useFollowScroll(
  ref: React.RefObject<HTMLElement | null>,
  dependency: unknown,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [ref, dependency]);
}

/**
 * The same rule for the full screen, where the page itself scrolls rather
 * than a box inside it.
 */
export function useFollowWindowScroll(dependency: unknown) {
  useEffect(() => {
    const nearBottom =
      document.documentElement.scrollHeight -
        window.scrollY -
        window.innerHeight <
      160;
    if (nearBottom) {
      window.scrollTo({ top: document.documentElement.scrollHeight });
    }
  }, [dependency]);
}
