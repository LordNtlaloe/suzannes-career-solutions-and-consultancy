// 009_step_safeguarding.mjs
//
// Safeguards (concept-note gap 12.1): restricted-access complaints,
// safeguarding reports and staff conflict-of-interest declarations.

export async function up(db) {
    await db.execute("PRAGMA foreign_keys = ON");

    await db.execute({
        sql: `
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
            )
        `,
        args: [],
    });
    console.log("  ✓ step_complaints");

    await db.execute({
        sql: `
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
            )
        `,
        args: [],
    });
    console.log("  ✓ step_safeguarding_reports");

    await db.execute({
        sql: `
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
            )
        `,
        args: [],
    });
    console.log("  ✓ step_conflict_declarations");

    await db.execute({
        sql: `CREATE INDEX IF NOT EXISTS idx_step_complaints_status ON step_complaints(status)`,
        args: [],
    });
    await db.execute({
        sql: `CREATE INDEX IF NOT EXISTS idx_step_safeguarding_status ON step_safeguarding_reports(status)`,
        args: [],
    });
    await db.execute({
        sql: `CREATE INDEX IF NOT EXISTS idx_step_conflict_user ON step_conflict_declarations(user_id)`,
        args: [],
    });
    console.log("  ✓ safeguarding indexes");
}
