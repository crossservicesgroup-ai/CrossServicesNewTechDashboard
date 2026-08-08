import type { Metadata } from "next";
import {
  getAllTodos,
  getPages,
  getRunbooks,
  getSystems,
  type Doc,
} from "@/lib/content";
import { getAccounts, getSpend } from "@/lib/data";
import { Markdown } from "@/components/Markdown";
import { formatReviewDate } from "@/lib/status";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "Print everything",
  description: "The entire dashboard on one page, for printing to PDF.",
};

/**
 * Everything on one continuous page.
 *
 * This is the survival copy: if the site is down, or nobody can remember the
 * password, a printed version of this page still answers every question the
 * dashboard answers. Both halves of every document are rendered — the
 * technical detail is never collapsed here.
 */

function PrintDoc({ doc }: { doc: Doc }) {
  return (
    <article className="mt-10 border-t-2 border-rule pt-5">
      <h2 className="text-2xl">{doc.title}</h2>
      {doc.summary ? <p className="mt-1 text-muted">{doc.summary}</p> : null}

      {/* These carry raw URLs. Without a wrap rule a long repo address runs
          off the right edge of a phone and drags the page with it — and it
          does it without making its own box any wider, so it is invisible to
          anything that measures element widths. */}
      <p className="mt-2 font-mono text-[12px] text-muted [overflow-wrap:anywhere]">
        {doc.slug} · {doc.status} · last reviewed{" "}
        {formatReviewDate(doc.lastReviewed)}
        {doc.owner ? ` · owner: ${doc.owner}` : ""}
      </p>
      {doc.liveUrl ? (
        <p className="font-mono text-[12px] text-muted [overflow-wrap:anywhere]">
          Live: {doc.liveUrl}
        </p>
      ) : null}
      {doc.repo ? (
        <p className="font-mono text-[12px] text-muted [overflow-wrap:anywhere]">
          Repo: {doc.repo}
        </p>
      ) : null}

      <Markdown>{doc.bodyMain}</Markdown>

      {doc.bodyTechnical ? (
        <>
          <h3 className="mt-6 border-t border-line pt-3 text-lg font-semibold">
            Technical detail
          </h3>
          <Markdown>{doc.bodyTechnical}</Markdown>
        </>
      ) : null}
    </article>
  );
}

export default function PrintPage() {
  const pages = getPages();
  const systems = getSystems();
  const runbooks = getRunbooks();
  const accounts = getAccounts();
  const spend = getSpend();
  const todos = getAllTodos();

  const startHere = pages.find((p) => p.slug === "start-here");
  const otherPages = pages.filter((p) => p.slug !== "start-here");

  return (
    <main id="main" className="mx-auto max-w-[72ch] px-5 py-10 sm:px-8">
      <header>
        <p className="type-eyebrow text-muted">Cross Services Group</p>
        <h1 className="mt-3 text-4xl">Systems handover — complete record</h1>
        <p className="mt-3 text-muted">
          Every page of the dashboard, printed on one sheet. Generated{" "}
          {formatReviewDate("2026-08-07")}.
        </p>
        <p className="mt-3 text-[15px] text-muted">
          This document contains no passwords. Credentials live in Bitwarden.
        </p>
        <div className="mt-5">
          <PrintButton />
        </div>
      </header>

      {startHere ? <PrintDoc doc={startHere} /> : null}

      <section className="mt-12">
        <h2 className="border-b-2 border-rule pb-2 text-3xl">Systems</h2>
        {systems.map((doc) => (
          <PrintDoc key={doc.slug} doc={doc} />
        ))}
      </section>

      {/* Accounts and spend live in JSON, so they are rendered directly
          rather than through the markdown pipeline. */}
      <section className="mt-12">
        <h2 className="border-b-2 border-rule pb-2 text-3xl">Accounts</h2>
        {accounts.map((account) => (
          <article
            key={account.service}
            className="mt-6 border-t border-line pt-3"
          >
            <h3 className="text-lg font-semibold">
              {account.service}{" "}
              <span className="font-mono text-[12px] text-muted">
                [{account.ownershipStatus}]
              </span>
            </h3>
            <p className="mt-1 text-[15px]">{account.purpose}</p>
            <dl className="mt-2 text-[14px]">
              {[
                ["Account owner", account.accountOwner],
                ["Log in as", account.loginAs],
                ["Vault entry", account.vaultEntry],
                ["Two-factor", account.twoFactor],
                ["If this lapses", account.ifThisLapses],
                ["Used by", account.usedBy.join(", ") || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2 py-0.5">
                  <dt className="w-32 shrink-0 text-muted">{label}</dt>
                  <dd className="min-w-0 flex-1 [overflow-wrap:anywhere]">{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="border-b-2 border-rule pb-2 text-3xl">Spend</h2>
        {/* Scrolls inside its own box on a phone. Without this the five
            columns push the whole page sideways. */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-[14px]">
            <thead className="border-b-2 border-rule">
              <tr>
                {["Service", "Monthly", "Billing", "Type", "Renews"].map((h) => (
                  <th key={h} className="px-2 py-2 text-left text-[12px]">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spend.map((item) => (
                <tr key={item.service} className="border-t border-line">
                  <td className="px-2 py-2 align-top">
                    {item.service}
                    {item.note ? (
                      <span className="block text-[12px] text-muted">
                        {item.note}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-2 py-2 align-top">
                    {item.monthlyCost === null
                      ? "Not yet confirmed"
                      : `$${item.monthlyCost}`}
                  </td>
                  <td className="px-2 py-2 align-top">{item.billing}</td>
                  <td className="px-2 py-2 align-top">{item.costType}</td>
                  <td className="px-2 py-2 align-top">{item.renewalDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="border-b-2 border-rule pb-2 text-3xl">Runbooks</h2>
        {runbooks.map((doc) => (
          <PrintDoc key={doc.slug} doc={doc} />
        ))}
      </section>

      <section className="mt-12">
        <h2 className="border-b-2 border-rule pb-2 text-3xl">Reference</h2>
        {otherPages.map((doc) => (
          <PrintDoc key={doc.slug} doc={doc} />
        ))}
      </section>

      <section className="mt-12">
        <h2 className="border-b-2 border-rule pb-2 text-3xl">
          Open items ({todos.length})
        </h2>
        <ul className="mt-4 space-y-3">
          {todos.map((todo, i) => (
            <li key={i} className="border-t border-line pt-2">
              <p className="font-semibold">{todo.title}</p>
              {todo.detail ? (
                <p className="text-[14px] whitespace-pre-line">{todo.detail}</p>
              ) : null}
              <p className="font-mono text-[12px] text-muted">
                {todo.docTitle} — {todo.sourcePath}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
