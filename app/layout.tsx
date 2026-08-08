import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import { BOOT_SCRIPT } from "@/components/TechnicalDetail";
import "./globals.css";

/* Same three families as the public CSG website, loaded the same way.
   Newsreader for headings, Plex Sans for reading, Plex Mono for anything
   you would type or paste. */

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-newsreader",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "CSG Systems",
    template: "%s — CSG Systems",
  },
  description:
    "Internal handover documentation for Cross Services Group systems, accounts and costs.",
  // This is an internal document. It should never turn up in a search result.
  robots: { index: false, follow: false, nocache: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /* suppressHydrationWarning is required, not incidental. The script below
       sets data-tech on this element before React hydrates, so the server HTML
       and the live DOM deliberately differ by that one attribute. Without this
       flag React logs a hydration mismatch on every page load.

       It only suppresses warnings for this element's own attributes — one
       level deep, not the whole tree — so real mismatches inside the app are
       still reported. */
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        {/* Runs before first paint so the technical-detail sections are
            already in the right state when the page appears. */}
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body
        className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
