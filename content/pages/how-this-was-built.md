---
title: How This Was Built
slug: how-this-was-built
status: live
owner: TODO
lastReviewed: 2026-08-07
summary: The CSG website and scheduler were built by describing them in plain English to an AI tool called Claude Code, not by hand-writing code.
---

The CSG website and the Furies scheduler were not built the traditional way, with someone writing code line by line. They were built using a tool called Claude Code: an AI agent that writes and edits code based on plain-English instructions. Gavin described what each app should do and look like, and Claude Code wrote the actual software.

This is why the systems can be changed quickly and cheaply going forward. Whoever inherits them does not need to be a professional developer. They need to be able to describe clearly what they want changed, run a small number of commands when told to, and paste error messages back to Claude Code when something breaks. That is the whole workflow.

This page is adapted from a guide Gavin wrote for CSG, "Building Apps with Claude Code," and reorganized here as a working reference for whoever takes this over. The original document also covers the tools, the accounts, and the vocabulary in more depth than a quick skim needs.

> [!WARNING] Read before touching either repo
> [!WARNING] Pushing to `main` publishes to the live site immediately
> Pushing to `main` on either CSG repository deploys to production immediately. There is no review step, no approval, and no staging environment in between. Always test at `localhost:3000` first and confirm it looks right before you push.

The two repositories are:

- `https://github.com/gkmestler/CrossServicesSite.git` — the CSG website
- `https://github.com/gkmestler/CrossServicesScheduleAgent1.git` — the Furies scheduler

<!-- TECHNICAL -->

This is the operator-facing version of "Building Apps with Claude Code," the guide Gavin wrote for CSG. It is adapted here into the dashboard's two-audience format; the structure and advice below are the guide's, reorganized under headings for this page.

## Read this first

You are not going to write code. You are going to describe what you want, in plain English, and an AI agent called Claude Code writes the code for you.

Your real job is three things:

- Describe the app clearly and in detail.
- Run a few commands when the guide tells you to.
- Tell Claude what looks wrong so it can fix it.

**The one rule:** when you get stuck or see an error, paste the error into Claude Code and ask it to explain and fix it. That is not cheating. That is the whole workflow.

The whole flow in one line: write a plan, Claude builds it, test locally, push to GitHub, deploy on Vercel, live.

## The tools

Five pieces. Each one has a single job.

| Tool | What it does |
|---|---|
| Visual Studio Code | The code editor. It is the program on your computer where your project files live and where you do everything. Think of it as Microsoft Word, but for code. |
| Claude Code | The AI agent that writes the code. It runs inside VS Code in a terminal panel. You type instructions, it creates and edits the files. |
| Node.js | The engine that runs your app on your computer. You install it once and mostly forget it exists. |
| GitHub | Cloud storage for your code. Every time you finish a chunk of work you push a copy up there. It is also how Vercel gets your code. |
| Vercel | The host. It takes your code from GitHub and puts it on a real URL that anyone can visit. |
| Supabase | The backend and database. Anywhere your app needs to remember something, like users, form submissions, or saved records, that data lives in Supabase. |

Why this stack: it is the fastest path from idea to live URL, it is free to start, and Claude Code knows all of these tools extremely well. Do not go shopping for alternatives on your first build.

## One-time setup

Do this once. It takes about twenty minutes and you never repeat it.

**Install:**

- Download and install Visual Studio Code from `code.visualstudio.com`.
- Download and install Node.js from `nodejs.org`. Take the LTS version, which is the stable one on the left.
- Install Claude Code. Open VS Code, open the terminal from the top menu under Terminal then New Terminal, and follow the current install instructions from Anthropic docs.

**Create free accounts:**

- GitHub at `github.com`
- Vercel at `vercel.com`, and sign up using your GitHub account so the two are already connected
- Supabase at `supabase.com`, also sign up with GitHub

Tip: signing into Vercel and Supabase with your GitHub login saves a connection headache later. Do it that way.

**Make a project folder:** create an empty folder on your computer for the app. Name it something simple with no spaces, like `invoice-tracker`. Then in VS Code go to File, then Open Folder, and select it. Everything from here happens inside that folder.

## Write the plan first

This is the step people skip, and it is the step that decides whether the app comes out good or mediocre. Claude Code builds exactly what you describe. Vague description, vague app.

Before you open Claude Code, open Claude on the desktop app or the web and have a real conversation about what you are building. Ask it to challenge you and ask you questions. Then have it write the whole thing up as a single markdown file.

