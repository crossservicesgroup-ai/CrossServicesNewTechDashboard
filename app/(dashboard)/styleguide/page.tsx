import type { Metadata } from "next";
import { ServiceTag, StatusPill } from "@/components/ServiceTag";
import {
  SYSTEM_STATUS,
  OWNERSHIP_STATUS,
  type SystemStatus,
  type OwnershipStatus,
} from "@/lib/status";

export const metadata: Metadata = { title: "Style guide" };

/**
 * The style guide exists so that anyone changing this dashboard later can see
 * every visual element in one place, and so the status colours have a legend
 * somebody can actually read.
 */

const SYSTEM_KEYS = Object.keys(SYSTEM_STATUS) as SystemStatus[];
const OWNERSHIP_KEYS = Object.keys(OWNERSHIP_STATUS) as OwnershipStatus[];

const SWATCHES = [
  { name: "cross-blue", value: "#1255a2", note: "Links and focus rings" },
  { name: "cross-navy", value: "#0b3665", note: "Headings and sidebar" },
  { name: "paper", value: "#f7f6f2", note: "Page background" },
  { name: "surface", value: "#ffffff", note: "Cards and tags" },
  { name: "ink", value: "#1b1d21", note: "Body text" },
  { name: "muted", value: "#5c6270", note: "Secondary text" },
  { name: "line", value: "#e4e2db", note: "Hairline borders" },
];

const SIGNALS = [
  { name: "signal-live", value: "#2f7d4f", note: "Live / CSG owned" },
  { name: "signal-progress", value: "#b8791a", note: "In progress / unknown" },
  { name: "signal-risk", value: "#a83232", note: "At risk / needs owner" },
  { name: "signal-none", value: "#6e7478", note: "Not built" },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 first:mt-0">
      <h2 className="text-2xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function StyleGuidePage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <p className="type-eyebrow text-muted">CSG Systems</p>
      <h1 className="mt-3 text-4xl">Style guide</h1>
      <p className="mt-4 max-w-[70ch] text-muted">
        Every visual element used in this dashboard. The brand colours and
        fonts are the same ones the public Cross Services website uses, so the
        two look like they come from the same company.
      </p>

      <Section title="The service tag">
        <p className="mb-6 max-w-[70ch]">
          This is the element the whole dashboard is built around. Every system,
          account and runbook carries one. It tells you three things without you
          reading a sentence: what the thing is called, whether it is working,
          and when somebody last checked.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <ServiceTag
            id="furies-scheduler"
            status="live"
            lastReviewed="2026-08-07"
            context="The Furies Scheduler"
          />
          <ServiceTag
            id="linen-automation"
            status="in-progress"
            lastReviewed="2026-08-07"
            context="Built and tested, currently switched off"
          />
          <ServiceTag
            id="vercel"
            status="at-risk"
            lastReviewed="2026-08-07"
            context="Hosting — on a personal account"
          />
          <ServiceTag
            id="ai-receptionist"
            status="not-built"
            context="Not started"
          />
        </div>
      </Section>

      <Section title="What the statuses mean">
        <h3 className="type-eyebrow text-muted">Systems</h3>
        <dl className="mt-3 divide-y divide-line border-y border-line">
          {SYSTEM_KEYS.map((key) => (
            <div
              key={key}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-2 py-3"
            >
              <dt className="w-28 shrink-0">
                <StatusPill status={key} />
              </dt>
              <dd className="flex-1 min-w-[16rem]">
                <span className="font-mono text-[13px] text-muted">{key}</span>
                <span className="ml-3">{SYSTEM_STATUS[key].meaning}</span>
              </dd>
            </div>
          ))}
        </dl>

        <h3 className="type-eyebrow mt-8 text-muted">Account ownership</h3>
        <dl className="mt-3 divide-y divide-line border-y border-line">
          {OWNERSHIP_KEYS.map((key) => (
            <div
              key={key}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-2 py-3"
            >
              <dt className="w-28 shrink-0">
                <StatusPill status={key} />
              </dt>
              <dd className="flex-1 min-w-[16rem]">
                <span className="font-mono text-[13px] text-muted">{key}</span>
                <span className="ml-3">{OWNERSHIP_STATUS[key].meaning}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Type">
        <div className="space-y-6 border-y border-line py-6">
          <div>
            <p className="type-eyebrow text-muted">Display — Newsreader</p>
            <p className="mt-2 font-display text-3xl text-cross-navy">
              The linen automation stopped filing orders
            </p>
          </div>
          <div>
            <p className="type-eyebrow text-muted">Body — IBM Plex Sans</p>
            <p className="mt-2 max-w-[70ch]">
              Orders come in through the WooCommerce site and land as an order
              email in the Furies inbox. Previously an office person copied each
              one into a spreadsheet by hand. This automation does the copying.
            </p>
          </div>
          <div>
            <p className="type-eyebrow text-muted">
              Identifiers — IBM Plex Mono
            </p>
            <p className="mt-2 font-mono text-[15px]">
              GOOGLE_MAPS_API_KEY · linen-bot/needs-review · checkSetup()
            </p>
            <p className="mt-2 max-w-[70ch] text-sm text-muted">
              Anything in mono is something you type, paste or click. Anything
              in Plex Sans is something you read. That rule holds everywhere on
              this site.
            </p>
          </div>
        </div>
      </Section>

      <Section title="Colour">
        <h3 className="type-eyebrow text-muted">Brand and neutrals</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {SWATCHES.map((s) => (
            <li
              key={s.name}
              className="flex items-center gap-3 border border-line bg-surface p-3"
              style={{ borderRadius: "var(--radius-control)" }}
            >
              <span
                className="h-10 w-10 shrink-0 border border-line"
                style={{ background: s.value, borderRadius: "2px" }}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block font-mono text-[13px]">{s.name}</span>
                <span className="block font-mono text-[12px] text-muted">
                  {s.value}
                </span>
                <span className="block text-[13px] text-muted">{s.note}</span>
              </span>
            </li>
          ))}
        </ul>

        <h3 className="type-eyebrow mt-8 text-muted">
          Signal — status only, never decoration
        </h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {SIGNALS.map((s) => (
            <li
              key={s.name}
              className="flex items-center gap-3 border border-line bg-surface p-3"
              style={{ borderRadius: "var(--radius-control)" }}
            >
              <span
                className="h-10 w-10 shrink-0"
                style={{ background: s.value, borderRadius: "2px" }}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block font-mono text-[13px]">{s.name}</span>
                <span className="block font-mono text-[12px] text-muted">
                  {s.value}
                </span>
                <span className="block text-[13px] text-muted">{s.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}
