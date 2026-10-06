// db/queries/step/safeguarding.ts
import "server-only";

import { database as db } from "@/db/database";

export async function listComplaints(): Promise<Record<string, unknown>[]> {
    const result = await db.execute({
        sql: `
            SELECT c.*, u.name AS reporter_name
            FROM step_complaints c
            LEFT JOIN user u ON u.id = c.reporter_user_id
            ORDER BY c.created_at DESC
        `,
        args: [],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function listSafeguardingReports(): Promise<Record<string, unknown>[]> {
    const result = await db.execute({
        sql: `
            SELECT r.*, u.name AS reporter_name
            FROM step_safeguarding_reports r
            LEFT JOIN user u ON u.id = r.reporter_user_id
            ORDER BY r.created_at DESC
        `,
        args: [],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function listConflictDeclarations(): Promise<Record<string, unknown>[]> {
    const result = await db.execute({
        sql: `
            SELECT d.*, u.name AS staff_name
            FROM step_conflict_declarations d
            JOIN user u ON u.id = d.user_id
            ORDER BY d.created_at DESC
        `,
        args: [],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function createComplaint(input: {
    id: string;
    reporterUserId: string | null;
    participantId: string | null;
    subject: string;
    body: string | null;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_complaints (id, reporter_user_id, participant_id, subject, body, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 'open', unixepoch(), unixepoch())
        `,
        args: [input.id, input.reporterUserId, input.participantId, input.subject, input.body],
    });
}

export async function createSafeguardingReport(input: {
    id: string;
    reporterUserId: string | null;
    participantId: string | null;
    subject: string;
    body: string | null;
    riskLevel: string;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_safeguarding_reports (id, reporter_user_id, participant_id, subject, body, risk_level, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'open', unixepoch(), unixepoch())
        `,
        args: [input.id, input.reporterUserId, input.participantId, input.subject, input.body, input.riskLevel],
    });
}

export async function createConflictDeclaration(input: {
    id: string;
    userId: string;
    relatedParty: string;
    relationship: string | null;
    interestType: string;
    details: string | null;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_conflict_declarations (id, user_id, related_party, relationship, interest_type, details, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'declared', unixepoch(), unixepoch())
        `,
        args: [input.id, input.userId, input.relatedParty, input.relationship, input.interestType, input.details],
    });
}

export async function resolveComplaint(input: {
    complaintId: string;
    status: string;
    resolution: string | null;
    resolvedBy: string;
}): Promise<void> {
    await db.execute({
        sql: `
            UPDATE step_complaints
            SET status = ?, resolution = ?, resolved_by = ?, resolved_at = unixepoch(), updated_at = unixepoch()
            WHERE id = ?
        `,
        args: [input.status, input.resolution, input.resolvedBy, input.complaintId],
    });
}

export async function resolveSafeguardingReport(input: {
    reportId: string;
    status: string;
    outcome: string | null;
    resolvedBy: string;
}): Promise<void> {
    await db.execute({
        sql: `
            UPDATE step_safeguarding_reports
            SET status = ?, outcome = ?, resolved_by = ?, resolved_at = unixepoch(), updated_at = unixepoch()
            WHERE id = ?
        `,
        args: [input.status, input.outcome, input.resolvedBy, input.reportId],
    });
}

export async function resolveConflictDeclaration(input: {
    declarationId: string;
    status: string;
    resolvedBy: string;
}): Promise<void> {
    await db.execute({
        sql: `
            UPDATE step_conflict_declarations
            SET status = ?, resolved_by = ?, resolved_at = unixepoch(), updated_at = unixepoch()
            WHERE id = ?
        `,
        args: [input.status, input.resolvedBy, input.declarationId],
    });
}
