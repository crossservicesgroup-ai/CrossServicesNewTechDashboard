"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * The technical-detail machinery.
 *
 * Requirements this has to satisfy at once:
 *   - collapsed by default on mobile, expanded by default on desktop
 *   - a global toggle in the header that sets the default for every page
 *   - that choice persists in a cookie, not localStorage
 *   - no flash of the wrong state on first paint
 *
 * The server cannot know the viewport, so it cannot render the correct
 * default. Instead a blocking script (see BOOT_SCRIPT in app/layout.tsx)
 * sets data-tech on <html> before first paint, and CSS keys off that. React
 * never renders the open/closed state itself, so there is nothing for
 * hydration to disagree about.
 */

export const TECH_COOKIE = "csg-technical";

/** Runs before first paint. Keep it small and defensive. */
export const BOOT_SCRIPT = `
(function(){
  try {
    var m = document.cookie.match(/(?:^|; )${TECH_COOKIE}=([^;]*)/);
    var v = m ? decodeURIComponent(m[1]) : null;
    var show = v ? v === "show" : window.matchMedia("(min-width: 768px)").matches;
    document.documentElement.setAttribute("data-tech", show ? "show" : "hide");
  } catch (e) {
    document.documentElement.setAttribute("data-tech", "show");
  }
})();
`.trim();

function readPreference(): boolean {
  if (typeof document === "undefined") return true;
  return document.documentElement.getAttribute("data-tech") !== "hide";
}

function writeCookie(show: boolean) {
  // A year, path-wide, lax. No secrets in here — it is a display preference.
  document.cookie = `${TECH_COOKIE}=${show ? "show" : "hide"}; path=/; max-age=31536000; samesite=lax`;
}

/* -------------------------------------------------------------------------
   The global switch, in the header
   ------------------------------------------------------------------------- */

export function TechnicalToggle({ className = "" }: { className?: string }) {
  // Starts as null so the button renders the same on the server and on the
  // first client render; the real value lands in the effect below.
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => setShow(readPreference()), []);

  const toggle = useCallback(() => {
    const next = !readPreference();
    document.documentElement.setAttribute("data-tech", next ? "show" : "hide");
    // Clear any per-section overrides so the global switch really is global.
    document
      .querySelectorAll("[data-tech-section]")
      .forEach((el) => el.removeAttribute("data-open"));
    writeCookie(next);
    setShow(next);
  }, []);

  const checked = show ?? true;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={show === null ? undefined : checked}
      onClick={toggle}
      className={`no-print inline-flex items-center gap-2 border border-line bg-surface px-3 py-1.5 text-[13px] text-ink hover:border-cross-blue ${className}`}
      style={{ borderRadius: "var(--radius-control)" }}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-3 w-3 border ${
          checked
            ? "border-cross-blue bg-cross-blue"
            : "border-muted bg-transparent"
        }`}
        style={{ borderRadius: "2px" }}
      />
      Show technical detail
    </button>
  );
}

/* -------------------------------------------------------------------------
   The per-section button
   ------------------------------------------------------------------------- */

/**
 * Overrides the global default for one section only, by setting data-open on
 * the wrapper. The CSS in globals.css resolves the two.
 */
export function TechnicalSectionToggle({ targetId }: { targetId: string }) {
  const [, force] = useState(0);

  const toggle = useCallback(() => {
    const section = document.getElementById(targetId);
    if (!section) return;

    const globalShow = readPreference();
    const override = section.getAttribute("data-open");
    const currentlyOpen = override === null ? globalShow : override === "1";

    section.setAttribute("data-open", currentlyOpen ? "0" : "1");
    force((n) => n + 1);
  }, [targetId]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-controls={`${targetId}-body`}
      className="no-print inline-flex w-full items-center justify-between gap-3 border-b border-line py-2 text-left hover:text-cross-blue"
    >
      <span className="type-eyebrow text-muted">Technical detail</span>
      <span className="type-eyebrow text-cross-blue">
        <span className="tech-show-label">Show</span>
        <span className="tech-hide-label">Hide</span>
      </span>
    </button>
  );
}
