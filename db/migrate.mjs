// db/migrate.mjs
//
// Minimal versioned migration runner for the Turso (libsql) database.
//
//   node --env-file=.env db/migrate.mjs
//
// Migrations live in db/migrations/*.mjs, each exporting an `up(db)` function.
// Applied versions are recorded in `schema_migrations` so every migration is
// applied exactly once, in filename order.
//
// This is additive-only tooling: it never resets or replaces existing tables.
// All content values are passed as bound parameters (never string-interpolated)
// so Markdown/HTML text with quotes, ampersands or em-dashes stays safe.

import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@libsql/client";

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const MIGRATIONS_DIR = dirname(fileURLToPath(import.meta.url)) + "/migrations";

async function ensureTrackingTable() {
    await client.execute({
        sql: `
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                applied_at INTEGER NOT NULL DEFAULT (unixepoch())
            )
        `,
        args: [],
    });
}

async function appliedVersions() {
    const result = await client.execute({
        sql: `SELECT version FROM schema_migrations`,
        args: [],
    });
    return new Set(result.rows.map((r) => r.version));
}

async function main() {
    if (!process.env.TURSO_DATABASE_URL) {
        console.error("✗ TURSO_DATABASE_URL is not set");
        process.exit(1);
    }

    await ensureTrackingTable();
    const applied = await appliedVersions();

    const files = (await readdir(MIGRATIONS_DIR))
        .filter((f) => f.endsWith(".mjs"))
        .sort();

    let ran = 0;
    for (const file of files) {
        const version = file.replace(/\.mjs$/, "");
        if (applied.has(version)) {
            continue;
        }

        const mod = await import(pathToFileURL(join(MIGRATIONS_DIR, file)).href);
        if (typeof mod.up !== "function") {
            throw new Error(`${file} does not export an up(db) function`);
        }

        console.log(`→ applying ${version}`);
        await mod.up(client);
        await client.execute({
            sql: `INSERT INTO schema_migrations (version, name) VALUES (?, ?)`,
            args: [version, file],
        });
        console.log(`  ✓ ${version}`);
        ran++;
    }

    if (ran === 0) {
        console.log("✓ up to date — no pending migrations");
    } else {
        console.log(`\n✓ ${ran} migration(s) applied`);
    }

    await client.close();
}

main().catch((err) => {
    console.error("✗ Migration failed:", err);
    process.exit(1);
});
