// 008_step_partners.mjs
//
// Partners, opportunity providers and introductions (concept-note gaps 9, 10
// and 13):
//  - step_partners + agreements + contributions. A partner's name is only
//    shown publicly once written approval is recorded (approved_at set).
//  - step_opportunity_providers and step_introductions track consented
//    introductions (participant, provider, consent, outcome).
//  - Optional, consented district/gender fields on step_applications.

async function hasColumn(db, table, column) {
    const info = await db.execute({
        sql: `SELECT name FROM pragma_table_info('${table}')`,
        args: [],
    });
    return info.rows.some((r) => r.name === column);
}

export async function up(db) {
    await db.execute("PRAGMA foreign_keys = ON");

    await db.execute({
        sql: `
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
            )
        `,
        args: [],
    });
    console.log("  ✓ step_partners");

    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_partner_agreements (
                id TEXT PRIMARY KEY,
                partner_id TEXT NOT NULL REFERENCES step_partners(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'draft', -- draft | signed | active | ended
                signed_at INTEGER,
                expires_at INTEGER,
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });
    console.log("  ✓ step_partner_agreements");

    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_partner_contributions (
                id TEXT PRIMARY KEY,
                partner_id TEXT NOT NULL REFERENCES step_partners(id) ON DELETE CASCADE,
                area TEXT NOT NULL,             -- learning | mentoring | placement | funding | assessment | other
                description TEXT,
                status TEXT NOT NULL DEFAULT 'proposed', -- proposed | committed | delivered
                created_at INTEGER NOT NULL DEFAULT (unixepoch()),
                updated_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });
    console.log("  ✓ step_partner_contributions");

    await db.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS step_opportunity_providers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                contact_email TEXT,
                partner_id TEXT REFERENCES step_partners(id) ON DELETE SET NULL,
                status TEXT NOT NULL DEFAULT 'active', -- active | inactive
                created_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });
    console.log("  ✓ step_opportunity_providers");

    await db.execute({
        sql: `
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
            )
        `,
        args: [],
    });
    console.log("  ✓ step_introductions");

    await db.execute({
        sql: `CREATE INDEX IF NOT EXISTS idx_step_partners_status ON step_partners(status)`,
        args: [],
    });
    await db.execute({
        sql: `CREATE INDEX IF NOT EXISTS idx_step_partner_agreements_partner ON step_partner_agreements(partner_id)`,
        args: [],
    });
    await db.execute({
        sql: `CREATE INDEX IF NOT EXISTS idx_step_partner_contributions_partner ON step_partner_contributions(partner_id)`,
        args: [],
    });
    await db.execute({
        sql: `CREATE INDEX IF NOT EXISTS idx_step_introductions_participant ON step_introductions(participant_id)`,
        args: [],
    });
    await db.execute({
        sql: `CREATE INDEX IF NOT EXISTS idx_step_introductions_provider ON step_introductions(provider_id)`,
        args: [],
    });
    console.log("  ✓ partner indexes");

    if (!(await hasColumn(db, "step_applications", "district"))) {
        await db.execute({
            sql: `ALTER TABLE step_applications ADD COLUMN district TEXT`,
            args: [],
        });
        console.log("  ✓ step_applications.district");
    }
    if (!(await hasColumn(db, "step_applications", "gender"))) {
        await db.execute({
            sql: `ALTER TABLE step_applications ADD COLUMN gender TEXT`,
            args: [],
        });
        console.log("  ✓ step_applications.gender");
    }
}
