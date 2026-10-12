# STEP — Skills, Talent & Employment Pathway

STEP is implemented as a module inside this repository (no separate project or
app). It reuses the existing Next.js app, better-auth identities, Turso
database and shared UI conventions.

## Current state

STEP is the primary application and is hosted at the site root:

| Path | Purpose |
| --- | --- |
| `/` | Public programme homepage |
| `/apply` | Registration / application portal (requires sign-in) |
| `/dashboard` | Participant dashboard (requires sign-in) |
| `/admin` | Programme administration — applications queue (admin/moderator) |

The blog CMS dashboard has been relocated to `/studio`; the public blog remains
at `/posts` with its URLs unchanged.

## Module layout

- `app/(step)/**` — STEP routes (own route group and chrome)
- `components/step/**` — STEP-specific UI
- `lib/step/**` — base-path helpers, constants, metadata
- `db/queries/step.ts` — data access
- `actions/step/*.actions.ts` — server actions split by domain
  (applications, learning, evidence, assessments, progression, passports,
  mentoring, staff) with shared helpers in `actions/step/helpers.ts`
- `db/schema.sql` — `step_cohorts`, `step_applications`, `step_participants`
- `db/seed/step-cohorts.mjs` — seeds the eight industry cohorts
- `proxy.ts` — hostname validation and route guards

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
  only shown publicly (the `/` approved-partners list) once written approval is
  recorded (`approved_at` set via `approvePartnerAction`).
- `step_opportunity_providers` / `step_introductions` — consented introductions
  between a participant and a provider. Participants consent or decline from
  their dashboard (`consentIntroductionAction`); staff record outcomes.
- Partner liaison is a scoped staff role: `canManagePartners` and
  `canManageIntroductions` grant access to `/partners` only — no
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
  (`canManageSafeguarding`), at `/admin/safeguarding`.

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

`/dashboard` resolves the user's STEP access and either shows their
application status (no STEP role), a workspace selector (multiple
responsibilities) or redirects to the single applicable view:

- `/dashboard/participant` — enrolments, readiness, deadlines,
  submissions, passport (including self-service limited share links once the
  passport is verified).
- `/dashboard/staff` — scoped review queues, overdue work, progression
  candidates.
- `/dashboard/mentor` — assigned participants, sessions, development
  actions; `/dashboard/mentor/sessions/[id]` records attendance and
  feedback for assigned enrolments only.
- `/dashboard/admin` — programme configuration, staff assignments,
  summary reporting.

Every dashboard query uses the authorised scope (mentors read from mentor
assignments, staff from their cycle/cohort scope).

Verified passport shares resolve at `/passport/[token]` (no sign-in
required). Field-scoped and full shares are enforced on the server; expired or
revoked shares render an "unavailable" state and are not indexed.

### Blog fixes included in the migrations

- `likes` gained partial unique indexes on `(user_id, post_id)` and
  `(user_id, comment_id)` to fix the nullable-target uniqueness gap
  (existing duplicates are removed first).
- Comment counter triggers now keep both `posts.comment_count` and
  `comments.reply_count` in sync with soft-delete/restore, and both counters
  are reconciled.

## Routing

STEP is the primary application and is hosted at the site root:

| Path | Served route |
| --- | --- |
| `/` | `app/(step)/page.tsx` |
| `/apply` | `app/(step)/apply/page.tsx` |
| `/dashboard` | `app/(step)/dashboard/page.tsx` |
| `/admin` | `app/(step)/admin/...` |

Links are generated through `lib/step/config.ts` (`stepPath` / the
`StepPathProvider` client context) with an empty base path, so the same
components produce `/apply`, `/dashboard`, `/admin`, and so on.

The public marketing pages remain at `/about`, `/services`, `/contact`, and the
public blog remains at `/posts`; the blog CMS dashboard has been relocated to
`/studio`. `proxy.ts` guards `/dashboard` and `/admin` (authentication only —
STEP authorisation is checked server-side against `step_staff`) and `/studio`
(signed-in blog users).

## Search / SEO

- Each STEP page emits a canonical URL via `lib/step/metadata.ts`, pointing at
  `https://<host><path>` on the application host.
- `app/sitemap.ts` lists the programme (`/`, `/apply`) and the public blog and
  marketing routes.
