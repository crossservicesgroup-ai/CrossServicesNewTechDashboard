import fs from "node:fs";
import path from "node:path";
import { CONTENT_ROOT } from "./content";
import type { OwnershipStatus } from "./status";

/**
 * The two JSON data files.
 *
 * accounts.json answers "who owns this and what breaks if it lapses".
 * spend.json answers "what does it cost", and is deliberately full of nulls —
 * a null means nobody has confirmed the number, and that is displayed as
 * "Not yet confirmed" rather than quietly counted as zero.
 */

export type Account = {
  service: string;
  purpose: string;
  accountOwner: string;
  loginAs: string;
  vaultEntry: string;
  twoFactor: string;
  usedBy: string[];
  ifThisLapses: string;
  ownershipStatus: OwnershipStatus;
};

export type SpendItem = {
  service: string;
  monthlyCost: number | null;
  billing: string;
  costType: "fixed" | "variable";
  attributedTo: string[];
  renewalDate: string;
  note: string;
  spendCap: string | null;
};

function readJson<T>(file: string): T[] {
  const full = path.join(CONTENT_ROOT, "data", file);
  if (!fs.existsSync(full)) return [];
  return JSON.parse(fs.readFileSync(full, "utf8")) as T[];
}

export function getAccounts(): Account[] {
  // At-risk first — those are the rows somebody has to act on.
  const order: OwnershipStatus[] = ["at-risk", "unknown", "csg-owned"];
  return readJson<Account>("accounts.json").sort(
    (a, b) =>
      order.indexOf(a.ownershipStatus) - order.indexOf(b.ownershipStatus) ||
      a.service.localeCompare(b.service),
  );
}

export function getSpend(): SpendItem[] {
  return readJson<SpendItem>("spend.json").sort((a, b) =>
    a.service.localeCompare(b.service),
  );
}

/* -------------------------------------------------------------------------
   Spend totals
   ------------------------------------------------------------------------- */

export type SpendTotals = {
  /** Sum of the costs that ARE confirmed. */
  confirmedMonthly: number;
  confirmedAnnual: number;
  /** How many rows have no confirmed cost. */
  unconfirmedCount: number;
  /** Rows billed on usage with no known cap — the surprise-invoice risk. */
  uncappedVariable: SpendItem[];
};

export function getSpendTotals(items: SpendItem[]): SpendTotals {
  const confirmedMonthly = items.reduce(
    (sum, item) => sum + (item.monthlyCost ?? 0),
    0,
  );

  return {
    confirmedMonthly,
    confirmedAnnual: confirmedMonthly * 12,
    unconfirmedCount: items.filter((i) => i.monthlyCost === null).length,
    uncappedVariable: items.filter(
      (i) => i.costType === "variable" && !i.spendCap,
    ),
  };
}

/** Cost rolled up per system slug, plus anything not attributable to one. */
export function getSpendBySystem(items: SpendItem[]) {
  const bySystem = new Map<
    string,
    { confirmed: number; unconfirmed: number; services: string[] }
  >();

  for (const item of items) {
    const keys = item.attributedTo.length ? item.attributedTo : ["unattributed"];
    for (const key of keys) {
      const row = bySystem.get(key) ?? {
        confirmed: 0,
        unconfirmed: 0,
        services: [],
      };
      if (item.monthlyCost === null) row.unconfirmed += 1;
      else row.confirmed += item.monthlyCost;
      row.services.push(item.service);
      bySystem.set(key, row);
    }
  }

  return [...bySystem.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function formatMoney(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}
