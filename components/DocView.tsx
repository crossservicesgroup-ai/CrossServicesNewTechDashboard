import Link from "next/link";
import type { Doc } from "@/lib/content";
import { Markdown } from "./Markdown";
import { ServiceTag } from "./ServiceTag";
import { TechnicalSectionToggle } from "./TechnicalDetail";
import { PrintButton } from "./PrintButton";

/**
 * The standard page furniture: a header carrying the service tag and the
 * facts an operator needs immediately, then the office-reader body, then the
 * collapsible technical half.
 */

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 border-t border-line py-2">
      <dt className="type-eyebrow w-28 shrink-0 pt-1 text-muted">{label}</dt>
      <dd className="min-w-0 flex-1 font-mono text-[13px] [overflow-wrap:anywhere]">
        {children}
      </dd>
    </div>
  );
}

/** A value that is still a TODO renders as an obvious amber marker. */
function Value({ value }: { value?: string }) {
  if (!value || value.toUpperCase().startsWith("TODO")) {
    return (
      <span className="text-signal-progress">
        {value && value.length > 4 ? value : "TODO — not confirmed"}
      </span>
    );
  }
  if (/^https?:/.test(value)) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cross-blue underline underline-offset-2"
      >
        {value}
      </a>
    );
  }
  return <span>{value}</span>;
}

export function DocHeader({ doc, eyebrow }: { doc: Doc; eyebrow: string }) {
  const hasMeta = doc.liveUrl || doc.repo || doc.owner;

  return (
    <header className="mb-8">
      <p className="type-eyebrow text-muted">{eyebrow}</p>
      <h1 className="mt-3 text-3xl sm:text-4xl">{doc.title}</h1>
      {doc.summary ? (
        <p className="mt-3 text-[17px] text-muted">{doc.summary}</p>
      ) : null}

      <div className="mt-6">
        <ServiceTag
          id={doc.slug}
          status={doc.status}
          lastReviewed={doc.lastReviewed}
        />
      </div>

      {hasMeta ? (
        <dl className="mt-5 border-b border-line">
          {doc.liveUrl ? (
            <MetaRow label="Live at">
              <Value value={doc.liveUrl} />
            </MetaRow>
          ) : null}
          {doc.repo ? (
            <MetaRow label="Repo">
              <Value value={doc.repo} />
            </MetaRow>
          ) : null}
          <MetaRow label="Owner">
            <Value value={doc.owner} />
          </MetaRow>
        </dl>
      ) : null}

      <div className="mt-5">
        <PrintButton />
      </div>
    </header>
  );
}

/**
 * The operator half. Hidden or shown per the global preference, overridable
 * per section, and always printed open.
 */
export function TechnicalSection({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      data-tech-section=""
      className="mt-12"
      aria-label="Technical detail"
    >
      <TechnicalSectionToggle targetId={id} />
      <div id={`${id}-body`} className="tech-body pt-2">
        {children}
      </div>
    </section>
  );
}

/** A full document: header, body, and technical half if the file has one. */
export function DocView({
  doc,
  eyebrow,
  backHref,
  backLabel,
}: {
  doc: Doc;
  eyebrow: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <article>
      {backHref ? (
        <Link
          href={backHref}
          className="no-print type-eyebrow mb-6 inline-block text-cross-blue"
        >
          ← {backLabel}
        </Link>
      ) : null}

      <DocHeader doc={doc} eyebrow={eyebrow} />

      <Markdown>{doc.bodyMain}</Markdown>

      {doc.bodyTechnical ? (
        <TechnicalSection id={`tech-${doc.slug}`}>
          <Markdown>{doc.bodyTechnical}</Markdown>
        </TechnicalSection>
      ) : null}
    </article>
  );
}
