// db/queries/step/applications.ts
import "server-only";

import { database as db } from "@/db/database";
import type {
    StepApplication,
    StepApplicationWithRelations,
} from "@/types/step";

const RELATIONS = `
    u.name  AS applicant_name,
    u.email AS applicant_email,
    c.name  AS cohort_name
`;

export async function getApplicationById(id: string): Promise<StepApplication | null> {
    const result = await db.execute({
        sql: `SELECT * FROM step_applications WHERE id = ?`,
        args: [id],
    });
    return (result.rows[0] as unknown as StepApplication | undefined) ?? null;
}

export async function getLatestApplicationByUser(userId: string): Promise<StepApplication | null> {
    const result = await db.execute({
        sql: `SELECT * FROM step_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
        args: [userId],
    });
    return (result.rows[0] as unknown as StepApplication | undefined) ?? null;
}

export type CreateApplicationInput = {
    id: string;
    userId: string;
    cycleId: string;
    cohortId: string | null;
    pathway: string;
    participantGroup: string;
    goals: string | null;
    baseline: string | null;
    consentContact: boolean;
    consentData: boolean;
    consentProgramme: boolean;
    status: "draft" | "submitted";
};

export async function createApplication(input: CreateApplicationInput): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_applications (
                id, user_id, cycle_id, cohort_id, pathway, participant_group,
                goals, baseline, consent_contact, consent_data, consent_programme,
                status, submitted_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
        `,
        args: [
            input.id,
            input.userId,
            input.cycleId,
            input.cohortId,
            input.pathway,
            input.participantGroup,
            input.goals,
            input.baseline,
            input.consentContact ? 1 : 0,
            input.consentData ? 1 : 0,
            input.consentProgramme ? 1 : 0,
            input.status,
            input.status === "submitted" ? Math.floor(Date.now() / 1000) : null,
        ],
    });
}

export async function updateApplicationDraft(
    id: string,
    input: {
        cohortId: string | null;
        pathway: string;
        participantGroup: string;
        goals: string | null;
        baseline: string | null;
    },
): Promise<void> {
    await db.execute({
        sql: `
            UPDATE step_applications
            SET cohort_id = ?, pathway = ?, participant_group = ?,
                goals = ?, baseline = ?, updated_at = unixepoch()
            WHERE id = ? AND status = 'draft'
        `,
        args: [input.cohortId, input.pathway, input.participantGroup, input.goals, input.baseline, id],
    });
}

export async function submitApplication(
    id: string,
    input: {
        consentContact: boolean;
        consentData: boolean;
        consentProgramme: boolean;
    },
): Promise<void> {
    await db.execute({
        sql: `
            UPDATE step_applications
            SET consent_contact = ?, consent_data = ?, consent_programme = ?,
                status = 'submitted', submitted_at = unixepoch(), updated_at = unixepoch()
            WHERE id = ? AND status = 'draft'
        `,
        args: [input.consentContact ? 1 : 0, input.consentData ? 1 : 0, input.consentProgramme ? 1 : 0, id],
    });
}

export async function getLatestNoticeVersion(
    userId: string,
    scope: string,
): Promise<number> {
    const result = await db.execute({
        sql: `SELECT COALESCE(MAX(notice_version), 0) AS v FROM step_consents WHERE user_id = ? AND scope = ?`,
        args: [userId, scope],
    });
    return Number(result.rows[0]?.v ?? 0);
}

