// 003_step_programme.mjs
//
// STEP programme operations: learning requirements & assignments, evidence
// submissions & reviews, assessments, mentoring, audited progression
// decisions, and verified Skills Passports with controlled sharing.
//
// Deletion rules preserve programme history: history-bearing references use
// ON DELETE RESTRICT so records cannot be cascade-deleted by accident; only
// genuinely owned children (evidence under an assignment, entries under a
// passport) cascade with their parent.

export async function up(db) {
    await db.execute("PRAGMA foreign_keys = ON");

    // ---------- learning requirements (templates) ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_learning_requirements (
                id TEXT PRIMARY KEY,
                cycle_id TEXT REFERENCES step_cycles(id) ON DELETE RESTRICT,
                pathway TEXT,
                title TEXT NOT NULL,
                description TEXT,
                required BOOLEAN NOT NULL DEFAULT TRUE,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });

    // ---------- assignments of requirements to enrolments ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_learning_assignments (
                id TEXT PRIMARY KEY,
                enrolment_id TEXT NOT NULL REFERENCES step_enrolments(id) ON DELETE CASCADE,
                requirement_id TEXT REFERENCES step_learning_requirements(id) ON DELETE RESTRICT,
                status TEXT NOT NULL DEFAULT 'assigned',
                due_at INTEGER,
                completed_at INTEGER,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
                UNIQUE(enrolment_id, requirement_id)
            )
        `,
        args: [],
    });

    // ---------- evidence submissions ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_evidence (
                id TEXT PRIMARY KEY,
                assignment_id TEXT REFERENCES step_learning_assignments(id) ON DELETE CASCADE,
                participant_id TEXT NOT NULL REFERENCES step_participants(id) ON DELETE CASCADE,
                kind TEXT NOT NULL DEFAULT 'file',
                title TEXT NOT NULL,
                body TEXT,
                media_id TEXT REFERENCES media(id) ON DELETE SET NULL,
                status TEXT NOT NULL DEFAULT 'submitted',
                submitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });

    // ---------- evidence reviews ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_evidence_reviews (
                id TEXT PRIMARY KEY,
                evidence_id TEXT NOT NULL REFERENCES step_evidence(id) ON DELETE CASCADE,
                reviewer_id TEXT REFERENCES user(id) ON DELETE SET NULL,
                decision TEXT NOT NULL,
                feedback TEXT,
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });

    // ---------- assessments ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_assessments (
                id TEXT PRIMARY KEY,
                cycle_id TEXT REFERENCES step_cycles(id) ON DELETE RESTRICT,
                pathway TEXT,
                title TEXT NOT NULL,
                kind TEXT NOT NULL DEFAULT 'competency_test',
                required BOOLEAN NOT NULL DEFAULT TRUE,
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });

    // ---------- assessment results ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_assessment_results (
                id TEXT PRIMARY KEY,
                assessment_id TEXT NOT NULL REFERENCES step_assessments(id) ON DELETE RESTRICT,
                enrolment_id TEXT NOT NULL REFERENCES step_enrolments(id) ON DELETE CASCADE,
                status TEXT NOT NULL DEFAULT 'pending',
                score REAL,
                result_notes TEXT,
                assessed_by TEXT REFERENCES user(id) ON DELETE SET NULL,
                assessed_at INTEGER,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
                UNIQUE(assessment_id, enrolment_id)
            )
        `,
        args: [],
    });

    // ---------- mentors ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_mentors (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
                bio TEXT,
                active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });

    // ---------- mentoring sessions ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_mentoring_sessions (
                id TEXT PRIMARY KEY,
                cycle_id TEXT REFERENCES step_cycles(id) ON DELETE RESTRICT,
                mentor_id TEXT NOT NULL REFERENCES step_mentors(id) ON DELETE RESTRICT,
                title TEXT NOT NULL,
                scheduled_at INTEGER,
                status TEXT NOT NULL DEFAULT 'scheduled',
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });

    // ---------- mentoring attendance ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_mentoring_attendance (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL REFERENCES step_mentoring_sessions(id) ON DELETE CASCADE,
                enrolment_id TEXT NOT NULL REFERENCES step_enrolments(id) ON DELETE CASCADE,
                attended BOOLEAN,
                feedback TEXT,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                UNIQUE(session_id, enrolment_id)
            )
        `,
        args: [],
    });

    // ---------- audited progression decisions ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_progression_decisions (
                id TEXT PRIMARY KEY,
                participant_id TEXT NOT NULL REFERENCES step_participants(id) ON DELETE CASCADE,
                enrolment_id TEXT REFERENCES step_enrolments(id) ON DELETE CASCADE,
                from_level TEXT NOT NULL,
                to_level TEXT NOT NULL,
                decision TEXT NOT NULL DEFAULT 'approved',
                override_reason TEXT,
                decided_by TEXT REFERENCES user(id) ON DELETE SET NULL,
                decided_at INTEGER NOT NULL DEFAULT (unixepoch()),
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });

    // ---------- verified Skills Passports ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_passports (
                id TEXT PRIMARY KEY,
                participant_id TEXT NOT NULL REFERENCES step_participants(id) ON DELETE CASCADE,
                version INTEGER NOT NULL,
                status TEXT NOT NULL DEFAULT 'draft',
                verified_by TEXT REFERENCES user(id) ON DELETE SET NULL,
                verified_at INTEGER,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                UNIQUE(participant_id, version)
            )
        `,
        args: [],
    });

    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_passport_entries (
                id TEXT PRIMARY KEY,
                passport_id TEXT NOT NULL REFERENCES step_passports(id) ON DELETE CASCADE,
                entry_type TEXT NOT NULL,
                title TEXT NOT NULL,
                verified_at INTEGER,
                source_ref TEXT,
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });

    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_passport_shares (
                id TEXT PRIMARY KEY,
                passport_id TEXT NOT NULL REFERENCES step_passports(id) ON DELETE CASCADE,
                token TEXT NOT NULL UNIQUE,
                scope TEXT NOT NULL DEFAULT 'full',
                expires_at INTEGER,
                revoked_at INTEGER,
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });

    // ---------- indexes ----------
    const indexes = [
        `CREATE INDEX IF NOT EXISTS idx_step_requirements_cycle ON step_learning_requirements(cycle_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_assignments_enrolment ON step_learning_assignments(enrolment_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_evidence_participant ON step_evidence(participant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_evidence_reviews_evidence ON step_evidence_reviews(evidence_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_assessments_cycle ON step_assessments(cycle_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_assessment_results_enrolment ON step_assessment_results(enrolment_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_mentoring_sessions_cycle ON step_mentoring_sessions(cycle_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_progression_participant ON step_progression_decisions(participant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_passports_participant ON step_passports(participant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_passport_entries_passport ON step_passport_entries(passport_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_passport_shares_passport ON step_passport_shares(passport_id)`,
    ];
    for (const sql of indexes) {
        await db.execute({ sql, args: [] });
    }
}
