# PRD / Agent Handoff: Market Denoising Engine

## 1. Working Name

**Market Denoising Engine**

Alternative names:

- Brand Diffusion Engine
- Market Probe Engine
- Content Evolution Dashboard
- Brand Fitness Lab
- Signal-Seeking Content System

For now, use **Market Denoising Engine**.

---

## 2. Purpose

Build a lightweight system for discovering brand strategy through repeated, instrumented
content experiments.

The system treats content as **market probes**, not polished marketing assets. It starts
with rough, low-cost, semi-random or weakly intentional content, publishes small
populations of variants, observes market response, evaluates relative fitness, and uses
the strongest signals to generate the next generation of probes.

The goal is not to automate content creation immediately.

The goal is to create a **learning spine**:

```
probe population
→ publish manually
→ collect metrics
→ evaluate fitness
→ review signal
→ produce mutations
→ next generation
```

Over time, more steps may become automated, but the initial system should make the
process visible, measurable, and repeatable before replacing humans with agents.

---

## 3. North Star

The system should answer:

> Which content/brand decisions are moving us toward a viable audience, market,
> message, offer, and trust position — with what evidence, at what confidence,
> and what should we try next?

This is not a social media scheduler.

This is not a generic analytics dashboard.

This is a **decision-learning system for emergent brand growth**.

---

## 4. Core Philosophy

### 4.1 Strategy is derived, not prescribed

Do not require the user to define a complete brand strategy upfront.

The system should allow strategy to emerge from repeated interaction with the market.

Initial content can be rough, exploratory, weird, incomplete, or low-production-value.

The required discipline is not polish.

The required discipline is:

- publishing
- tagging
- measuring
- reviewing
- mutating
- preserving the audit trail

### 4.2 Start with bounded noise

The system should support "noise," but not destructive randomness.

Useful noise:

- rough claims
- half-formed ideas
- weird metaphors
- raw voice-note fragments
- screenshots
- short text posts
- ugly static images
- unpolished video/audio snippets
- low-cost probes

Unacceptable trash:

- dishonest claims
- reputationally harmful content
- untagged output
- expensive experiments with no learning path
- engagement bait that violates brand trust
- content impossible to compare or learn from

The first version should help distinguish **cheap learnable noise** from **unusable garbage**.

### 4.3 Compare within generations

Avoid pretending there is one universal, objective quality score.

Instead, evaluate probes **relative to their generation**.

A generation is a small population of related probes, likely starting with 3 variants.

Example:

```
Generation 1:
- Probe A: anti-grift sales framing
- Probe B: AI replacement fear framing
- Probe C: freedom/independence framing
```

The system should help answer:

> Within this population, which probe produced the strongest movement toward useful signal?

### 4.4 Fitness is multi-dimensional

Fitness is not just engagement.

Fitness may include:

- comments
- saves
- shares
- follows
- profile clicks
- DMs
- leads
- qualitative resonance
- audience quality
- buyer-likelihood
- trust alignment
- strategic usefulness
- effort cost
- mutation potential

The first implementation can use a simple weighted score, but the model must allow
future revision.

Fitness functions should be versioned or at least named, because the definition of
"good" will evolve.

### 4.5 Preserve observations, interpretations, and decisions separately

This is critical.

Do not collapse metrics, human judgment, and strategic conclusions into one blob.

Separate:

```
Observation:
Post got 4 comments, 2 saves, 1 DM.

Interpretation:
The anti-grift framing may resonate with engineers.

Decision:
Create next-generation variants around "sales without becoming a grifter."
```

This separation prevents dashboard spaghetti and keeps the system auditable.

### 4.6 Manual-first, automation-later

The day-zero system should assume humans perform many steps manually:

- create content
- publish content
- collect metrics
- review signal
- choose mutations

The app should reduce friction, compute basic scores, and preserve state.

Automation should be added only after a repeated human runbook exposes stable steps
and bottlenecks.

---

## 5. Product Summary

Build an Nx monorepo containing a minimal full-stack app that supports:

1. Creating a **generation** of content probes.
2. Creating 3 or more **probes** inside that generation.
3. Recording manually published platform posts.
4. Entering metric snapshots over time.
5. Calculating simple fitness scores.
6. Reviewing signals.
7. Selecting winners/parents.
8. Creating mutations for the next generation.
9. Viewing a dashboard of current learning state.

