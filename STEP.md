# STEP — Skills, Talent & Employment Pathway

STEP is implemented as a module inside this repository (no separate project or
app). It reuses the existing Next.js app, better-auth identities, Turso
database and shared UI conventions.

## Current state

STEP is live under `/step` on the main domain:

| Path | Purpose |
| --- | --- |
| `/step` | Public programme homepage |
| `/step/apply` | Registration / application portal (requires sign-in) |
| `/step/dashboard` | Participant dashboard (requires sign-in) |
| `/step/admin` | Programme administration — applications queue (admin/moderator) |

The existing blog and its URLs are unchanged.

## Module layout

- `app/(step)/step/**` — STEP routes (own route group and chrome)
- `components/step/**` — STEP-specific UI
- `lib/step/**` — hostname/path helpers, constants, metadata
- `db/queries/step.ts` — data access
- `actions/step/*.actions.ts` — server actions split by domain
  (applications, learning, evidence, assessments, progression, passports,
  mentoring, staff) with shared helpers in `actions/step/helpers.ts`
- `db/schema.sql` — `step_cohorts`, `step_applications`, `step_participants`
- `db/seed/step-cohorts.mjs` — seeds the eight industry cohorts
- `proxy.ts` — hostname validation, subdomain rewrite, route guards

## Data model

The full schema is the canonical DDL in `db/schema.sql`. It is applied to the
live database with versioned, additive migrations:

```bash
node --env-file=.env db/migrate.mjs          # apply pending migrations
node --env-file=.env db/seed/step-cohorts.mjs # seed the eight cohort families
```

Migrations live in `db/migrations/*.mjs` and are recorded in
`schema_migrations`, so each runs exactly once.

Core tables:

- `step_cycles` — intake cycles (future intakes are new rows, not schema
  changes). Seeded with the `cohort-2026` inaugural cycle.
- `step_cohorts` / `step_cycle_cohorts` — cohort family definitions and
  programme-specific cohort instances per cycle.
- `step_applications` — draft-capable, cycle-aware registration
  (`draft → submitted → under_review → admitted | rejected`).
- `step_participants` — permanent identity only (one record per user).
- `step_enrolments` — intake-specific records: admission application ref,
  cohort, pathway, readiness level and programme status. A graduate can start
  a new intake at a different level without touching their identity.
- `step_consents` — consent events separated from the notice version, so a
  grant, withdrawal and re-grant can all happen under the same notice.
- `step_staff` / `step_staff_assignments` — staff identity plus scoped role
  assignments (cycle/cohort scope, multiple roles per user), independent of
  blog roles.

Programme operations:

- `step_learning_requirements` / `step_learning_assignments` — requirements
  carry the milestone level they satisfy, month, cohort relevance and
  completion criteria.
- `step_evidence` / `step_evidence_reviews` — submissions and audited reviews.
- `step_assessments` / `step_assessment_attempts` — attempt history with
  rubric version, score, feedback and assessor.
- `step_mentors` / `step_mentoring_sessions` / `step_mentoring_attendance` /
  `step_mentoring_assignments` / `step_development_actions`.
- `step_progression_decisions` — audited level changes. Enrolment `level` is
  **never** freely edited: the decision row and the readiness change are
  written in one atomic batch, and advancing past unmet requirements requires
  an `override` with a recorded reason.
- `step_passports` / `step_passport_entries` / `step_passport_shares` —
  verified Skills Passports. Entries trace their verified source and verifier
  and can be revoked; shares default to `limited` and store permitted fields,
  with expiry, revocation and passport status enforced on every read.
- `step_audit_log` — one entry per mutated row for bulk operations (assign
  reviewer, move to under review) so staff can see who changed what and when.

Capacity is enforced in the database, not just in code: before an enrolment is
inserted, triggers compare the cohort's `step_cycle_cohorts.capacity` (or, for
uncohortenrolled admissions, the cycle's `cohort_size`) against current
enrolments and abort the admission transaction when it is full. `NULL`/`0`
capacity means "no limit", and re-using an existing (participant, cycle)
enrolment is never blocked.

