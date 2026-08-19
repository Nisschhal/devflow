/**
 * Wipes the devflow database and reseeds it with coherent dummy data.
 *
 *   node --env-file=.env scripts/seed.mjs
 *
 * Destructive: every collection listed in COLLECTIONS is dropped first.
 * Seeded credential users all share the password below.
 */
import bcrypt from "bcryptjs"
import mongoose from "mongoose"

const SEED_PASSWORD = "Password123!"

/**
 * The real (GitHub) account that owns this deployment.
 *
 * `userId` is pinned so an existing signed-in session keeps resolving to a real
 * user after a reseed — otherwise the session cookie points at a document that
 * no longer exists and /profile/:id reports "User not found".
 *
 * `email` must match the email GitHub reports, because the OAuth callback looks
 * users up by email. If it doesn't match, signing in creates a second user
 * instead of reusing this one.
 */
const OWNER = {
  userId: process.env.SEED_OWNER_USER_ID || "6a36170dbc9b9f2279ccb749",
  githubAccountId: process.env.SEED_OWNER_GITHUB_ID || "28801164",
  email: process.env.SEED_OWNER_EMAIL || "mrnischalpuri@gmail.com",
  username: "nischalpuri",
}

const COLLECTIONS = [
  "users",
  "accounts",
  "questions",
  "answers",
  "tags",
  "tagquestions",
  "votes",
  "collections",
  "interactions",
]

const { ObjectId } = mongoose.Types

const oid = () => new ObjectId()

// Spreads createdAt/updatedAt over the past few months so "recent" and "oldest"
// sorting actually shows a difference.
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

const USERS = [
  {
    name: "Ada Sharma",
    username: "adasharma",
    email: "ada@devflow.test",
    bio: "Backend engineer who thinks in queues. Rust, Go, and too much coffee.",
    location: "Bengaluru, India",
    portfolio: "https://ada.example.com",
    reputation: 1420,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=ada",
  },
  {
    name: "Marcus Lee",
    username: "marcuslee",
    email: "marcus@devflow.test",
    bio: "Frontend dev. React, accessibility, and design systems.",
    location: "Singapore",
    portfolio: "https://marcus.example.com",
    reputation: 980,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=marcus",
  },
  {
    name: "Priya Raut",
    username: "priyaraut",
    email: "priya@devflow.test",
    bio: "Full-stack. Next.js by day, Postgres query plans by night.",
    location: "Pune, India",
    portfolio: "https://priya.example.com",
    reputation: 2310,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=priya",
  },
  {
    name: "Tomas Novak",
    username: "tomasnovak",
    email: "tomas@devflow.test",
    bio: "DevOps. If it isn't in Terraform, it doesn't exist.",
    location: "Prague, Czechia",
    portfolio: "https://tomas.example.com",
    reputation: 760,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=tomas",
  },
  {
    name: "Sofia Alvarez",
    username: "sofiaalvarez",
    email: "sofia@devflow.test",
    bio: "Mobile engineer, React Native and Swift. Ex-designer.",
    location: "Madrid, Spain",
    portfolio: "https://sofia.example.com",
    reputation: 540,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=sofia",
  },
  {
    name: "Kenji Tanaka",
    username: "kenjitanaka",
    email: "kenji@devflow.test",
    bio: "Type-level TypeScript enthusiast. Sorry about the generics.",
    location: "Tokyo, Japan",
    portfolio: "https://kenji.example.com",
    reputation: 1875,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=kenji",
  },
  {
    name: "Amara Okafor",
    username: "amaraokafor",
    email: "amara@devflow.test",
    bio: "Data engineer. Pipelines, Python, and parquet files.",
    location: "Lagos, Nigeria",
    portfolio: "https://amara.example.com",
    reputation: 1130,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=amara",
  },
  {
    // The owner account — pinned id + linked GitHub login (see OWNER above).
    _id: OWNER.userId,
    github: OWNER.githubAccountId,
    name: "Nischal Puri",
    username: OWNER.username,
    email: OWNER.email,
    bio: "Building DevFlow. Next.js, MongoDB, and shipping things.",
    location: "Kathmandu, Nepal",
    portfolio: "https://nischal.example.com",
    reputation: 3040,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=nischal",
  },
  {
    name: "Elena Rossi",
    username: "elenarossi",
    email: "elena@devflow.test",
    bio: "Platform engineer. Kubernetes, observability, and on-call sanity.",
    location: "Milan, Italy",
    portfolio: "https://elena.example.com",
    reputation: 1650,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=elena",
  },
  {
    name: "Daniel Okoye",
    username: "danielokoye",
    email: "daniel@devflow.test",
    bio: "Security engineer. I read your auth code so you don't have to.",
    location: "Abuja, Nigeria",
    portfolio: "https://daniel.example.com",
    reputation: 2190,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=daniel",
  },
  {
    name: "Mei Lin",
    username: "meilin",
    email: "mei@devflow.test",
    bio: "ML engineer turned infra. PyTorch, CUDA, and very large logs.",
    location: "Shenzhen, China",
    portfolio: "https://mei.example.com",
    reputation: 1490,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=mei",
  },
  {
    name: "Lucas Fernandes",
    username: "lucasfernandes",
    email: "lucas@devflow.test",
    bio: "Rails refugee, now writing Go. Still miss ActiveRecord sometimes.",
    location: "São Paulo, Brazil",
    portfolio: "https://lucas.example.com",
    reputation: 830,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=lucas",
  },
  {
    name: "Hana Yilmaz",
    username: "hanayilmaz",
    email: "hana@devflow.test",
    bio: "QA automation. If it can break, I have already broken it.",
    location: "Istanbul, Türkiye",
    portfolio: "https://hana.example.com",
    reputation: 615,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=hana",
  },
  {
    name: "Oliver Bennett",
    username: "oliverbennett",
    email: "oliver@devflow.test",
    bio: "Indie hacker. Shipping small things quickly.",
    location: "Manchester, UK",
    portfolio: "https://oliver.example.com",
    reputation: 445,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=oliver",
  },
  {
    name: "Fatima Zahra",
    username: "fatimazahra",
    email: "fatima@devflow.test",
    bio: "Systems programmer. C, Rust, and a fondness for memory maps.",
    location: "Casablanca, Morocco",
    portfolio: "https://fatima.example.com",
    reputation: 2680,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=fatima",
  },
  {
    name: "Jonas Weber",
    username: "jonasweber",
    email: "jonas@devflow.test",
    bio: "Database internals nerd. Ask me about write-ahead logs.",
    location: "Berlin, Germany",
    portfolio: "https://jonas.example.com",
    reputation: 1975,
    image: "https://api.dicebear.com/9.x/notionists/png?seed=jonas",
  },
]

const TAG_NAMES = [
  "nextjs",
  "react",
  "typescript",
  "mongodb",
  "nodejs",
  "tailwindcss",
  "python",
  "docker",
  "postgresql",
  "javascript",
  "kubernetes",
  "rust",
  "go",
  "graphql",
  "redis",
  "aws",
  "testing",
  "git",
  "css",
  "security",
]

