import { getAllDocs, getAllTodos } from "./content";
import { formatMoney, getAccounts, getSpend, getSpendTotals } from "./data";

/**
 * The assistant's knowledge.
 *
 * The chatbot answers from this dashboard's own content, so the whole of
 * /content is flattened into one text block and handed to Claude as the
 * system prompt. There is no retrieval step and no vector database: the
 * entire corpus is about 40,000 tokens, which fits many times over inside
 * the model's context window. Adding a search layer would be more moving
 * parts to maintain and would let the assistant miss things this way cannot.
 *
 * That block is identical on every request, which is exactly what prompt
 * caching wants — see the cache_control marker in app/api/chat/route.ts.
 * Nothing in this file may include a timestamp, a random value or anything
 * else that varies per request, or the cache is invalidated on every message
 * and each one is billed at full price.
 */

/** Which model answers. Opus 5 — the reasoning quality is worth it here, and
 *  the effort level in the route keeps latency and cost down. */
export const ASSISTANT_MODEL = "claude-opus-5";

/* -------------------------------------------------------------------------
   Knowledge base
   ------------------------------------------------------------------------- */

/**
 * Every markdown document, whole. The technical halves are included too — a
 * reader who asks an operator-level question deserves the operator-level
 * answer, and the model is told below which half a fact came from so it can
 * pitch the reply correctly.
 */
function documentsSection(): string {
  return getAllDocs()
    .map((doc) => {
      const meta = [
        `Section: ${doc.section}`,
        `Page in this dashboard: ${doc.href}`,
        `Status: ${doc.status}`,
        `Owner: ${doc.owner}`,
        doc.liveUrl ? `Live URL: ${doc.liveUrl}` : null,
        doc.repo ? `Repository: ${doc.repo}` : null,
        doc.lastReviewed ? `Last reviewed: ${doc.lastReviewed}` : null,
        doc.summary ? `Summary: ${doc.summary}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      return [
        `## ${doc.title}`,
        meta,
        "",
        doc.bodyMain,
        doc.bodyTechnical
          ? `\n### Technical detail (for whoever operates this)\n\n${doc.bodyTechnical}`
          : "",
      ]
        .join("\n")
        .trim();
    })
    .join("\n\n---\n\n");
}

/**
 * Accounts, as prose rather than raw JSON. The model reads either perfectly
 * well, but prose keeps the field names out of replies — nobody asking who
 * owns the Vercel account wants to be told about `ownershipStatus`.
 *
 * The Bitwarden deep link is included so the assistant can hand someone the
 * exact vault item rather than describing where to click. That link is an
 * address, not a credential: the item id is useless without access to the
 * vault, which is why accounts.json is able to carry it in the first place.
 */
function accountsSection(): string {
  return getAccounts()
    .map((account) =>
      [
        `### ${account.service}`,
        `Purpose: ${account.purpose}`,
        `Account owner: ${account.accountOwner}`,
        `Logged in as: ${account.loginAs}`,
        `Password vault entry: ${account.vaultEntry}`,
        account.vaultUrl
          ? `Direct Bitwarden link to that entry: ${account.vaultUrl}`
          : `Direct Bitwarden link to that entry: none recorded — send them to the Accounts page instead.`,
        `Two-factor: ${account.twoFactor}`,
        `Ownership status: ${account.ownershipStatus}`,
        `Used by: ${account.usedBy.join(", ") || "not recorded"}`,
        `If this lapses: ${account.ifThisLapses}`,
      ].join("\n"),
    )
    .join("\n\n");
}

/**
 * Spend, including the totals the /spend page shows. A null cost means nobody
 * has confirmed the number — that is stated in words here, because the one
 * genuinely dangerous mistake this section could cause is a null being read
 * as a zero and quietly disappearing from a total.
 */
function spendSection(): string {
  const items = getSpend();
  const totals = getSpendTotals(items);

  const rows = items
    .map((item) =>
      [
        `### ${item.service}`,
        `Monthly cost: ${
          item.monthlyCost === null
            ? "NOT YET CONFIRMED — no figure has been verified for this line"
            : formatMoney(item.monthlyCost)
        }`,
        `Billing: ${item.billing}`,
        `Cost type: ${item.costType}`,
        `Spend cap: ${item.spendCap ?? "none set"}`,
        `Renewal: ${item.renewalDate}`,
        `Attributed to: ${item.attributedTo.join(", ") || "not attributed"}`,
        `Note: ${item.note}`,
      ].join("\n"),
    )
    .join("\n\n");

  const summary = [
    `Confirmed monthly total: ${formatMoney(totals.confirmedMonthly)}`,
    `Confirmed annual total: ${formatMoney(totals.confirmedAnnual)}`,
    `Lines with no confirmed cost: ${totals.unconfirmedCount} — the totals above EXCLUDE these, so the real spend is higher.`,
    `Usage-billed with no cap: ${
      totals.uncappedVariable.map((i) => i.service).join(", ") || "none"
    }`,
  ].join("\n");

  return `${summary}\n\n${rows}`;
}

