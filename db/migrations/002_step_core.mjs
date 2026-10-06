// 002_step_core.mjs
//
// STEP core: programme cycles, cycle cohorts, enrolments, versioned consent
// records and scoped programme staff (separate from blog roles). Also brings
// step_applications / step_participants up to the cycle-aware shape.

async function hasColumn(db, table, column) {
    const info = await db.execute({
        sql: `SELECT name FROM pragma_table_info('${table}')`,
        args: [],
    });
    return info.rows.some((r) => r.name === column);
}

export async function up(db) {
    await db.execute("PRAGMA foreign_keys = ON");

    // ---------- cycles ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_cycles (
                id TEXT PRIMARY KEY,
                slug TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                cohort_size INTEGER,
                starts_at INTEGER,
                ends_at INTEGER,
                status TEXT NOT NULL DEFAULT 'draft',
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });

    // ---------- cycle cohorts (programme-specific cohort instances) ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_cycle_cohorts (
                id TEXT PRIMARY KEY,
                cycle_id TEXT NOT NULL REFERENCES step_cycles(id) ON DELETE CASCADE,
                cohort_id TEXT NOT NULL REFERENCES step_cohorts(id) ON DELETE RESTRICT,
                capacity INTEGER,
                lead_user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
                status TEXT NOT NULL DEFAULT 'open',
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                UNIQUE(cycle_id, cohort_id)
            )
        `,
        args: [],
    });

    // ---------- applications (cycle-aware, draft-capable) ----------
    await db.execute({
        sql: `
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
                status TEXT NOT NULL DEFAULT 'draft',
                submitted_at INTEGER,
                reviewed_by TEXT,
                review_note TEXT,
                reviewed_at INTEGER,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE RESTRICT,
                FOREIGN KEY (cohort_id) REFERENCES step_cohorts(id) ON DELETE SET NULL,
                FOREIGN KEY (reviewed_by) REFERENCES user(id) ON DELETE SET NULL
            )
        `,
        args: [],
    });

    if (!(await hasColumn(db, "step_applications", "cycle_id"))) {
        await db.execute({
            sql: `ALTER TABLE step_applications ADD COLUMN cycle_id TEXT REFERENCES step_cycles(id) ON DELETE RESTRICT`,
            args: [],
        });
    }
    if (!(await hasColumn(db, "step_applications", "submitted_at"))) {
        await db.execute({
            sql: `ALTER TABLE step_applications ADD COLUMN submitted_at INTEGER`,
            args: [],
        });
    }

    // ---------- participants (person-level record) ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_participants (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE,
                application_id TEXT NOT NULL,
                cohort_id TEXT,
                pathway TEXT NOT NULL DEFAULT 'employment',
                level TEXT NOT NULL DEFAULT 'registered',
                status TEXT NOT NULL DEFAULT 'active',
                admitted_at INTEGER NOT NULL DEFAULT (unixepoch()),
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE RESTRICT,
                FOREIGN KEY (application_id) REFERENCES step_applications(id) ON DELETE RESTRICT,
                FOREIGN KEY (cohort_id) REFERENCES step_cohorts(id) ON DELETE SET NULL
            )
        `,
        args: [],
    });

    // ---------- enrolments (participant in a cycle cohort) ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_enrolments (
                id TEXT PRIMARY KEY,
                participant_id TEXT NOT NULL REFERENCES step_participants(id) ON DELETE CASCADE,
                cycle_id TEXT NOT NULL REFERENCES step_cycles(id) ON DELETE RESTRICT,
                cycle_cohort_id TEXT REFERENCES step_cycle_cohorts(id) ON DELETE SET NULL,
                pathway TEXT NOT NULL DEFAULT 'employment',
                status TEXT NOT NULL DEFAULT 'enrolled',
                enrolled_at INTEGER NOT NULL DEFAULT (unixepoch()),
                exited_at INTEGER,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
                UNIQUE(participant_id, cycle_id)
            )
        `,
        args: [],
    });

    // ---------- versioned, revocable consent records ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_consents (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES user(id) ON DELETE RESTRICT,
                scope TEXT NOT NULL,
                version INTEGER NOT NULL,
                granted BOOLEAN NOT NULL,
                source TEXT NOT NULL DEFAULT 'application',
                recorded_by TEXT REFERENCES user(id) ON DELETE SET NULL,
                recorded_at INTEGER NOT NULL DEFAULT (unixepoch()),
                UNIQUE(user_id, scope, version)
            )
        `,
        args: [],
    });

    // ---------- scoped programme staff (independent of blog roles) ----------
    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_staff (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE REFERENCES user(id) ON DELETE CASCADE,
                role TEXT NOT NULL DEFAULT 'coordinator',
                active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });

    // ---------- indexes ----------
    const indexes = [
        `CREATE INDEX IF NOT EXISTS idx_step_applications_user ON step_applications(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_applications_status ON step_applications(status)`,
        `CREATE INDEX IF NOT EXISTS idx_step_applications_cycle ON step_applications(cycle_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_participants_user ON step_participants(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_participants_cohort ON step_participants(cohort_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_enrolments_participant ON step_enrolments(participant_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_enrolments_cycle ON step_enrolments(cycle_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_cycle_cohorts_cycle ON step_cycle_cohorts(cycle_id)`,
        `CREATE INDEX IF NOT EXISTS idx_step_consents_user ON step_consents(user_id, scope)`,
    ];
    for (const sql of indexes) {
        await db.execute({ sql, args: [] });
    }

    // ---------- seed: inaugural cycle + cycle cohorts ----------
    const cycleId = "cycle_2026";
    await db.execute({
        sql: `
            INSERT INTO step_cycles (id, slug, name, cohort_size, status)
            VALUES (?, ?, ?, ?, 'open')
            ON CONFLICT(slug) DO UPDATE SET
                name = excluded.name,
                cohort_size = excluded.cohort_size,
                status = excluded.status,
                updated_at = unixepoch()
        `,
        args: [cycleId, "cohort-2026", "2026 Inaugural Cohort", 600],
    });

    const cohorts = await db.execute({
        sql: `SELECT id FROM step_cohorts ORDER BY sort_order ASC`,
        args: [],
    });
    for (const row of cohorts.rows) {
        await db.execute({
            sql: `
                INSERT INTO step_cycle_cohorts (id, cycle_id, cohort_id, status)
                VALUES (?, ?, ?, 'open')
                ON CONFLICT(cycle_id, cohort_id) DO NOTHING
            `,
            args: [`cycle_2026_${row.id}`, cycleId, row.id],
        });
    }
    console.log("  ✓ inaugural cycle + cycle cohorts seeded");

    // ---------- bootstrap: grant programme_admin to existing blog admins ----------
    await db.execute({
        sql: `
            INSERT OR IGNORE INTO step_staff (id, user_id, role, active, created_at)
            SELECT 'staff_' || user.id, user.id, 'programme_admin', TRUE, unixepoch()
            FROM user WHERE user.role = 'admin'
        `,
        args: [],
    });
    console.log("  ✓ step_staff bootstrapped from existing admins");
}
