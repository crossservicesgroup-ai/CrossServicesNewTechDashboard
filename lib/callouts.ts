/**
 * Callout parsing.
 *
 * The content uses GitHub-style alert blockquotes:
 *
 *   > [!TODO] Repo URL
 *   > Confirm with Gavin before handoff.
 *
 * The spec requires TODOs to render as a visually obvious amber block rather
 * than as inline text, so they cannot just be styled blockquotes. Rather than
 * fight the markdown renderer over blockquote children, the document is split
 * into plain-markdown segments and callout segments before rendering, and
 * each is rendered on its own terms.
 */

export type CalloutVariant = "todo" | "warning" | "note" | "important";

export type Segment =
  | { type: "markdown"; text: string }
  | { type: "callout"; variant: CalloutVariant; title: string; body: string };

const VARIANTS: Record<string, CalloutVariant> = {
  todo: "todo",
  warning: "warning",
  caution: "warning",
  note: "note",
  tip: "note",
  important: "important",
};

const OPENER = /^\s*>\s*\[!([A-Za-z]+)\]\s*(.*)$/;

export function splitCallouts(markdown: string): Segment[] {
  const lines = markdown.split("\n");
  const segments: Segment[] = [];
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text) segments.push({ type: "markdown", text });
    buffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(OPENER);
    const variant = match ? VARIANTS[match[1].toLowerCase()] : undefined;

    // An unrecognised alert type falls through and renders as an ordinary
    // blockquote, rather than vanishing.
    if (!match || !variant) {
      buffer.push(lines[i]);
      continue;
    }

    flush();

    const title = match[2].trim();
    const body: string[] = [];

    let j = i + 1;
    for (; j < lines.length; j++) {
      const quoted = lines[j].match(/^\s*>\s?(.*)$/);
      if (!quoted) break;
      // A new alert marker ends this callout and starts the next one.
      if (OPENER.test(lines[j])) break;
      body.push(quoted[1]);
    }

    segments.push({
      type: "callout",
      variant,
      title,
      body: body.join("\n").trim(),
    });

    i = j - 1;
  }

  flush();
  return segments;
}