**How to do it:**

- Open Claude desktop or `claude.ai`.
- Describe your app idea and let Claude interview you about it.
- When the spec feels complete, ask for it as one markdown file:

> "Turn everything we just discussed into one complete markdown spec file I can hand to Claude Code as build instructions. Include the tech stack, the data model, every screen, the design system, and the user flows."

- Copy that file into your project folder and name it `mainprompt.md`.

**What your plan needs to cover:**

*Function*
- What problem the app solves and who uses it
- Every screen or page, and what is on each one
- What data gets stored, and what each record contains
- Whether users log in, and if so how

*Design*
- Color palette, including your primary and accent colors
- Fonts
- Button styles, corner rounding, spacing, and overall feel
- Light mode, dark mode, or both

*Navigation and UX*
- What the navigation looks like, for example a top bar, a sidebar, or a bottom tab bar
- Where it sits on the screen and what links are in it
- What a user sees first when they land, and what the main action is

Always include this line in the spec: "Build this app mobile first." It tells Claude to design for a phone screen and then scale up to desktop, instead of building for desktop and cramming it down. The difference in how the app looks on a phone is enormous.

## Build the app

Open your project folder in VS Code, open a terminal, and start Claude Code:

```
claude
```

Your very first message is short, because all the detail already lives in your spec file:

> "Build my app based on the requirements in @mainprompt.md"

The `@` symbol tells Claude Code to read that file. Hit enter and let it work. It will create folders, install packages, and write out the whole project. This takes a few minutes on a first build.

Claude will ask permission before it runs certain commands. Read what it is asking, then approve. You do not need to understand every file it creates, but skimming along teaches you the shape of a project faster than anything else.

## Test it on your computer

Before anything goes online you run the app locally, meaning it runs only on your machine.

Open a second terminal window, leaving Claude Code running in the first one, and run:

```
npm run dev
```

You will see a local address in the output, usually `http://localhost:3000`. Open it in your browser. That is your app.

**What to check:**

- Click every button and every link
- Submit every form
- Shrink the browser window down to phone width and confirm it still looks right
- Look for anything broken, ugly, or missing

Anything wrong, go back to the Claude Code terminal and describe it. Be specific about what you see:

> "The submit button on the contact form does nothing when I click it. Fix it and tell me what was wrong."

Errors are normal: red text in the terminal is not a disaster. Copy the whole error, paste it into Claude Code, and say "fix this." That loop is most of what building an app actually feels like.

## Save your code to GitHub

Once the app works locally, get a copy into the cloud. This protects your work and it is how Vercel finds your project.

Create a new empty repository on `github.com`. Copy its URL. Then tell Claude Code:

> "Commit and push my codebase to GitHub. The repo URL is [paste your URL here]."

Claude handles the rest. Refresh the GitHub page and your files should be sitting there.

Do this often: push after every meaningful chunk of work, not just once at the end. If something breaks badly you can always roll back to a version that worked.

## API keys and environment variables

This is the part everyone finds hardest, so here is what is actually happening.

When your app talks to an outside service like Supabase, it has to prove it is allowed to. It does that with an API key, which is a long secret string. Those keys never go in your code, because your code goes on GitHub where other people can see it. Instead they go in a file called `.env.local`, which stays on your computer only.

**Set it up:**

- Create a file in your project root named `.env.local`. The dot at the front matters.
- Go to your Supabase project, open Settings, then API, and copy your project URL and your keys.
- Paste them into `.env.local` in the format Claude gives you.

It ends up looking roughly like this:

