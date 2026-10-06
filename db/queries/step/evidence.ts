// db/queries/step/evidence.ts
import "server-only";

import { database as db } from "@/db/database";
import type { StepEvidence } from "@/types/step";

export async function getEvidenceById(id: string): Promise<StepEvidence | null> {
    const result = await db.execute({
        sql: `SELECT * FROM step_evidence WHERE id = ?`,
        args: [id],
    });
    return (result.rows[0] as unknown as StepEvidence | undefined) ?? null;
}

export async function submitEvidence(input: {
    id: string;
    assignmentId: string;
    participantId: string;
    kind: string;
    title: string;
    body: string | null;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_evidence (id, assignment_id, participant_id, kind, title, body, status, submitted_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'submitted', unixepoch(), unixepoch())
        `,
        args: [input.id, input.assignmentId, input.participantId, input.kind, input.title, input.body],
    });
}

export async function listEvidenceForAssignment(assignmentId: string) {
    const result = await db.execute({
        sql: `
            SELECT ev.*
            FROM step_evidence ev
            WHERE ev.assignment_id = ?
            ORDER BY ev.submitted_at DESC
        `,
        args: [assignmentId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function listEvidenceForEnrolment(enrolmentId: string) {
    const result = await db.execute({
        sql: `
            SELECT ev.*
            FROM step_evidence ev
            JOIN step_learning_assignments a ON a.id = ev.assignment_id
            WHERE a.enrolment_id = ?
            ORDER BY ev.submitted_at DESC
        `,
        args: [enrolmentId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function listEvidenceReviewQueue(scope: {
    cycleId?: string | null;
    cohortId?: string | null;
    status?: string;
    limit: number;
    offset: number;
}) {
    const conditions: string[] = ["ev.status = ?"];
    const args: (string | number)[] = [scope.status ?? "submitted"];
    if (scope.cycleId) {
        conditions.push("e.cycle_id = ?");
        args.push(scope.cycleId);
    }
    if (scope.cohortId) {
        conditions.push("cc.cohort_id = ?");
        args.push(scope.cohortId);
    }

    const result = await db.execute({
        sql: `
            SELECT ev.*, a.enrolment_id, e.cycle_id, r.title AS requirement_title,
                   u.name AS participant_name
            FROM step_evidence ev
            LEFT JOIN step_learning_assignments a ON a.id = ev.assignment_id
            LEFT JOIN step_enrolments e ON e.id = a.enrolment_id
            LEFT JOIN step_cycle_cohorts cc ON cc.id = e.cycle_cohort_id
            LEFT JOIN step_learning_requirements r ON r.id = a.requirement_id
            LEFT JOIN step_participants p ON p.id = ev.participant_id
            LEFT JOIN user u ON u.id = p.user_id
            WHERE ${conditions.join(" AND ")}
            ORDER BY ev.submitted_at ASC
            LIMIT ? OFFSET ?
        `,
        args: [...args, scope.limit, scope.offset],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function countEvidenceReviewQueue(scope: {
    cycleId?: string | null;
    cohortId?: string | null;
    status?: string;
}): Promise<number> {
    const conditions: string[] = ["ev.status = ?"];
    const args: (string | number)[] = [scope.status ?? "submitted"];
    if (scope.cycleId) {
        conditions.push("e.cycle_id = ?");
        args.push(scope.cycleId);
    }
    if (scope.cohortId) {
        conditions.push("cc.cohort_id = ?");
        args.push(scope.cohortId);
    }
    const result = await db.execute({
        sql: `
            SELECT COUNT(*) AS c
            FROM step_evidence ev
            LEFT JOIN step_learning_assignments a ON a.id = ev.assignment_id
            LEFT JOIN step_enrolments e ON e.id = a.enrolment_id
            LEFT JOIN step_cycle_cohorts cc ON cc.id = e.cycle_cohort_id
            WHERE ${conditions.join(" AND ")}
        `,
        args,
    });
    return Number(result.rows[0]?.c ?? 0);
}

export async function listEvidenceReviews(evidenceId: string) {
    const result = await db.execute({
        sql: `
            SELECT er.*, u.name AS reviewer_name
            FROM step_evidence_reviews er
            LEFT JOIN user u ON u.id = er.reviewer_id
            WHERE er.evidence_id = ?
            ORDER BY er.created_at ASC
        `,
        args: [evidenceId],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

/**
 * Review evidence transactionally: append the review (history preserved),
 * update the evidence status, and mark the assignment completed only when the
 * evidence is accepted.
 */
export async function reviewEvidence(input: {
    reviewId: string;
    evidenceId: string;
    assignmentId: string;
    reviewerId: string;
    decision: "accepted" | "rejected" | "changes_requested";
    feedback: string | null;
}): Promise<void> {
    const evidenceStatus =
        input.decision === "accepted"
            ? "accepted"
            : input.decision === "rejected"
              ? "rejected"
              : "submitted";

    await db.batch(
        [
            {
                sql: `
                    INSERT INTO step_evidence_reviews (id, evidence_id, reviewer_id, decision, feedback, created_at)
                    VALUES (?, ?, ?, ?, ?, unixepoch())
                `,
                args: [input.reviewId, input.evidenceId, input.reviewerId, input.decision, input.feedback],
            },
            {
                sql: `UPDATE step_evidence SET status = ? WHERE id = ?`,
                args: [evidenceStatus, input.evidenceId],
            },
            ...(input.decision === "accepted"
                ? [
                      {
                          sql: `
                              UPDATE step_learning_assignments
                              SET status = 'completed', completed_at = unixepoch(), updated_at = unixepoch()
                              WHERE id = ?
                          `,
                          args: [input.assignmentId],
                      },
                  ]
                : []),
        ],
        "write",
    );
}
