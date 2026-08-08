import type { Metadata } from "next";
import Link from "next/link";
import {
  getSpend,
  getSpendBySystem,
  getSpendTotals,
  formatMoney,
} from "@/lib/data";
import { Page } from "@/components/Shell";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "Spend",
  description: "What it costs to run these systems.",
};

function Cost({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-signal-progress">Not yet confirmed</span>;
  }
  return <span className="font-mono">{formatMoney(value)}</span>;
}

export default function SpendPage() {
  const items = getSpend();
  const totals = getSpendTotals(items);
  const bySystem = getSpendBySystem(items);

  return (
    <Page wide>
      <header className="mb-8">
        <p className="type-eyebrow text-muted">Cross Services Systems</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Spend</h1>
        <p className="mt-3 max-w-[70ch] text-[17px] text-muted">
          What it costs to keep these systems running.
        </p>
        <div className="mt-5">
          <PrintButton />
        </div>
      </header>

      {/* The headline number is stated as a floor, never as a total. A null
          cost must never quietly deflate the figure someone budgets against. */}
      <section
        className="border border-line bg-surface"
        style={{ borderRadius: "var(--radius-card)" }}
      >
        <div className="h-[3px] bg-rule" aria-hidden="true" />
        <div className="grid gap-px bg-line sm:grid-cols-2">
          <div className="bg-surface px-5 py-5">
            <p className="type-eyebrow text-muted">Confirmed monthly</p>
            <p className="mt-2 font-mono text-3xl text-cross-navy">
              {formatMoney(totals.confirmedMonthly)}
            </p>
            <p className="mt-2 text-[14px] text-muted">
              plus {totals.unconfirmedCount} unconfirmed item
              {totals.unconfirmedCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="bg-surface px-5 py-5">
            <p className="type-eyebrow text-muted">Confirmed annually</p>
            <p className="mt-2 font-mono text-3xl text-cross-navy">
              {formatMoney(totals.confirmedAnnual)}
            </p>
            <p className="mt-2 text-[14px] text-muted">
              {totals.confirmedMonthly === 0
                ? "No cost has been confirmed yet"
                : "Based on confirmed costs only"}
            </p>
          </div>
        </div>
      </section>

      {totals.unconfirmedCount > 0 ? (
        <section
          className="callout mt-6 border-l-4 border-signal-progress bg-signal-progress-tint px-4 py-4"
          style={{ borderRadius: "var(--radius-control)" }}
        >
          <p className="type-eyebrow text-signal-progress">Read this first</p>
          <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed">
            The real running cost is{" "}
            <strong>
              at least {formatMoney(totals.confirmedMonthly)} a month, plus{" "}
              {totals.unconfirmedCount} unconfirmed item
              {totals.unconfirmedCount === 1 ? "" : "s"}
            </strong>
            . Every unconfirmed row below is a real bill going somewhere that
            nobody has checked. Treat the figure above as a floor, not a total.
          </p>
        </section>
      ) : null}

      {totals.uncappedVariable.length > 0 ? (
        <section
          className="callout mt-6 border-l-4 border-signal-risk bg-signal-risk-tint px-4 py-4"
          style={{ borderRadius: "var(--radius-control)" }}
        >
          <p className="type-eyebrow text-signal-risk">
            Uncapped usage billing
          </p>
          <p className="mt-2 max-w-[70ch] text-[15px] leading-relaxed">
            {totals.uncappedVariable.length} service
            {totals.uncappedVariable.length === 1 ? " is" : "s are"} billed on
            usage with no spend cap or billing alert confirmed. This is the
            thing that produces a surprise invoice — a loop that runs away, or
            a key that leaks, bills silently until someone reads the statement.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px]">
            {totals.uncappedVariable.map((item) => (
              <li key={item.service}>
                <span className="font-mono">{item.service}</span> — set a
                billing alert and a cap.
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* By service */}
      <section className="mt-12">
        <h2 className="text-2xl">By service</h2>
        <div className="mt-4 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[46rem] border-collapse text-[15px]">
            <thead className="border-b-2 border-rule">
              <tr>
                {["Service", "Monthly", "Billing", "Type", "Cap", "Renews"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-[13px] font-semibold"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.service} className="border-t border-line">
                  <td className="px-3 py-3 align-top">
                    <span className="font-medium">{item.service}</span>
                    {item.note ? (
                      <span className="mt-1 block text-[13px] leading-snug text-muted">
                        {item.note}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <Cost value={item.monthlyCost} />
                  </td>
                  <td className="px-3 py-3 align-top font-mono text-[13px]">
                    {item.billing.toUpperCase().startsWith("TODO") ? (
                      <span className="text-signal-progress">TODO</span>
                    ) : (
                      item.billing
                    )}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <span
                      className={`type-eyebrow ${
                        item.costType === "variable"
                          ? "text-signal-risk"
                          : "text-muted"
                      }`}
                    >
                      {item.costType}
                    </span>
                  </td>
                  <td className="px-3 py-3 align-top text-[13px]">
                    {item.costType === "variable" && !item.spendCap ? (
                      <span className="text-signal-risk">None — uncapped</span>
                    ) : item.spendCap ? (
                      <span className="font-mono">{item.spendCap}</span>
                    ) : (
                      <span className="text-muted">n/a</span>
                    )}
                  </td>
                  <td className="px-3 py-3 align-top font-mono text-[13px]">
                    {item.renewalDate.toUpperCase().startsWith("TODO") ? (
                      <span className="text-signal-progress">TODO</span>
                    ) : (
                      item.renewalDate
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* By system */}
      <section className="mt-12">
        <h2 className="text-2xl">By system</h2>
        <p className="mt-2 max-w-[70ch] text-[15px] text-muted">
          The same costs, rolled up to the system each one pays for. A service
          used by two systems appears under both.
        </p>
        <ul className="mt-5 space-y-4">
          {bySystem.map(([slug, row]) => (
            <li
              key={slug}
              className="border border-line bg-surface px-4 py-4"
              style={{ borderRadius: "var(--radius-card)" }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                {slug === "unattributed" ? (
                  <span className="font-mono text-[15px] text-muted">
                    Not tied to one system
                  </span>
                ) : (
                  <Link
                    href={`/systems/${slug}`}
                    className="font-mono text-[15px] text-cross-blue underline underline-offset-2"
                  >
                    {slug}
                  </Link>
                )}
                <span className="font-mono text-[15px]">
                  {row.confirmed > 0 ? formatMoney(row.confirmed) : null}
                  {row.unconfirmed > 0 ? (
                    <span className="text-signal-progress">
                      {row.confirmed > 0 ? " + " : ""}
                      {row.unconfirmed} unconfirmed
                    </span>
                  ) : null}
                </span>
              </div>
              <p className="mt-2 text-[14px] text-muted">
                {row.services.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
