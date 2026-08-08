import type { Metadata } from "next";
import Link from "next/link";
import { getRunbooks } from "@/lib/content";
import { Page } from "@/components/Shell";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "Runbooks",
  description: "What to do when something breaks.",
};

export default function RunbooksIndexPage() {
  const runbooks = getRunbooks();

  return (
    <Page>
      <header className="mb-8">
        <p className="type-eyebrow text-muted">Cross Services Systems</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Runbooks</h1>
        <p className="mt-3 text-[17px] text-muted">
          What to do when something breaks. Each one is a numbered procedure
          you can follow start to finish without knowing how the system was
          built.
        </p>
        <div className="mt-5">
          <PrintButton />
        </div>
      </header>

      <ul className="divide-y divide-line border-y border-line">
        {runbooks.map((runbook) => (
          <li key={runbook.slug}>
            <Link
              href={runbook.href}
              className="group flex flex-col gap-1 py-4 hover:text-cross-blue"
            >
              <span className="text-lg font-medium text-cross-navy group-hover:text-cross-blue">
                {runbook.title}
              </span>
              {runbook.summary ? (
                <span className="text-[15px] leading-snug text-muted">
                  {runbook.summary}
                </span>
              ) : null}
              <span className="type-eyebrow mt-1 text-muted">
                {runbook.slug}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Page>
  );
}
