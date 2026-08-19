# DevFlow

A full-stack Q&A platform for developers — ask questions, answer them, vote, earn reputation, and get recommendations based on what you actually engage with. Think Stack Overflow, rebuilt on the Next.js App Router.

**🔗 Live demo — [devflow-five-alpha.vercel.app](https://devflow-five-alpha.vercel.app/)**

> Sign in with GitHub, or use any seeded demo account:
> **email** `ada@devflow.test` · **password** `Password123!`

---

## Why I built it

I wanted a project that couldn't be faked with a component library and some mock JSON — something where the interesting problems are on the server.

A Q&A site turns out to be a good vehicle for that. It has a genuinely relational data model on a document database, a reputation system where a single user action has to update several collections atomically, a recommendation feed that has to be derived rather than hardcoded, and enough read paths that naive queries fall over. Most of the work in this repo is in `lib/actions/` and `database/`, not in the UI.

Specific problems I set out to solve properly:

- **Many-to-many relationships in MongoDB.** Tags and questions reference each other in both directions, and both directions need to be fast.
- **Multi-collection writes that must not half-apply.** Posting a question touches `questions`, `tags`, `tagquestions` and `interactions`. Voting touches `votes`, the target document, and the author's reputation.
- **A recommendation feed with no ML.** Derived from the user's own interaction history, using aggregation rather than a separate service.
- **Search that spans every entity type**, not just a filter on the current list.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | Server Components keep data fetching on the server; Server Actions remove most of the hand-written API layer |
| Language | **TypeScript** (strict) | Shared types across server actions, models and components |
| Database | **MongoDB** + **Mongoose 9** | Document model fits nested question/answer content; aggregation pipelines drive the derived views |
| Auth | **NextAuth v5 (Auth.js)** | GitHub OAuth *and* credentials in one session model, JWT strategy |
| Validation | **Zod 4** | One schema validates the client form, the server action, and the API route |
| Styling | **Tailwind CSS v4** + **shadcn/ui** (Radix) | v4's CSS-first `@theme` / `@utility` config; accessible primitives without a heavy component framework |
| Editor | **MDXEditor** + **next-mdx-remote** | Markdown authoring with syntax-highlighted code blocks, rendered server-side |
| AI | **Vercel AI SDK** + **OpenAI** | Optional AI-drafted answers that build on the user's own draft |
| Logging | **Pino** | Structured logs, kept out of the client bundle via `serverExternalPackages` |

Supporting: `bcryptjs` (password hashing), `slugify`, `dayjs`, `query-string`, `sonner` (toasts), `next-themes` (dark mode).

---

## What it does

**Questions & answers**
- Markdown editor with live preview and syntax-highlighted code blocks
- Full CRUD with author-only edit/delete enforced server-side
- View counting, answer counting, and denormalised counters kept in sync

**Voting & reputation**
- Upvote/downvote on both questions and answers, with optimistic UI
- Reputation is *earned*, not stored arbitrarily: +10 to an author per upvote received, +2 to the voter, −2/−1 on downvotes, +5 per question posted, +10 per answer
- Every vote runs inside a MongoDB transaction so the vote record, the target's counters, and both users' reputation move together or not at all

**Discovery**
- **Global search (⌘K)** across questions, answers, users and tags in a single pass, with in-dialog type filters
- Per-page local search, plus filters (newest, unanswered, popular) driven by URL state so results stay shareable
- **Personalised recommendations** built from the user's last 50 interactions → the tags behind them → unseen questions carrying those tags
- Tag pages, a community directory, and profiles with a user's top tags computed via aggregation

**Collections & profiles**
- Bookmark questions to a personal collection
- Profiles show questions, answers, top tags, badges and reputation

**Auth**
- GitHub OAuth and email/password in the same session model
- Route protection via middleware; server actions independently re-check authorisation rather than trusting the client

---

## Architecture notes

A few decisions worth calling out, since they're the point of the project:

**Both an embedded array *and* a join collection for tags.** Questions carry `tags: ObjectId[]` so rendering a question needs no join, while a separate `tagquestions` collection with a compound unique index makes "every question for this tag" fast. The duplication costs a transaction on write and buys cheap reads in both directions.

**Transactions around multi-collection writes.** Posting, voting and deleting each span several collections. All of them run through `session.withTransaction()`, so a failure halfway through can't leave orphaned tag links or a reputation score that doesn't match the votes.

**A single `action()` handler in front of every server action.** It validates params against a Zod schema, checks the session when the action requires authorisation, and connects to the database — so each action starts from a known-good state instead of repeating the same guard clauses.

**A cached Mongoose connection on `globalThis`.** Without it, hot reloading opens a new connection on every file save until Atlas refuses them. The *promise* is cached alongside the connection so concurrent cold-start requests share one connect call.

**Denormalised counters.** `question.answers`, `tag.questions` and vote totals are stored rather than counted per request, which keeps list pages to a single query.

---

## Running locally

```bash
git clone https://github.com/Nisschhal/devflow.git
cd devflow
npm install
```

Create a `.env` in the project root:

```bash
MONGODB_URI=            # MongoDB connection string (replica set required for transactions — Atlas works)
AUTH_SECRET=            # generate with: npx auth secret
AUTH_GITHUB_ID=         # from your GitHub OAuth app
AUTH_GITHUB_SECRET=
OPENAI_API_KEY=         # optional — only for AI-generated answers
```

Your GitHub OAuth app's callback URL must be `http://localhost:3000/api/auth/callback/github` locally, and the equivalent on your production domain.

```bash
npm run dev
```

### Seeding demo data

```bash
node --env-file=.env scripts/seed.mjs
```

Wipes the database and reseeds it with 16 users, 20 tags, 32 questions, 49 answers, plus votes, bookmarks and interactions — enough for the feed, recommendations, reputation and search to all show real behaviour. Seeded accounts share the password `Password123!`.

> ⚠️ Destructive: it drops every collection before inserting.

---

## Project structure

```
app/
  (auth)/           sign-in, sign-up
  (root)/           home, questions, tags, community, profile, collections
  api/              route handlers — OAuth callback, user/account lookups, AI answers
components/
  forms/            auth, question and answer forms
  search/           global command palette + per-page local search
  editor/           MDX editor and renderer
  ui/               shadcn/Radix primitives
database/           Mongoose models
lib/
  actions/          server actions — the bulk of the business logic
  handlers/         shared action/error/fetch wrappers
  validation.ts     Zod schemas shared by client and server
scripts/seed.mjs    database seeding
```

---

## Status

Working and deployed. Google OAuth is scaffolded but disabled — the provider is commented out in `auth.ts` until credentials are configured. There is no role/admin system; every user has the same permissions, and authorisation is per-resource ownership.
