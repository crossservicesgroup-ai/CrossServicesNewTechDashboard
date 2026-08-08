"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV, UTILITY_NAV, isActive } from "@/lib/nav";
import { TechnicalToggle } from "./TechnicalDetail";
import { SearchTrigger } from "./Search";

/**
 * Navigation.
 *
 * Desktop: a persistent left sidebar. Mobile: a top bar with a drawer.
 * Both are hidden in print — a paper copy has no use for links.
 */

function NavLinks({
  pathname,
  onNavigate,
  todoCount,
}: {
  pathname: string;
  onNavigate?: () => void;
  todoCount: number;
}) {
  return (
    <>
      <ul className="space-y-0.5">
        {NAV.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`block border-l-2 px-3 py-2 text-[15px] leading-snug ${
                  active
                    ? "border-cross-blue bg-[#eaeef4] font-medium text-cross-navy"
                    : "border-transparent text-ink hover:border-line hover:bg-[#efeeea]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <hr className="my-4 border-t border-line" />

      <ul className="space-y-0.5">
        {UTILITY_NAV.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={`flex items-center justify-between gap-2 border-l-2 px-3 py-2 text-[15px] leading-snug ${
                  active
                    ? "border-cross-blue bg-[#eaeef4] font-medium text-cross-navy"
                    : "border-transparent text-ink hover:border-line hover:bg-[#efeeea]"
                }`}
              >
                <span>{item.label}</span>
                {item.href === "/todos" && todoCount > 0 ? (
                  <span
                    className="signal-block type-eyebrow bg-signal-progress px-1.5 py-0.5 text-white"
                    style={{ borderRadius: "2px" }}
                    aria-label={`${todoCount} open items`}
                  >
                    {todoCount}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function Sidebar({ todoCount }: { todoCount: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="no-print hidden w-64 shrink-0 border-r border-line bg-surface md:block"
    >
      <div className="sticky top-0 flex max-h-screen flex-col overflow-y-auto px-3 py-5">
        <Link href="/" className="px-3">
          <span className="type-eyebrow block text-muted">Cross Services</span>
          <span className="mt-1 block font-display text-xl leading-tight text-cross-navy">
            Systems
          </span>
        </Link>

        <div className="mt-5 px-3">
          <SearchTrigger />
        </div>

        <div className="mt-5">
          <NavLinks pathname={pathname} todoCount={todoCount} />
        </div>

        <div className="mt-6 px-3 pb-4">
          <TechnicalToggle className="w-full justify-start" />
        </div>
      </div>
    </nav>
  );
}

export function MobileBar({ todoCount }: { todoCount: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close the drawer when the route changes, or the reader taps a link and
  // then finds the drawer still covering the page they asked for.
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes it, and the body must not scroll behind an open drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="no-print md:hidden">
      <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3">
        <Link href="/" className="min-w-0">
          <span className="type-eyebrow block text-muted">Cross Services</span>
          <span className="block font-display text-lg leading-tight text-cross-navy">
            Systems
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <SearchTrigger compact />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-drawer"
            className="border border-line bg-surface px-3 py-2 text-[14px]"
            style={{ borderRadius: "var(--radius-control)" }}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-[#16181a]/40"
          />
          <div
            id="mobile-drawer"
            ref={panelRef}
            tabIndex={-1}
            className="fixed inset-x-0 top-0 z-50 max-h-[85vh] overflow-y-auto border-b border-line bg-surface px-3 pt-4 pb-6 shadow-lg"
          >
            <div className="flex items-center justify-between px-3 pb-3">
              <span className="type-eyebrow text-muted">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border border-line px-3 py-1.5 text-[14px]"
                style={{ borderRadius: "var(--radius-control)" }}
              >
                Close
              </button>
            </div>
            <NavLinks
              pathname={pathname}
              onNavigate={() => setOpen(false)}
              todoCount={todoCount}
            />
            <div className="mt-5 px-3">
              <TechnicalToggle className="w-full justify-start" />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