### Partners & introductions

- `step_partners` / `step_partner_agreements` / `step_partner_contributions` —
  partner records with contribution areas and agreements. A partner's name is
  only shown publicly (`/step` approved-partners list) once written approval is
  recorded (`approved_at` set via `approvePartnerAction`).
- `step_opportunity_providers` / `step_introductions` — consented introductions
  between a participant and a provider. Participants consent or decline from
  their dashboard (`consentIntroductionAction`); staff record outcomes.
- Partner liaison is a scoped staff role: `canManagePartners` and
  `canManageIntroductions` grant access to `/step/partners` only — no
  application/evidence/progression tools. Partners never see the talent pool,
  only aggregate results or consented, field-scoped passport shares.
- Optional, consented `district` and `gender` columns exist on
  `step_applications` for demographic measurement.

### Safeguarding

- `step_complaints`, `step_safeguarding_reports` and
  `step_conflict_declarations` hold restricted-access records. Any signed-in
  user can raise a complaint or safeguarding concern from the participant
  dashboard; active STEP staff can declare conflicts of interest.
- Only programme administrators can view or resolve these records
  (`canManageSafeguarding`), at `/step/admin/safeguarding`.

Referential consistency: `step_enrolments(cycle_id, cycle_cohort_id)` is a
composite FK to `step_cycle_cohorts(cycle_id, id)`, so an enrolment's cohort
must belong to its cycle. Evidence/assessment/session participant coherence is
enforced in the server actions.

Deletion rules preserve programme history: history-bearing references use
`ON DELETE RESTRICT` so records cannot be cascade-deleted by accident; only
genuinely owned children (entries under a passport, evidence under an
assignment) cascade with their parent.

### Scoped permissions

STEP administration checks `step_staff`, not the blog's `user.role`. The
migration bootstraps existing blog admins into `step_staff` once; from then on
STEP staff and their role scopes are managed independently of blog roles.

Permissions live in two layers:

- `lib/step/access-rules.ts` — pure predicates (deny by default; explicit
  scope semantics). Unit-tested in `db/tests/access-rules.test.mjs`.
- `lib/step/permissions.ts` — server-only resolver that builds the
  `StepAccessContext` from the Better Auth session and the `step_*` tables.

Scope semantics are deliberate: an assignment with `cycle_id` and
`cycle_cohort_id` both null is global (programme_admin only); a cycle-only
scope covers that cycle; a cohort scope covers that cohort within its cycle.
Incomplete scope data is never treated as global access.

### Query layer

`db/queries/step/*` is split by domain (`access`, `cycles`, `applications`,
`enrolments`, `learning`, `evidence`, `assessments`, `mentoring`,
`progression`, `passports`, `dashboards`). Every module is marked `server-only`
and uses parameterised queries. Reads return participant-safe fields only;
private staff notes stay in staff-only queries.

Each `actions/step/*.actions.ts` module resolves the session (via
`actions/step/helpers.ts`), validates input (Joi in `lib/step/validation.ts`),
checks permissions, then calls the query layer. Browser-supplied user ids,
roles and readiness levels are never trusted. Admission, evidence review and
progression are transactional (`db.batch`).

### Dashboards

`/step/dashboard` resolves the user's STEP access and either shows their
application status (no STEP role), a workspace selector (multiple
responsibilities) or redirects to the single applicable view:

- `/step/dashboard/participant` — enrolments, readiness, deadlines,
  submissions, passport (including self-service limited share links once the
  passport is verified).
- `/step/dashboard/staff` — scoped review queues, overdue work, progression
  candidates.
- `/step/dashboard/mentor` — assigned participants, sessions, development
  actions; `/step/dashboard/mentor/sessions/[id]` records attendance and
  feedback for assigned enrolments only.