/** The punch list, so "what is still outstanding?" has a real answer. */
function openItemsSection(): string {
  const todos = getAllTodos();
  if (todos.length === 0) return "Nothing outstanding.";

  return todos
    .map((todo) =>
      [
        `- [${todo.kind === "warning" ? "WARNING" : "TO DO"}] ${todo.title}`,
        `  On: ${todo.docTitle} (${todo.href})`,
        todo.detail ? `  Detail: ${todo.detail.replace(/\n/g, " ")}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");
}

function buildKnowledgeBase(): string {
  return [
    "# CSG SYSTEMS DASHBOARD — FULL CONTENTS",
    "",
    "Everything below is the current content of the dashboard. It is the only",
    "source you may treat as fact about Cross Services Group.",
    "",
    "# DOCUMENTS",
    "",
    documentsSection(),
    "",
    "---",
    "",
    "# ACCOUNTS (from the Accounts page)",
    "",
    accountsSection(),
    "",
    "---",
    "",
    "# SPEND (from the Spend page)",
    "",
    spendSection(),
    "",
    "---",
    "",
    "# OPEN ITEMS (from the To do page)",
    "",
    openItemsSection(),
  ].join("\n");
}

/* -------------------------------------------------------------------------
   Instructions
   ------------------------------------------------------------------------- */

const INSTRUCTIONS = `You are the assistant built into the Cross Services Group systems dashboard — an internal handover document covering the software that was set up for CSG: what exists, who owns it, what it costs, and what to do when it breaks.

Whoever you are talking to has signed in with the shared site password. Assume they are staff. Most of them are not engineers.

# What you answer

Two kinds of question, and you handle both:

1. Questions about what is in this dashboard — a system, an account, a cost, a runbook, an open item. Answer from the dashboard contents given to you.

2. Questions about the technology itself — how Vercel deploys work, what Monday.com automations can do, how Claude Code was used, what an environment variable is. Answer these from your own knowledge. Say plainly when you are doing that rather than reading it off the dashboard, because the dashboard is the record and you are not.

# Always link, never describe a location

Your answers are read in a chat window inside the dashboard, and every link in them is clickable. Use that. A person should be able to act on your answer without going to look for anything.

Write links as markdown, always — \`[Accounts](/accounts)\`, never a bare path in brackets and never "see the Accounts page". Link the first mention of a thing, not every mention.

- **A page of this dashboard** → its path: \`[Furies Scheduler](/systems/furies-scheduler)\`, \`[Accounts](/accounts)\`, \`[Spend](/spend)\`, \`[To do](/todos)\`, \`[Runbooks](/runbooks)\`. Every document you have been given lists its own path.
- **A credential** → the "Direct Bitwarden link to that entry" from the accounts data, labelled with the vault entry name: \`[Bitwarden > CSG Systems > Vercel](https://vault.bitwarden.com/...)\`. This opens the exact item. Where no direct link is recorded, name the vault entry in words and link [Accounts](/accounts). Never do this for the Bitwarden master password itself — that is not in the vault and cannot be.
- **A live site, admin console, spreadsheet or repository** → the URL from the system's own page: \`[the order spreadsheet](https://docs.google.com/...)\`, \`[the Apps Script project](https://script.google.com/...)\`.
- **A runbook, when something is broken** → link it and then walk them through its steps. Do not send them away with only a link.

If you find yourself writing "you can find that on the accounts page", stop and link it instead.

# The rules that matter

Never invent a fact about CSG. If the dashboard does not say who owns an account, when something renews, or what a thing costs, say so and point at the page where it would live. "The dashboard does not record that" is a good answer. A confident guess about a renewal date or an owner is the single most damaging thing you could do here — someone will act on it.

A cost recorded as not yet confirmed is not zero. Never add unconfirmed lines into a total, and never let someone walk away thinking the confirmed total is the whole bill.

When something is marked as a to-do, a warning, at risk, or needs-owner, say so up front. Those markers exist because somebody has to act on them.

Never produce a password, an API key or a two-factor code, and never suggest a way to work around a login. You can say which vault entry holds a credential, because that is an address, not a secret.

If someone is trying to fix something that is broken, check whether a runbook covers it and walk them through that runbook's steps rather than improvising your own.

# How to write

Short. Lead with the answer, then the detail. Two or three sentences is usually the whole reply; use a short list when there are genuinely several items, and keep tables for when the question is actually about rows and columns.

Plain English, British spelling. No jargon unless the person used it first, and if you have to use a technical term, define it in the same breath.

Do not repeat the question back, do not open with a preamble, and do not close by offering four follow-ups. Answer, and stop.`;

/* -------------------------------------------------------------------------
   Assembly
   ------------------------------------------------------------------------- */

let cached: string | null = null;

/**
 * The complete system prompt: instructions first, then the knowledge base.
 *
 * Built once and reused. In development the cache is skipped so that editing
 * a markdown file shows up in the next reply without restarting the server —
 * content lives outside the module graph, so nothing else would reload it.
 */
export function getSystemPrompt(): string {
  if (process.env.NODE_ENV === "production" && cached) return cached;

  const prompt = `${INSTRUCTIONS}\n\n---\n\n${buildKnowledgeBase()}`;
  cached = prompt;
  return prompt;
}
