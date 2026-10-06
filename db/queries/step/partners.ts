// db/queries/step/partners.ts
import "server-only";

import { database as db } from "@/db/database";
import type { StepPartner } from "@/types/step";

export async function listPartners(): Promise<StepPartner[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_partners ORDER BY created_at DESC`,
        args: [],
    });
    return result.rows as unknown as StepPartner[];
}

/** Public-facing list: only partners with recorded written approval. */
export async function listApprovedPartners(): Promise<StepPartner[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_partners WHERE status = 'approved' AND approved_at IS NOT NULL ORDER BY name ASC`,
        args: [],
    });
    return result.rows as unknown as StepPartner[];
}

export async function getPartnerById(id: string): Promise<StepPartner | null> {
    const result = await db.execute({
        sql: `SELECT * FROM step_partners WHERE id = ?`,
        args: [id],
    });
    return (result.rows[0] as unknown as StepPartner | undefined) ?? null;
}

export async function createPartner(input: {
    id: string;
    name: string;
    slug: string | null;
    contactEmail: string | null;
    website: string | null;
    contributionAreas: string[] | null;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_partners (id, name, slug, contact_email, website, contribution_areas, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'proposed', unixepoch(), unixepoch())
        `,
        args: [
            input.id,
            input.name,
            input.slug,
            input.contactEmail,
            input.website,
            input.contributionAreas ? JSON.stringify(input.contributionAreas) : null,
        ],
    });
}

export async function approvePartner(input: {
    partnerId: string;
    approvedBy: string;
}): Promise<void> {
    await db.execute({
        sql: `
            UPDATE step_partners
            SET status = 'approved', approved_at = unixepoch(), approved_by = ?, updated_at = unixepoch()
            WHERE id = ?
        `,
        args: [input.approvedBy, input.partnerId],
    });
}

export async function listAgreements(partnerId: string): Promise<Record<string, unknown>[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_partner_agreements WHERE partner_id = ? ORDER BY created_at DESC`,
        args: [partnerId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function createAgreement(input: {
    id: string;
    partnerId: string;
    title: string;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_partner_agreements (id, partner_id, title, status, created_at)
            VALUES (?, ?, ?, 'draft', unixepoch())
        `,
        args: [input.id, input.partnerId, input.title],
    });
}

export async function listContributions(partnerId: string): Promise<Record<string, unknown>[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_partner_contributions WHERE partner_id = ? ORDER BY created_at DESC`,
        args: [partnerId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function createContribution(input: {
    id: string;
    partnerId: string;
    area: string;
    description: string | null;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_partner_contributions (id, partner_id, area, description, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'proposed', unixepoch(), unixepoch())
        `,
        args: [input.id, input.partnerId, input.area, input.description],
    });
}
