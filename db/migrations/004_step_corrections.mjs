// 004_step_corrections.mjs
//
// Architectural corrections to STEP:
//  - Readiness (level) and intake-specific details move from step_participants
//    to step_enrolments; participants keep only permanent identity.
//  - step_staff becomes identity-only; scoped role assignments get their own
//    table with cycle/cohort scope (no one-role-per-user limit).
//  - Referential consistency: enrolment cohort must belong to its cycle
//    (composite FK).
//  - Learning requirements gain milestone level, month, cohort relevance and
//    completion criteria.
//  - Assessment results become multiple attempts (rubric version, score,
//    feedback, assessor).
//  - Consent separates notice version from grant/withdraw event history.
//  - Mentoring gains mentor→enrolment assignments and development actions.
//  - Passport entries become traceable (source, verifier, status); sharing
//    stores permitted fields and defaults to limited.
//  - Comment physical-delete trigger no longer double-decrements an already
//    soft-deleted comment.

async function tableExists(db, name) {
    const r = await db.execute({
        sql: `SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?`,
        args: [name],
    });
    return r.rows.length > 0;
}

export async function up(db) {
    await db.execute("PRAGMA foreign_keys = ON");

    // Composite FK target: enrolments reference (cycle_id, cycle_cohort_id).
    await db.execute({
        sql: `CREATE UNIQUE INDEX IF NOT EXISTS uniq_step_cycle_cohorts_cycle_id ON step_cycle_cohorts(cycle_id, id)`,
        args: [],
    });

    // ---------- 1. comment physical-delete trigger ----------
    await db.execute({ sql: `DROP TRIGGER IF EXISTS trg_comments_after_delete`, args: [] });
    await db.execute({
        sql: `
            CREATE TRIGGER trg_comments_after_delete
            AFTER DELETE ON comments
            WHEN OLD.is_deleted = FALSE
            BEGIN
                UPDATE posts SET comment_count = MAX(0, comment_count - 1) WHERE id = OLD.post_id;
                UPDATE comments SET reply_count = MAX(0, reply_count - 1) WHERE id = OLD.parent_id;
            END
        `,
        args: [],
    });
    console.log("  ✓ physical-delete trigger no longer double-decrements");

    // ---------- 2. staff identity + scoped assignments ----------
    const oldStaffRows = await db.execute({
        sql: `SELECT user_id, role, active, created_at FROM step_staff`,
        args: [],
    });

    await db.execute({ sql: `DROP TABLE IF EXISTS step_staff_assignments`, args: [] });
    await db.execute({ sql: `DROP TABLE IF EXISTS step_staff`, args: [] });

    await db.execute({
        sql: `
            CREATE TABLE step_staff (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
                active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });
    await db.execute({
        sql: `
            CREATE TABLE step_staff_assignments (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
                role TEXT NOT NULL DEFAULT 'coordinator',
                cycle_id TEXT REFERENCES step_cycles(id) ON DELETE RESTRICT,
                cycle_cohort_id TEXT REFERENCES step_cycle_cohorts(id) ON DELETE RESTRICT,
                active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
                UNIQUE(user_id, role, cycle_id, cycle_cohort_id)
            )
        `,
        args: [],
    });

    for (const row of oldStaffRows.rows) {
        await db.execute({
            sql: `INSERT OR IGNORE INTO step_staff (id, user_id, active, created_at) VALUES (?, ?, ?, ?)`,
            args: [`staff_${row.user_id}`, row.user_id, row.active, row.created_at],
        });
        await db.execute({
            sql: `INSERT OR IGNORE INTO step_staff_assignments (id, user_id, role, active, created_at) VALUES (?, ?, ?, TRUE, unixepoch())`,
            args: [`staff_role_${row.user_id}_${row.role}`, row.user_id, row.role],
        });
    }
    console.log("  ✓ step_staff split into identity + scoped assignments");

    // ---------- 3. enrolments carry readiness & intake details ----------
    const hadEnrolments = await tableExists(db, "step_enrolments");

    // Rebuild enrolments first (it joins the old participants for level/app).
    await db.execute({ sql: `DROP TABLE IF EXISTS step_enrolments_new`, args: [] });
    await db.execute({
        sql: `
            CREATE TABLE step_enrolments_new (
                id TEXT PRIMARY KEY,
                participant_id TEXT NOT NULL REFERENCES step_participants(id) ON DELETE CASCADE,
                cycle_id TEXT NOT NULL REFERENCES step_cycles(id) ON DELETE RESTRICT,
                cycle_cohort_id TEXT,
                application_id TEXT REFERENCES step_applications(id) ON DELETE SET NULL,
                pathway TEXT NOT NULL DEFAULT 'employment',
                level TEXT NOT NULL DEFAULT 'registered',
                status TEXT NOT NULL DEFAULT 'enrolled',
                enrolled_at INTEGER NOT NULL DEFAULT (unixepoch()),
                admitted_at INTEGER,
                exited_at INTEGER,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
                UNIQUE(participant_id, cycle_id),
                FOREIGN KEY (cycle_id, cycle_cohort_id)
                    REFERENCES step_cycle_cohorts(cycle_id, id)
            )
        `,
        args: [],
    });
    if (hadEnrolments) {
        await db.execute({
            sql: `
                INSERT OR IGNORE INTO step_enrolments_new (
                    id, participant_id, cycle_id, cycle_cohort_id,
                    application_id, pathway, level, status,
                    enrolled_at, admitted_at, exited_at, created_at, updated_at
                )
                SELECT
                    e.id, e.participant_id, e.cycle_id, e.cycle_cohort_id,
                    p.application_id, e.pathway, p.level, e.status,
                    e.enrolled_at, p.admitted_at, e.exited_at, e.created_at, e.updated_at
                FROM step_enrolments e
                LEFT JOIN step_participants p ON p.id = e.participant_id
            `,
            args: [],
        });
    }
    await db.execute({ sql: `DROP TABLE IF EXISTS step_enrolments`, args: [] });
    await db.execute({ sql: `ALTER TABLE step_enrolments_new RENAME TO step_enrolments`, args: [] });
    console.log("  ✓ enrolments now carry readiness and intake details");

    // ---------- 4. participants become identity-only ----------
    await db.execute({ sql: `DROP TABLE IF EXISTS step_participants_new`, args: [] });
    await db.execute({
        sql: `
            CREATE TABLE step_participants_new (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE RESTRICT,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });
    await db.execute({
        sql: `
            INSERT OR IGNORE INTO step_participants_new (id, user_id, created_at, updated_at)
            SELECT id, user_id, created_at, updated_at FROM step_participants
        `,
        args: [],
    });
    await db.execute({ sql: `DROP TABLE IF EXISTS step_participants`, args: [] });
    await db.execute({ sql: `ALTER TABLE step_participants_new RENAME TO step_participants`, args: [] });
    console.log("  ✓ participants are identity-only");

    // ---------- 5. consent notice version + event history ----------
    await db.execute({ sql: `DROP TABLE IF EXISTS step_consents_new`, args: [] });
    await db.execute({
        sql: `
            CREATE TABLE step_consents_new (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES user(id) ON DELETE RESTRICT,
                scope TEXT NOT NULL,
                notice_version INTEGER NOT NULL,
                action TEXT NOT NULL DEFAULT 'grant',  -- grant | withdraw
                recorded_by TEXT REFERENCES user(id) ON DELETE SET NULL,
                recorded_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });
    // Old rows become grant events under notice_version 1.
    await db.execute({
        sql: `
            INSERT OR IGNORE INTO step_consents_new (id, user_id, scope, notice_version, action, recorded_by, recorded_at)
            SELECT id, user_id, scope, 1, CASE WHEN granted THEN 'grant' ELSE 'withdraw' END, recorded_by, recorded_at
            FROM step_consents
        `,
        args: [],
    });
    await db.execute({ sql: `DROP TABLE IF EXISTS step_consents`, args: [] });
    await db.execute({ sql: `ALTER TABLE step_consents_new RENAME TO step_consents`, args: [] });
    await db.execute({
        sql: `CREATE INDEX IF NOT EXISTS idx_step_consents_user ON step_consents(user_id, scope, notice_version)`,
        args: [],
    });
    console.log("  ✓ consents split notice version from event history");

    // ---------- 6. learning requirements: milestone level + metadata ----------
    const reqInfo = await db.execute({
        sql: `SELECT name FROM pragma_table_info('step_learning_requirements')`,
        args: [],
    });
    const reqCols = new Set(reqInfo.rows.map((r) => r.name));
    for (const [col, ddl] of [
        ["level", `ALTER TABLE step_learning_requirements ADD COLUMN level TEXT NOT NULL DEFAULT 'foundation_ready'`],
        ["month", `ALTER TABLE step_learning_requirements ADD COLUMN month INTEGER`],
        ["cohort_id", `ALTER TABLE step_learning_requirements ADD COLUMN cohort_id TEXT REFERENCES step_cohorts(id) ON DELETE SET NULL`],
        ["completion_criteria", `ALTER TABLE step_learning_requirements ADD COLUMN completion_criteria TEXT`],
    ]) {
        if (!reqCols.has(col)) {
            await db.execute({ sql: ddl, args: [] });
        }
    }
    console.log("  ✓ learning requirements carry milestone level + metadata");

    // ---------- 7. assessment attempts ----------
    await db.execute({ sql: `DROP TABLE IF EXISTS step_assessment_attempts`, args: [] });
    await db.execute({
        sql: `
            CREATE TABLE step_assessment_attempts (
                id TEXT PRIMARY KEY,
                assessment_id TEXT NOT NULL REFERENCES step_assessments(id) ON DELETE RESTRICT,
                enrolment_id TEXT NOT NULL REFERENCES step_enrolments(id) ON DELETE CASCADE,
                attempt INTEGER NOT NULL DEFAULT 1,
                rubric_version TEXT,
                status TEXT NOT NULL DEFAULT 'pending',
                score REAL,
                feedback TEXT,
                assessed_by TEXT REFERENCES user(id) ON DELETE SET NULL,
                assessed_at INTEGER,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
                UNIQUE(assessment_id, enrolment_id, attempt)
            )
        `,
        args: [],
    });
    if (await tableExists(db, "step_assessment_results")) {
        await db.execute({
            sql: `
                INSERT OR IGNORE INTO step_assessment_attempts (
                    id, assessment_id, enrolment_id, attempt, status, score,
                    feedback, assessed_by, assessed_at, created_at, updated_at
                )
                SELECT id, assessment_id, enrolment_id, 1, status, score,
                       result_notes, assessed_by, assessed_at, created_at, updated_at
                FROM step_assessment_results
            `,
            args: [],
        });
        await db.execute({ sql: `DROP TABLE IF EXISTS step_assessment_results`, args: [] });
    }
    console.log("  ✓ assessment results become attempt history");

    // ---------- 8. mentoring assignments + development actions ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_mentoring_assignments (
                id TEXT PRIMARY KEY,
                mentor_id TEXT NOT NULL REFERENCES step_mentors(id) ON DELETE RESTRICT,
                enrolment_id TEXT NOT NULL REFERENCES step_enrolments(id) ON DELETE CASCADE,
                status TEXT NOT NULL DEFAULT 'assigned', -- assigned | active | ended
                notes TEXT,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
                UNIQUE(mentor_id, enrolment_id)
            )
        `,
        args: [],
    });
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_development_actions (
                id TEXT PRIMARY KEY,
                enrolment_id TEXT NOT NULL REFERENCES step_enrolments(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                due_at INTEGER,
                status TEXT NOT NULL DEFAULT 'open', -- open | done
                created_by TEXT REFERENCES user(id) ON DELETE SET NULL,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });
    console.log("  ✓ mentoring assignments + development actions added");

    // ---------- 9. passport entries: traceable verification ----------
    await db.execute({ sql: `DROP TABLE IF EXISTS step_passport_entries_new`, args: [] });
    await db.execute({
        sql: `
            CREATE TABLE step_passport_entries_new (
                id TEXT PRIMARY KEY,
                passport_id TEXT NOT NULL REFERENCES step_passports(id) ON DELETE CASCADE,
                enrolment_id TEXT REFERENCES step_enrolments(id) ON DELETE SET NULL,
                entry_type TEXT NOT NULL,
                title TEXT NOT NULL,
                source_type TEXT,       -- evidence | assessment | learning | mentoring | manual
                source_id TEXT,
                verified_by TEXT REFERENCES user(id) ON DELETE SET NULL,
                verified_at INTEGER,
                status TEXT NOT NULL DEFAULT 'verified', -- verified | revoked
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });
    await db.execute({
        sql: `
            INSERT OR IGNORE INTO step_passport_entries_new (id, passport_id, entry_type, title, verified_at, created_at)
            SELECT id, passport_id, entry_type, title, verified_at, created_at FROM step_passport_entries
        `,
        args: [],
    });
    await db.execute({ sql: `DROP TABLE IF EXISTS step_passport_entries`, args: [] });
    await db.execute({ sql: `ALTER TABLE step_passport_entries_new RENAME TO step_passport_entries`, args: [] });

    // ---------- 10. passport shares: permitted fields + limited default ----------
    await db.execute({ sql: `DROP TABLE IF EXISTS step_passport_shares_new`, args: [] });
    await db.execute({
        sql: `
            CREATE TABLE step_passport_shares_new (
                id TEXT PRIMARY KEY,
                passport_id TEXT NOT NULL REFERENCES step_passports(id) ON DELETE CASCADE,
                token TEXT NOT NULL UNIQUE,
                scope TEXT NOT NULL DEFAULT 'limited',
                fields TEXT,            -- JSON array of permitted entry types/fields
                expires_at INTEGER,
                revoked_at INTEGER,
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });
    await db.execute({
        sql: `
            INSERT OR IGNORE INTO step_passport_shares_new (id, passport_id, token, scope, expires_at, revoked_at, created_at)
            SELECT id, passport_id, token, scope, expires_at, revoked_at, created_at FROM step_passport_shares
        `,
        args: [],
    });
    await db.execute({ sql: `DROP TABLE IF EXISTS step_passport_shares`, args: [] });
    await db.execute({ sql: `ALTER TABLE step_passport_shares_new RENAME TO step_passport_shares`, args: [] });
    console.log("  ✓ passport entries traceable; shares scoped by permitted fields");

    // ---------- indexes ----------
    const indexes = [
        `CREATE INDEX IF NOT EXISTS idx_step_staff_assignments_user ON step_staff_assignments(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_staff_assignments_cycle ON step_staff_assignments(cycle_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_enrolments_participant ON step_enrolments(participant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_enrolments_cycle ON step_enrolments(cycle_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_enrolments_level ON step_enrolments(level)`,
        `CREATE INDEX IF NOT EXISTS idx_step_assessment_attempts_enrolment ON step_assessment_attempts(enrolment_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_mentoring_assignments_mentor ON step_mentoring_assignments(mentor_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_mentoring_assignments_enrolment ON step_mentoring_assignments(enrolment_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_development_actions_enrolment ON step_development_actions(enrolment_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_passport_entries_passport ON step_passport_entries(passport_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_passport_shares_passport ON step_passport_shares(passport_id)`,
    ];
    for (const sql of indexes) {
        await db.execute({ sql, args: [] });
    }
}
