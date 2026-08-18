import type { Metadata } from "next";
import Link from "next/link";
import { getSystems, asLink, linkHost } from "@/lib/content";
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
        {systems.map((system) => {
          // Only a real address becomes a button. A system whose liveUrl is
          // still TODO gets no button at all rather than a dead one.
          const appUrl = asLink(system.liveUrl);

          return (
            <li key={system.slug} className="flex">
              {/* The card is a plain container, not a link. The whole surface
                  is still clickable — the title's link stretches over it via
                  the ::after overlay below — because an <a> for the live app
                  cannot legally sit inside another <a>. */}
              <div
                className="group relative flex h-full w-full flex-col border border-line bg-surface hover:border-cross-blue focus-within:border-cross-blue"
                style={{ borderRadius: "var(--radius-card)" }}
              >
                <ServiceTag
                  id={system.slug}
                  status={system.status}
                  lastReviewed={system.lastReviewed}
                  className="border-0"
                />
                <div className="flex flex-1 flex-col px-4 py-4">
                  <h2 className="text-xl group-hover:text-cross-blue">
                    <Link
                      href={system.href}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {system.title}
                    </Link>
                  </h2>
                  {system.summary ? (
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">
                      {system.summary}
                    </p>
                  ) : null}

                  {/* mt-auto pins the row to the bottom, so the buttons line
                      up across cards whose summaries differ in length. */}
                  <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                    <span className="type-eyebrow text-cross-blue">
                      Read more →
                    </span>
                    {appUrl ? (
                      // z-10 lifts it above the title's stretched overlay, so
                      // this link wins the click instead of the card behind it.
                      <a
                        href={appUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={appUrl}
                        className="type-eyebrow relative z-10 border border-line px-2 py-1 text-ink hover:border-cross-blue hover:text-cross-blue"
                        style={{ borderRadius: "var(--radius-control)" }}
                      >
                        Open {linkHost(appUrl)} ↗
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
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
