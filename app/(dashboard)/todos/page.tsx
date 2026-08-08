import type { Metadata } from "next";
import Link from "next/link";
import { getAllTodos } from "@/lib/content";
import { Page } from "@/components/Shell";
import { Markdown } from "@/components/Markdown";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "To do",
  description: "Every unconfirmed item across the whole dashboard.",
};

/**
 * The punch list.
 *
 * Collected at build time by scanning every content file for TODO blocks.
 * Nothing is maintained by hand here — resolve a TODO by deleting the block
 * from the markdown file it lives in, and it disappears from this page.
 */
export default function TodosPage() {
  const todos = getAllTodos();

  // Grouped by the document they came from, keeping content order.
  const grouped = new Map<string, typeof todos>();
  for (const todo of todos) {
    const list = grouped.get(todo.docTitle) ?? [];
    list.push(todo);
    grouped.set(todo.docTitle, list);
  }

  return (
    <Page>
      <header className="mb-8">
        <p className="type-eyebrow text-muted">Cross Services Systems</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">To do</h1>
        <p className="mt-3 text-[17px] text-muted">
          Every unconfirmed item across the whole dashboard. This is the punch
          list for the handover.
        </p>

        <p className="mt-5 font-mono text-[15px]">
          <span className="text-3xl text-cross-navy">{todos.length}</span> open
          item{todos.length === 1 ? "" : "s"} across {grouped.size} page
          {grouped.size === 1 ? "" : "s"}
        </p>

        <div className="mt-5">
          <PrintButton />
        </div>
      </header>

      <div
        className="callout border-l-4 border-cross-navy bg-[#eaeef4] px-4 py-3"
        style={{ borderRadius: "var(--radius-control)" }}
      >
        <p className="text-[15px] leading-relaxed">
          This page is generated from the content files at build time. To close
          an item, delete its{" "}
          <span className="font-mono text-[13px]">&gt; [!TODO]</span> block from
          the markdown file listed under it. Nothing here is edited by hand.
        </p>
      </div>

      {todos.length === 0 ? (
        <p className="mt-10 text-[17px]">
          Nothing outstanding. Every fact in this dashboard has been confirmed.
        </p>
      ) : (
        <div className="mt-10 space-y-10">
          {[...grouped.entries()].map(([docTitle, items]) => (
            <section key={docTitle}>
              <h2 className="border-b-2 border-rule pb-2 text-xl">
                <Link
                  href={items[0].href}
                  className="text-cross-navy hover:text-cross-blue"
                >
                  {docTitle}
                </Link>
                <span className="ml-2 font-sans text-[14px] font-normal text-muted">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </span>
              </h2>

              <ul className="mt-4 space-y-4">
                {items.map((todo, i) => (
                  <li
                    key={`${todo.title}-${i}`}
                    className="callout border-l-4 border-signal-progress bg-signal-progress-tint px-4 py-3"
                    style={{ borderRadius: "var(--radius-control)" }}
                  >
                    <p className="type-eyebrow text-signal-progress">To do</p>
                    <p className="mt-2 font-semibold">{todo.title}</p>
                    {todo.detail ? (
                      <div className="mt-1 text-[15px] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <Markdown>{todo.detail}</Markdown>
                      </div>
                    ) : null}
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Link
                        href={todo.href}
                        className="type-eyebrow text-cross-blue"
                      >
                        Go to {todo.docTitle} →
                      </Link>
                      <span className="font-mono text-[12px] text-muted">
                        {todo.sourcePath}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Page>
  );
}
