// db/queries/step/introductions.ts
import "server-only";

import { database as db } from "@/db/database";
import type { StepIntroduction, StepOpportunityProvider } from "@/types/step";

/** Enrolled participants (identity id + name) for introduction creation. */
export async function listEnrolledParticipants(): Promise<Record<string, unknown>[]> {
    const result = await db.execute({
        sql: `
            SELECT p.id AS participant_id, u.name AS participant_name, e.id AS enrolment_id
            FROM step_enrolments e
            JOIN step_participants p ON p.id = e.participant_id
            JOIN user u ON u.id = p.user_id
            WHERE e.status = 'enrolled'
            ORDER BY u.name ASC
        `,
        args: [],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function listProviders(): Promise<StepOpportunityProvider[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_opportunity_providers WHERE status = 'active' ORDER BY name ASC`,
        args: [],
    });
    return result.rows as unknown as StepOpportunityProvider[];
}

export async function createProvider(input: {
    id: string;
    name: string;
    contactEmail: string | null;
    partnerId: string | null;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_opportunity_providers (id, name, contact_email, partner_id, status, created_at)
            VALUES (?, ?, ?, ?, 'active', unixepoch())
        `,
        args: [input.id, input.name, input.contactEmail, input.partnerId],
    });
}

/** Introductions with participant and provider names, paginated. */
export async function listIntroductions(input: {
    limit: number;
    offset: number;
}): Promise<Record<string, unknown>[]> {
    const result = await db.execute({
        sql: `
            SELECT i.*, u.name AS participant_name, op.name AS provider_name
            FROM step_introductions i
            JOIN step_participants p ON p.id = i.participant_id
            JOIN user u ON u.id = p.user_id
            JOIN step_opportunity_providers op ON op.id = i.provider_id
            ORDER BY i.created_at DESC
            LIMIT ? OFFSET ?
        `,
        args: [input.limit, input.offset],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function countIntroductions(): Promise<number> {
    const result = await db.execute({
        sql: `SELECT COUNT(*) AS c FROM step_introductions`,
        args: [],
    });
    return Number(result.rows[0]?.c ?? 0);
}

export async function listIntroductionsForParticipant(
    participantId: string,
): Promise<Record<string, unknown>[]> {
    const result = await db.execute({
        sql: `
            SELECT i.*, op.name AS provider_name
            FROM step_introductions i
            JOIN step_opportunity_providers op ON op.id = i.provider_id
            WHERE i.participant_id = ?
            ORDER BY i.created_at DESC
        `,
        args: [participantId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function getIntroductionById(id: string): Promise<StepIntroduction | null> {
    const result = await db.execute({
        sql: `SELECT * FROM step_introductions WHERE id = ?`,
        args: [id],
    });
    return (result.rows[0] as unknown as StepIntroduction | undefined) ?? null;
}

export async function createIntroduction(input: {
    id: string;
    participantId: string;
    providerId: string;
    createdBy: string;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_introductions (id, participant_id, provider_id, status, created_by, created_at, updated_at)
            VALUES (?, ?, ?, 'requested', ?, unixepoch(), unixepoch())
        `,
        args: [input.id, input.participantId, input.providerId, input.createdBy],
    });
}

/** The participant consents to the introduction (or declines). */
export async function recordIntroductionConsent(input: {
    introductionId: string;
    consented: boolean;
}): Promise<void> {
    await db.execute({
        sql: `
            UPDATE step_introductions
            SET status = ?, consented_at = unixepoch(), updated_at = unixepoch()
            WHERE id = ? AND status = 'requested'
        `,
        args: [input.consented ? "consented" : "declined", input.introductionId],
    });
}

export async function markIntroductionMade(introductionId: string): Promise<void> {
    await db.execute({
        sql: `
            UPDATE step_introductions
            SET status = 'made', introduced_at = unixepoch(), updated_at = unixepoch()
            WHERE id = ? AND status IN ('requested', 'consented')
        `,
        args: [introductionId],
    });
}

export async function recordIntroductionOutcome(input: {
    introductionId: string;
    outcomeStatus: string;
    outcome: string | null;
}): Promise<void> {
    await db.execute({
        sql: `
            UPDATE step_introductions
            SET status = 'outcome_recorded', outcome_status = ?, outcome = ?,
                outcome_at = unixepoch(), updated_at = unixepoch()
            WHERE id = ?
        `,
        args: [input.outcomeStatus, input.outcome, input.introductionId],
    });
}
