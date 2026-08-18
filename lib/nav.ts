/**
 * The nav. Ten sections plus the punch list and the print view.
 *
 * Adding a page means adding a line here and a markdown file in /content.
 * (Ask is the exception — it is a screen, not a document, so it has no file.)
 */

export type NavItem = {
  href: string;
  label: string;
  /** Shown under the label in the mobile drawer. */
  hint: string;
};

export const NAV: NavItem[] = [
  { href: "/", label: "Start Here", hint: "What all this is, and what breaks first" },
  { href: "/ask", label: "Ask", hint: "Ask a question about any of it, in plain English" },
  { href: "/systems", label: "Systems", hint: "Everything that was built, and what state it is in" },
  { href: "/accounts", label: "Accounts", hint: "Who owns what, and what is at risk" },
  { href: "/spend", label: "Spend", hint: "What it costs to run" },
  { href: "/how-this-was-built", label: "How This Was Built", hint: "The Claude Code workflow" },
  { href: "/claude", label: "Claude", hint: "The shared account, and what the API costs" },
  { href: "/runbooks", label: "Runbooks", hint: "What to do when something breaks" },
  { href: "/roadmap", label: "Roadmap", hint: "Unfinished and unstarted work" },
  { href: "/resources", label: "Resources", hint: "Presentation and learning material" },
];

/** Shown apart from the main nine, because they are tools rather than reading. */
export const UTILITY_NAV: NavItem[] = [
  { href: "/todos", label: "To do", hint: "Everything still unconfirmed" },
  { href: "/print", label: "Print everything", hint: "One page, for PDF" },
];

/**
 * True when `href` is the page currently being viewed. "/" has to match
 * exactly or it would light up on every route.
 */
export function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