---

## 6. Initial User

Primary user:

A solo founder/operator trying to discover a viable brand/content strategy by
publishing rough probes across social platforms, learning from market response, and
iterating toward stronger positioning.

The user is technical and comfortable with:

- TypeScript
- Next.js
- Prisma
- Postgres
- Nx
- Git
- structured markdown
- manual workflows
- eventual agentic automation

The product does not need to be consumer-polished at first.

It must be conceptually clean, extensible, and easy to operate.

---

## 7. Initial Scope

### In scope for MVP

- Nx monorepo
- Next.js app
- Prisma schema
- Postgres database
- CRUD for generations
- CRUD for probes
- CRUD for platform posts
- manual metric snapshots
- signal reviews
- mutation queue
- simple dashboard
- simple relative fitness scoring
- ADR folder
- basic tests
- seed data
- README/runbook

### Out of scope for MVP

- automated publishing
- OAuth integrations
- platform SDK/API integrations
- automated metric ingestion
- AI content generation
- autonomous agents
- PPC campaign management
- real statistical significance testing
- multi-user permissions
- billing
- advanced data warehouse
- complex attribution
- native mobile app
- media asset rendering pipeline

---

## 8. Recommended Stack

### Required

- **Nx monorepo**
- **TypeScript**
- **Next.js**
- **Prisma**
- **Postgres**
- **Zod**
- **React Hook Form** or equivalent
- **Jest/Vitest**
- **Playwright**
- **ESLint**
- **Prettier**

### Preferred deployment

- App: **Vercel**
- DB: **Neon Postgres** or other managed Postgres
- CI: **GitHub Actions**
- ORM: **Prisma**

### Repository shape

```
market-denoising-engine/
  apps/
    web/
  packages/
    db/
    domain/
    scoring/
    ui/
    config/
  docs/
    adr/
    prd/
    runbooks/
  tools/
    scripts/
```

Keep the domain model isolated enough that future workers, CLIs, or agents can reuse it.

---

## 9. Key Concepts

### 9.1 Probe

A **Probe** is a content unit intended to test market resonance.

It may be:

- short text
- static image
- short video
- longform text
- longform video
- audio
- blog post
- email
- ad creative

MVP can focus on short text and manual URL tracking.

### 9.2 Generation

A **Generation** is a population of related probes.

A generation exists to compare variants against each other.

MVP default population size: **3 probes**.

A generation should have:

- a title
- a loose exploration theme
- optional parent generation
- optional parent probe(s)
- a fitness function version/name
- status
- review notes

### 9.3 Population

The **Population** is the set of probes inside a generation.

For MVP, this can simply be `Generation.probes`.

### 9.4 Fitness Function

A **Fitness Function** is the scoring logic used to compare probes.

MVP can use a simple weighted formula.

Example v0:

```
fitness =
  likes * 1
+ comments * 5
+ shares * 4
+ saves * 4
+ follows * 8
+ profileClicks * 4
+ linkClicks * 6
+ leads * 20
+ qualitativeSignalScore * 10
```

Then optionally normalize:

```
fitnessPerEffort = fitness / max(effortMinutes, 1)
fitnessPerImpression = fitness / max(impressions, 1)
```

The app should display raw metrics and computed scores separately.

Do not hide the formula.

### 9.5 Signal Review

A **Signal Review** is human interpretation of what happened.

It captures:

- what seemed to resonate
- what audience seemed present
- what language people repeated
- whether the signal was useful
- whether the content was trust-aligned
- whether to mutate, repeat, retire, or ignore

### 9.6 Mutation

A **Mutation** is a proposed next variant derived from one or more probes.

Examples:

- same claim, different hook
- same audience, different pain
- same pain, different promise
- same idea as static image
- same idea as short video
- softer version
- sharper version
- more technical version
- more personal version

Mutations may become probes in the next generation.

### 9.7 Parent / Child Lineage

The system should preserve lineage.

A probe may derive from:

- a previous probe
- multiple previous probes
- a human note
- an external idea
- a mutation

