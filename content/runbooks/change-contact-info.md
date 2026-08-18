---
title: You need to change a phone number, email or address on the website
slug: change-contact-info
status: live
owner: TODO
lastReviewed: 2026-08-13
summary: How to update a phone number, email address, or physical address shown on the CSG website.
---

**Symptom:** A phone number, email address, or physical address shown on `https://www.crossservicesgroup.com` is wrong or has changed, and needs updating.

This site's copy — including contact details — lives in `/content/*.ts` files in the CSG website repo. You do not need to hand-edit code yourself; you can ask Claude Code to make the change for you, then check it before it goes live.

**Important:** pushing to the `main` branch deploys to production immediately. There is no review step, no staging environment, and no approval gate. Whatever is in `main` becomes what visitors see, usually within a minute or two. Always test the change locally first.

## Step 1: Open the repo in Claude Code

1. Open a terminal.
2. Navigate to a local clone of `https://github.com/crossservicesgroup-ai/CrossServicesSite`. If you do not have a local clone yet, clone it first (`git clone https://github.com/crossservicesgroup-ai/CrossServicesSite.git`).

   If you already had a clone from before 13 Aug 2026, it still points at the old `gkmestler` address. That keeps working through a GitHub redirect, so nothing will appear wrong, but repoint it anyway: `git remote set-url origin https://github.com/crossservicesgroup-ai/CrossServicesSite.git`.
3. Start Claude Code in that folder (`claude`).

## Step 2: Give Claude Code a clear, specific prompt

Be specific about the old value, the new value, and where it appears. Here is the shape of a good prompt — **the two numbers below are made-up placeholders, not real CSG numbers.** Replace them with the actual old and new values before you send it:

```
Find every place the phone number OLD-NUMBER-HERE appears in the /content
directory and replace it with NEW-NUMBER-HERE. Do not change any other
phone numbers, emails, or addresses. Show me a diff of every file you
change before you finish.
```

Adjust the wording and file scope to match what actually needs to change. If you are changing an email or address, name it explicitly the same way (old value, new value, and confirm nothing else should match that pattern).

## Step 3: Review what Claude Code changed

1. Read the diff Claude Code shows you.
   - **Good:** only the intended contact detail changed, in the expected files, nowhere else.
   - **If anything else changed, or the change touched a file you did not expect:** ask Claude Code to undo that part, or review it carefully before continuing.

## Step 4: Test locally before pushing

1. Run `npm run dev` (or the project's usual dev command) in the repo folder.
2. Open `localhost:3000` in a browser.
3. Navigate to the page(s) where the changed contact detail appears.
   - **Good:** the new phone number, email, or address shows correctly, and nothing else on the page looks broken.
   - **If it looks wrong:** go back to Claude Code and correct it before pushing anything.

## Step 5: Push to `main`

1. Once the local check looks right, commit the change and push to `main`.
2. This deploys to production immediately — there is no extra approval step.
3. Wait a minute or two, then reload the live site (`https://www.crossservicesgroup.com`) and re-check the same page.
   - **Good:** the live site shows the corrected contact detail.
   - **If the live site does not update after a few minutes:** check `vercel-build-failed.md` — the deployment may have failed, in which case the old value would still be showing.

**If you changed a phone number**, nothing needs doing in Google Analytics. The `phone_click` tracking attaches itself to any phone link on the site rather than to a specific number, so a new number is counted automatically from the moment it goes live.

## Still stuck?

> [!TODO] Support contact
> Who to contact if a contact-info change will not push, will not build, or will not show up live.

If none of this worked, contact: TODO.
