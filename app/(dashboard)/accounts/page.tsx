import type { Metadata } from "next";
import Link from "next/link";
import { getAccounts } from "@/lib/data";
import { Page } from "@/components/Shell";
import { StatusPill } from "@/components/ServiceTag";
import { PrintButton } from "@/components/PrintButton";
import { OWNERSHIP_STATUS } from "@/lib/status";

export const metadata: Metadata = {
  title: "Accounts",
  description:
    "Who owns each account, where the credential lives, and what breaks if it lapses.",
};

/** Renders a TODO value in amber so unconfirmed facts are never mistaken for confirmed ones. */
function Field({ value }: { value: string }) {
  const isTodo = value.toUpperCase().startsWith("TODO");
  return (
    <span className={isTodo ? "text-signal-progress" : undefined}>{value}</span>
  );
}

export default function AccountsPage() {
  const accounts = getAccounts();
  const atRisk = accounts.filter((a) => a.ownershipStatus === "at-risk");
  const unknown = accounts.filter((a) => a.ownershipStatus === "unknown");

  return (
    <Page wide>
      <header className="mb-8">
        <p className="type-eyebrow text-muted">Cross Services Systems</p>
        <h1 className="mt-3 text-3xl sm:text-4xl">Accounts</h1>
        <p className="mt-3 max-w-[70ch] text-[17px] text-muted">
          Every account these systems depend on, who owns it, and what breaks
          if it lapses.
        </p>
        <div className="mt-5">
          <PrintButton />
        </div>
      </header>

      {/* The credential model, before the table, because it explains why no
          passwords appear anywhere on this site. */}
      <section
        className="callout border-l-4 border-cross-navy bg-[#eaeef4] px-4 py-4"
        style={{ borderRadius: "var(--radius-control)" }}
      >
        <h2 className="text-lg">How credentials are stored</h2>
        <div className="mt-2 max-w-[70ch] space-y-3 text-[15px] leading-relaxed">
          <p>
            <strong>This dashboard stores no secrets.</strong> It is a map to
            where credentials live, not a vault. No password, API key, token or
            recovery code appears anywhere in this site or its source code.
          </p>
          <p>
            The vault is <strong>Bitwarden</strong> — a free two-person
            organisation holding a <span className="font-mono">CSG Systems</span>{" "}
            collection. Each row below names the entry that holds its
            credential.
          </p>
          <p>
            Bitwarden&apos;s free tier does not include the built-in
            authenticator, so 2FA setup seeds and backup recovery codes are
            stored as secure notes, and the authenticator app itself lives on a
            CSG-owned device rather than on anyone&apos;s personal phone.
          </p>
          <p>
            There is also a <strong>break-glass envelope</strong>: owner-level
            credentials and recovery codes for the domain registrar and the
            Google admin account, printed once, sealed, and kept in the office
            safe.
          </p>
        </div>
      </section>

      {atRisk.length > 0 ? (
        <section
          className="callout mt-6 border-l-4 border-signal-risk bg-signal-risk-tint px-4 py-4"
          style={{ borderRadius: "var(--radius-control)" }}
        >
          <p className="type-eyebrow text-signal-risk">Act on these</p>
          <h2 className="mt-2 text-lg">
            {atRisk.length} account{atRisk.length === 1 ? "" : "s"} sit on a
            personal login
          </h2>
          <p className="mt-2 max-w-[70ch] text-[15px]">
            These are the ones that break when Gavin&apos;s accounts go away.
            {unknown.length > 0 ? (
              <>
                {" "}
                A further {unknown.length} have not had their ownership
                confirmed at all.
              </>
            ) : null}
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px]">
            {atRisk.map((a) => (
              <li key={a.service}>
                <span className="font-mono">{a.service}</span> — {a.ifThisLapses}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* One card per account. A wide table would either scroll sideways on a
          phone or crush nine columns into unreadable slivers. */}
      <section className="mt-10 space-y-5">
        {accounts.map((account) => (
          <article
            key={account.service}
            className="border border-line bg-surface"
            style={{ borderRadius: "var(--radius-card)" }}
          >
            <div className="h-[3px] bg-rule" aria-hidden="true" />
            <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <h2 className="text-xl">{account.service}</h2>
                <p className="mt-1 text-[15px] text-muted">{account.purpose}</p>
              </div>
              <StatusPill status={account.ownershipStatus} />
            </div>

            <dl className="border-t border-line px-4 py-3 text-[14px]">
              {[
                ["Account owner", account.accountOwner],
                ["Log in as", account.loginAs],
                ["Vault entry", account.vaultEntry],
                ["Two-factor", account.twoFactor],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-wrap gap-x-3 gap-y-0.5 border-b border-line py-2 last:border-b-0"
                >
                  <dt className="type-eyebrow w-32 shrink-0 pt-1 text-muted">
                    {label}
                  </dt>
                  <dd className="min-w-0 flex-1 font-mono text-[13px] [overflow-wrap:anywhere]">
                    <Field value={value} />
                  </dd>
                </div>
              ))}
            </dl>

            <div className="border-t border-line bg-paper px-4 py-3">
              <p className="type-eyebrow text-muted">If this lapses</p>
              <p className="mt-1 text-[15px]">{account.ifThisLapses}</p>
              {account.usedBy.length > 0 ? (
                <p className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="type-eyebrow text-muted">Used by</span>
                  {account.usedBy.map((slug) => (
                    <Link
                      key={slug}
                      href={`/systems/${slug}`}
                      className="border border-line bg-surface px-2 py-0.5 font-mono text-[12px] text-cross-blue hover:border-cross-blue"
                      style={{ borderRadius: "2px" }}
                    >
                      {slug}
                    </Link>
                  ))}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-xl">What the ownership labels mean</h2>
        <dl className="mt-4 divide-y divide-line border-y border-line">
          {Object.entries(OWNERSHIP_STATUS).map(([key, meta]) => (
            <div key={key} className="flex flex-wrap gap-x-4 gap-y-1 py-3">
              <dt className="w-32 shrink-0 font-mono text-[13px] text-muted">
                {key}
              </dt>
              <dd className="min-w-[16rem] flex-1 text-[15px]">
                {meta.meaning}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </Page>
  );
}
