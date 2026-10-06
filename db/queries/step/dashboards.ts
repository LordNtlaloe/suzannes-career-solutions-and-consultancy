// db/queries/step/dashboards.ts
//
// Role-specific dashboard queries. Each returns only the data the view needs,
// scoped to the caller's authorisations (the caller resolves access first and
// passes explicit ids — no free-form user-supplied scoping).
import "server-only";

import { database as db } from "@/db/database";
import { getEnrolmentsByUserId, getParticipantIdentity } from "@/db/queries/step/access";
import { getLatestPassport, listPassportEntries } from "@/db/queries/step/passports";
import { listEnrolmentAssignments } from "@/db/queries/step/learning";
import { listEvidenceForEnrolment } from "@/db/queries/step/evidence";
import {
    listAssignedEnrolments,
    listDevelopmentActionsForMentor,
    listMentoringSessions,
    listUpcomingSessionsForCycle,
} from "@/db/queries/step/mentoring";
import { listCycles } from "@/db/queries/step/cycles";
import {
    getReadinessRequirements,
    listProgressionDecisions,
} from "@/db/queries/step/progression";
import { PARTICIPANT_LEVELS } from "@/lib/step/constants";

const LEVEL_ORDER: string[] = PARTICIPANT_LEVELS.map((l) => l.value);

export async function participantDashboard(userId: string) {
    const participant = await getParticipantIdentity(userId);
    if (!participant) return { participant: null, enrolments: [], passport: null, now: Math.floor(Date.now() / 1000) };

    const enrolments = await getEnrolmentsByUserId(userId);
    const passport = await getLatestPassport(participant.id);

    const now = Math.floor(Date.now() / 1000);

    const detailed = await Promise.all(
        enrolments.map(async (enrolment) => {
            const [assignments, evidence, sessions] = await Promise.all([
                listEnrolmentAssignments(enrolment.id),
                listEvidenceForEnrolment(enrolment.id),
                listUpcomingSessionsForCycle(enrolment.cycle_id),
            ]);
            const pendingFeedback = evidence.filter((e) => e.status === "submitted");
            const active = assignments.filter(
                (a) => a.status !== "completed" && a.status !== "waived",
            );
            const overdue = active.filter(
                (a) => a.due_at && Number(a.due_at) < now,
            );
            const dueThisWeek = active.filter(
                (a) =>
                    a.due_at &&
                    Number(a.due_at) >= now &&
                    Number(a.due_at) <= now + 7 * 86400,
            );
            const awaitingSubmission = active.filter(
                (a) => a.status === "assigned" || a.status === "in_progress",
            );

            const currentLevel = String(enrolment.level);
            const nextLevel =
                LEVEL_ORDER[LEVEL_ORDER.indexOf(currentLevel) + 1] ?? null;
            const readiness = nextLevel
                ? await getReadinessRequirements(enrolment.id, nextLevel)
                : null;
            const unmetRequirements = readiness
                ? readiness.requirements.filter(
                      (r) =>
                          !["completed", "waived"].includes(
                              String(r.assignment_status ?? ""),
                          ),
                  )
                : [];
            const unmetAssessments = readiness
                ? readiness.assessments.filter(
                      (a) => String(a.latest_status ?? "") !== "passed",
                  )
                : [];

            return {
                enrolment,
                assignments,
                evidence,
                pendingFeedback,
                overdue,
                dueThisWeek,
                awaitingSubmission,
                sessions,
                nextLevel,
                unmetRequirements,
                unmetAssessments,
            };
        }),
    );

    return { participant, enrolments: detailed, passport, now };
}

export async function staffDashboard(scope: { cycleId?: string | null; cohortId?: string | null }) {
    const conditions: string[] = [];
    const args: (string | number)[] = [];

    if (scope.cycleId) {
        conditions.push("a.cycle_id = ?");
        args.push(scope.cycleId);
    }

    const applications = await db.execute({
        sql: `
            SELECT COUNT(*) AS c FROM step_applications a
            ${conditions.length ? `WHERE ${conditions.join(" AND ")} AND a.status IN ('submitted','under_review')` : "WHERE a.status IN ('submitted','under_review')"}
        `,
        args,
    });

    const evidenceConditions: string[] = ["ev.status = 'submitted'"];
    const evidenceArgs: (string | number)[] = [];
    if (scope.cycleId) {
        evidenceConditions.push("e.cycle_id = ?");
        evidenceArgs.push(scope.cycleId);
    }
    const evidence = await db.execute({
        sql: `
            SELECT COUNT(*) AS c
            FROM step_evidence ev
            LEFT JOIN step_learning_assignments la ON la.id = ev.assignment_id
            LEFT JOIN step_enrolments e ON e.id = la.enrolment_id
            WHERE ${evidenceConditions.join(" AND ")}
        `,
        args: evidenceArgs,
    });

    const overdue = await db.execute({
        sql: `
            SELECT COUNT(*) AS c
            FROM step_learning_assignments la
            JOIN step_enrolments e ON e.id = la.enrolment_id
            WHERE la.status IN ('assigned','in_progress')
              AND la.due_at IS NOT NULL AND la.due_at < unixepoch()
              ${scope.cycleId ? "AND e.cycle_id = ?" : ""}
        `,
        args: scope.cycleId ? [scope.cycleId] : [],
    });

    const candidates = await db.execute({
        sql: `
            SELECT COUNT(*) AS c
            FROM step_enrolments e
            WHERE e.status = 'enrolled'
              AND e.level != 'graduate'
              ${scope.cycleId ? "AND e.cycle_id = ?" : ""}
        `,
        args: scope.cycleId ? [scope.cycleId] : [],
    });

    return {
        applicationQueue: Number(applications.rows[0]?.c ?? 0),
        evidenceQueue: Number(evidence.rows[0]?.c ?? 0),
        overdueAssignments: Number(overdue.rows[0]?.c ?? 0),
        progressionCandidates: Number(candidates.rows[0]?.c ?? 0),
    };
}

