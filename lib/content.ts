import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { isSystemStatus, type SystemStatus } from "./status";

/**
 * The content pipeline.
 *
 * Everything the dashboard displays is read from /content at build time.
 * Nothing here talks to a database or an API. If you want to change what a
 * page says, edit the markdown file — you never need to open a .tsx file.
 */

export const CONTENT_ROOT = path.join(process.cwd(), "content");

/** The literal string that splits the office half from the operator half. */
export const TECHNICAL_MARKER = "<!-- TECHNICAL -->";

export type ContentKind = "system" | "runbook" | "page";

export type Doc = {
  kind: ContentKind;
  slug: string;
  title: string;
  status: SystemStatus;
  owner: string;
  liveUrl?: string;
  repo?: string;
  lastReviewed?: string;
  summary: string;
  /** Everything above the TECHNICAL marker. Always rendered. */
  bodyMain: string;
  /** Everything below it, or null when the file has no technical half. */
  bodyTechnical: string | null;
  /** The whole body, used for search and the TODO scan. */
  bodyRaw: string;
  href: string;
  /** Which nav section this belongs to, for grouping search results. */
  section: string;
  sourcePath: string;
};

export type TodoItem = {
  title: string;
  detail: string;
  docTitle: string;
  href: string;
  section: string;
  sourcePath: string;
};

/* -------------------------------------------------------------------------
   Frontmatter normalising
   ------------------------------------------------------------------------- */

/**
 * YAML parses an unquoted 2026-08-07 into a Date, not a string. Left alone
 * that becomes a Date object in the props and Next refuses to serialise it,
 * so every date is coerced back to a plain YYYY-MM-DD string here.
 */
function asDateString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function asString(value: unknown, fallback = ""): string {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

/**
 * A missing or misspelled status must not crash the build and must not
 * silently render as "live". Anything unrecognised becomes needs-owner,
 * which is the honest reading of "nobody has set this properly".
 */
function asStatus(value: unknown): SystemStatus {
  return isSystemStatus(value) ? value : "needs-owner";
}

/* -------------------------------------------------------------------------
   Reading
   ------------------------------------------------------------------------- */

const SECTION_BY_KIND: Record<ContentKind, string> = {
  system: "Systems",
  runbook: "Runbooks",
  page: "Pages",
};

function hrefFor(kind: ContentKind, slug: string): string {
  if (kind === "system") return `/systems/${slug}`;
  if (kind === "runbook") return `/runbooks/${slug}`;
  // Singleton pages map to their own top-level route. Start Here is the root.
  if (slug === "start-here") return "/";
  return `/${slug}`;
}

function readDir(kind: ContentKind, dirName: string): Doc[] {
  const dir = path.join(CONTENT_ROOT, dirName);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const sourcePath = path.join(dir, file);
      const raw = fs.readFileSync(sourcePath, "utf8");
      const { data, content } = matter(raw);

      const slug = asString(data.slug) || file.replace(/\.md$/, "");

      // The split is on the literal marker. indexOf, not a regex, so that
      // nothing in the content can accidentally match it.
      const markerAt = content.indexOf(TECHNICAL_MARKER);
      const hasTechnical = markerAt !== -1;

      const bodyMain = (hasTechnical ? content.slice(0, markerAt) : content).trim();
      const bodyTechnical = hasTechnical
        ? content.slice(markerAt + TECHNICAL_MARKER.length).trim() || null
        : null;

      return {
        kind,
        slug,
        title: asString(data.title) || slug,
        status: asStatus(data.status),
        owner: asString(data.owner, "TODO"),
        liveUrl: asString(data.liveUrl) || undefined,
        repo: asString(data.repo) || undefined,
        lastReviewed: asDateString(data.lastReviewed),
        summary: asString(data.summary),
        bodyMain,
        bodyTechnical,
        bodyRaw: content.trim(),
        href: hrefFor(kind, slug),
        section: SECTION_BY_KIND[kind],
        sourcePath: path.relative(process.cwd(), sourcePath),
      } satisfies Doc;
    });
}

/* -------------------------------------------------------------------------
   Public readers
   ------------------------------------------------------------------------- */

export function getSystems(): Doc[] {
  // Live systems first, then in-progress, then the rest — the reader cares
  // about what is running before what is planned.
  const order: SystemStatus[] = ["live", "in-progress", "needs-owner", "not-built"];
  return readDir("system", "systems").sort((a, b) => {
    const byStatus = order.indexOf(a.status) - order.indexOf(b.status);
    return byStatus !== 0 ? byStatus : a.title.localeCompare(b.title);
  });
}

export function getRunbooks(): Doc[] {
  return readDir("runbook", "runbooks").sort((a, b) =>
    a.title.localeCompare(b.title),
  );
}

export function getPages(): Doc[] {
  return readDir("page", "pages");
}

export function getSystem(slug: string): Doc | undefined {
  return getSystems().find((d) => d.slug === slug);
}