The MVP does not need full genetic crossover mechanics, but it should not block them.

At minimum:

- Generation may have parent generation.
- Probe may have parent probe.
- Mutation may point to source probe.
- Future schema should allow multiple parents.

---

## 10. MVP User Flow

### 10.1 Create generation

User creates:

```
Title: Engineer-Seller Noise Batch 001
Theme: Rough probes around engineers, AI commoditization, sales, and anti-grift framing
Population size: 3
Fitness function: default_v0
```

### 10.2 Create three probes

Example:

```
Probe A:
Engineers don't need to become influencers. They need enough sales to survive
commoditization.

Probe B:
AI won't replace engineers. It will replace engineers who need perfect specs
before acting.

Probe C:
Most technical founders do not have a product problem. They have a distribution
allergy.
```

Each probe records:

- text
- tags
- estimated effort
- format
- intended platform
- optional notes

### 10.3 Publish manually

User manually posts each probe to LinkedIn, X, etc.

Then records:

```
platform
URL
publishedAt
caption/content actually posted
```

### 10.4 Capture metric snapshots

At 24h, 48h, and 7d, user manually enters metrics.

For MVP, snapshots are manual.

Example fields:

- impressions
- views
- likes
- comments
- shares
- saves
- follows
- profileClicks
- linkClicks
- leads
- notes

### 10.5 Compare generation

The dashboard shows:

```
Probe A: fitness 42
Probe B: fitness 18
Probe C: fitness 57
```

But also shows why:

```
Probe C had fewer likes but more comments and one qualified DM.
```

### 10.6 Review signal

User writes review:

```
Signal:
"Distribution allergy" language got comments from technical founders.
Seems promising.

Interpretation:
Audience may respond to blunt diagnosis of avoidance around sales/distribution.

Decision:
Create next generation around "distribution allergy," with variants:
1. technical founder framing
2. freelance engineer framing
3. AI commoditization framing
```

### 10.7 Create next generation

User selects one or more winners/parents.

The system creates a draft next generation with mutations.

MVP can do this manually via forms.

Future version can suggest mutations with LLMs.

---

## 11. Data Model: MVP Draft

Use this as a starting point. Adjust implementation details as needed.

