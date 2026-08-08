"use client";

import Link from "next/link";

/**
 * "Print this section" opens the browser's own print dialog, which is what
 * produces the PDF. The print stylesheet in globals.css hides the navigation,
 * opens every collapsed technical section and prints link URLs.
 */
export function PrintButton() {
  return (
    <div className="no-print flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => window.print()}
        className="border border-line bg-surface px-3 py-1.5 text-[13px] hover:border-cross-blue"
        style={{ borderRadius: "var(--radius-control)" }}
      >
        Print this section
      </button>
      <Link
        href="/print"
        className="border border-line bg-surface px-3 py-1.5 text-[13px] hover:border-cross-blue"
        style={{ borderRadius: "var(--radius-control)" }}
      >
        Print everything
      </Link>
    </div>
  );
}
