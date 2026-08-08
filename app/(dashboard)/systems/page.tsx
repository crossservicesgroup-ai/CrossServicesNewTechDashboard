import type { Metadata } from "next";
import Link from "next/link";
import { getSystems } from "@/lib/content";
import { Page } from "@/components/Shell";
import { ServiceTag } from "@/components/ServiceTag";
import { SYSTEM_STATUS } from "@/lib/status";
import { PrintButton } from "@/components/PrintButton";

export const metadata: Metadata = {
  title: "Systems",
  description: "Every system built for Cross Services Group.",
};

export default function SystemsIndexPage() {
  const systems = getSystems();

  return (
    <Page wide>
      <header className="mb-8">
        <p className="type-eyebrow text-muted">Cross Services Systems</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Systems</h1>
        <p className="mt-3 max-w-[70ch] text-[17px] text-muted">
          Everything that was built, and what state each one is in. Live means
          it is running and being used right now.
        </p>
        <div className="mt-5">
          <PrintButton />
        </div>
      </header>

      <ul className="grid gap-5 sm:grid-cols-2">
        {systems.map((system) => (
          <li key={system.slug}>
            <Link
              href={system.href}
              className="group block h-full border border-line bg-surface hover:border-cross-blue"
              style={{ borderRadius: "var(--radius-card)" }}
            >
              <ServiceTag
                id={system.slug}
                status={system.status}
                lastReviewed={system.lastReviewed}
                className="border-0"
              />
              <div className="px-4 py-4">
                <h2 className="text-xl group-hover:text-cross-blue">
                  {system.title}
                </h2>
                {system.summary ? (
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">
                    {system.summary}
                  </p>
                ) : null}
                <p className="type-eyebrow mt-4 text-cross-blue">Read more →</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-12">
        <h2 className="text-xl">What the statuses mean</h2>
        <dl className="mt-4 divide-y divide-line border-y border-line">
          {Object.entries(SYSTEM_STATUS).map(([key, meta]) => (
            <div key={key} className="flex flex-wrap gap-x-4 gap-y-1 py-3">
              <dt className="w-32 shrink-0 font-mono text-[13px] text-muted">
                {key}
              </dt>
              <dd className="min-w-[16rem] flex-1 text-[15px]">
                {meta.meaning}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </Page>
  );
}
