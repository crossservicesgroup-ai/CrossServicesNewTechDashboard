import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { splitCallouts, type CalloutVariant } from "@/lib/callouts";

/**
 * Renders content markdown.
 *
 * Two jobs: render GitHub-flavoured markdown (tables matter — the content
 * uses them heavily), and turn alert blockquotes into real callout blocks.
 */

/* -------------------------------------------------------------------------
   Element styling
   ------------------------------------------------------------------------- */

const components: Components = {
  h1: (props) => <h2 className="mt-10 mb-3 text-2xl" {...props} />,
  h2: (props) => <h2 className="mt-10 mb-3 text-2xl" {...props} />,
  h3: (props) => <h3 className="mt-8 mb-2 text-lg font-semibold" {...props} />,
  h4: (props) => (
    <h4 className="mt-6 mb-2 text-base font-semibold text-muted" {...props} />
  ),

  p: (props) => <p className="my-4 leading-relaxed" {...props} />,

  ul: (props) => <ul className="my-4 list-disc space-y-2 pl-6" {...props} />,
  ol: (props) => <ol className="my-4 list-decimal space-y-2 pl-6" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,

  a: ({ href, children, ...rest }) => {
    const external = typeof href === "string" && /^https?:/.test(href);
    return (
      <a
        href={href}
        className="text-cross-blue underline underline-offset-2 hover:text-cross-blue-hover"
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {children}
      </a>
    );
  },

  // Identifiers — anything you would type or paste — render in mono.
  // `overflow-wrap: anywhere` rather than `break-words`: env var names, label
  // paths and URLs are long unbroken strings, and one landing at the end of a
  // line would otherwise push the whole page sideways on a phone.
  code: ({ children, ...rest }) => (
    <code
      className="bg-[#eeeeec] px-1.5 py-0.5 font-mono text-[0.875em] [overflow-wrap:anywhere]"
      style={{ borderRadius: "2px" }}
      {...rest}
    >
      {children}
    </code>
  ),

  pre: ({ children, ...rest }) => (
    <pre
      className="my-5 overflow-x-auto border border-line bg-[#f4f4f2] p-4 font-mono text-[13px] leading-relaxed"
      style={{ borderRadius: "var(--radius-control)" }}
      {...rest}
    >
      {children}
    </pre>
  ),

  // Tables scroll inside their own container so a wide table never makes the
  // whole page scroll sideways on a phone. `max-w-full` on the wrapper is
  // what actually pins it to the parent width — without it the table's
  // min-width wins and pushes the page out.
  table: ({ children, ...rest }) => (
    <div className="my-6 max-w-full overflow-x-auto">
      <table className="w-full min-w-[32rem] border-collapse text-[15px]" {...rest}>
        {children}
      </table>
    </div>
  ),
  thead: (props) => <thead className="border-b-2 border-rule" {...props} />,
  th: (props) => (
    <th
      className="px-3 py-2 text-left align-bottom text-[13px] font-semibold"
      {...props}
    />
  ),
  td: (props) => (
    <td className="border-t border-line px-3 py-2 align-top" {...props} />
  ),

  // A plain blockquote — one that is not an alert callout.
  blockquote: (props) => (
    <blockquote
      className="my-5 border-l-[3px] border-cross-navy bg-surface py-1 pl-4 text-muted"
      {...props}
    />
  ),

  hr: () => <hr className="my-10 border-t border-line" />,

  img: ({ alt, ...rest }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} className="my-6 h-auto max-w-full" {...rest} />
  ),
};

/* -------------------------------------------------------------------------
   Callouts
   ------------------------------------------------------------------------- */

const CALLOUT_STYLE: Record<
  CalloutVariant,
  { label: string; border: string; bg: string; accent: string }
> = {
  todo: {
    label: "To do",
    border: "border-signal-progress",
    bg: "bg-signal-progress-tint",
    accent: "text-signal-progress",
  },
  warning: {
    label: "Warning",
    border: "border-signal-risk",
    bg: "bg-signal-risk-tint",
    accent: "text-signal-risk",
  },
  important: {
    label: "Important",
    border: "border-cross-navy",
    bg: "bg-[#eaeef4]",
    accent: "text-cross-navy",
  },
  note: {
    label: "Note",
    border: "border-signal-none",
    bg: "bg-signal-none-tint",
    accent: "text-signal-none",
  },
};

export function Callout({
  variant,
  title,
  body,
}: {
  variant: CalloutVariant;
  title: string;
  body: string;
}) {
  const style = CALLOUT_STYLE[variant];

  return (
    <div
      className={`callout my-6 border-l-4 ${style.border} ${style.bg} px-4 py-3`}
      style={{ borderRadius: "var(--radius-control)" }}
    >
      <p className={`type-eyebrow ${style.accent}`}>{style.label}</p>
      {title ? (
        <p className="mt-2 font-semibold text-ink">{title}</p>
      ) : null}
      {body ? (
        <div className="mt-1 text-[15px] [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {body}
          </ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------
   The renderer
   ------------------------------------------------------------------------- */

export function Markdown({ children }: { children: string }) {
  const segments = splitCallouts(children);

  return (
    <div className="[&>*:first-child]:mt-0">
      {segments.map((segment, i) =>
        segment.type === "callout" ? (
          <Callout
            key={i}
            variant={segment.variant}
            title={segment.title}
            body={segment.body}
          />
        ) : (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={components}>
            {segment.text}
          </ReactMarkdown>
        ),
      )}
    </div>
  );
}