```prisma
model Generation {
  id               String           @id @default(cuid())
  title            String
  theme            String?
  status           GenerationStatus @default(DRAFT)
  fitnessFunction  String           @default("default_v0")

  parentId         String?
  parent           Generation?      @relation("GenerationLineage", fields: [parentId], references: [id])
  children         Generation[]     @relation("GenerationLineage")

  probes           Probe[]
  reviews          GenerationReview[]

  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt
}

model Probe {
  id               String       @id @default(cuid())

  generationId     String
  generation       Generation   @relation(fields: [generationId], references: [id])

  parentProbeId    String?
  parentProbe      Probe?       @relation("ProbeLineage", fields: [parentProbeId], references: [id])
  childProbes      Probe[]      @relation("ProbeLineage")

  title            String
  rawInput         String
  contentText      String?
  format           Format
  status           ProbeStatus  @default(DRAFT)

  tags             String[]
  effortMinutes    Int          @default(10)

  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  platformPosts    PlatformPost[]
  reviews          SignalReview[]
  mutations        Mutation[]
}

model PlatformPost {
  id               String       @id @default(cuid())

  probeId          String
  probe            Probe        @relation(fields: [probeId], references: [id])

  platform         Platform
  url              String?
  externalId       String?
  caption          String?
  publishedAt      DateTime?

  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  snapshots        MetricSnapshot[]
}

model MetricSnapshot {
  id               String       @id @default(cuid())

  platformPostId   String
  platformPost     PlatformPost @relation(fields: [platformPostId], references: [id])

  capturedAt       DateTime     @default(now())
  hoursSincePost   Int?

  impressions      Int?
  views            Int?
  likes            Int?
  comments         Int?
  shares           Int?
  saves            Int?
  follows          Int?
  profileClicks    Int?
  linkClicks       Int?
  leads            Int?

  qualitativeScore Int?
  notes            String?
}

model SignalReview {
  id               String         @id @default(cuid())

  probeId          String
  probe            Probe          @relation(fields: [probeId], references: [id])

  reviewedAt       DateTime       @default(now())

  signal           SignalStrength
  confidence       Confidence

  observation      String
  interpretation   String
  decision         String?

  inferredAudience String?
  inferredProblem  String?
  inferredPromise  String?
  inferredTags     String[]

  trustAligned     Boolean        @default(true)
  shouldMutate     Boolean        @default(false)
}

model GenerationReview {
  id                  String     @id @default(cuid())

  generationId        String
  generation          Generation @relation(fields: [generationId], references: [id])

  reviewedAt          DateTime   @default(now())

  summary             String
  winnerProbeId       String?
  rationale           String?

  nextGenerationPlan  String?
}

model Mutation {
  id             String         @id @default(cuid())

  sourceProbeId  String
  sourceProbe    Probe          @relation(fields: [sourceProbeId], references: [id])

  description    String
  mutationType   MutationType
  status         MutationStatus @default(OPEN)

  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
}

enum GenerationStatus {
  DRAFT
  ACTIVE
  PUBLISHED
  REVIEWED
  MUTATED
  RETIRED
}

enum Format {
  SHORT_TEXT
  STATIC_IMAGE
  SHORT_VIDEO
  LONGFORM_TEXT
  LONGFORM_VIDEO
  AUDIO
}

enum Platform {
  LINKEDIN
  X
  YOUTUBE
  TIKTOK
  INSTAGRAM
  FACEBOOK
  BLOG
  EMAIL
  OTHER
}

enum ProbeStatus {
  DRAFT
  READY
  PUBLISHED
  REVIEWED
  MUTATED
  RETIRED
}

enum SignalStrength {
  NONE
  WEAK
  PROMISING
  STRONG
}

enum Confidence {
  LOW
  MEDIUM
  HIGH
}

enum MutationType {
  HOOK
  AUDIENCE
  PAIN
  PROMISE
  FORMAT
  PLATFORM
  CTA
  TONE
  PROOF
  VISUAL
  OTHER
}

enum MutationStatus {
  OPEN
  DRAFTED
  PUBLISHED
  DONE
  SKIPPED
}
```

---

## 12. MVP Pages

### `/`

Redirect to dashboard.

### `/dashboard`

Show:

- active generation
- probes published this week
- open mutations
- top probes by fitness
- latest snapshots
- current strongest signal
- next recommended human action

Minimum useful dashboard cards:

```
Active Generation
Population Fitness Ranking
Open Mutations
Needs Metrics Capture
Needs Review
```

### `/generations`

List generations.

Fields:

- title
- status
- theme
- number of probes
- top fitness score
- created date
- reviewed date

### `/generations/new`

Create generation.

Fields:

- title
- theme
- fitness function
- optional parent generation

### `/generations/[id]`

Generation detail.

Show:

- theme
- status
- probes
- population ranking
- metric summary
- reviews
- mutations
- button: create next generation from selected probe(s)

### `/probes/new`

Create probe.

Fields:

- generation
- title
- raw input
- content text
- format
- tags
- effort minutes
- optional parent probe

### `/probes/[id]`

Probe detail.

Show:

- content
- tags
- platform posts
- metric snapshots
- computed score
- signal reviews
- mutations
- lineage

Actions:

- add platform post
- add metric snapshot
- add signal review
- create mutation

### `/mutations`

List open mutations.

Fields:

- source probe
- mutation type
- description
- status
- create probe from mutation

---

## 13. Scoring Requirements

### 13.1 MVP scoring

Implement one simple scoring module in a package such as `packages/scoring`.

It should expose something like:

```typescript
type FitnessInput = {
  impressions?: number | null;
  views?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
  follows?: number | null;
  profileClicks?: number | null;
  linkClicks?: number | null;
  leads?: number | null;
  qualitativeScore?: number | null;
  effortMinutes?: number | null;
};

type FitnessResult = {
  rawScore: number;
  scorePerEffortMinute: number | null;
  scorePerImpression: number | null;
  formulaVersion: "default_v0";
};
```

Default formula:

```typescript
const rawScore =
  likes * 1 +
  comments * 5 +
  shares * 4 +
  saves * 4 +
  follows * 8 +
  profileClicks * 4 +
  linkClicks * 6 +
  leads * 20 +
  qualitativeScore * 10;
```