export async function recordConsent(input: {
    id: string;
    userId: string;
    scope: string;
    noticeVersion: number;
    action: "grant" | "withdraw";
    recordedBy: string | null;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_consents (id, user_id, scope, notice_version, action, recorded_by, recorded_at)
            VALUES (?, ?, ?, ?, ?, ?, unixepoch())
        `,
        args: [input.id, input.userId, input.scope, input.noticeVersion, input.action, input.recordedBy],
    });
}

export async function updateApplicationStatus(
    id: string,
    input: {
        status: string;
        reviewedBy: string | null;
        reviewNote: string | null;
        feedback?: string | null;
    },
): Promise<void> {
    await db.execute({
        sql: `
            UPDATE step_applications
            SET status = ?, reviewed_by = ?, review_note = ?, feedback = ?,
                reviewed_at = unixepoch(), updated_at = unixepoch()
            WHERE id = ?
        `,
        args: [input.status, input.reviewedBy, input.reviewNote, input.feedback ?? null, id],
    });
}

export async function getApplicationForReview(id: string) {
    const result = await db.execute({
        sql: `
            SELECT a.*, u.name AS applicant_name, u.email AS applicant_email, c.name AS cohort_name
            FROM step_applications a
            LEFT JOIN user u ON u.id = a.user_id
            LEFT JOIN step_cohorts c ON c.id = a.cohort_id
            WHERE a.id = ?
        `,
        args: [id],
    });
    return (result.rows[0] as unknown as Record<string, unknown> | undefined) ?? null;
}

export type ApplicationReviewScope = {
    status?: string;
    cycleId?: string | null;
    cohortId?: string | null;
    pathway?: string;
    q?: string;
    submittedAfter?: number | null;
    limit: number;
    offset: number;
};

function buildApplicationConditions(
    scope: Omit<ApplicationReviewScope, "limit" | "offset">,
): { where: string; args: (string | number)[] } {
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (scope.status) {
        conditions.push("a.status = ?");
        args.push(scope.status);
    }
    if (scope.cycleId) {
        conditions.push("a.cycle_id = ?");
        args.push(scope.cycleId);
    }
    if (scope.cohortId) {
        conditions.push("a.cohort_id = ?");
        args.push(scope.cohortId);
    }
    if (scope.pathway) {
        conditions.push("a.pathway = ?");
        args.push(scope.pathway);
    }
    if (scope.q) {
        conditions.push("(u.name LIKE ? OR u.email LIKE ?)");
        args.push(`%${scope.q}%`, `%${scope.q}%`);
    }
    if (scope.submittedAfter) {
        conditions.push("a.submitted_at >= ?");
        args.push(scope.submittedAfter);
    }

    return {
        where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
        args,
    };
}

/** Applications within a reviewer's cycle/cohort scope (paginated). */
export async function listApplicationsForReview(
    scope: ApplicationReviewScope,
): Promise<StepApplicationWithRelations[]> {
    const { where, args } = buildApplicationConditions(scope);

    const result = await db.execute({
        sql: `
            SELECT a.*, ${RELATIONS}
            FROM step_applications a
            LEFT JOIN user u ON u.id = a.user_id
            LEFT JOIN step_cohorts c ON c.id = a.cohort_id
            ${where}
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `,
        args: [...args, scope.limit, scope.offset],
    });
    return result.rows as unknown as StepApplicationWithRelations[];
}

export async function countApplicationsForReview(
    scope: Omit<ApplicationReviewScope, "limit" | "offset">,
): Promise<number> {
    const { where, args } = buildApplicationConditions(scope);
    const result = await db.execute({
        sql: `SELECT COUNT(*) AS c FROM step_applications a LEFT JOIN user u ON u.id = a.user_id ${where}`,
        args,
    });
    return Number(result.rows[0]?.c ?? 0);
}

export async function getApplicationsByIds(ids: string[]): Promise<StepApplication[]> {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => "?").join(", ");
    const result = await db.execute({
        sql: `SELECT * FROM step_applications WHERE id IN (${placeholders})`,
        args: ids,
    });
    return result.rows as unknown as StepApplication[];
}

/** Users who can be assigned as reviewers (active programme/coordination/review roles). */
export async function listReviewers(): Promise<Record<string, unknown>[]> {
    const result = await db.execute({
        sql: `
            SELECT DISTINCT u.id, u.name, u.email
            FROM step_staff_assignments sa
            JOIN user u ON u.id = sa.user_id
            WHERE sa.active = TRUE
              AND sa.role IN ('programme_admin', 'coordinator', 'reviewer')
            ORDER BY u.name ASC
        `,
        args: [],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export type BulkAuditRow = { applicationId: string; auditId: string };

/** Assign one reviewer to several applications, one audit entry per row. */
export async function bulkAssignReviewer(input: {
    rows: BulkAuditRow[];
    reviewerUserId: string;
    actorUserId: string;
}): Promise<void> {
    const statements = input.rows.flatMap((r) => [
        {
            sql: `UPDATE step_applications SET assigned_reviewer = ?, updated_at = unixepoch() WHERE id = ?`,
            args: [input.reviewerUserId, r.applicationId],
        },
        {
            sql: `
                INSERT INTO step_audit_log (id, actor_user_id, entity_type, entity_id, action, metadata, created_at)
                VALUES (?, ?, 'application', ?, 'assign_reviewer', ?, unixepoch())
            `,
            args: [
                r.auditId,
                input.actorUserId,
                r.applicationId,
                JSON.stringify({ reviewer: input.reviewerUserId }),
            ],
        },
    ]);
    await db.batch(statements, "write");
}

/** Move several applications to under review, one audit entry per row. */
export async function bulkSetUnderReview(input: {
    rows: BulkAuditRow[];
    actorUserId: string;
}): Promise<void> {
    const statements = input.rows.flatMap((r) => [
        {
            sql: `UPDATE step_applications SET status = 'under_review', updated_at = unixepoch() WHERE id = ? AND status IN ('submitted', 'under_review')`,
            args: [r.applicationId],
        },
        {
            sql: `
                INSERT INTO step_audit_log (id, actor_user_id, entity_type, entity_id, action, metadata, created_at)
                VALUES (?, ?, 'application', ?, 'mark_under_review', NULL, unixepoch())
            `,
            args: [r.auditId, input.actorUserId, r.applicationId],
        },
    ]);
    await db.batch(statements, "write");
}