export function getRunbook(slug: string): Doc | undefined {
  return getRunbooks().find((d) => d.slug === slug);
}

export function getPage(slug: string): Doc | undefined {
  return getPages().find((d) => d.slug === slug);
}

/** Every document, in the order the nav presents them. */
export function getAllDocs(): Doc[] {
  return [...getPages(), ...getSystems(), ...getRunbooks()];
}

/* -------------------------------------------------------------------------
   TODO scanning
   ------------------------------------------------------------------------- */

/**
 * Finds every TODO block in a markdown body.
 *
 * The convention is a blockquote whose first line is the alert marker:
 *
 *   > [!TODO] Repo URL
 *   > Confirm with Gavin before handoff.
 *
 * Parsed line by line rather than with one big regex, because a blockquote
 * can run to any number of lines and the detail needs to survive intact.
 */
export function extractTodos(body: string): { title: string; detail: string }[] {
  const lines = body.split("\n");
  const found: { title: string; detail: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const opener = lines[i].match(/^\s*>\s*\[!TODO\]\s*(.*)$/i);
    if (!opener) continue;

    const title = opener[1].trim() || "Untitled";
    const detail: string[] = [];

    // Consume the rest of the blockquote.
    let j = i + 1;
    for (; j < lines.length; j++) {
      const quoted = lines[j].match(/^\s*>\s?(.*)$/);
      if (!quoted) break;
      // A second alert marker starts a new block rather than continuing this one.
      if (/^\s*\[!(TODO|WARNING|NOTE|IMPORTANT)\]/i.test(quoted[1])) break;
      detail.push(quoted[1]);
    }

    found.push({ title, detail: detail.join("\n").trim() });
    i = j - 1;
  }

  return found;
}

/** Every TODO across every content file, for the /todos punch list. */
export function getAllTodos(): TodoItem[] {
  return getAllDocs().flatMap((doc) =>
    extractTodos(doc.bodyRaw).map((t) => ({
      ...t,
      docTitle: doc.title,
      href: doc.href,
      section: doc.section,
      sourcePath: doc.sourcePath,
    })),
  );
}

export function getTodoCount(): number {
  return getAllTodos().length;
}

/* -------------------------------------------------------------------------
   Search index
   ------------------------------------------------------------------------- */

/** Strips markdown syntax so search matches words, not punctuation. */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ") // fenced code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links keep their text
    .replace(/^\s*>\s?/gm, " ") // blockquote markers
    .replace(/\[!(TODO|WARNING|NOTE|IMPORTANT)\]/gi, " ")
    .replace(/[#*_`|~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The index shipped to the browser. Body text is capped so the payload stays
 * small — the cap is generous enough that it has never truncated a real page
 * mid-topic at this content size.
 */
export function getSearchIndex() {
  const docs = getAllDocs().map((doc) => ({
    title: doc.title,
    href: doc.href,
    section: doc.section,
    summary: doc.summary,
    text: toPlainText(doc.bodyRaw).slice(0, 6000),
  }));

  // Accounts and spend live in JSON rather than markdown, so they are not
  // picked up by getAllDocs. Without these, searching for "Vercel" would
  // never surface the Vercel account — the row most likely to be wanted.
  const accounts = getAccountsForSearch();
  const spend = getSpendForSearch();

  // TODOs are searchable in their own right — someone will search for
  // "pickup location" and expect to land on the open question.
  const todos = getAllTodos().map((todo) => ({
    title: todo.title,
    href: "/todos",
    section: "To do",
    summary: `Open item on ${todo.docTitle}`,
    text: toPlainText(todo.detail),
  }));

  return [...docs, ...accounts, ...spend, ...todos];
}

/**
 * Read directly rather than importing from ./data, which would create a
 * circular import (data.ts already imports CONTENT_ROOT from this file).
 */
function readDataFile<T>(file: string): T[] {
  const full = path.join(CONTENT_ROOT, "data", file);
  if (!fs.existsSync(full)) return [];
  return JSON.parse(fs.readFileSync(full, "utf8")) as T[];
}

function getAccountsForSearch() {
  type Row = {
    service: string;
    purpose: string;
    ifThisLapses: string;
    vaultEntry: string;
    ownershipStatus: string;
    accountOwner: string;
  };
  return readDataFile<Row>("accounts.json").map((a) => ({
    title: a.service,
    href: "/accounts",
    section: "Accounts",
    summary: a.purpose,
    text: toPlainText(
      `${a.ifThisLapses} ${a.vaultEntry} ${a.ownershipStatus} ${a.accountOwner}`,
    ),
  }));
}

function getSpendForSearch() {
  type Row = {
    service: string;
    note: string;
    billing: string;
    costType: string;
  };
  return readDataFile<Row>("spend.json").map((s) => ({
    title: `${s.service} — cost`,
    href: "/spend",
    section: "Spend",
    summary: s.note,
    text: toPlainText(`${s.billing} ${s.costType}`),
  }));
}
