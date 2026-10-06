// db/seed/step-cohorts.mjs
//
// Seeds the eight STEP industry cohorts. Idempotent (upsert by slug).
//
// Usage:
//   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... node db/seed/step-cohorts.mjs

import { createClient } from "@libsql/client";

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const COHORTS = [
    {
        slug: "business-finance-professional-services",
        name: "Business, Finance and Professional Services",
        fields: "Accounting, banking, insurance, consulting, audit, procurement, administration and customer experience",
    },
    {
        slug: "technology-data-digital-work",
        name: "Technology, Data and Digital Work",
        fields: "Information technology, cloud, artificial intelligence, cybersecurity, data, product and digital operations",
    },
    {
        slug: "media-creative-creator-economy",
        name: "Media, Creative Industries and Creator Economy",
        fields: "Content creation, film, television, music, photography, design, journalism, marketing, communications and digital entrepreneurship",
    },
    {
        slug: "engineering-infrastructure-built-environment",
        name: "Engineering, Infrastructure and Built Environment",
        fields: "Engineering, construction, architecture, quantity surveying, energy, utilities and technical trades",
    },
    {
        slug: "health-social-impact-development",
        name: "Health, Social Impact and Development",
        fields: "Health, public health, social services, research, monitoring and evaluation, development practice and humanitarian work",
    },
    {
        slug: "environment-agriculture-green-economy",
        name: "Environment, Agriculture and Green Economy",
        fields: "Environmental practice, sustainability, agriculture, climate, natural resources and circular-economy opportunities",
    },
    {
        slug: "governance-law-public-institutions",
        name: "Governance, Law and Public Institutions",
        fields: "Law, compliance, regulation, public administration, governance, risk, policy and professional bodies",
    },
    {
        slug: "entrepreneurship-enterprise-growth",
        name: "Entrepreneurship and Enterprise Growth",
        fields: "Start-ups, micro and small enterprises, freelancers, consultants and innovation-led businesses",
    },
];

async function seed() {
    if (!process.env.TURSO_DATABASE_URL) {
        console.error("✗ TURSO_DATABASE_URL is not set");
        process.exit(1);
    }

    try {
        await client.execute({
            sql: `
                CREATE TABLE IF NOT EXISTS step_cohorts (
                    id TEXT PRIMARY KEY,
                    slug TEXT NOT NULL UNIQUE,
                    name TEXT NOT NULL,
                    fields TEXT,
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    active BOOLEAN NOT NULL DEFAULT TRUE,
                    created_at INTEGER NOT NULL DEFAULT (unixepoch())
                )
            `,
            args: [],
        });
        console.log("  ✓ step_cohorts table ready");

        for (let i = 0; i < COHORTS.length; i++) {
            const c = COHORTS[i];
            await client.execute({
                sql: `
                    INSERT INTO step_cohorts (id, slug, name, fields, sort_order, active, created_at)
                    VALUES (?, ?, ?, ?, ?, TRUE, unixepoch())
                    ON CONFLICT(slug) DO UPDATE SET
                        name       = excluded.name,
                        fields     = excluded.fields,
                        sort_order = excluded.sort_order,
                        active     = TRUE
                `,
                args: [`cohort_${c.slug}`, c.slug, c.name, c.fields, i],
            });
            console.log(`  ✓ ${c.name}`);
        }
    } catch (err) {
        console.error("✗ Seed failed:", err);
        process.exit(1);
    }

    await client.close();
    console.log("\n✓ Done");
}

seed();
