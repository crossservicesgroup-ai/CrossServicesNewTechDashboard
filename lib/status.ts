/**
 * Every status value used anywhere in the dashboard is defined here, once.
 *
 * If you want to change what a status is called on screen, change the `label`
 * below and it changes on every page. Do not add a new status without adding
 * it here first — the colour, the label and the explanation all come from
 * this file.
 */

export type SystemStatus = "live" | "in-progress" | "not-built" | "needs-owner";

export type OwnershipStatus = "csg-owned" | "at-risk" | "unknown";

/** The four visual signals. Colour is never used for anything else. */
export type SignalTone = "live" | "progress" | "risk" | "none";

type StatusMeta = {
  label: string;
  tone: SignalTone;
  /** Plain English, for the legend and for screen readers. */
  meaning: string;
};

export const SYSTEM_STATUS: Record<SystemStatus, StatusMeta> = {
  live: {
    label: "Live",
    tone: "live",
    meaning: "Running in production right now and being used.",
  },
  "in-progress": {
    label: "In progress",
    tone: "progress",
    meaning: "Built, but not switched on or not finished.",
  },
  "not-built": {
    label: "Not built",
    tone: "none",
    meaning: "Discussed or scoped, but no work has started.",
  },
  "needs-owner": {
    label: "Needs owner",
    tone: "risk",
    meaning: "Working, but nobody is responsible for it. It will rot.",
  },
};

export const OWNERSHIP_STATUS: Record<OwnershipStatus, StatusMeta> = {
  "csg-owned": {
    label: "CSG owned",
    tone: "live",
    meaning: "The account belongs to Cross Services. Nothing to do.",
  },
  "at-risk": {
    label: "At risk",
    tone: "risk",
    meaning:
      "The account is on a personal login. If that login goes away, this breaks.",
  },
  unknown: {
    label: "Unknown",
    tone: "progress",
    meaning: "Nobody has confirmed who owns this. Find out.",
  },
};

/** Tailwind classes per tone. Kept here so the mapping lives in one place. */
export const TONE_CLASSES: Record<
  SignalTone,
  { solid: string; tint: string; text: string; border: string }
> = {
  live: {
    solid: "bg-signal-live text-white",
    tint: "bg-signal-live-tint",
    text: "text-signal-live",
    border: "border-signal-live",
  },
  progress: {
    solid: "bg-signal-progress text-white",
    tint: "bg-signal-progress-tint",
    text: "text-signal-progress",
    border: "border-signal-progress",
  },
  risk: {
    solid: "bg-signal-risk text-white",
    tint: "bg-signal-risk-tint",
    text: "text-signal-risk",
    border: "border-signal-risk",
  },
  none: {
    solid: "bg-signal-none text-white",
    tint: "bg-signal-none-tint",
    text: "text-signal-none",
    border: "border-signal-none",
  },
};

export function isSystemStatus(value: unknown): value is SystemStatus {
  return typeof value === "string" && value in SYSTEM_STATUS;
}

export function isOwnershipStatus(value: unknown): value is OwnershipStatus {
  return typeof value === "string" && value in OWNERSHIP_STATUS;
}

/**
 * Dates are written as YYYY-MM-DD in the content files and rendered as
 * "7 Aug 2026". Formatted in UTC on purpose: parsing "2026-08-07" gives a
 * UTC midnight, and formatting that in a US timezone would render it as the
 * 6th.
 */
export function formatReviewDate(value: string | undefined): string {
  if (!value) return "Never";
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