Rules:

- Null metrics count as zero.
- Do not mutate database state from scoring functions.
- Keep scoring deterministic and testable.
- Show formula version in UI.
- Make weights easy to change later.

### 13.2 Relative generation ranking

For each generation, show probes ranked by:
1. raw score
2. score per effort
3. score per impression, if impressions exist

Do not overstate certainty.

The UI should say "best observed fitness," not "best content."

---

## 14. Development Principles

### 14.1 Spec-first

Before implementing non-trivial changes:

- update PRD or feature spec
- add/modify ADR if architectural
- define acceptance criteria
- implement
- test
- update runbook if user workflow changes

### 14.2 Preserve future optionality

This system may later include:

- platform APIs
- scheduled ingestion
- LLM summarization
- agentic mutation generation
- media generation
- PPC experiments
- multi-brand support
- multi-user support
- vector search over probe history
- external dashboards
- Git-based content inventory

Avoid decisions that make those impossible.

But do not build them now.

### 14.3 Prefer boring infrastructure

The novelty is in the workflow and data model, not the infrastructure.

Use standard tools:

- Next.js
- Prisma
- Postgres
- Nx
- Vercel
- GitHub Actions

Avoid premature queues, warehouses, event buses, or distributed systems.

### 14.4 Separate domain logic from UI

Scoring, status transitions, and core business concepts should live outside React
components.

Use packages such as:

- `packages/domain`
- `packages/scoring`
- `packages/db`

### 14.5 Optimize for auditability

The system should preserve:

- what was published
- when
- where
- with which metadata
- what metrics were observed
- what humans inferred
- what decision followed
- what mutation came next

The audit trail is more important than beautiful UI.

### 14.6 Avoid premature automation

Do not add automation just because it is possible.

Automate only when:

- a manual step has been repeated enough to understand it
- the inputs/outputs are stable
- failure modes are acceptable
- the automation improves throughput or reduces cognitive load

### 14.7 Human judgment remains first-class

Metrics are evidence, not truth.

The system must preserve qualitative signal, taste, trust, and context.

A post with low metrics but one qualified buyer reply may be more valuable than a post
with many empty likes.

---

## 15. ADRs to Create Early

Create `docs/adr/`.

Initial ADRs:

### ADR 001: Use Nx Monorepo

Decision: Use Nx from the start to support future growth into multiple apps, packages,
workers, scripts, infrastructure, and shared domain logic.

Rationale: Even though the MVP is small, the product is likely to grow across frontend,
backend, ingestion jobs, scoring packages, automation agents, and infra code.

### ADR 002: Manual-First Pipeline

Decision: Start with manual publishing and manual metric entry.

Rationale: Platform integrations introduce OAuth, API access, rate limits, schema drift,
and distraction. The first goal is to validate the learning loop, not automate publishing.

### ADR 003: Separate Observations, Interpretations, and Decisions

Decision: Model metric snapshots, signal reviews, and mutations as separate records.

Rationale: This keeps the system auditable and prevents premature collapse of raw data
into strategy claims.

### ADR 004: Use Simple Versioned Fitness Function

Decision: Start with a simple deterministic scoring function named `default_v0`.

Rationale: Early data is noisy and sparse. The point is relative comparison within
generations, not statistical certainty.

### ADR 005: Vercel + Managed Postgres Deployment

Decision: Deploy the MVP as a Next.js app on Vercel with managed Postgres.

Rationale: This minimizes operational overhead and matches the project's initial
full-stack TypeScript needs.

---

## 16. Acceptance Criteria for MVP

The MVP is complete when:

1. User can create a generation.
2. User can create at least 3 probes inside a generation.
3. User can add a manually published platform URL to each probe.
4. User can enter metric snapshots for each platform post.
5. System computes deterministic fitness scores.
6. System ranks probes within a generation.
7. User can write signal reviews separating:
   - observation
   - interpretation
   - decision
8. User can create mutations from a probe.
9. User can create a next generation from a mutation or winning probe.
10. Dashboard shows:
    - active generation
    - ranking
    - open mutations
    - probes needing metrics
    - probes needing review
