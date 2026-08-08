import {
  SYSTEM_STATUS,
  OWNERSHIP_STATUS,
  TONE_CLASSES,
  formatReviewDate,
  type SystemStatus,
  type OwnershipStatus,
} from "@/lib/status";

/**
 * The service tag.
 *
 * This is the one element repeated across every system, account and runbook,
 * and it is modelled on the inspection tag zip-tied to a piece of equipment:
 * a hard rule across the top, a monospace identifier, a solid status block,
 * and the date somebody last checked it.
 *
 * Deliberately flat — no shadow, no gradient, 2px corners at most.
 */

type Props = {
  /** The mono identifier, e.g. "furies-scheduler". */
  id: string;
  status: SystemStatus | OwnershipStatus;
  /** YYYY-MM-DD. Renders as "Never" when missing, which is the honest answer. */
  lastReviewed?: string;
  /** Optional second line, e.g. the service a runbook belongs to. */
  context?: string;
  className?: string;
};

function resolve(status: SystemStatus | OwnershipStatus) {
  if (status in SYSTEM_STATUS) {
    return SYSTEM_STATUS[status as SystemStatus];
  }
  return OWNERSHIP_STATUS[status as OwnershipStatus];
}

export function ServiceTag({
  id,
  status,
  lastReviewed,
  context,
  className = "",
}: Props) {
  const meta = resolve(status);
  const tone = TONE_CLASSES[meta.tone];

  return (
    <div
      className={`service-tag border border-line border-t-0 bg-surface ${className}`}
      style={{ borderRadius: "var(--radius-control)" }}
    >
      {/* The hard rule. This is the detail that makes it read as a tag
          rather than a card. */}
      <div className="h-[3px] bg-rule" aria-hidden="true" />

      {/* No flex-wrap: the signal block stays pinned top-right at every width.
          If it were allowed to drop below the text, a long context line would
          move the signal somewhere different on each tag, and the whole point
          of the tag is that your eye finds the status in the same place. */}
      <div className="flex items-start justify-between gap-x-3 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[13px] leading-tight font-medium break-all text-ink">
            {id}
          </p>
          {context ? (
            <p className="mt-1 text-[13px] leading-tight text-muted">{context}</p>
          ) : null}
        </div>

        <span
          className={`signal-block type-eyebrow shrink-0 px-2 py-1.5 ${tone.solid}`}
          style={{ borderRadius: "var(--radius-control)" }}
        >
          {meta.label}
        </span>
      </div>

      <div className="border-t border-line px-3 py-2">
        <p className="type-eyebrow text-muted">
          Last reviewed{" "}
          <span className="text-ink">{formatReviewDate(lastReviewed)}</span>
        </p>
      </div>
    </div>
  );
}

/**
 * The compact form — a single inline pill, for tables and list rows where a
 * full tag would be too heavy.
 */
export function StatusPill({
  status,
  className = "",
}: {
  status: SystemStatus | OwnershipStatus;
  className?: string;
}) {
  const meta = resolve(status);
  const tone = TONE_CLASSES[meta.tone];

  return (
    <span
      className={`signal-block type-eyebrow inline-block px-2 py-1 whitespace-nowrap ${tone.solid} ${className}`}
      style={{ borderRadius: "var(--radius-control)" }}
    >
      {meta.label}
    </span>
  );
}
