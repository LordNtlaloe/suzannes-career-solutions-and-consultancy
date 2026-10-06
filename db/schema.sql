-- ============================================================
-- Users table (referenced throughout; include here for FK context)
-- ============================================================
CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    image TEXT,
    role TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'author' | 'moderator' | 'admin'
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================================
-- Categories (hierarchical)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id TEXT,
    depth INTEGER NOT NULL DEFAULT 0,     -- denormalized: 0 for root
    path TEXT NOT NULL DEFAULT '',        -- materialized path: '/root/child/leaf/'
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================================
-- Tags
-- ============================================================
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ============================================================
-- Posts
-- ============================================================
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category_id TEXT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image_id TEXT,                  -- FK to media (added later)
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at INTEGER,
    scheduled_at INTEGER,
    -- Denormalized counters (updated via triggers)
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    comment_count INTEGER NOT NULL DEFAULT 0,
    bookmark_count INTEGER NOT NULL DEFAULT 0,
    -- Review aggregate (updated via triggers on reviews)
    review_count INTEGER NOT NULL DEFAULT 0,
    review_avg REAL NOT NULL DEFAULT 0,   -- 0.00–5.00
    -- Soft delete
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at INTEGER,                   -- when it was soft-deleted
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================================
-- Post Versions (history & drafts)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_versions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    version_number INTEGER NOT NULL,
    is_draft BOOLEAN NOT NULL DEFAULT FALSE,
    created_by TEXT,                      -- user who created this version
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE SET NULL,
    UNIQUE(post_id, version_number)
);

