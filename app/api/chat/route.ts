import Anthropic from "@anthropic-ai/sdk";
import { type NextRequest } from "next/server";
import { ASSISTANT_MODEL, getSystemPrompt } from "@/lib/assistant";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";

/**
 * The chatbot's endpoint.
 *
 * Takes the conversation so far, sends it to Claude with the whole dashboard
 * as the system prompt, and streams the reply back a fragment at a time.
 *
 * Runs on the Node runtime, not Edge: lib/assistant reads /content off disk
 * with node:fs at request time.
 */
export const runtime = "nodejs";

/** Never prerendered or cached — every request is a different conversation. */
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------
   Limits

   These exist to stop one open tab, or one crafted request, running up a bill
   nobody authorised. They are deliberately generous for a real conversation
   and deliberately hard stops for anything else.
   ------------------------------------------------------------------------- */

/** Characters in a single message. Roughly two pages of pasted text. */
const MAX_MESSAGE_CHARS = 8000;

/** Turns kept in one conversation. Past this the client must start a new chat. */
const MAX_MESSAGES = 40;

/** Ceiling on one reply. Covers thinking as well as the visible answer. */
const MAX_TOKENS = 8000;

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * The wire format back to the browser: newline-delimited JSON, one object per
 * line. Plain text would be simpler, but there would then be no way to
 * distinguish an error that happens mid-stream from the answer itself — the
 * failure would arrive looking like something Claude had said.
 */
type StreamEvent =
  | { type: "text"; text: string }
  | { type: "error"; message: string };

function jsonError(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

/* -------------------------------------------------------------------------
   Input validation
   ------------------------------------------------------------------------- */

function parseMessages(body: unknown): ChatMessage[] | string {
  if (typeof body !== "object" || body === null || !("messages" in body)) {
    return "Expected a messages array.";
  }

  const raw = (body as { messages: unknown }).messages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return "Expected at least one message.";
  }
  if (raw.length > MAX_MESSAGES) {
    return `This conversation has reached ${MAX_MESSAGES} messages. Start a new chat.`;
  }

  const messages: ChatMessage[] = [];
  for (const item of raw) {
    if (typeof item !== "object" || item === null) return "Malformed message.";
    const { role, content } = item as { role?: unknown; content?: unknown };

    if (role !== "user" && role !== "assistant") return "Unknown message role.";
    if (typeof content !== "string") return "Message content must be text.";

    const trimmed = content.trim();
    if (!trimmed) return "Empty message.";
    if (trimmed.length > MAX_MESSAGE_CHARS) {
      return `That message is too long. Keep it under ${MAX_MESSAGE_CHARS.toLocaleString()} characters.`;
    }

    messages.push({ role, content: trimmed });
  }

  // The API requires the first turn to be the user's, and it is the client's
  // job to send a conversation that ends on one.
  if (messages[0].role !== "user") return "A conversation must start with a question.";
  if (messages[messages.length - 1].role !== "user") {
    return "The last message must be a question.";
  }

  return messages;
}

/* -------------------------------------------------------------------------
   Handler
   ------------------------------------------------------------------------- */

export async function POST(request: NextRequest) {
  /*
   * Authentication is done HERE, not in middleware.
   *
   * middleware.ts excludes the whole /api path from the password gate — it has
   * to, because /api/login must be reachable before anyone has a session, and
   * the matcher cannot express a sub-path exclusion (see the comment there).
   * Without this check the endpoint would be open to the internet, and anyone
   * who found it could read every account and cost record on the site and
   * spend our API credits doing it.
   */
  const secret = process.env.SESSION_SECRET;
  if (!secret) return jsonError("The site is not configured.", 503);

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifyToken(token, secret))) {
    return jsonError("Not signed in. Reload the page and sign in again.", 401);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return jsonError(
      "The assistant is not configured — ANTHROPIC_API_KEY is not set.",
      503,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Could not read that request.", 400);
  }

  const parsed = parseMessages(body);
  if (typeof parsed === "string") return jsonError(parsed, 400);

  const client = new Anthropic({ apiKey });
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: StreamEvent) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));

      try {
        const response = client.messages.stream({
          model: ASSISTANT_MODEL,
          max_tokens: MAX_TOKENS,

          /*
           * The dashboard runs to roughly 40,000 tokens and is byte-identical
           * on every request, so it is cached rather than re-read each time.
           * The one-hour window is chosen over the default five minutes
           * because people ask a question, go and read the page it pointed
           * them at, then come back — five minutes expires in the gap and
           * every follow-up pays the full write cost again.
           */
          system: [
            {
              type: "text",
              text: getSystemPrompt(),
              cache_control: { type: "ephemeral", ttl: "1h" },
            },
          ],

          /*
           * Low effort. This is a lookup-and-explain job over documentation
           * that is already in context, not a reasoning problem, and a chat
           * window that takes fifteen seconds to start answering does not get
           * used twice. Raise this to "medium" or "high" if replies start
           * missing things.
           */
          output_config: { effort: "low" },

          messages: parsed,
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            send({ type: "text", text: event.delta.text });
          }
        }

        const final = await response.finalMessage();

        /*
         * One line per answer in the server log, which on Vercel is where
         * anyone asking "why is the Anthropic bill what it is" will look.
         *
         * `cacheRead` is the number that matters. It should be roughly the
         * size of the dashboard on every request after the first. If it is
         * persistently 0 then the cache is being missed and every question is
         * being billed at full price — the usual cause is something in
         * lib/assistant.ts having started to vary between requests.
         */
        const { usage } = final;
        console.log(
          `[chat] in=${usage.input_tokens} out=${usage.output_tokens} ` +
            `cacheRead=${usage.cache_read_input_tokens ?? 0} ` +
            `cacheWrite=${usage.cache_creation_input_tokens ?? 0} ` +
            `stop=${final.stop_reason}`,
        );

        // Claude's safety classifiers can decline a request outright. That
        // arrives as a successful response with no content, which would look
        // to the reader like the assistant simply ignored them.
        if (final.stop_reason === "refusal") {
          send({
            type: "error",
            message: "The assistant declined to answer that one.",
          });
        } else if (final.stop_reason === "max_tokens") {
          send({
            type: "error",
            message: "That answer was cut short. Ask for a shorter version, or ask about one part of it.",
          });
        }
      } catch (error) {
        // The reply is already streaming by the time most failures happen, so
        // there is no status code left to set — the error has to travel down
        // the stream as an event and be rendered in the chat window.
        console.error("[chat]", error);

        let message = "Something went wrong reaching the assistant. Try again.";
        if (error instanceof Anthropic.RateLimitError) {
          message = "Too many requests at once. Wait a moment and try again.";
        } else if (error instanceof Anthropic.AuthenticationError) {
          message = "The Anthropic API key is missing or invalid.";
        } else if (error instanceof Anthropic.APIConnectionError) {
          message = "Could not reach Anthropic. Check the connection and try again.";
        }

        send({ type: "error", message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      // Vercel and most proxies buffer responses without this, which turns a
      // streamed answer back into a long wait followed by a wall of text.
      "X-Accel-Buffering": "no",
    },
  });
}
