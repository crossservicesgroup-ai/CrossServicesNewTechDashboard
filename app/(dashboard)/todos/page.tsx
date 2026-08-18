import type { Metadata } from "next";
import { getAllTodos } from "@/lib/content";
import { Page } from "@/components/Shell";
import { PrintButton } from "@/components/PrintButton";
import { TodoChecklist } from "@/components/TodoChecklist";

export const metadata: Metadata = {
  title: "To do",
  description: "Every unconfirmed item and standing warning across the dashboard.",
};

/**
 * The punch list.
 *
 * Collected at build time by scanning every content file for TODO and WARNING
 * blocks. Nothing is maintained by hand here — an item leaves this page for
 * good when its block is deleted from the markdown file it lives in.
 *
 * The tick boxes are a working aid on top of that, stored in the browser.
 * See TodoChecklist for why they are not shared between people.
 */
export default function TodosPage() {
  const todos = getAllTodos();
  const todoCount = todos.filter((t) => t.kind === "todo").length;
  const warningCount = todos.filter((t) => t.kind === "warning").length;
  const pageCount = new Set(todos.map((t) => t.docTitle)).size;

  return (
    <Page>
      <header className="mb-8">
        <p className="type-eyebrow text-muted">Cross Services Systems</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">To do</h1>
        <p className="mt-3 text-[17px] text-muted">
          Every unconfirmed item and standing warning across the whole
          dashboard. This is the punch list for the handover.
        </p>

        <p className="mt-3 font-mono text-[14px] text-muted">
          {todoCount} to confirm · {warningCount} warning
          {warningCount === 1 ? "" : "s"} · across {pageCount} page
          {pageCount === 1 ? "" : "s"}
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
          Tick a box as you finish something. Ticks are saved in{" "}
          <strong>this browser only</strong> — a colleague on another laptop
          will not see them, and clearing your browser data clears them. Use{" "}
          <strong>Copy what I have ticked</strong> to send your progress to
          whoever is updating these pages.
        </p>
        <p className="mt-2 text-[15px] leading-relaxed">
          A tick is a working note, not the record. An item only leaves this
          page for good when its{" "}
          <span className="font-mono text-[13px]">&gt; [!TODO]</span> or{" "}
          <span className="font-mono text-[13px]">&gt; [!WARNING]</span> block
          is deleted from the markdown file named under it.
        </p>
      </div>

      {todos.length === 0 ? (
        <p className="mt-10 text-[17px]">
          Nothing outstanding. Every fact in this dashboard has been confirmed.
        </p>
      ) : (
        <TodoChecklist items={todos} />
      )}
    </Page>
  );
}