```
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

If you cannot find a key, ask directly:

> "Walk me through exactly where to find my Supabase API keys, click by click, and tell me which ones belong in .env.local."

Never do this: never paste API keys straight into your code files. Never commit `.env.local` to GitHub. Claude Code sets up a `.gitignore` file to prevent that, but confirm `.env.local` is listed in it before you push.

## Put it on the internet with Vercel

Before you deploy anything, run one prompt that saves a lot of pain:

> "Ensure this will build and compile correctly with Vercel without errors. Check for anything that works locally but will fail in a production build."

Local and production behave differently, and this tells Claude what you are aiming at so it can catch the gaps in advance.

**Deploy:**

- Go to `vercel.com` and log in.
- Click Add New, then Project.
- Find your GitHub repository in the list and click Import.
- Before you hit Deploy, open the Environment Variables section.
- Add every single variable from your `.env.local` file. Same names, same values. Miss one and the app breaks in a confusing way.
- Click Deploy and wait for the build.

When it finishes you get a live URL. Open it on your phone and click through the whole app again.

If the build fails: Vercel shows you a build log. Copy the error out of it, paste it into Claude Code, and ask it to fix the build. Then push to GitHub again. Vercel redeploys automatically every time you push.

## Making changes after launch

From here the loop is short and it never really changes:

- Tell Claude Code what you want changed.
- Check it at `localhost:3000`.
- Push to GitHub.
- Vercel redeploys on its own.

Good change requests are specific:

| Weak | Strong |
|---|---|
| Make the dashboard better | On the dashboard, move the stats cards above the table, make them three across on desktop and stacked on mobile, and add the percent change versus last month under each number |
| The colors look off | Change the primary color to a deep teal, keep the buttons white text, and lighten the page background to a warm off white |

## Prompt cheat sheet

Copy these as needed.

**Start the build**
> "Build my app based on the requirements in @mainprompt.md"

**Fix an error**
> "I am getting this error. Explain what it means in plain English, then fix it: [paste the full error]"

**Push your work**
> "Commit and push my codebase to GitHub. The repo URL is [your URL]."

**Find your keys**
> "Walk me through where to find my API keys for [service] and exactly what to put in .env.local."

**Prep for deploy**
> "Ensure this will build and compile correctly with Vercel without errors."

**Mobile quality**
> "Review every page on mobile viewport widths and fix anything that overflows, wraps badly, or is hard to tap."

**Understand your own project**
> "Explain the structure of this project to me like I have never seen a codebase before. What does each main folder do?"

## When things break

| Symptom | What to do |
|---|---|
| `npm run dev` throws errors | Paste the full error into Claude Code and ask it to fix it. Nine times out of ten it is a missing package or a typo it can resolve instantly. |
| `localhost:3000` will not load | Check the terminal is still running. If it says the port is in use, something else is already on 3000. Ask Claude to run it on a different port. |
| Works locally, breaks on Vercel | Almost always a missing environment variable. Open your Vercel project settings and compare the list against `.env.local` line by line. |
| Vercel build fails | Open the build log, copy the error, hand it to Claude Code, then push the fix. Vercel redeploys automatically. |
| Data is not saving | Check your Supabase keys are correct in both places, and confirm the tables actually exist in Supabase. Ask Claude to verify the connection. |
| Looks broken on a phone | Tell Claude the app should be mobile first and describe exactly which screen and which element looks wrong. |
| You have no idea what happened | Say so. "Something broke and I do not understand what. Walk me through diagnosing it." Claude will step through it with you. |

## Glossary

| Term | Meaning |
|---|---|
| Repository, or repo | A single project folder stored on GitHub. |
| Commit | A saved snapshot of your code with a short note about what changed. |
| Push | Uploading your commits from your computer to GitHub. |
| Deploy | Taking your code and running it on the internet at a public URL. |
| Build | The process that turns your source code into the optimized version that actually gets served to users. |
| Localhost | Your own computer acting as the server. Only you can see it. |
| Terminal | The text window where you type commands. It lives at the bottom of VS Code. |
| API key | A secret string that proves your app is allowed to use an outside service. |
| Environment variable | A setting stored outside your code, used mostly for secrets like API keys. |
| Frontend | Everything the user sees and clicks. |
| Backend | The database and the logic behind the scenes. |
| Mobile first | Designing for a phone screen first, then scaling up to larger screens. |
| Package | Prewritten code from someone else that your project uses. npm installs these. |

## Last thing

Your first app will take longer than you expect and your third will take an afternoon. The only way through the learning curve is to build something small and finish it. Pick a real problem you actually have, keep the scope tight, and ship it.

## What is not covered here

> [!TODO] Addendum: working on existing projects
> The original guide series includes a second document covering how to work on an *existing* project with Claude Code (as opposed to starting from scratch) — pulling latest changes, understanding a codebase you did not write, and making safe changes without breaking what's already live. That addendum has not been provided to this dashboard yet. Paste its content in here once available. This matters more than the base guide for whoever inherits these repos, since both CSG apps already exist.

> [!TODO] CSG prompt library
> A CSG-specific prompt library was referenced as a companion to this guide, presumably a set of tested prompts tailored to the CSG website and scheduler codebases specifically (beyond the generic cheat sheet above). It has not been provided to this dashboard yet. Paste its content in here once available.