-- ============================================================
-- Post-Tag Junction
-- ============================================================
CREATE TABLE IF NOT EXISTS post_tags (
    post_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ============================================================
-- Media / Attachments
-- ============================================================
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    post_id TEXT,                         -- nullable: media can exist before attaching
    user_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    width INTEGER,                        -- for images
    height INTEGER,                       -- for images
    url TEXT NOT NULL,
    thumbnail_url TEXT,                   -- optional derived thumbnail
    alt_text TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Now add the FK on posts.cover_image_id (deferred because media declares after posts)
-- SQLite doesn't support ALTER TABLE ADD CONSTRAINT; enforce at query layer.

-- ============================================================
-- Comments (nested replies)
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    parent_id TEXT,
    body TEXT NOT NULL,
    depth INTEGER NOT NULL DEFAULT 0,     -- 0 for top-level
    path TEXT NOT NULL DEFAULT '',        -- materialized path: '/parent/child/'
    like_count INTEGER NOT NULL DEFAULT 0,
    reply_count INTEGER NOT NULL DEFAULT 0,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- ============================================================
-- Likes (posts & comments)
-- ============================================================
CREATE TABLE IF NOT EXISTS likes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT,
    comment_id TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(user_id, post_id, comment_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- ============================================================
-- Bookmarks
-- ============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- ============================================================
-- Reviews / Ratings
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    body TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- ============================================================
-- View Analytics (source of truth for views)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_views (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT,
    ip_hash TEXT,                         -- optional: dedupe anonymous viewers
    user_agent TEXT,
    referrer TEXT,
    viewed_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
);

-- ============================================================
-- Indexes
-- ============================================================

-- Posts
CREATE INDEX IF NOT EXISTS idx_posts_user_id      ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_id  ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_published    ON posts(published, is_deleted);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON posts(scheduled_at)
    WHERE scheduled_at IS NOT NULL AND published = FALSE AND is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_posts_slug         ON posts(slug);

-- Post versions
CREATE INDEX IF NOT EXISTS idx_post_versions_post_id ON post_versions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_versions_draft   ON post_versions(post_id, is_draft);
-- Only one draft per post
CREATE UNIQUE INDEX IF NOT EXISTS uniq_post_versions_draft
    ON post_versions(post_id) WHERE is_draft = TRUE;

-- Categories
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_path      ON categories(path);

-- Post tags
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);

-- Media
CREATE INDEX IF NOT EXISTS idx_media_post_id ON media(post_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id       ON comments(post_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_comments_user_id       ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id     ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_depth    ON comments(post_id, depth);

-- Likes
CREATE INDEX IF NOT EXISTS idx_likes_user_id    ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id    ON likes(post_id)    WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_likes_comment_id ON likes(comment_id) WHERE comment_id IS NOT NULL;
-- The table-level UNIQUE(user_id, post_id, comment_id) does not prevent
-- duplicates when one target is NULL; these partial indexes do.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_likes_post    ON likes(user_id, post_id)    WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_likes_comment ON likes(user_id, comment_id) WHERE comment_id IS NOT NULL;

-- Bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_post_id ON reviews(post_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);

-- Post views
CREATE INDEX IF NOT EXISTS idx_post_views_post_id   ON post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_post_views_user_id   ON post_views(user_id);
CREATE INDEX IF NOT EXISTS idx_post_views_viewed_at ON post_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_post_views_dedupe    ON post_views(post_id, ip_hash, viewed_at);

-- ============================================================
-- Triggers — keep denormalized counters in sync
-- ============================================================

-- ---- Post like_count ----
CREATE TRIGGER IF NOT EXISTS trg_likes_post_after_insert
AFTER INSERT ON likes
WHEN NEW.post_id IS NOT NULL
BEGIN
    UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_likes_post_after_delete
AFTER DELETE ON likes
WHEN OLD.post_id IS NOT NULL
BEGIN
    UPDATE posts SET like_count = MAX(0, like_count - 1) WHERE id = OLD.post_id;
END;

-- ---- Comment like_count ----
CREATE TRIGGER IF NOT EXISTS trg_likes_comment_after_insert
AFTER INSERT ON likes
WHEN NEW.comment_id IS NOT NULL
BEGIN
    UPDATE comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_likes_comment_after_delete
AFTER DELETE ON likes
WHEN OLD.comment_id IS NOT NULL
BEGIN
    UPDATE comments SET like_count = MAX(0, like_count - 1) WHERE id = OLD.comment_id;
END;

-- ---- Post comment_count & comment reply_count ----
CREATE TRIGGER IF NOT EXISTS trg_comments_after_insert
AFTER INSERT ON comments
BEGIN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    UPDATE comments SET reply_count = reply_count + 1
        WHERE id = NEW.parent_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_comments_after_delete
AFTER DELETE ON comments
WHEN OLD.is_deleted = FALSE
BEGIN
    UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = OLD.post_id;
    UPDATE comments SET reply_count = MAX(0, reply_count - 1)
        WHERE id = OLD.parent_id;
END;

-- Soft-delete / restore keep both counters in sync with visible comments.
CREATE TRIGGER IF NOT EXISTS trg_comments_after_soft_delete
AFTER UPDATE OF is_deleted ON comments
WHEN NEW.is_deleted = TRUE AND OLD.is_deleted = FALSE
BEGIN
    UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = NEW.post_id;
    UPDATE comments SET reply_count = MAX(0, reply_count - 1)
        WHERE id = NEW.parent_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_comments_after_restore
AFTER UPDATE OF is_deleted ON comments
WHEN NEW.is_deleted = FALSE AND OLD.is_deleted = TRUE
BEGIN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    UPDATE comments SET reply_count = reply_count + 1
        WHERE id = NEW.parent_id;
END;

-- ---- Post bookmark_count ----
CREATE TRIGGER IF NOT EXISTS trg_bookmarks_after_insert
AFTER INSERT ON bookmarks
BEGIN
    UPDATE posts SET bookmark_count = bookmark_count + 1 WHERE id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_bookmarks_after_delete
AFTER DELETE ON bookmarks
BEGIN
    UPDATE posts SET bookmark_count = MAX(0, bookmark_count - 1) WHERE id = OLD.post_id;
END;

-- ---- Post review aggregates ----
CREATE TRIGGER IF NOT EXISTS trg_reviews_after_insert
AFTER INSERT ON reviews
BEGIN
    UPDATE posts
    SET
        review_count = (SELECT COUNT(*) FROM reviews WHERE post_id = NEW.post_id),
        review_avg   = (SELECT AVG(rating) FROM reviews WHERE post_id = NEW.post_id)
    WHERE id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_reviews_after_update
AFTER UPDATE ON reviews
BEGIN
    UPDATE posts
    SET
        review_count = (SELECT COUNT(*) FROM reviews WHERE post_id = NEW.post_id),
        review_avg   = (SELECT AVG(rating) FROM reviews WHERE post_id = NEW.post_id)
    WHERE id = NEW.post_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_reviews_after_delete
AFTER DELETE ON reviews
BEGIN
    UPDATE posts
    SET
        review_count = (SELECT COUNT(*) FROM reviews WHERE post_id = OLD.post_id),
        review_avg   = COALESCE((SELECT AVG(rating) FROM reviews WHERE post_id = OLD.post_id), 0)
    WHERE id = OLD.post_id;
END;

-- ---- post_views → posts.view_count ----
CREATE TRIGGER IF NOT EXISTS trg_post_views_after_insert
AFTER INSERT ON post_views
BEGIN
    UPDATE posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
END;

-- ============================================================
-- STEP: Skills, Talent & Employment Pathway
-- Programme module served under /step now and step.<domain> later.
-- Applied to the live database via db/migrate.mjs (versioned, additive).
-- ============================================================

-- Migration bookkeeping
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Industry cohorts (the 8 proposed cohort families)
CREATE TABLE IF NOT EXISTS step_cohorts (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    fields TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Intake cycles (future intakes are new rows, never schema changes)
CREATE TABLE IF NOT EXISTS step_cycles (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    cohort_size INTEGER,
    starts_at INTEGER,
    ends_at INTEGER,
    status TEXT NOT NULL DEFAULT 'draft', -- draft | open | active | closed | archived
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Programme-specific cohort instances within a cycle
CREATE TABLE IF NOT EXISTS step_cycle_cohorts (
    id TEXT PRIMARY KEY,
    cycle_id TEXT NOT NULL REFERENCES step_cycles(id) ON DELETE CASCADE,
    cohort_id TEXT NOT NULL REFERENCES step_cohorts(id) ON DELETE RESTRICT,
    capacity INTEGER,
    lead_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'open',
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(cycle_id, cohort_id)
);

-- Composite FK target for step_enrolments(cycle_id, cycle_cohort_id).
CREATE UNIQUE INDEX IF NOT EXISTS uniq_step_cycle_cohorts_cycle_id ON step_cycle_cohorts(cycle_id, id);

-- Registration / application pipeline (draft-capable, cycle-aware)
CREATE TABLE IF NOT EXISTS step_applications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    cycle_id TEXT REFERENCES step_cycles(id) ON DELETE RESTRICT,
    cohort_id TEXT,
    pathway TEXT NOT NULL DEFAULT 'employment',
    participant_group TEXT NOT NULL,
    goals TEXT,
    baseline TEXT,
    consent_contact BOOLEAN NOT NULL DEFAULT FALSE,
    consent_data BOOLEAN NOT NULL DEFAULT FALSE,
    consent_programme BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'draft', -- draft | submitted | under_review | admitted | rejected | withdrawn
    submitted_at INTEGER,
    reviewed_by TEXT,
    assigned_reviewer TEXT,               -- staff member handling the application
    review_note TEXT,                     -- private staff note
    feedback TEXT,                        -- participant-visible feedback
    reviewed_at INTEGER,
    district TEXT,                        -- optional, consented
    gender TEXT,                          -- optional, consented
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE RESTRICT,
    FOREIGN KEY (cohort_id) REFERENCES step_cohorts(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES user(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_reviewer) REFERENCES user(id) ON DELETE SET NULL
);

-- Participants: permanent identity only. Intake-specific details
-- (application ref, cohort, pathway, readiness, status) live on enrolments.
CREATE TABLE IF NOT EXISTS step_participants (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE RESTRICT
);

-- Enrolments: a participant in a specific cycle cohort. Readiness (level)
-- is intake-specific: a graduate can start a new intake at a lower level.
CREATE TABLE IF NOT EXISTS step_enrolments (
    id TEXT PRIMARY KEY,
    participant_id TEXT NOT NULL REFERENCES step_participants(id) ON DELETE CASCADE,
    cycle_id TEXT NOT NULL REFERENCES step_cycles(id) ON DELETE RESTRICT,
    cycle_cohort_id TEXT,
    application_id TEXT REFERENCES step_applications(id) ON DELETE SET NULL,
    pathway TEXT NOT NULL DEFAULT 'employment',
    level TEXT NOT NULL DEFAULT 'registered', -- advanced only via audited decisions
    status TEXT NOT NULL DEFAULT 'enrolled',  -- enrolled | on_hold | exited | graduated
    enrolled_at INTEGER NOT NULL DEFAULT (unixepoch()),
    admitted_at INTEGER,
    exited_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(participant_id, cycle_id),
    FOREIGN KEY (cycle_id, cycle_cohort_id) REFERENCES step_cycle_cohorts(cycle_id, id)
);

-- Consent events: notice version is separate from grant/withdraw history.
CREATE TABLE IF NOT EXISTS step_consents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE RESTRICT,
    scope TEXT NOT NULL,                 -- contact | data | programme | passport_share
    notice_version INTEGER NOT NULL,
    action TEXT NOT NULL DEFAULT 'grant', -- grant | withdraw
    recorded_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    recorded_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Programme staff identity (independent of blog roles)
CREATE TABLE IF NOT EXISTS step_staff (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Scoped role assignments: one user may hold several roles, each optionally
-- scoped to a cycle or cohort.
CREATE TABLE IF NOT EXISTS step_staff_assignments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'coordinator', -- programme_admin | coordinator | reviewer | mentor | partner_liaison
    cycle_id TEXT REFERENCES step_cycles(id) ON DELETE RESTRICT,
    cycle_cohort_id TEXT REFERENCES step_cycle_cohorts(id) ON DELETE RESTRICT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(user_id, role, cycle_id, cycle_cohort_id)
);

-- Learning requirement templates (optionally per cycle / pathway / cohort).
-- `level` is the milestone the requirement satisfies; month, cohort relevance
-- and completion criteria make progression checkable.
CREATE TABLE IF NOT EXISTS step_learning_requirements (
    id TEXT PRIMARY KEY,
    cycle_id TEXT REFERENCES step_cycles(id) ON DELETE RESTRICT,
    pathway TEXT,
    cohort_id TEXT REFERENCES step_cohorts(id) ON DELETE SET NULL,
    level TEXT NOT NULL DEFAULT 'foundation_ready',
    month INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    completion_criteria TEXT,
    resource_url TEXT,                    -- course/resource link
    required BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Assignments of requirements to an enrolment
CREATE TABLE IF NOT EXISTS step_learning_assignments (
    id TEXT PRIMARY KEY,
    enrolment_id TEXT NOT NULL REFERENCES step_enrolments(id) ON DELETE CASCADE,
    requirement_id TEXT REFERENCES step_learning_requirements(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'assigned', -- assigned | in_progress | completed | waived
    due_at INTEGER,
    completed_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(enrolment_id, requirement_id)
);

-- Evidence submissions
CREATE TABLE IF NOT EXISTS step_evidence (
    id TEXT PRIMARY KEY,
    assignment_id TEXT REFERENCES step_learning_assignments(id) ON DELETE CASCADE,
    participant_id TEXT NOT NULL REFERENCES step_participants(id) ON DELETE CASCADE,
    kind TEXT NOT NULL DEFAULT 'file',   -- file | link | text
    title TEXT NOT NULL,
    body TEXT,
    media_id TEXT REFERENCES media(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'submitted',
    submitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Evidence reviews (audited)
CREATE TABLE IF NOT EXISTS step_evidence_reviews (
    id TEXT PRIMARY KEY,
    evidence_id TEXT NOT NULL REFERENCES step_evidence(id) ON DELETE CASCADE,
    reviewer_id TEXT REFERENCES user(id) ON DELETE SET NULL,
    decision TEXT NOT NULL,              -- accepted | rejected | changes_requested
    feedback TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Assessments (per cycle / pathway)
CREATE TABLE IF NOT EXISTS step_assessments (
    id TEXT PRIMARY KEY,
    cycle_id TEXT REFERENCES step_cycles(id) ON DELETE RESTRICT,
    pathway TEXT,
    title TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'competency_test',
    required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Assessment attempts: separate rows per attempt (rubric version, score,
-- feedback, assessor). Passing state is derived from the latest attempt.
CREATE TABLE IF NOT EXISTS step_assessment_attempts (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL REFERENCES step_assessments(id) ON DELETE RESTRICT,
    enrolment_id TEXT NOT NULL REFERENCES step_enrolments(id) ON DELETE CASCADE,
    attempt INTEGER NOT NULL DEFAULT 1,
    rubric_version TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | passed | failed
    score REAL,
    feedback TEXT,
    assessed_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    assessed_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(assessment_id, enrolment_id, attempt)
);

-- Mentors
CREATE TABLE IF NOT EXISTS step_mentors (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
    bio TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Mentoring sessions
CREATE TABLE IF NOT EXISTS step_mentoring_sessions (
    id TEXT PRIMARY KEY,
    cycle_id TEXT REFERENCES step_cycles(id) ON DELETE RESTRICT,
    mentor_id TEXT NOT NULL REFERENCES step_mentors(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    scheduled_at INTEGER,
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled | completed | cancelled
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Mentoring attendance
CREATE TABLE IF NOT EXISTS step_mentoring_attendance (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES step_mentoring_sessions(id) ON DELETE CASCADE,
    enrolment_id TEXT NOT NULL REFERENCES step_enrolments(id) ON DELETE CASCADE,
    attended BOOLEAN,
    feedback TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(session_id, enrolment_id)
);

-- Mentor → enrolment assignments (establishes who a mentor may access)
CREATE TABLE IF NOT EXISTS step_mentoring_assignments (
    id TEXT PRIMARY KEY,
    mentor_id TEXT NOT NULL REFERENCES step_mentors(id) ON DELETE RESTRICT,
    enrolment_id TEXT NOT NULL REFERENCES step_enrolments(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'assigned', -- assigned | active | ended
    notes TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(mentor_id, enrolment_id)
);

-- Development actions (follow-ups from mentoring / reviews)
CREATE TABLE IF NOT EXISTS step_development_actions (
    id TEXT PRIMARY KEY,
    enrolment_id TEXT NOT NULL REFERENCES step_enrolments(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    due_at INTEGER,
    status TEXT NOT NULL DEFAULT 'open', -- open | done
    created_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Audited progression decisions (readiness is never freely edited)
CREATE TABLE IF NOT EXISTS step_progression_decisions (
    id TEXT PRIMARY KEY,
    participant_id TEXT NOT NULL REFERENCES step_participants(id) ON DELETE CASCADE,
    enrolment_id TEXT REFERENCES step_enrolments(id) ON DELETE CASCADE,
    from_level TEXT NOT NULL,
    to_level TEXT NOT NULL,
    decision TEXT NOT NULL DEFAULT 'approved', -- approved | denied | override
    override_reason TEXT,
    decided_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    decided_at INTEGER NOT NULL DEFAULT (unixepoch()),
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Verified Skills Passports
CREATE TABLE IF NOT EXISTS step_passports (
    id TEXT PRIMARY KEY,
    participant_id TEXT NOT NULL REFERENCES step_participants(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- draft | verified | revoked
    verified_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    verified_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    UNIQUE(participant_id, version)
);

CREATE TABLE IF NOT EXISTS step_passport_entries (
    id TEXT PRIMARY KEY,
    passport_id TEXT NOT NULL REFERENCES step_passports(id) ON DELETE CASCADE,
    enrolment_id TEXT REFERENCES step_enrolments(id) ON DELETE SET NULL,
    entry_type TEXT NOT NULL,            -- course | certificate | mentoring | assessment | project | milestone
    title TEXT NOT NULL,
    source_type TEXT,                    -- evidence | assessment | learning | mentoring | manual
    source_id TEXT,                      -- id of the verified source record
    verified_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    verified_at INTEGER,
    status TEXT NOT NULL DEFAULT 'verified', -- verified | revoked
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Controlled sharing of passports (token-scoped). Limited shares record the
-- permitted fields; expiry, revocation and passport status are enforced on
-- every read.
CREATE TABLE IF NOT EXISTS step_passport_shares (
    id TEXT PRIMARY KEY,
    passport_id TEXT NOT NULL REFERENCES step_passports(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    scope TEXT NOT NULL DEFAULT 'limited', -- full | limited
    fields TEXT,                           -- JSON array of permitted entry types/fields
    expires_at INTEGER,
    revoked_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Partners: name/logo shown publicly only after written approval (approved_at).
CREATE TABLE IF NOT EXISTS step_partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    contact_email TEXT,
    website TEXT,
    contribution_areas TEXT,        -- JSON array of contribution areas
    status TEXT NOT NULL DEFAULT 'proposed', -- proposed | approved | declined
    approved_at INTEGER,
    approved_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS step_partner_agreements (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES step_partners(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- draft | signed | active | ended
    signed_at INTEGER,
    expires_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS step_partner_contributions (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL REFERENCES step_partners(id) ON DELETE CASCADE,
    area TEXT NOT NULL,             -- learning | mentoring | placement | funding | assessment | other
    description TEXT,
    status TEXT NOT NULL DEFAULT 'proposed', -- proposed | committed | delivered
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS step_opportunity_providers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_email TEXT,
    partner_id TEXT REFERENCES step_partners(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active | inactive
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Consented introductions: participant, provider, consent and outcome.
CREATE TABLE IF NOT EXISTS step_introductions (
    id TEXT PRIMARY KEY,
    participant_id TEXT NOT NULL REFERENCES step_participants(id) ON DELETE CASCADE,
    provider_id TEXT NOT NULL REFERENCES step_opportunity_providers(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'requested', -- requested | consented | made | declined | outcome_recorded
    consented_at INTEGER,
    introduced_at INTEGER,
    outcome TEXT,
    outcome_status TEXT,           -- pending | interview | hired | declined | other
    outcome_at INTEGER,
    created_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Safeguards (restricted access): complaints, safeguarding reports and
-- staff conflict-of-interest declarations.
CREATE TABLE IF NOT EXISTS step_complaints (
    id TEXT PRIMARY KEY,
    reporter_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
    participant_id TEXT REFERENCES step_participants(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'open', -- open | in_review | resolved | dismissed
    resolution TEXT,
    resolved_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    resolved_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS step_safeguarding_reports (
    id TEXT PRIMARY KEY,
    reporter_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
    participant_id TEXT REFERENCES step_participants(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    body TEXT,
    risk_level TEXT NOT NULL DEFAULT 'medium', -- low | medium | high | critical
    status TEXT NOT NULL DEFAULT 'open', -- open | investigating | resolved
    outcome TEXT,
    resolved_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    resolved_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS step_conflict_declarations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    related_party TEXT NOT NULL,
    relationship TEXT,
    interest_type TEXT NOT NULL DEFAULT 'other', -- financial | personal | employment | other
    details TEXT,
    status TEXT NOT NULL DEFAULT 'declared', -- declared | under_review | resolved
    resolved_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    resolved_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Audit trail for programme operations (one entry per mutated row).
CREATE TABLE IF NOT EXISTS step_audit_log (
    id TEXT PRIMARY KEY,
    actor_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,       -- application | evidence | enrolment | ...
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,            -- assign_reviewer | mark_under_review | ...
    metadata TEXT,                   -- JSON payload (non-identifying where possible)
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ---------- Indexes ----------

CREATE INDEX IF NOT EXISTS idx_step_cohorts_slug             ON step_cohorts(slug);
CREATE INDEX IF NOT EXISTS idx_step_cycles_status           ON step_cycles(status);
CREATE INDEX IF NOT EXISTS idx_step_cycle_cohorts_cycle     ON step_cycle_cohorts(cycle_id);
CREATE INDEX IF NOT EXISTS idx_step_applications_user       ON step_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_step_applications_status     ON step_applications(status);
CREATE INDEX IF NOT EXISTS idx_step_applications_cycle      ON step_applications(cycle_id);
CREATE INDEX IF NOT EXISTS idx_step_participants_user       ON step_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_step_enrolments_participant  ON step_enrolments(participant_id);
CREATE INDEX IF NOT EXISTS idx_step_enrolments_cycle        ON step_enrolments(cycle_id);
CREATE INDEX IF NOT EXISTS idx_step_enrolments_level        ON step_enrolments(level);
CREATE INDEX IF NOT EXISTS idx_step_consents_user           ON step_consents(user_id, scope, notice_version);
CREATE INDEX IF NOT EXISTS idx_step_staff_assignments_user  ON step_staff_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_step_staff_assignments_cycle ON step_staff_assignments(cycle_id);
CREATE INDEX IF NOT EXISTS idx_step_requirements_cycle      ON step_learning_requirements(cycle_id);
CREATE INDEX IF NOT EXISTS idx_step_assignments_enrolment   ON step_learning_assignments(enrolment_id);
CREATE INDEX IF NOT EXISTS idx_step_evidence_participant    ON step_evidence(participant_id);
CREATE INDEX IF NOT EXISTS idx_step_evidence_reviews_evidence ON step_evidence_reviews(evidence_id);
CREATE INDEX IF NOT EXISTS idx_step_assessments_cycle       ON step_assessments(cycle_id);
CREATE INDEX IF NOT EXISTS idx_step_assessment_attempts_enrolment ON step_assessment_attempts(enrolment_id);
CREATE INDEX IF NOT EXISTS idx_step_mentoring_sessions_cycle ON step_mentoring_sessions(cycle_id);
CREATE INDEX IF NOT EXISTS idx_step_mentoring_assignments_mentor ON step_mentoring_assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_step_mentoring_assignments_enrolment ON step_mentoring_assignments(enrolment_id);
CREATE INDEX IF NOT EXISTS idx_step_development_actions_enrolment ON step_development_actions(enrolment_id);
CREATE INDEX IF NOT EXISTS idx_step_progression_participant ON step_progression_decisions(participant_id);
CREATE INDEX IF NOT EXISTS idx_step_passports_participant   ON step_passports(participant_id);
CREATE INDEX IF NOT EXISTS idx_step_passport_entries_passport ON step_passport_entries(passport_id);
CREATE INDEX IF NOT EXISTS idx_step_passport_shares_passport ON step_passport_shares(passport_id);
CREATE INDEX IF NOT EXISTS idx_step_audit_log_entity ON step_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_step_partners_status ON step_partners(status);
CREATE INDEX IF NOT EXISTS idx_step_partner_agreements_partner ON step_partner_agreements(partner_id);
CREATE INDEX IF NOT EXISTS idx_step_partner_contributions_partner ON step_partner_contributions(partner_id);
CREATE INDEX IF NOT EXISTS idx_step_introductions_participant ON step_introductions(participant_id);
CREATE INDEX IF NOT EXISTS idx_step_introductions_provider ON step_introductions(provider_id);
CREATE INDEX IF NOT EXISTS idx_step_complaints_status ON step_complaints(status);
CREATE INDEX IF NOT EXISTS idx_step_safeguarding_status ON step_safeguarding_reports(status);
CREATE INDEX IF NOT EXISTS idx_step_conflict_user ON step_conflict_declarations(user_id);
-- ---------- Enrolment capacity enforcement ----------
-- Enforced before insert so concurrent admissions can never exceed a cohort's
-- capacity (step_cycle_cohorts.capacity) or a cycle's target
-- (step_cycles.cohort_size). NULL/0 capacity means "no limit". Re-using an
-- existing (participant, cycle) enrolment is never blocked.

CREATE TRIGGER IF NOT EXISTS trg_step_enrolments_cohort_capacity
BEFORE INSERT ON step_enrolments
WHEN NEW.status = 'enrolled'
  AND NEW.cycle_cohort_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM step_enrolments e2
      WHERE e2.participant_id = NEW.participant_id
        AND e2.cycle_id = NEW.cycle_id
  )
  AND (SELECT COALESCE(capacity, 0) FROM step_cycle_cohorts WHERE id = NEW.cycle_cohort_id) > 0
  AND (
      SELECT COUNT(*) FROM step_enrolments e
      WHERE e.cycle_cohort_id = NEW.cycle_cohort_id
        AND e.status = 'enrolled'
  ) >= (SELECT COALESCE(capacity, 0) FROM step_cycle_cohorts WHERE id = NEW.cycle_cohort_id)
BEGIN
    SELECT RAISE(ABORT, 'cohort capacity reached');
END;

CREATE TRIGGER IF NOT EXISTS trg_step_enrolments_cycle_capacity
BEFORE INSERT ON step_enrolments
WHEN NEW.status = 'enrolled'
  AND NEW.cycle_cohort_id IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM step_enrolments e2
      WHERE e2.participant_id = NEW.participant_id
        AND e2.cycle_id = NEW.cycle_id
  )
  AND (SELECT COALESCE(cohort_size, 0) FROM step_cycles WHERE id = NEW.cycle_id) > 0
  AND (
      SELECT COUNT(*) FROM step_enrolments e
      WHERE e.cycle_id = NEW.cycle_id
        AND e.status = 'enrolled'
  ) >= (SELECT COALESCE(cohort_size, 0) FROM step_cycles WHERE id = NEW.cycle_id)
BEGIN
    SELECT RAISE(ABORT, 'cycle capacity reached');
END;