11. Repo includes:
    - README
    - runbook
    - ADR folder
    - seed data
    - basic unit tests for scoring
    - at least one Playwright smoke test

---

## 17. Day-Zero Runbook

### Manual content loop

1. Create a generation.
2. Create 3 rough probes.
3. Publish them manually to one platform.
4. Paste URLs into the app.
5. After 24h, enter metrics.
6. Review each probe.
7. Compare generation ranking.
8. Select the strongest parent.
9. Create 2–3 mutations.
10. Create next generation.
11. Repeat.

---

## 18. First Test Generation

Use this as seed/example data.

### Generation

```
Title: Engineer-Seller Batch 001
Theme: Rough probes around engineers, AI commoditization, sales, and anti-grift positioning.
Population size: 3
Platform: LinkedIn
Fitness function: default_v0
```

### Probe A

```
Most engineers don't need to become influencers.

They need to learn enough sales to survive commoditization.

Not guru sales.
Not manipulation.
Not fake authority.

Just enough to explain a real problem,
find people who have it,
and get paid to solve it.
```

Tags: `engineer-seller, ai-disruption, anti-grift, sales`

### Probe B

```
AI won't replace engineers.

It will replace engineers who need perfect specs before they can create value.

The next durable skill is not prompting.

It is finding painful problems,
shipping rough solutions,
and learning from the market before your confidence catches up.
```

Tags: `ai-disruption, market-learning, shipping, engineers`

### Probe C

```
Most technical founders don't have a product problem.

They have a distribution allergy.

They keep improving the thing because improving the thing feels safer than
asking strangers if they care.
```

Tags: `technical-founders, distribution, sales-avoidance, positioning`

---

## 19. Risks

### 19.1 Schema over-design

Risk: Trying to model every future idea now.

Mitigation: Start with generations, probes, posts, snapshots, reviews, mutations.

### 19.2 False certainty

Risk: Fitness scores may imply rigor that the data does not support.

Mitigation: Use language like:

- observed score
- weak signal
- promising
- confidence low/medium/high
- needs more probes

### 19.3 Optimizing for engagement instead of trust

Risk: System may reward shallow attention.

Mitigation: Include qualitative review fields and trust alignment flag.

### 19.4 Premature automation

Risk: Building agents before the human process is understood.

Mitigation: Manual-first ADR. Add automation only after repeated runbook evidence.

### 19.5 Variant explosion

Risk: Too many probes make it impossible to compare or learn.

Mitigation: Default to population size 3 per generation.

---

## 20. Future Roadmap

### Phase 1: MVP manual loop

- generations
- probes
- snapshots
- scoring
- reviews
- mutations
- dashboard

### Phase 2: Import assistance

- CSV import
- platform export parsing
- bulk metric entry
- scheduled reminders

### Phase 3: AI-assisted review

- summarize comments
- detect repeated language
- suggest inferred audience/problem/promise tags
- propose mutations

### Phase 4: AI-assisted generation

- generate variants from winning probes
- generate platform-specific rewrites
- generate image/video prompts
- draft next generation

### Phase 5: Platform integrations

- LinkedIn
- YouTube
- X
- Instagram/TikTok if API access is worth friction
- email/blog analytics

### Phase 6: Advanced decision intelligence

- strategy candidate dashboard
- confidence scoring
- lineage visualization
- audience cluster detection
- offer/campaign correlation
- cost-of-learning analytics

---

## 21. Non-Negotiables

1. Use Nx.
2. Keep the system manual-first.
3. Preserve audit trail.
4. Separate observation, interpretation, and decision.
5. Make fitness functions explicit and versioned.
6. Optimize for learning, not vanity metrics.
7. Do not build platform integrations in MVP.
8. Keep domain logic outside UI components.
9. Add ADRs before consequential architecture choices.
10. The first successful loop matters more than polished UI.

---

## 22. First Implementation Task

Create the repo and implement the smallest complete vertical slice:

```
Create Generation
→ Add 3 Probes
→ Add Platform Posts
→ Add Metric Snapshots
→ Compute Fitness
→ Rank Generation
→ Add Signal Review
→ Create Mutation
```

This is the first milestone.

No agents.

No API integrations.

No automation.

Just the learning loop.