- `/step/dashboard/admin` — programme configuration, staff assignments,
  summary reporting.

Every dashboard query uses the authorised scope (mentors read from mentor
assignments, staff from their cycle/cohort scope).

Verified passport shares resolve at `/step/passport/[token]` (no sign-in
required). Field-scoped and full shares are enforced on the server; expired or
revoked shares render an "unavailable" state and are not indexed.

### Blog fixes included in the migrations

- `likes` gained partial unique indexes on `(user_id, post_id)` and
  `(user_id, comment_id)` to fix the nullable-target uniqueness gap
  (existing duplicates are removed first).
- Comment counter triggers now keep both `posts.comment_count` and
  `comments.reply_count` in sync with soft-delete/restore, and both counters
  are reconciled.

## Activating the subdomain (step.<domain>)

The subdomain is **not live** until the configuration below is completed. The
code path already exists in `proxy.ts`; it is disabled until the hostnames are
configured.

### 1. DNS and hosting

- Add a DNS record for `step.<your-domain>` pointing at the same deployment
  serving the main domain (CNAME or A record, depending on your host).
- Configure the hosting platform to accept the new domain/hostname for this
  project (e.g. add `step.<your-domain>` to the deployment's domains).

### 2. Environment variables

Set these in the deployment (and optionally `.env` for local testing):

```bash
# Hostnames that serve STEP (comma-separated). Enables the subdomain rewrite.
STEP_SUBDOMAINS=step.example.com

# Hostnames that serve the main blog. When set, any other host is rejected
# with 404 by proxy.ts (explicit hostname validation).
APP_HOSTNAMES=example.com,www.example.com

# Canonical base for STEP. Once set, /step pages are noindexed and this
# subdomain becomes the single indexed copy.
NEXT_PUBLIC_STEP_BASE_URL=https://step.example.com

# Existing app URL (already used by better-auth client).
NEXT_PUBLIC_APP_URL=https://example.com
```

### 3. Behaviour after activation

`proxy.ts` rewrites STEP-subdomain requests into the `/step` namespace:

| Browser URL (subdomain) | Served route |
| --- | --- |
| `https://step.example.com/` | `app/(step)/step/page.tsx` |
| `https://step.example.com/apply` | `app/(step)/step/apply/page.tsx` |
| `https://step.example.com/dashboard` | `app/(step)/step/dashboard/page.tsx` |
| `https://step.example.com/admin` | `app/(step)/step/admin/...` |

Links are generated through `lib/step/config.ts` (`stepPath` / the
`StepPathProvider` client context), so the same components produce `/apply` on
the subdomain and `/step/apply` on the main domain.

### 4. Authentication across hosts

Both hosts run the same application and share the same `user` table, so
accounts are shared — no duplicate identities. Sessions, however, are scoped
to the host that issued the cookie (better-auth default). This is intentional:
we do **not** broaden the cookie to `.example.com`, to avoid widening session
exposure and cross-site cookie risks.

Consequence: a user may need to sign in once on the main domain and once on
`step.<domain>`. Sign-in/sign-up pages (`/sign-in`, `/sign-up`) work on both
hosts and return users to the page they came from via `callbackUrl`.

If single sign-on across both hosts is later required, configure better-auth's
cookie domain explicitly and evaluate the security trade-off; do not do this
silently. `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` must match the
publicly-reachable origin used by the auth client.

## Search / SEO

- Each STEP page emits a canonical URL via `lib/step/metadata.ts`. It points at
  `/step/*` today and flips to `https://step.<domain>/*` once
  `NEXT_PUBLIC_STEP_BASE_URL` is set (at which point `/step/*` pages are
  noindexed).
- `app/sitemap.ts` lists the blog and STEP `/step` routes. When the subdomain
  is live, replace the STEP entries with the subdomain URLs (or serve a
  separate sitemap from the subdomain host).
