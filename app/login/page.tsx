import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, string> = {
  wrong: "That password was not right. Try again.",
  unconfigured:
    "This site is not fully set up yet. SITE_PASSWORD and SESSION_SECRET need adding in Vercel. Until then nobody can sign in.",
};

type Props = {
  searchParams: Promise<{ error?: string; from?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error, from } = await searchParams;
  const message = error ? MESSAGES[error] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <p className="type-eyebrow text-muted">Cross Services Group</p>
        <h1 className="mt-3 text-3xl">Systems handover</h1>

        {/* Someone who lands here should know what this is before they are
            asked for anything. */}
        <p className="mt-4 text-[16px] leading-relaxed text-muted">
          Internal documentation for the websites, automations and AI tools
          built for Cross Services Group — what exists, what it costs, who owns
          each account, and what to do when something breaks.
        </p>
        <p className="mt-3 text-[16px] leading-relaxed text-muted">
          It is password-protected because it describes how the company&apos;s
          systems are put together. If you need access, ask the office.
        </p>

        {message ? (
          <div
            className="callout mt-6 border-l-4 border-signal-risk bg-signal-risk-tint px-4 py-3"
            style={{ borderRadius: "var(--radius-control)" }}
            role="alert"
          >
            <p className="text-[15px]">{message}</p>
          </div>
        ) : null}

        <form
          action="/api/login"
          method="POST"
          className="mt-8 border border-line bg-surface"
          style={{ borderRadius: "var(--radius-card)" }}
        >
          <div className="h-[3px] bg-rule" aria-hidden="true" />
          <div className="p-5">
            <label
              htmlFor="password"
              className="type-eyebrow block text-muted"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              className="mt-2 w-full border border-line bg-paper px-3 py-2.5 text-[17px] outline-none focus:border-cross-blue"
              style={{ borderRadius: "var(--radius-control)" }}
            />
            <input type="hidden" name="from" value={from ?? "/"} />

            <button
              type="submit"
              className="mt-4 w-full bg-cross-blue px-4 py-2.5 text-[16px] font-medium text-white hover:bg-cross-blue-hover"
              style={{ borderRadius: "var(--radius-control)" }}
            >
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-6 text-[14px] text-muted">
          This site stores no passwords or API keys. Credentials live in
          Bitwarden.
        </p>
      </div>
    </main>
  );
}
