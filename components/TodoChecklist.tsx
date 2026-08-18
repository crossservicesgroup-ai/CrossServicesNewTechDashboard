"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { TodoItem } from "@/lib/content";
import { Markdown } from "./Markdown";

/**
 * The punch list, as something you can work through rather than just read.
 *
 * Ticks are stored in this browser only. That is deliberate and it is a real
 * limitation: there is no server here and no accounts, so there is nowhere
 * shared to put them. Two people ticking on two laptops will not see each
 * other's progress.
 *
 * The permanent record of a finished item is still the content file — an item
 * disappears from this page for good when its block is deleted from the
 * markdown. A tick means "I have done this, it can be written up"; deleting
 * the block is the writing up.
 */

const STORAGE_KEY = "csg-todo-progress-v1";

type Progress = Record<string, string>; // item id -> ISO date it was ticked

function loadProgress(): Progress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    // Only keep string values. A corrupted entry should drop out quietly
    // rather than crash the page someone is trying to work from.
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        ([, v]) => typeof v === "string",
      ),
    ) as Progress;
  } catch {
    return {};
  }
}

export function TodoChecklist({ items }: { items: TodoItem[] }) {
  const [progress, setProgress] = useState<Progress>({});
  // Ticks live in localStorage, which the server cannot know about. Rendering
  // unticked first and filling in after mount keeps the server and client
  // markup identical and avoids a hydration mismatch.
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hideDone, setHideDone] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setReady(true);
  }, []);

  function toggle(id: string) {
    setProgress((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = new Date().toISOString().slice(0, 10);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // A full or blocked localStorage should not stop the box ticking on
        // screen. The list still works for this session.
      }
      return next;
    });
  }

  const doneCount = useMemo(
    () => items.filter((i) => progress[i.id]).length,
    [items, progress],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, TodoItem[]>();
    for (const item of items) {
      const list = map.get(item.docTitle) ?? [];
      list.push(item);
      map.set(item.docTitle, list);
    }
    return [...map.entries()];
  }, [items]);

  /** A plain-text report of what is ticked, to paste to whoever is updating
   *  the content files. Without this the ticks are trapped in one browser. */
  function copyReport() {
    const done = items.filter((i) => progress[i.id]);
    const lines = [
      `CSG dashboard: ${done.length} of ${items.length} items marked done`,
      "",
      ...(done.length
        ? done.map((i) => `[x] ${i.docTitle} / ${i.title}  (ticked ${progress[i.id]})`)
        : ["(nothing ticked yet)"]),
      "",
      `Still open: ${items.length - done.length}`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
      },
      () => setCopied(false),
    );
  }

  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div>
      <div className="no-print mt-6">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <p className="font-mono text-[15px]">
            <span className="text-3xl text-cross-navy">
              {ready ? doneCount : 0}
            </span>{" "}
            of {items.length} done
          </p>
          <p className="text-[14px] text-muted">
            {items.length - (ready ? doneCount : 0)} still open
          </p>
        </div>

        <div
          className="mt-3 h-2 w-full overflow-hidden bg-[#e6e8ec]"
          style={{ borderRadius: "var(--radius-control)" }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={ready ? pct : 0}
          aria-label="Handover progress"
        >
          <div
            className="h-full bg-cross-blue transition-[width] duration-300"
            style={{ width: `${ready ? pct : 0}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyReport}
            className="border border-line bg-surface px-3 py-1.5 text-[13px] hover:border-cross-blue"
            style={{ borderRadius: "var(--radius-control)" }}
          >
            {copied ? "Copied" : "Copy what I have ticked"}
          </button>
          <button
            type="button"
            onClick={() => setHideDone((v) => !v)}
            className="border border-line bg-surface px-3 py-1.5 text-[13px] hover:border-cross-blue"
            style={{ borderRadius: "var(--radius-control)" }}
          >
            {hideDone ? "Show finished items" : "Hide finished items"}
          </button>
        </div>
      </div>

      <div className="mt-10 space-y-10">
        {grouped.map(([docTitle, groupItems]) => {
          const visible = hideDone
            ? groupItems.filter((i) => !progress[i.id])
            : groupItems;
          if (!visible.length) return null;

          const groupDone = groupItems.filter((i) => progress[i.id]).length;

          return (
            <section key={docTitle}>
              <h2 className="border-b-2 border-rule pb-2 text-xl">
                <Link
                  href={groupItems[0].href}
                  className="text-cross-navy hover:text-cross-blue"
                >
                  {docTitle}
                </Link>
                <span className="ml-2 font-sans text-[14px] font-normal text-muted">
                  {ready && groupDone ? `${groupDone} of ` : ""}
                  {groupItems.length} item
                  {groupItems.length === 1 ? "" : "s"}
                  {ready && groupDone ? " done" : ""}
                </span>
              </h2>

              <ul className="mt-4 space-y-4">
                {visible.map((item) => {
                  const done = Boolean(progress[item.id]);
                  const isWarning = item.kind === "warning";

                  return (
                    <li
                      key={item.id}
                      className={`callout border-l-4 px-4 py-3 transition-opacity ${
                        done
                          ? "border-line bg-surface opacity-60"
                          : isWarning
                            ? "border-signal-risk bg-signal-risk-tint"
                            : "border-signal-progress bg-signal-progress-tint"
                      }`}
                      style={{ borderRadius: "var(--radius-control)" }}
                    >
                      <div className="flex gap-3">
                        <input
                          type="checkbox"
                          id={item.id}
                          checked={done}
                          onChange={() => toggle(item.id)}
                          className="mt-1 h-4 w-4 shrink-0 accent-cross-blue"
                        />
                        <div className="min-w-0">
                          <p
                            className={`type-eyebrow ${
                              done
                                ? "text-muted"
                                : isWarning
                                  ? "text-signal-risk"
                                  : "text-signal-progress"
                            }`}
                          >
                            {done
                              ? `Done ${progress[item.id]}`
                              : isWarning
                                ? "Warning"
                                : "To do"}
                          </p>

                          <label
                            htmlFor={item.id}
                            className={`mt-2 block cursor-pointer font-semibold ${
                              done ? "line-through" : ""
                            }`}
                          >
                            {item.title}
                          </label>

                          {item.detail ? (
                            <div className="mt-1 text-[15px] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                              <Markdown>{item.detail}</Markdown>
                            </div>
                          ) : null}

                          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <Link
                              href={item.href}
                              className="type-eyebrow text-cross-blue"
                            >
                              Go to {item.docTitle}
                            </Link>
                            <span className="font-mono text-[12px] text-muted">
                              {item.sourcePath}
                            </span>
                          </p>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