export async function mentorDashboard(mentorUserId: string) {
    const [assigned, sessions, actions] = await Promise.all([
        listAssignedEnrolments(mentorUserId),
        listMentoringSessions(mentorUserId),
        listDevelopmentActionsForMentor(mentorUserId),
    ]);
    return {
        assigned,
        sessions,
        actions,
        now: Math.floor(Date.now() / 1000),
    };
}

export async function listStaffAssignments(): Promise<Record<string, unknown>[]> {
    const staff = await db.execute({
        sql: `
            SELECT sa.*, u.name AS staff_name, u.email AS staff_email
            FROM step_staff_assignments sa
            LEFT JOIN user u ON u.id = sa.user_id
            WHERE sa.active = TRUE
            ORDER BY sa.role ASC, u.name ASC
        `,
        args: [],
    });
    return staff.rows as unknown as Record<string, unknown>[];
}

export async function adminDashboard() {
    const cycles = await listCycles();
    const staff = await listStaffAssignments();
    const totals = await db.execute({
        sql: `
            SELECT
                (SELECT COUNT(*) FROM step_participants) AS participants,
                (SELECT COUNT(*) FROM step_enrolments WHERE status = 'enrolled') AS active_enrolments,
                (SELECT COUNT(*) FROM step_applications WHERE status = 'admitted') AS admitted,
                (SELECT COUNT(*) FROM step_passports WHERE status = 'verified') AS verified_passports
        `,
        args: [],
    });
    return {
        cycles,
        staff,
        totals: totals.rows[0] as unknown as Record<string, unknown>,
    };
}

/** Aggregate, non-identifying programme reporting (concept-note indicators). */
export async function stepReporting(): Promise<Record<string, unknown>> {
    const [reach, enrolled, byLevel, byCohort, delays, exits] = await Promise.all([
        db.execute({
            sql: `
                SELECT
                    COUNT(*) AS applications,
                    SUM(CASE WHEN status != 'draft' THEN 1 ELSE 0 END) AS submitted,
                    SUM(CASE WHEN status = 'admitted' THEN 1 ELSE 0 END) AS admitted,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
                FROM step_applications
            `,
            args: [],
        }),
        db.execute({
            sql: `SELECT COUNT(*) AS c FROM step_enrolments WHERE status = 'enrolled'`,
            args: [],
        }),
        db.execute({
            sql: `
                SELECT level, COUNT(*) AS c
                FROM step_enrolments
                WHERE status = 'enrolled'
                GROUP BY level
                ORDER BY level ASC
            `,
            args: [],
        }),
        db.execute({
            sql: `
                SELECT
                    cy.name AS cycle_name,
                    c.name AS cohort_name,
                    COUNT(e.id) AS enrolled,
                    SUM(CASE WHEN e.level = 'graduate' THEN 1 ELSE 0 END) AS graduates
                FROM step_cycle_cohorts cc
                JOIN step_cycles cy ON cy.id = cc.cycle_id
                JOIN step_cohorts c ON c.id = cc.cohort_id
                LEFT JOIN step_enrolments e ON e.cycle_cohort_id = cc.id AND e.status = 'enrolled'
                GROUP BY cc.id
                ORDER BY cy.created_at DESC, c.sort_order ASC
            `,
            args: [],
        }),
        db.execute({
            sql: `
                SELECT COUNT(*) AS c
                FROM step_learning_assignments la
                JOIN step_enrolments e ON e.id = la.enrolment_id
                WHERE la.status IN ('assigned', 'in_progress')
                  AND la.due_at IS NOT NULL AND la.due_at < unixepoch()
            `,
            args: [],
        }),
        db.execute({
            sql: `SELECT COUNT(*) AS c FROM step_enrolments WHERE status = 'withdrawn'`,
            args: [],
        }),
    ]);

    return {
        reach: reach.rows[0] as unknown as Record<string, unknown>,
        enrolled: Number(enrolled.rows[0]?.c ?? 0),
        byLevel: byLevel.rows as unknown as Record<string, unknown>[],
        byCohort: byCohort.rows as unknown as Record<string, unknown>[],
        overdueAssignments: Number(delays.rows[0]?.c ?? 0),
        exits: Number(exits.rows[0]?.c ?? 0),
    };
}

export async function progressionHistoryForEnrolment(enrolmentId: string) {
    const enrolment = await db.execute({
        sql: `SELECT participant_id FROM step_enrolments WHERE id = ?`,
        args: [enrolmentId],
    });
    const participantId = (enrolment.rows[0] as { participant_id?: string } | undefined)
        ?.participant_id;
    if (!participantId) return [];
    return listProgressionDecisions(participantId);
}

export async function passportForParticipant(participantId: string) {
    const passport = await getLatestPassport(participantId);
    const entries = passport ? await listPassportEntries(passport.id) : [];
    return { passport, entries };
}