// Each question names its tags and its author by username; ids are resolved
// after the users and tags are inserted.
const QUESTIONS = [
  {
    author: "priyaraut",
    title: "How do I share a MongoDB connection across requests in Next.js?",
    tags: ["nextjs", "mongodb", "nodejs"],
    createdDaysAgo: 2,
    views: 412,
    upvotes: 24,
    downvotes: 1,
    content: `I keep hitting connection-pool exhaustion in development. Every time I save a file, a new Mongoose connection seems to be created.

\`\`\`ts
import mongoose from "mongoose"

export async function connect() {
  return mongoose.connect(process.env.MONGODB_URI!)
}
\`\`\`

In production this looks fine, but locally the connection count climbs until Atlas starts refusing new ones. What is the accepted pattern here?`,
    answers: [
      {
        author: "adasharma",
        upvotes: 31,
        downvotes: 0,
        createdDaysAgo: 2,
        content: `The problem is hot reloading. Next.js re-evaluates the module on every save, so the module-level state is thrown away and a fresh connection is opened.

Cache the connection on \`globalThis\`, which survives module reloads:

\`\`\`ts
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function dbConnect() {
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI!, {
      dbName: "devflow",
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
\`\`\`

Caching the *promise* as well as the connection matters — without it, concurrent requests during a cold start each kick off their own \`connect()\`.`,
      },
      {
        author: "tomasnovak",
        upvotes: 8,
        downvotes: 0,
        createdDaysAgo: 1,
        content: `Adding to the above: set \`maxPoolSize\` explicitly. The driver default of 100 is far more than a serverless function needs, and on Atlas free tiers you will hit the cluster limit long before you hit the pool limit.`,
      },
    ],
  },
  {
    author: "marcuslee",
    title: "Why does my React state update not reflect immediately after setState?",
    tags: ["react", "javascript"],
    createdDaysAgo: 5,
    views: 1290,
    upvotes: 47,
    downvotes: 2,
    content: `I have a counter and I log right after calling the setter:

\`\`\`jsx
const [count, setCount] = useState(0)

const handleClick = () => {
  setCount(count + 1)
  console.log(count) // still the old value
}
\`\`\`

The UI updates correctly, but the log is always one behind. Am I misusing the hook?`,
    answers: [
      {
        author: "kenjitanaka",
        upvotes: 52,
        downvotes: 1,
        createdDaysAgo: 5,
        content: `You are not misusing it — \`count\` is a **const binding captured by that render's closure**. Calling the setter schedules a re-render; it does not reassign the existing variable.

The next render creates a *new* \`count\` binding with the new value. Your log belongs to the old render, so it prints the old value forever.

If the next value depends on the previous one, use the updater form:

\`\`\`jsx
setCount((prev) => prev + 1)
\`\`\`

And if you need to react to the committed value, use an effect:

\`\`\`jsx
useEffect(() => {
  console.log(count)
}, [count])
\`\`\``,
      },
    ],
  },
  {
    author: "kenjitanaka",
    title: "Best way to type a generic form component with react-hook-form and Zod?",
    tags: ["typescript", "react"],
    createdDaysAgo: 8,
    views: 634,
    upvotes: 19,
    downvotes: 0,
    content: `I want one \`<AuthForm />\` that works for both sign-in and sign-up, driven by whichever Zod schema I hand it.

\`\`\`tsx
interface Props<T extends FieldValues> {
  schema: z.ZodType<T>
  defaultValues: T
}
\`\`\`

TypeScript then complains that \`Resolver<FieldValues, any, T>\` is not assignable to \`Resolver<T, any, T>\`. What is the correct way to express this?`,
    answers: [
      {
        author: "priyaraut",
        upvotes: 22,
        downvotes: 0,
        createdDaysAgo: 7,
        content: `Zod 4's \`ZodType<T>\` leaves the **input** side as \`unknown\`, while the resolver requires the input to extend \`FieldValues\`. Pin both sides:

\`\`\`tsx
schema: z.ZodType<T, T>
\`\`\`

With the input typed as \`T\`, \`standardSchemaResolver\` infers \`Resolver<T, unknown, T>\` and the assignment succeeds — no cast needed.`,
      },
    ],
  },
  {
    author: "adasharma",
    title: "How should I model many-to-many tag relationships in MongoDB?",
    tags: ["mongodb", "nodejs"],
    createdDaysAgo: 12,
    views: 388,
    upvotes: 15,
    downvotes: 0,
    content: `Questions have many tags and tags have many questions. I can see two options:

1. Embed an array of tag ids on the question document.
2. Keep a separate join collection.

Is there a reason to prefer one when I need "questions for a tag" *and* "tags for a question" to both be fast?`,
    answers: [
      {
        author: "amaraokafor",
        upvotes: 18,
        downvotes: 0,
        createdDaysAgo: 11,
        content: `Do both, and accept the duplication.

The embedded array makes rendering a question cheap — one document, no join. The join collection makes "all questions for tag X" cheap and gives you somewhere to hang a compound unique index:

\`\`\`js
TagQuestionSchema.index({ tag: 1, question: 1 }, { unique: true })
\`\`\`

The cost is that writes must update both, so wrap them in a transaction. For a read-heavy site that trade is almost always worth it.`,
      },
      {
        author: "nischalpuri",
        upvotes: 6,
        downvotes: 0,
        createdDaysAgo: 10,
        content: `One caveat on the embedded array: keep a denormalised \`questions\` counter on the tag itself. Otherwise the tags page has to run a \`countDocuments\` per tag, which gets slow fast.`,
      },
    ],
  },
  {
    author: "sofiaalvarez",
    title: "Tailwind v4: how do I define reusable custom utilities?",
    tags: ["tailwindcss", "react"],
    createdDaysAgo: 15,
    views: 902,
    upvotes: 33,
    downvotes: 1,
    content: `In v3 I had a \`tailwind.config.js\` with a plugin that added things like \`.flex-center\`. v4 dropped the JS config in favour of CSS. Where do custom utilities go now?`,
    answers: [
      {
        author: "marcuslee",
        upvotes: 40,
        downvotes: 0,
        createdDaysAgo: 14,
        content: `Use the \`@utility\` directive directly in your CSS:

\`\`\`css
@utility flex-center {
  @apply flex justify-center items-center;
}

@utility background-light900_dark200 {
  @apply bg-light-900 dark:bg-dark-200;
}
\`\`\`

Utilities declared this way work with every variant, so \`hover:flex-center\` and \`md:background-light900_dark200\` both compile. Design tokens go in \`@theme\`:

\`\`\`css
@theme {
  --color-primary-500: #ff7000;
}
\`\`\``,
      },
    ],
  },
  {
    author: "tomasnovak",
    title: "Docker image for a Next.js app is 1.2GB — how do I shrink it?",
    tags: ["docker", "nextjs"],
    createdDaysAgo: 19,
    views: 756,
    upvotes: 28,
    downvotes: 0,
    content: `My Dockerfile is the naive one: copy everything, \`npm install\`, \`npm run build\`, \`npm start\`. The resulting image is over a gigabyte, which makes deploys painfully slow.

\`\`\`dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
\`\`\``,
    answers: [
      {
        author: "adasharma",
        upvotes: 35,
        downvotes: 0,
        createdDaysAgo: 18,
        content: `Two changes do most of the work: a multi-stage build, and Next's standalone output.

Set this in \`next.config.ts\`:

\`\`\`ts
export default { output: "standalone" }
\`\`\`

Then only copy the traced runtime into a slim final stage:

\`\`\`dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
\`\`\`

That typically lands around 150MB. Add a \`.dockerignore\` with \`node_modules\` and \`.next\` so the build context stays small too.`,
      },
    ],
  },
  {
    author: "amaraokafor",
    title: "Postgres: why is my index not being used for this query?",
    tags: ["postgresql", "python"],
    createdDaysAgo: 23,
    views: 521,
    upvotes: 21,
    downvotes: 1,
    content: `I have an index on \`created_at\` but \`EXPLAIN\` still shows a sequential scan:

\`\`\`sql
CREATE INDEX idx_events_created ON events (created_at);

EXPLAIN ANALYZE
SELECT * FROM events WHERE DATE(created_at) = '2026-01-15';
\`\`\`

The table has about 4 million rows.`,
    answers: [
      {
        author: "priyaraut",
        upvotes: 29,
        downvotes: 0,
        createdDaysAgo: 22,
        content: `Wrapping the column in \`DATE()\` makes the predicate non-sargable — the planner cannot match \`DATE(created_at)\` against an index on \`created_at\`.

Query a range instead:

\`\`\`sql
SELECT * FROM events
WHERE created_at >= '2026-01-15'
  AND created_at <  '2026-01-16';
\`\`\`

If you genuinely need the function form, index the expression itself:

\`\`\`sql
CREATE INDEX idx_events_created_date ON events ((DATE(created_at)));
\`\`\`

The range version is still preferable — it also works for timestamps with time zones without surprises.`,
      },
    ],
  },
  {
    author: "nischalpuri",
    title: "Server Actions vs Route Handlers — when should I use which?",
    tags: ["nextjs", "typescript"],
    createdDaysAgo: 27,
    views: 1104,
    upvotes: 38,
    downvotes: 2,
    content: `I have both \`app/api/*/route.ts\` files and \`"use server"\` action files in the same project, and I am no longer sure which belongs where. Is there a rule of thumb?`,
    answers: [
      {
        author: "kenjitanaka",
        upvotes: 44,
        downvotes: 1,
        createdDaysAgo: 26,
        content: `The dividing line is *who calls it*.

**Server Actions** — your own UI calls it. Mutations from forms and client components, where you want the closure over server code, automatic revalidation, and no hand-written fetch.

**Route Handlers** — something that is not your React tree calls it. Third-party webhooks, OAuth callbacks, mobile clients, cron jobs, anything needing a stable public URL, custom headers, or a non-JSON response.

A useful check: if you would ever want to curl it, make it a route handler.`,
      },
      {
        author: "sofiaalvarez",
        upvotes: 11,
        downvotes: 0,
        createdDaysAgo: 25,
        content: `Worth adding that server actions are POST-only under the hood, so anything that needs to be cacheable or GET-addressable has to be a route handler regardless of who calls it.`,
      },
    ],
  },
  {
    author: "marcuslee",
    title: "How do I debounce a search input without losing the latest result?",
    tags: ["react", "javascript", "typescript"],
    createdDaysAgo: 31,
    views: 467,
    upvotes: 17,
    downvotes: 0,
    content: `My debounced search occasionally renders stale results — a slow earlier request lands after a faster later one and overwrites it. Debouncing alone clearly isn't enough. How do people handle this?`,
    answers: [
      {
        author: "kenjitanaka",
        upvotes: 25,
        downvotes: 0,
        createdDaysAgo: 30,
        content: `You need cancellation on top of the debounce. The timer stops extra *requests*; a cancelled flag stops stale *responses*.

\`\`\`tsx
useEffect(() => {
  let cancelled = false

  const timer = setTimeout(async () => {
    const data = await search(query)
    if (!cancelled) setResults(data)
  }, 300)

  return () => {
    cancelled = true
    clearTimeout(timer)
  }
}, [query])
\`\`\`

The cleanup runs before the next effect, so any in-flight response from a previous query is discarded rather than applied. With \`fetch\` you can go further and pass an \`AbortController\` signal so the request is dropped on the wire.`,
      },
    ],
  },
  {
    author: "priyaraut",
    title: "Mongoose aggregation: how do I get a user's top tags?",
    tags: ["mongodb", "nodejs", "javascript"],
    createdDaysAgo: 36,
    views: 298,
    upvotes: 12,
    downvotes: 0,
    content: `For a profile page I want the ten tags a user has posted under most often. Questions store \`tags\` as an array of ObjectIds. I can do it with a loop in JS, but that is a lot of round trips — can this be one aggregation?`,
    answers: [
      {
        author: "adasharma",
        upvotes: 16,
        downvotes: 0,
        createdDaysAgo: 35,
        content: `Unwind, group, sort, then look up the names:

\`\`\`js
Question.aggregate([
  { $match: { author: new Types.ObjectId(userId) } },
  { $unwind: "$tags" },
  { $group: { _id: "$tags", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 },
  {
    $lookup: {
      from: "tags",
      localField: "_id",
      foreignField: "_id",
      as: "tag",
    },
  },
  { $unwind: "$tag" },
  { $project: { _id: "$tag._id", name: "$tag.name", count: 1 } },
])
\`\`\`

Sort and limit *before* the \`$lookup\` — otherwise you join every tag the user has ever touched and throw most of it away.`,
      },
    ],
  },
  {
    author: "sofiaalvarez",
    title: "TypeScript: how to narrow a discriminated union inside a filter callback?",
    tags: ["typescript"],
    createdDaysAgo: 42,
    views: 344,
    upvotes: 14,
    downvotes: 0,
    content: `Filtering by the discriminant does not narrow the resulting array type:

\`\`\`ts
type Result =
  | { kind: "question"; title: string }
  | { kind: "user"; name: string }

const questions = results.filter((r) => r.kind === "question")
// still Result[], not { kind: "question"; title: string }[]
\`\`\``,
    answers: [
      {
        author: "kenjitanaka",
        upvotes: 20,
        downvotes: 0,
        createdDaysAgo: 41,
        content: `\`filter\` cannot narrow on its own — it returns the same element type unless the callback is a type predicate. Write one:

\`\`\`ts
const questions = results.filter(
  (r): r is Extract<Result, { kind: "question" }> => r.kind === "question",
)
\`\`\`

TypeScript 5.5+ can infer this automatically when the predicate is a simple, directly-returned comparison, so on a recent compiler your original code may already narrow. If it doesn't, the explicit annotation always works.`,
      },
    ],
  },
  {
    author: "amaraokafor",
    title: "Python: fastest way to stream a large CSV into MongoDB?",
    tags: ["python", "mongodb", "docker"],
    createdDaysAgo: 48,
    views: 412,
    upvotes: 11,
    downvotes: 1,
    content: `I have a 6GB CSV to load. Reading it with pandas exhausts memory, and inserting row by row takes hours. What does a reasonable ingest look like?`,
    answers: [
      {
        author: "tomasnovak",
        upvotes: 15,
        downvotes: 0,
        createdDaysAgo: 47,
        content: `Stream the file and write in batches — never materialise the whole thing.

\`\`\`python
import csv
from itertools import islice
from pymongo import MongoClient

BATCH = 5_000

col = MongoClient(uri).devflow.events

with open("big.csv", newline="") as f:
    reader = csv.DictReader(f)
    while batch := list(islice(reader, BATCH)):
        col.insert_many(batch, ordered=False)
\`\`\`

\`ordered=False\` lets the server keep going past individual duplicate-key failures rather than aborting the batch. Drop secondary indexes before the load and rebuild them afterwards — maintaining them per-insert is usually the real bottleneck.`,
      },
    ],
  },
  {
    author: "elenarossi",
    title: "Kubernetes pod keeps restarting with OOMKilled — how do I find the cause?",
    tags: ["kubernetes", "docker"],
    createdDaysAgo: 3,
    views: 688,
    upvotes: 26,
    downvotes: 0,
    content: `A Node service restarts every few hours. \`kubectl describe pod\` shows:

\`\`\`
Last State: Terminated
  Reason:   OOMKilled
  Exit Code: 137
\`\`\`

The memory limit is 512Mi. Do I just raise it, or is that hiding a real leak?`,
    answers: [
      {
        author: "tomasnovak",
        upvotes: 33,
        downvotes: 0,
        createdDaysAgo: 3,
        content: `Find out which before you touch the limit. Plot \`container_memory_working_set_bytes\` over a few restart cycles:

- **Sawtooth that plateaus** below the limit, then gets killed on a spike → the limit is genuinely too low.
- **Steady climb that never plateaus** → a leak; raising the limit only lengthens the interval between restarts.

For Node specifically, also set the heap ceiling below the container limit:

\`\`\`yaml
env:
  - name: NODE_OPTIONS
    value: "--max-old-space-size=384"
\`\`\`

Otherwise V8 happily grows past 512Mi and the kernel kills the process before the garbage collector ever feels pressure.`,
      },
      {
        author: "meilin",
        upvotes: 9,
        downvotes: 0,
        createdDaysAgo: 2,
        content: `Worth checking \`requests\` too, not just \`limits\`. If requests are far below actual usage the scheduler overpacks the node, and you get evictions that look like OOM kills but are really node memory pressure.`,
      },
    ],
  },
  {
    author: "danielokoye",
    title: "Is storing a JWT in localStorage really that dangerous?",
    tags: ["security", "javascript", "nodejs"],
    createdDaysAgo: 6,
    views: 1533,
    upvotes: 51,
    downvotes: 3,
    content: `Every article says "never put your JWT in localStorage" but few explain what to do instead in a SPA that talks to a separate API domain. What is the actual threat model here?`,
    answers: [
      {
        author: "fatimazahra",
        upvotes: 58,
        downvotes: 1,
        createdDaysAgo: 6,
        content: `The threat is XSS. \`localStorage\` is readable by any JavaScript on the page, so a single injected script exfiltrates the token and the attacker has a valid session until it expires.

The standard alternative is a cookie the page's JavaScript cannot read:

\`\`\`
Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax; Path=/
\`\`\`

That moves the risk from "token theft" to "CSRF", which is the easier problem — \`SameSite\` plus a CSRF token handles it.

Being honest about the limits: if you have XSS, an attacker can also just *make requests* with the cookie attached. \`HttpOnly\` stops them walking away with a token they can replay elsewhere later, which is a meaningful reduction, not a cure.`,
      },
      {
        author: "adasharma",
        upvotes: 14,
        downvotes: 0,
        createdDaysAgo: 5,
        content: `For the cross-domain case, put the API behind the same site as the app (\`api.example.com\` with the cookie scoped to \`.example.com\`). Third-party cookie restrictions have made the "separate domain plus bearer token" pattern steadily less viable anyway.`,
      },
    ],
  },
  {
    author: "jonasweber",
    title: "Redis: SCAN vs KEYS in production — how bad is KEYS really?",
    tags: ["redis", "nodejs"],
    createdDaysAgo: 9,
    views: 497,
    upvotes: 22,
    downvotes: 0,
    content: `I need to find all keys matching \`session:*\` to expire them. \`KEYS session:*\` works instantly on my laptop with a few hundred keys. Production has around 8 million. How much trouble am I in?`,
    answers: [
      {
        author: "elenarossi",
        upvotes: 30,
        downvotes: 0,
        createdDaysAgo: 9,
        content: `A lot — Redis is single threaded, so \`KEYS\` blocks *every other client* for the whole scan. At 8 million keys that is comfortably into multi-second territory, and everything else queues behind it.

Use \`SCAN\`, which returns a cursor and does bounded work per call:

\`\`\`js
let cursor = "0"
do {
  const [next, keys] = await redis.scan(cursor, "MATCH", "session:*", "COUNT", 500)
  cursor = next
  if (keys.length) await redis.unlink(...keys)
} while (cursor !== "0")
\`\`\`

Note \`UNLINK\` rather than \`DEL\` — it frees memory on a background thread instead of blocking.

Better still, don't scan at all: set a TTL when you create the session and let Redis expire them for you.`,
      },
    ],
  },
  {
    author: "lucasfernandes",
    title: "Go: when should I use a channel instead of a mutex?",
    tags: ["go"],
    createdDaysAgo: 11,
    views: 741,
    upvotes: 29,
    downvotes: 1,
    content: `"Share memory by communicating" gets quoted constantly, but plenty of real Go code uses \`sync.Mutex\`. Is there a practical rule for choosing?`,
    answers: [
      {
        author: "fatimazahra",
        upvotes: 37,
        downvotes: 0,
        createdDaysAgo: 10,
        content: `The distinction that holds up in practice: **channels pass ownership, mutexes protect state.**

Use a mutex when goroutines share a data structure and each just needs exclusive access briefly — a cache, a counter, a connection pool. A channel there adds a goroutine and a hop for no benefit.

\`\`\`go
type Cache struct {
    mu sync.RWMutex
    m  map[string]string
}
\`\`\`

Use a channel when a *value* moves from one goroutine to another — a work queue, a pipeline stage, a cancellation signal. The channel is the handoff, and after it the sender must not touch the value.

If you find yourself using a channel of size one as a lock, you wanted a mutex.`,
      },
      {
        author: "adasharma",
        upvotes: 12,
        downvotes: 0,
        createdDaysAgo: 9,
        content: `Also worth knowing \`sync.RWMutex\` is not automatically faster for read-heavy loads — under high core counts the read lock's cache-line contention can lose to a plain \`Mutex\`. Benchmark before assuming.`,
      },
    ],
  },
  {
    author: "hanayilmaz",
    title: "How do I test code that depends on the current date?",
    tags: ["testing", "javascript", "typescript"],
    createdDaysAgo: 14,
    views: 386,
    upvotes: 18,
    downvotes: 0,
    content: `I have a function returning "3 days ago" style strings. The tests pass today and fail next month, which makes CI unreliable.

\`\`\`ts
export function relativeTime(date: Date) {
  const diff = Date.now() - date.getTime()
  // ...
}
\`\`\``,
    answers: [
      {
        author: "kenjitanaka",
        upvotes: 24,
        downvotes: 0,
        createdDaysAgo: 13,
        content: `Freeze the clock. Every major test runner has fake timers now:

\`\`\`ts
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date("2026-01-15T12:00:00Z"))
})

afterEach(() => vi.useRealTimers())
\`\`\`

The alternative, which is better if you can afford the refactor, is to stop reaching for the global clock at all:

\`\`\`ts
export function relativeTime(date: Date, now: Date = new Date()) { ... }
\`\`\`

Now the test passes an explicit \`now\` and needs no framework magic. Injected time also makes the function easier to reason about — it becomes pure.`,
      },
      {
        author: "oliverbennett",
        upvotes: 7,
        downvotes: 0,
        createdDaysAgo: 12,
        content: `One gotcha with fake timers: if any code under test awaits a real promise chain, remember to advance the timers *and* flush microtasks, otherwise you get mysterious hangs.`,
      },
    ],
  },
  {
    author: "oliverbennett",
    title: "Git: how do I undo a commit I already pushed?",
    tags: ["git"],
    createdDaysAgo: 16,
    views: 2104,
    upvotes: 44,
    downvotes: 2,
    content: `I pushed a commit to \`main\` with a hardcoded API key. I know I have to rotate the key, but what is the right way to get the commit out of history when other people have already pulled?`,
    answers: [
      {
        author: "danielokoye",
        upvotes: 49,
        downvotes: 0,
        createdDaysAgo: 16,
        content: `Rotate the key first — treat it as leaked the moment it was pushed. Everything below is cleanup, not remediation.

For a shared branch, prefer a forward fix:

\`\`\`bash
git revert <sha>
git push
\`\`\`

This adds a new commit undoing the change and breaks nobody's history. The secret is still in the old commit, which is why rotation is not optional.

If the history genuinely must be scrubbed (compliance, public repo), rewrite and coordinate:

\`\`\`bash
git filter-repo --path config/secrets.json --invert-paths
git push --force-with-lease
\`\`\`

Then every collaborator re-clones. Use \`--force-with-lease\` rather than \`--force\` so you don't clobber someone's push that landed while you were rewriting.`,
      },
      {
        author: "priyaraut",
        upvotes: 15,
        downvotes: 0,
        createdDaysAgo: 15,
        content: `And add a pre-commit secret scanner afterwards. Rotating once is fine; rotating monthly because the same mistake keeps happening is a process problem, not a git problem.`,
      },
    ],
  },
  {
    author: "meilin",
    title: "Why is my GraphQL API making hundreds of database queries per request?",
    tags: ["graphql", "nodejs", "postgresql"],
    createdDaysAgo: 18,
    views: 812,
    upvotes: 31,
    downvotes: 0,
    content: `Fetching 50 posts with their authors produces 51 SQL queries. Each post resolver looks up its own author:

\`\`\`js
const resolvers = {
  Post: {
    author: (post) => db.user.findById(post.authorId),
  },
}
\`\`\`

Is there a standard fix, or do I need to hand-write joins per query shape?`,
    answers: [
      {
        author: "jonasweber",
        upvotes: 41,
        downvotes: 0,
        createdDaysAgo: 17,
        content: `This is the classic N+1, and the standard fix is a **DataLoader** — it batches all the lookups made within one tick into a single query:

\`\`\`js
const userLoader = new DataLoader(async (ids) => {
  const users = await db.user.findMany({ where: { id: { in: ids } } })
  const byId = new Map(users.map((u) => [u.id, u]))
  return ids.map((id) => byId.get(id))
})

const resolvers = {
  Post: { author: (post) => userLoader.load(post.authorId) },
}
\`\`\`

51 queries becomes 2. Two rules that people trip over:

1. Create the loader **per request**, not per process, or users will see each other's cached data.
2. The batch function must return results in the *same order* as the input ids, including \`null\` for misses.`,
      },
    ],
  },
  {
    author: "fatimazahra",
    title: "Rust: what is the actual difference between String and &str?",
    tags: ["rust"],
    createdDaysAgo: 21,
    views: 1876,
    upvotes: 56,
    downvotes: 1,
    content: `Coming from garbage-collected languages, having two string types is the thing I keep tripping over. When does a function take one versus the other?`,
    answers: [
      {
        author: "lucasfernandes",
        upvotes: 63,
        downvotes: 0,
        createdDaysAgo: 20,
        content: `\`String\` **owns** heap-allocated bytes and can grow. \`&str\` is a **borrowed view** into bytes someone else owns — a pointer and a length, no allocation.

For parameters, the rule is nearly always: take \`&str\`.

\`\`\`rust
fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}
\`\`\`

A caller with a \`String\` can pass \`&s\` and deref coercion handles it, while a caller with a literal passes it directly. Taking \`String\` forces every caller to allocate or give up ownership for no reason.

Return \`String\` when you are producing new text, as above. Return \`&str\` only when it borrows from an input, and the lifetimes will say so.`,
      },
      {
        author: "meilin",
        upvotes: 18,
        downvotes: 0,
        createdDaysAgo: 19,
        content: `The mental shortcut that made it click for me: \`String\` is to \`&str\` what \`Vec<T>\` is to \`&[T]\`. Same owned/borrowed split, same "take the borrowed form in arguments" advice.`,
      },
    ],
  },
  {
    author: "elenarossi",
    title: "AWS Lambda cold starts are killing my p99 — what actually helps?",
    tags: ["aws", "nodejs", "docker"],
    createdDaysAgo: 24,
    views: 934,
    upvotes: 27,
    downvotes: 1,
    content: `p50 is 40ms, p99 is 2.8 seconds. It is clearly cold starts. I have seen advice ranging from "use provisioned concurrency" to "rewrite in Go" and would like to know what is worth doing first.`,
    answers: [
      {
        author: "tomasnovak",
        upvotes: 34,
        downvotes: 0,
        createdDaysAgo: 23,
        content: `In rough order of effort-to-payoff:

1. **Shrink the bundle.** Cold start scales with how much code has to be loaded and parsed. Bundle with esbuild, tree-shake, and stop importing the entire AWS SDK when you need one client.
2. **Move work out of the handler.** Anything at module scope runs once per container, not once per invocation — put client construction there.
3. **Do not open a VPC connection you don't need.** VPC-attached Lambdas used to be the worst offender; it is much better now, but still non-zero.
4. **Provisioned concurrency**, only after the above. It works, and you pay for it whether or not traffic arrives.

Rewriting in Go is real but it is the largest change for a gain you may not need once the bundle is 2MB instead of 40MB.`,
      },
      {
        author: "amaraokafor",
        upvotes: 10,
        downvotes: 0,
        createdDaysAgo: 22,
        content: `Check whether the p99 is cold starts at all before optimising — \`AWS/Lambda\` publishes \`InitDuration\` separately. I spent a week on bundle size once when the real cause was a downstream database connection timing out.`,
      },
    ],
  },
  {
    author: "marcuslee",
    title: "CSS: why does my flex child overflow instead of shrinking?",
    tags: ["css", "tailwindcss"],
    createdDaysAgo: 26,
    views: 1247,
    upvotes: 39,
    downvotes: 0,
    content: `A long unbroken string in a flex child blows out the layout and produces a horizontal scrollbar, even with \`overflow: hidden\` on the parent.

\`\`\`html
<div class="flex">
  <div class="flex-1">averyveryverylongunbrokenstring...</div>
</div>
\`\`\``,
    answers: [
      {
        author: "sofiaalvarez",
        upvotes: 47,
        downvotes: 0,
        createdDaysAgo: 25,
        content: `Flex items default to \`min-width: auto\`, which means "never shrink below my content's intrinsic size". An unbreakable string has a large intrinsic size, so the item refuses to shrink and overflows.

Override it on the child:

\`\`\`css
.flex-1 { min-width: 0; }
\`\`\`

In Tailwind that is \`min-w-0\`. The same applies vertically in a column flex container with \`min-h-0\`, which is the usual reason a scrollable panel inside a flex column won't scroll.`,
      },
      {
        author: "hanayilmaz",
        upvotes: 8,
        downvotes: 0,
        createdDaysAgo: 24,
        content: `If the content is genuinely unbreakable text rather than a layout bug, pair it with \`break-words\` or \`truncate\` — \`min-w-0\` lets it shrink, but you still have to say what happens to the overflowing text.`,
      },
    ],
  },
  {
    author: "jonasweber",
    title: "Postgres: SELECT FOR UPDATE vs advisory locks for a job queue?",
    tags: ["postgresql", "go"],
    createdDaysAgo: 29,
    views: 428,
    upvotes: 16,
    downvotes: 0,
    content: `I am building a small job queue on Postgres rather than adding another piece of infrastructure. Multiple workers poll the same table. How do I stop two workers claiming the same job?`,
    answers: [
      {
        author: "fatimazahra",
        upvotes: 23,
        downvotes: 0,
        createdDaysAgo: 28,
        content: `\`SELECT ... FOR UPDATE SKIP LOCKED\` is purpose-built for this and is what most Postgres-backed queues use:

\`\`\`sql
UPDATE jobs SET status = 'running', worker_id = $1
WHERE id = (
  SELECT id FROM jobs
  WHERE status = 'pending'
  ORDER BY created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
RETURNING *;
\`\`\`

\`SKIP LOCKED\` is the important part — without it, workers queue behind each other on the same row and throughput collapses to serial. With it, each worker takes the first row nobody else holds.

Advisory locks are for coordinating things that are not rows (a nightly job that must run once across the fleet). For claiming rows, they are strictly more bookkeeping.`,
      },
    ],
  },
  {
    author: "sofiaalvarez",
    title: "How do I handle optimistic UI updates that fail on the server?",
    tags: ["react", "nextjs", "typescript"],
    createdDaysAgo: 33,
    views: 573,
    upvotes: 20,
    downvotes: 0,
    content: `Upvote buttons feel sluggish when I wait for the round trip, but if I update immediately and the request fails, the UI lies. What is the accepted pattern in a Next.js app using server actions?`,
    answers: [
      {
        author: "marcuslee",
        upvotes: 26,
        downvotes: 0,
        createdDaysAgo: 32,
        content: `\`useOptimistic\` is built for exactly this, and the rollback is automatic:

\`\`\`tsx
const [optimisticVotes, addOptimistic] = useOptimistic(
  votes,
  (state, delta: number) => state + delta,
)

async function handleUpvote() {
  addOptimistic(1)
  await upvoteAction(questionId) // throws → optimistic state is discarded
}
\`\`\`

When the action settles, React re-renders from the real state. If it failed, the real state never changed and the optimistic value simply disappears — you don't hand-roll the undo.

Do still surface the failure with a toast. Silently reverting a number the user just watched go up is worse than saying "couldn't save that".`,
      },
      {
        author: "nischalpuri",
        upvotes: 9,
        downvotes: 0,
        createdDaysAgo: 31,
        content: `Also make the server action idempotent where you can. Users double-click, and a vote endpoint that toggles on every call turns a double-click into no vote at all.`,
      },
    ],
  },
  {
    author: "hanayilmaz",
    title: "What is the difference between unit, integration, and e2e tests in practice?",
    tags: ["testing"],
    createdDaysAgo: 37,
    views: 1392,
    upvotes: 35,
    downvotes: 2,
    content: `Every team I have joined draws these lines differently, and the definitions in blog posts don't match what people actually write. Is there a useful practical distinction, or is it mostly vocabulary?`,
    answers: [
      {
        author: "kenjitanaka",
        upvotes: 30,
        downvotes: 1,
        createdDaysAgo: 36,
        content: `The definitions matter less than the trade-off they encode: **the more of the real system a test exercises, the more confidence it gives and the slower and flakier it is.**

A workable split:

- **Unit** — one module, dependencies substituted. Milliseconds. Catches logic errors. Tells you nothing about whether the pieces fit together.
- **Integration** — several real modules, real database, no browser. Seconds. Catches wiring, schema, and query errors, which is where most real bugs live.
- **E2E** — the deployed app through a browser. Minutes. Catches "the deploy config is wrong" and little else that the layer below missed.

Most teams over-invest in the ends and under-invest in the middle. If you have a fixed budget, integration tests usually buy the most confidence per second of CI time.`,
      },
      {
        author: "oliverbennett",
        upvotes: 6,
        downvotes: 0,
        createdDaysAgo: 35,
        content: `Agreed on the middle layer. Docker Compose plus a throwaway database has made integration tests cheap enough that the old reasons for mocking everything mostly don't apply now.`,
      },
    ],
  },
  {
    author: "nischalpuri",
    title: "Next.js: how do loading.tsx and error.tsx actually work?",
    tags: ["nextjs", "react"],
    createdDaysAgo: 40,
    views: 664,
    upvotes: 23,
    downvotes: 0,
    content: `I added \`loading.tsx\` and \`error.tsx\` to a route folder and things improved, but I don't fully understand what they wrap or why \`error.tsx\` has to be a client component.`,
    answers: [
      {
        author: "priyaraut",
        upvotes: 28,
        downvotes: 0,
        createdDaysAgo: 39,
        content: `They are sugar for two React features, scoped to the route segment.

\`loading.tsx\` becomes a \`<Suspense fallback>\` around the segment's page. Any async server component inside suspends, and the fallback streams to the browser immediately — which is why navigation feels instant even when the data isn't ready.

\`error.tsx\` becomes an error boundary around the same segment. It must be a client component because error boundaries rely on class-component lifecycle and state that only exist on the client. It receives \`error\` and a \`reset()\` you can call to retry:

\`\`\`tsx
"use client"

export default function Error({ error, reset }) {
  return <button onClick={reset}>Try again</button>
}
\`\`\`

Both are per-segment, so a nested route gets its own boundary and a failure there doesn't blank out the parent layout.`,
      },
    ],
  },
  {
    author: "amaraokafor",
    title: "Python: asyncio.gather vs TaskGroup — which should I use now?",
    tags: ["python"],
    createdDaysAgo: 44,
    views: 587,
    upvotes: 19,
    downvotes: 0,
    content: `I have used \`asyncio.gather\` for years. Newer code keeps using \`TaskGroup\`. Is \`gather\` deprecated, or do they solve different problems?`,
    answers: [
      {
        author: "meilin",
        upvotes: 25,
        downvotes: 0,
        createdDaysAgo: 43,
        content: `\`gather\` isn't deprecated, but \`TaskGroup\` is the better default for concurrent work that should succeed or fail together.

The difference is what happens on failure. With \`gather\`, when one task raises, the others **keep running** unless you cancel them yourself — a common source of leaked tasks and confusing logs:

\`\`\`python
async with asyncio.TaskGroup() as tg:
    a = tg.create_task(fetch_user())
    b = tg.create_task(fetch_orders())
# both awaited; if either raises, the other is cancelled
\`\`\`

\`TaskGroup\` cancels siblings on the first failure and raises an \`ExceptionGroup\` covering everything that went wrong.

\`gather\` is still the right tool when you specifically want \`return_exceptions=True\` — "run all of these, tell me which ones failed, don't stop for any of them".`,
      },
    ],
  },
  {
    author: "lucasfernandes",
    title: "Docker Compose: how do I wait for Postgres to be ready before starting my app?",
    tags: ["docker", "postgresql"],
    createdDaysAgo: 51,
    views: 1058,
    upvotes: 30,
    downvotes: 1,
    content: `\`depends_on\` starts the database container first, but my app still crashes on boot because Postgres isn't accepting connections yet. Adding \`sleep 10\` works but feels awful.`,
    answers: [
      {
        author: "elenarossi",
        upvotes: 36,
        downvotes: 0,
        createdDaysAgo: 50,
        content: `\`depends_on\` alone only waits for the container to *start*, not for the process inside to be ready. Add a healthcheck and depend on that condition:

\`\`\`yaml
services:
  db:
    image: postgres:17
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 10

  app:
    depends_on:
      db:
        condition: service_healthy
\`\`\`

That said — make the app retry its initial connection anyway. In production there is no Compose orchestrating startup order, and databases restart independently of your app. The healthcheck fixes local development; retry logic fixes reality.`,
      },
      {
        author: "danielokoye",
        upvotes: 11,
        downvotes: 0,
        createdDaysAgo: 49,
        content: `Second the retry point. Exponential backoff with a cap, and log each attempt — otherwise a misconfigured host string looks identical to a slow-starting database.`,
      },
    ],
  },
  {
    author: "oliverbennett",
    title: "Should I use a monorepo for a small side project?",
    tags: ["git", "nodejs", "typescript"],
    createdDaysAgo: 56,
    views: 723,
    upvotes: 13,
    downvotes: 4,
    content: `Two packages: a Next.js web app and a small CLI that shares some types with it. Is a monorepo overkill at this size, or does it pay off early?`,
    answers: [
      {
        author: "nischalpuri",
        upvotes: 21,
        downvotes: 0,
        createdDaysAgo: 55,
        content: `At two packages sharing types, yes — but keep it boring. npm/pnpm workspaces are enough:

\`\`\`json
{ "workspaces": ["apps/*", "packages/*"] }
\`\`\`

The payoff is that a type change and the code reacting to it land in one commit, and there is no publish step between them. That is worth a lot even at this size.

What you should skip is the heavy tooling — Nx, Bazel, remote caching. Those solve problems you get at fifty packages and a twenty-minute CI run, and they cost real setup time now.`,
      },
      {
        author: "jonasweber",
        upvotes: 5,
        downvotes: 2,
        createdDaysAgo: 54,
        content: `Counterpoint: if the shared surface is genuinely just types, a single \`types.ts\` copied between two repos costs less than a workspace setup, and you can always merge later. Monorepos are easy to adopt and hard to reverse.`,
      },
    ],
  },
  {
    author: "danielokoye",
    title: "How should I hash passwords in 2026 — bcrypt, scrypt, or argon2?",
    tags: ["security", "nodejs"],
    createdDaysAgo: 61,
    views: 1671,
    upvotes: 42,
    downvotes: 1,
    content: `Existing code uses bcrypt with 10 rounds. Is that still acceptable, or should I be migrating to argon2?`,
    answers: [
      {
        author: "fatimazahra",
        upvotes: 48,
        downvotes: 0,
        createdDaysAgo: 60,
        content: `All three are acceptable; none of them are the weak link in a typical breach. In preference order for new code: **argon2id**, then **scrypt**, then **bcrypt**.

Argon2id resists GPU and side-channel attacks better and lets you tune memory cost, which is what actually hurts an attacker with a rack of GPUs.

bcrypt at 10 rounds is not broken, but bump it — 12 is the common floor now, and it costs you a few hundred milliseconds per login. Two things people forget about bcrypt:

- It silently truncates input at **72 bytes**. Pre-hash with SHA-256 if you accept long passphrases.
- The cost factor should be re-evaluated periodically; a value chosen in 2016 is doing much less work relative to today's hardware.

Migrate opportunistically: on successful login, if the stored hash uses the old scheme, re-hash with the new one. No mass reset required.`,
      },
      {
        author: "adasharma",
        upvotes: 13,
        downvotes: 0,
        createdDaysAgo: 59,
        content: `And rate-limit the login endpoint. A slow hash protects the database dump; it does nothing about someone trying ten thousand passwords against one account over the network.`,
      },
    ],
  },
  {
    author: "meilin",
    title: "Why is my Docker build not using the cache when only my source changed?",
    tags: ["docker", "nodejs"],
    createdDaysAgo: 68,
    views: 845,
    upvotes: 25,
    downvotes: 0,
    content: `Every build reinstalls all dependencies even when I only edited one component. My Dockerfile:

\`\`\`dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
\`\`\``,
    answers: [
      {
        author: "tomasnovak",
        upvotes: 32,
        downvotes: 0,
        createdDaysAgo: 67,
        content: `\`COPY . .\` invalidates the cache for every layer beneath it whenever *any* file changes — including your one component. So \`npm ci\` reruns every time.

Copy the manifests first, install, then copy the source:

\`\`\`dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
\`\`\`

Now the install layer is only invalidated when the lockfile changes.

Add a \`.dockerignore\` too — without it \`node_modules\` and \`.next\` get sent to the daemon and can bust the cache through mtime changes alone:

\`\`\`
node_modules
.next
.git
\`\`\``,
      },
    ],
  },
  {
    author: "priyaraut",
    title: "MongoDB transactions: do I need them for a two-collection write?",
    tags: ["mongodb", "nodejs"],
    createdDaysAgo: 74,
    views: 519,
    upvotes: 17,
    downvotes: 0,
    content: `When someone posts a question I insert into \`questions\` and then into \`tagquestions\`, and increment a counter on \`tags\`. If the second write fails I get orphaned data. Are transactions the right answer, or is that over-engineering for MongoDB?`,
    answers: [
      {
        author: "jonasweber",
        upvotes: 24,
        downvotes: 0,
        createdDaysAgo: 73,
        content: `Multi-document transactions are the right answer, and they are unremarkable on a replica set now:

\`\`\`js
const session = await mongoose.startSession()
try {
  await session.withTransaction(async () => {
    const [question] = await Question.create([doc], { session })
    await TagQuestion.insertMany(links, { session })
    await Tag.bulkWrite(ops, { session })
  })
} finally {
  await session.endSession()
}
\`\`\`

\`withTransaction\` also retries on transient errors, which hand-rolled commit/abort blocks usually forget.

Two caveats: they require a replica set (Atlas gives you one; a bare local \`mongod\` does not), and they are more expensive than single-document writes — so use them where atomicity actually matters, not everywhere.`,
      },
      {
        author: "adasharma",
        upvotes: 8,
        downvotes: 0,
        createdDaysAgo: 72,
        content: `If you cannot use transactions, the fallback is to make the operation idempotent and reconcile — write the question first, then have a background job repair missing tag links. Strictly worse, but it is what you do on a sharded setup where the transaction cost is real.`,
      },
    ],
  },
]

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI missing — run with --env-file=.env")

  await mongoose.connect(uri, { dbName: "devflow" })
  const db = mongoose.connection.db
  console.log(`Connected to "${db.databaseName}"`)

  // --- wipe -----------------------------------------------------------------
  const existing = (await db.listCollections().toArray()).map((c) => c.name)
  for (const name of COLLECTIONS) {
    if (existing.includes(name)) {
      await db.collection(name).drop()
      console.log(`  dropped ${name}`)
    }
  }

  // --- users + credential accounts -----------------------------------------
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10)
  const userIdByUsername = new Map()

  // `github` and an explicit `_id` are seed-only hints, not user fields.
  const userDocs = USERS.map(({ _id, github, ...u }, i) => {
    const id = _id ? new ObjectId(_id) : oid()
    userIdByUsername.set(u.username, id)
    return {
      _id: id,
      ...u,
      github,
      createdAt: daysAgo(120 - i * 5),
      updatedAt: daysAgo(120 - i * 5),
    }
  })

  await db
    .collection("users")
    // eslint-disable-next-line no-unused-vars
    .insertMany(userDocs.map(({ github, ...doc }) => doc))

  const accountDocs = userDocs.map((u) => ({
    _id: oid(),
    userId: u._id,
    name: u.name,
    image: u.image,
    password: passwordHash,
    provider: "credentials",
    providerAccountId: u.email,
    createdAt: u.createdAt,
    updatedAt: u.createdAt,
  }))

  // The owner also has a real GitHub account linked, so the OAuth callback
  // finds an existing link instead of creating a duplicate.
  for (const u of userDocs) {
    if (!u.github) continue
    accountDocs.push({
      _id: oid(),
      userId: u._id,
      name: u.name,
      image: u.image,
      provider: "github",
      providerAccountId: u.github,
      createdAt: u.createdAt,
      updatedAt: u.createdAt,
    })
  }

  await db.collection("accounts").insertMany(accountDocs)

  // --- tags -----------------------------------------------------------------
  // The per-tag question count is filled in once the questions are known.
  const tagIdByName = new Map(TAG_NAMES.map((name) => [name, oid()]))
  const tagQuestionCount = new Map(TAG_NAMES.map((name) => [name, 0]))

  for (const q of QUESTIONS) {
    for (const t of q.tags) {
      tagQuestionCount.set(t, tagQuestionCount.get(t) + 1)
    }
  }

  await db.collection("tags").insertMany(
    TAG_NAMES.map((name) => ({
      _id: tagIdByName.get(name),
      name,
      questions: tagQuestionCount.get(name),
      createdAt: daysAgo(90),
      updatedAt: daysAgo(1),
    })),
  )

  // --- questions, answers, and the tag join collection ----------------------
  const questionDocs = []
  const answerDocs = []
  const tagQuestionDocs = []

  for (const q of QUESTIONS) {
    const questionId = oid()
    const createdAt = daysAgo(q.createdDaysAgo)

    questionDocs.push({
      _id: questionId,
      title: q.title,
      content: q.content,
      tags: q.tags.map((t) => tagIdByName.get(t)),
      views: q.views,
      answers: q.answers.length,
      upvotes: q.upvotes,
      downvotes: q.downvotes,
      author: userIdByUsername.get(q.author),
      createdAt,
      updatedAt: createdAt,
    })

    for (const t of q.tags) {
      tagQuestionDocs.push({
        _id: oid(),
        tag: tagIdByName.get(t),
        question: questionId,
        createdAt,
        updatedAt: createdAt,
      })
    }

    for (const a of q.answers) {
      const answeredAt = daysAgo(a.createdDaysAgo)
      answerDocs.push({
        _id: oid(),
        author: userIdByUsername.get(a.author),
        question: questionId,
        content: a.content,
        upvotes: a.upvotes,
        downvotes: a.downvotes,
        createdAt: answeredAt,
        updatedAt: answeredAt,
      })
    }
  }

  await db.collection("questions").insertMany(questionDocs)
  await db.collection("answers").insertMany(answerDocs)
  await db.collection("tagquestions").insertMany(tagQuestionDocs)

  // --- votes ----------------------------------------------------------------
  // Deterministic but varied: each user votes on a rotating slice of the
  // questions and answers, so vote state differs per signed-in user.
  const voteDocs = []
  const interactionDocs = []

  userDocs.forEach((user, ui) => {
    questionDocs.forEach((question, qi) => {
      if (question.author.equals(user._id)) return
      if ((ui + qi) % 3 !== 0) return

      const voteType = (ui + qi) % 6 === 0 ? "downvote" : "upvote"
      voteDocs.push({
        _id: oid(),
        author: user._id,
        actionId: question._id,
        actionType: "question",
        voteType,
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      })

      interactionDocs.push({
        _id: oid(),
        user: user._id,
        action: voteType,
        actionId: question._id,
        actionType: "question",
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      })
    })

    answerDocs.forEach((answer, ai) => {
      if (answer.author.equals(user._id)) return
      if ((ui + ai) % 4 !== 0) return

      voteDocs.push({
        _id: oid(),
        author: user._id,
        actionId: answer._id,
        actionType: "answer",
        voteType: "upvote",
        createdAt: daysAgo(1),
        updatedAt: daysAgo(1),
      })
    })
  })

  await db.collection("votes").insertMany(voteDocs)

  // --- collections (bookmarks) ---------------------------------------------
  const collectionDocs = []
  userDocs.forEach((user, ui) => {
    questionDocs.forEach((question, qi) => {
      if (question.author.equals(user._id)) return
      if ((ui + qi) % 5 !== 0) return

      collectionDocs.push({
        _id: oid(),
        author: user._id,
        question: question._id,
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      })

      interactionDocs.push({
        _id: oid(),
        user: user._id,
        action: "bookmark",
        actionId: question._id,
        actionType: "question",
        createdAt: daysAgo(2),
        updatedAt: daysAgo(2),
      })
    })
  })

  await db.collection("collections").insertMany(collectionDocs)

  // --- interactions ---------------------------------------------------------
  // "post" interactions back the reputation calculations the app performs.
  for (const question of questionDocs) {
    interactionDocs.push({
      _id: oid(),
      user: question.author,
      action: "post",
      actionId: question._id,
      actionType: "question",
      createdAt: question.createdAt,
      updatedAt: question.createdAt,
    })
  }

  for (const answer of answerDocs) {
    interactionDocs.push({
      _id: oid(),
      user: answer.author,
      action: "post",
      actionId: answer._id,
      actionType: "answer",
      createdAt: answer.createdAt,
      updatedAt: answer.createdAt,
    })
  }

  await db.collection("interactions").insertMany(interactionDocs)

  // --- indexes --------------------------------------------------------------
  // Dropping the collections dropped their indexes too; recreate the unique
  // ones the schemas declare so the app keeps its guarantees.
  await db.collection("users").createIndex({ email: 1 }, { unique: true })
  await db.collection("users").createIndex({ username: 1 }, { unique: true })
  await db.collection("tags").createIndex({ name: 1 }, { unique: true })
  await db.collection("tagquestions").createIndex({ tag: 1 })
  await db.collection("tagquestions").createIndex({ question: 1 })
  await db
    .collection("tagquestions")
    .createIndex({ tag: 1, question: 1 }, { unique: true })

  console.log("\nSeeded:")
  console.log(`  ${userDocs.length} users (+ ${accountDocs.length} accounts)`)
  console.log(`  ${TAG_NAMES.length} tags`)
  console.log(`  ${questionDocs.length} questions`)
  console.log(`  ${answerDocs.length} answers`)
  console.log(`  ${tagQuestionDocs.length} tag-question links`)
  console.log(`  ${voteDocs.length} votes`)
  console.log(`  ${collectionDocs.length} collections`)
  console.log(`  ${interactionDocs.length} interactions`)
  console.log(`\nSign in with any seeded email, password: ${SEED_PASSWORD}`)
  console.log(`e.g. ${USERS[0].email}`)

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect()
  process.exit(1)
})
