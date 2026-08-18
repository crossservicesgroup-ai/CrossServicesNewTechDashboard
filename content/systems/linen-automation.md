---
title: Linen Order Automation
slug: linen-automation
status: live
owner: TODO
liveUrl: TODO
repo: TODO
lastReviewed: 2026-08-17
summary: Copies new Furies linen orders out of email and into the order spreadsheet automatically, instead of someone typing each one in by hand.
---

## What this is

The Furies rents linens on Cape Cod. Orders come in through the WooCommerce website and arrive as an order email in the `info@thefuriesonline.com` Gmail inbox. Until now, someone in the office copied each order into a spreadsheet by hand and sent a confirmation email from a saved template — roughly a couple of minutes per order, worst on Monday mornings. This automation does that copying step for them.

There is no AI model involved in reading the orders. The order emails always look the same, so the automation pulls the fields out using fixed rules, not guesswork. The same email will always produce the same result.

## Where it lives

**The order spreadsheet:** [Linen order spreadsheet](https://docs.google.com/spreadsheets/d/163KmRWhCMJob_XENNcaAAYsexCp1yg4oQLnOcbYqD1Q/edit) — this is where the orders land. If you only want to see today's orders, this is the link you need.

**The automation itself:** [Apps Script project](https://script.google.com/home/projects/1WVcqTi2b0RrmMW8MLFt0Hd8OoNk1RhtjRKxOLPlboOfHfs4vTOtzHNVu/edit) — the code, the triggers and the settings. You must be signed in as `info@thefuriesonline.com` for this link to open; signed in as anyone else it will show an error, not a login prompt.

This runs as a Google Apps Script project inside the `info@thefuriesonline.com` Google account. It is not a separate website or app, it does not run on a server anyone has to maintain, and there is no subscription or API key attached to it — it runs on Google's own infrastructure, for free, as part of that Gmail/Google account. There is no live web address (`liveUrl`) because there is no site to visit, and no code repository (`repo`) because the code lives inside the Apps Script editor attached to that Google account, not on GitHub. Whoever has access to `info@thefuriesonline.com` already has full access to this system — ownership here is already clean.

## Is it working right now?

The spreadsheet step is live: new orders get written into the order spreadsheet on their own.

**The email step is in `draft` mode as of 17 Aug 2026. No customer has received an automatic email.** Confirmations are written into the Gmail drafts folder and go nowhere until someone changes the setting deliberately.

The email step has **three** settings, not two:

- `off` — rows get written and no email is created or sent at all.
- `draft` — a confirmation email is written into the Gmail drafts folder, addressed to the real customer, but nothing goes out. This is the rehearsal setting, and the one it is on now.
- `send` — the confirmation email goes to the customer automatically.

The spreadsheet step and the email step are separate switches, and they should never both be changed on the same day.

## The confirmation replies on the customer's own order thread

Since 17 Aug 2026 the confirmation is drafted as a **reply on the customer's original order thread**, rather than as a separate new email.

This is how the office has always done it by hand, and the reason is the customer's: the reply sits directly under the order details, so when someone writes back asking about their order, the order itself is right there in the same thread instead of in a different email they have to go and find.

Two things change visibly because of it, and both are unavoidable consequences of threading rather than choices anyone made:

- **The subject line is now the order email's own subject with `Re:` in front** — `Re: [Cape Cod Linen Rentals - The Furies]: You've got a new order: #14294` — instead of a custom confirmation subject. A threaded reply cannot have its own subject.
- **Customer replies come back to `info@thefuriesonline.com` and stay on the order thread.** That is the mailbox to watch, and the thread is where the whole exchange will live.

If threading ever needs turning off, `REPLY_ON_THREAD` in the script's `CONFIG` block reverts it to standalone emails.

## The spreadsheet is becoming the master record

The plan is for the year's existing order history to be pasted into the automated spreadsheet, so that one sheet holds both the history and everything the automation writes from now on.

> [!WARNING] Only one sheet can be the live one
> The moment history is pasted into the automated sheet, that sheet becomes the record the office works from — and the old sheet has to stop being used the same day. Two people typing into two different spreadsheets for a week is the messiest possible outcome, and it is very hard to unpick afterwards.
>
> The old sheet should be renamed to something nobody can open by accident, such as `Furies Linens 2026 — ARCHIVE (do not use)`, and everyone who touches linen orders needs telling directly, not just once in passing.

> [!TODO] Confirm the history has been merged and the old sheet archived
> Confirm that the historical rows are in the automated spreadsheet, that the row count looks right, that dates run in order across the join between old and new rows, and that the old sheet has been renamed to an obvious archive name. Confirm the office has been told which sheet to use.

## What you have to do daily

**Someone has to check the `needs-review` label in Gmail every day.**

The automation puts one of two labels on every order email it looks at:

- `linen-bot/done` — it read the order and copied it in successfully.
- `linen-bot/needs-review` — it found something it couldn't safely handle (a missing arrival date, a missing total, or missing line items) and left it for a person to enter by hand.

If nobody is checking `needs-review`, orders sit there half-handled and nobody finds out until a customer calls asking where their linens are. This has to be someone's daily job, not an occasional one.

> [!TODO] Owner for the daily needs-review check
> Someone needs to be assigned responsibility for checking the `linen-bot/needs-review` label in the `info@thefuriesonline.com` inbox every day. Confirm who, and make sure they know how.

## The most important warning

> [!WARNING] A customer's reply to their order is never seen
> The automation only reads emails whose subject matches the new-order notification (`subject:"got a new order"`). When a customer *replies* to their order thread — "can you move my delivery to Thursday" — the script does not see it, does not flag it, and does not update anything. The sheet keeps saying Tuesday.
>
> The failure mode is subtle: once rows start appearing on their own, people stop reading the inbox as carefully, and that is exactly when the replies stop getting read.
>
> Threading the confirmation onto the order thread makes this more likely, not less. The customer now has an obvious thing to reply to, and their reply lands in a thread the automation has already labelled `linen-bot/done` — which reads, at a glance, as a thread that has been dealt with.
>
> **The "Edits to Order" column is human-only, permanently.** The automation handles new orders. Changes stay manual.

<!-- TECHNICAL -->

## How it works

1. A time-driven trigger fires every 5 minutes.
2. It searches Gmail for `subject:"got a new order"` within the last 7 days, excluding anything already labelled.
3. It parses the order email's HTML directly, using fixed selectors — deliberately no AI model in this path, so the same email always produces the same result.
4. It appends a row to the Google Sheet across 13 columns.
5. It builds a confirmation email — a different one for delivery orders and pickup orders — and then either does nothing with it, saves it as a draft, or sends it, depending on `EMAIL_MODE`.
6. It applies the `linen-bot/done` label, which is what stops the same order being written twice.

Because the script appends at the first empty row below everything else, it always writes to the bottom of the sheet. It never overwrites a row that is already there, wherever the bottom happens to be.

## How the threaded reply works

WooCommerce sets the `Reply-To` header on the order notification to the customer's address, so the script replies to that message directly and the confirmation lands on the customer's own order thread.

**Before replying it checks that the `Reply-To` address matches the customer email it parsed out of the order body.** If the two disagree it does not reply to the thread — it falls back to a standalone email and logs why.

That check is the whole safety argument for this feature. `Reply-To` is set by WooCommerce configuration, which is editable outside this script by someone who has no idea it is load-bearing. Without the comparison, a change on the WooCommerce side would silently route order confirmations to whatever address the header now carried, and every confirmation would go to the wrong person while the script reported success. With it, a mismatch degrades to a standalone email and leaves a reason in the log.

Threading is controlled by `REPLY_ON_THREAD` in `CONFIG`. Set it to `false` to go back to standalone emails.

## Settings you can change

These live in the `CONFIG` block at the top of the script file.

| Setting | What it does |
| --- | --- |
| `EMAIL_MODE` | `off`, `draft` or `send`. Currently `draft`. See [Is it working right now?](#is-it-working-right-now) above. |
| `REPLY_ON_THREAD` | When on, the confirmation is drafted as a reply on the customer's original order thread instead of as a new email. `false` reverts to standalone emails. |
| `HOLD_ORDERS_WITH_NOTES` | When on, any order where the customer left a note becomes a draft for a person to read, **even in `send` mode**. Notes are usually where the awkward requests hide, so this is deliberate. |
| `INCLUDE_GREETING` | Whether the confirmation email opens with a greeting line. |
| `INCLUDE_ORDER_SUMMARY` | Whether the confirmation email lists what was ordered. |
| `PICKUP_MAP_URL` | The map link included in confirmation emails for pickup orders, so the customer can find the pickup location. |
| `SHEET_ID` | Which spreadsheet the automation writes to. |
| `PICKUP_LOCATION` | The pickup address shown to customers. |
| `REPLY_TO` | The address customer replies go to. |

> [!WARNING] HOLD_ORDERS_WITH_NOTES needs an owner once email goes live
> While `EMAIL_MODE` is `draft`, everything is a draft anyway, so this setting makes no visible difference and is easy to forget about. Once the mode is `send`, it starts quietly putting a small number of orders into the drafts folder instead of emailing them.
>
> If that folder collects a couple of drafts a week that someone reads and sends, the setting is working as intended. If it collects drafts nobody opens, those customers are getting no confirmation at all — which is worse than the automation having sent an imperfect one. Either give the folder an owner or turn the setting off.

## Safety rails already built in

- A 7-day lookback window, so the script can never reach back into the roughly 1,700 historical orders already in the inbox.
- A cap of 15 orders processed per run.
- A script lock so two runs can never overlap.
- A check of the order number against column B before appending a row, so even if a label is somehow missing, it still won't produce a duplicate row.

## Functions (run by hand from the Apps Script editor)

| Function | What it does |
| --- | --- |
| `checkSetup` | Confirms the sheet, tab and column headers match |
| `testParseLatest` | Parses the 5 most recent orders and logs what it *would* write, including the full text of the confirmation email it would produce. Writes nothing, sends nothing, drafts nothing. |
| `testThreadReply` | Creates one draft reply on the most recent order. Does not write to the sheet and does not touch labels, so it is the safe way to check email wording changes without disturbing live data. It does leave a real draft addressed to a real customer — delete it afterwards. |
| `setupTrigger` | Starts the automation on its 5-minute cycle |
| `removeTriggers` | Stops it completely |
| `resetLabelsForTesting` | Clears the bot labels so you can re-run against the same emails. **Dangerous once email is live — see below.** |

> [!WARNING] resetLabelsForTesting will re-email real customers in send mode
> The bot labels are the only thing stopping an order being handled twice. Clearing them makes the script treat the last 7 days of orders as brand new — so in `send` mode it would email every one of those customers a second time. There is no undo.
>
> It is a harmless testing tool in `off` mode and a live incident in `send` mode, and nothing about the function's name says so. Before `EMAIL_MODE` is switched to `send`, either delete this function or guard it so it refuses to run unless the mode is `off`.

## Open items

> [!TODO] Work through the staged plan for turning email on
> Email should go live in stages, cheapest and safest first. Do not skip to the end.
>
> 1. **Read the wording without sending anything.** Run `testParseLatest`. It prints the full email body for the 5 most recent orders to the execution log and sends nothing. This is where the awkward line breaks and clumsy phrasing get caught. Check both a delivery order and a pickup order, since they use different templates.
> 2. **Get the wording signed off** by whoever owns customer communication, before anything reaches a customer.
> 3. **Run in `draft` mode for at least a week**, with the trigger on. Every real order produces a draft addressed to the real customer. Read them, then delete them. The office keeps sending confirmations by hand as normal during this period. Be careful: these drafts are addressed to real people and it is easy to hit send by reflex.
> 4. **Place a real test order** on the website using your own email and address, and let it run untouched. This is the only test that proves the whole chain — site sends the order email, the trigger picks it up on its own, the row appears, the confirmation arrives. Check it on a phone, since that is where most customers will read it and where the pickup map link matters most. Refund the order afterwards.
> 5. **Switch to `send`**, and tell the office the exact day it starts so nobody double-sends.
>
> Before step 5, deal with `resetLabelsForTesting` (see the warning above).

> [!TODO] Confirm the confirmation email wording
> The confirmation email text needs checking against the office's real wording before any of it reaches a customer. The wording is built in `buildConfirmation()`, with the list of items in `buildOrderSummary()`. There are separate templates for delivery and pickup orders, and both need reading. Use `testThreadReply` to see the real thing without touching the sheet or the labels.
>
> The subject line is no longer part of this question. While `REPLY_ON_THREAD` is on, the subject is inherited from the order email as `Re: [Cape Cod Linen Rentals - The Furies]: You've got a new order: #14294` and cannot be set. The invented subject line that nobody had approved only comes back if threading is turned off.

> [!TODO] Confirm PICKUP_LOCATION and PICKUP_MAP_URL
> `PICKUP_LOCATION` was set from the email footer and has never been confirmed against the real office address.
>
> `PICKUP_MAP_URL` is the map link sent to pickup customers. Open it on a phone and confirm it lands on the right place — a map link that points at the wrong address sends customers somewhere else entirely, and they will not question it.

> [!TODO] REPLY_TO domain mismatch
> `REPLY_TO` is set to `info@thefuries.com`, but the account this automation runs from is `info@thefuriesonline.com` — a different domain. If `info@thefuries.com` is not a real, monitored mailbox, a confirmation sent through that path goes out with a reply-to address that bounces. Verify this before switching email on.
>
> Threading has narrowed this, not fixed it. While `REPLY_ON_THREAD` is on and the `Reply-To` check passes, replies land on the order thread at `info@thefuriesonline.com` and `REPLY_TO` never comes into it. It still applies on the standalone fallback path — which is exactly the path taken when something has already gone wrong, so it should not be the thing that fails next.

> [!TODO] Confirm which sheet SHEET_ID points to
> Confirm whether `SHEET_ID` is currently pointed at the test copy of the spreadsheet or the live one.
>
> To check: open the Apps Script project's script properties and compare `SHEET_ID` against the ID of the spreadsheet linked above, which is `163KmRWhCMJob_XENNcaAAYsexCp1yg4oQLnOcbYqD1Q`. If they match, the automation is writing to that sheet. If they do not, find out which sheet `SHEET_ID` does point to before changing anything.

> [!TODO] Fix the 71 mismatched historical rows
> Starting around June 2026, 71 historical rows have the phone number and email address swapped into the wrong columns. The automation writes these two fields correctly.
>
> Once the history is merged into the automated sheet, these rows sit directly alongside correct ones in the same two columns, so the phone and email columns cannot be trusted or filtered on at all until this is fixed. It is a one-time cleanup: filter or sort to find the affected rows and swap the two cells.

> [!TODO] Guard or delete resetLabelsForTesting before switching to send
> In `send` mode, running `resetLabelsForTesting` would email every customer from the past 7 days a second time, with no undo. Either delete the function or make it refuse to run unless `EMAIL_MODE` is `off`. This has to be done before the mode is switched to `send`, not after.

> [!TODO] Confirm whether WooCommerce sends its own order receipt
> Confirm whether WooCommerce already emails customers its own order receipt separately. If it does, and this automation's email step is switched on, customers will receive two emails for the same order.

> [!TODO] Security: confirm the Furies Gmail password has been rotated
> The Furies Gmail account password appeared in plaintext in a meeting-notes transcript. Confirm whether the password has since been rotated, and rotate it if not.
