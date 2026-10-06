// db/queries/step/cycles.ts
import "server-only";

import { database as db } from "@/db/database";
import type { StepCohort, StepCycle } from "@/types/step";

export async function getStepCohorts(): Promise<StepCohort[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_cohorts WHERE active = TRUE ORDER BY sort_order ASC`,
        args: [],
    });
    return result.rows as unknown as StepCohort[];
}

export async function getStepCohortById(id: string): Promise<StepCohort | null> {
    const result = await db.execute({
        sql: `SELECT * FROM step_cohorts WHERE id = ?`,
        args: [id],
    });
    return (result.rows[0] as unknown as StepCohort | undefined) ?? null;
}

export async function getOpenCycles(): Promise<StepCycle[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_cycles WHERE status = 'open' ORDER BY created_at ASC`,
        args: [],
    });
    return result.rows as unknown as StepCycle[];
}

export async function getCycleById(id: string): Promise<StepCycle | null> {
    const result = await db.execute({
        sql: `SELECT * FROM step_cycles WHERE id = ?`,
        args: [id],
    });
    return (result.rows[0] as unknown as StepCycle | undefined) ?? null;
}

export async function listCycles(): Promise<StepCycle[]> {
    const result = await db.execute({
        sql: `SELECT * FROM step_cycles ORDER BY created_at DESC`,
        args: [],
    });
    return result.rows as unknown as StepCycle[];
}

/** Cycle cohorts with their capacity and current enrolled count (C1). */
export async function listCycleCohorts(): Promise<Record<string, unknown>[]> {
    const result = await db.execute({
        sql: `
            SELECT
                cc.id, cc.cycle_id, cc.cohort_id, cc.capacity, cc.status,
                cy.name AS cycle_name, cy.cohort_size AS cycle_cohort_size,
                c.name AS cohort_name,
                (SELECT COUNT(*) FROM step_enrolments e
                 WHERE e.cycle_cohort_id = cc.id AND e.status != 'withdrawn') AS enrolled_count
            FROM step_cycle_cohorts cc
            JOIN step_cycles cy ON cy.id = cc.cycle_id
            JOIN step_cohorts c ON c.id = cc.cohort_id
            ORDER BY cy.created_at DESC, c.sort_order ASC
        `,
        args: [],
    });
    return result.rows as unknown as Record<string, unknown>[];
}

export async function createCycle(input: {
    id: string;
    slug: string;
    name: string;
    cohortSize: number | null;
    startsAt: number | null;
    endsAt: number | null;
}): Promise<void> {
    await db.execute({
        sql: `
            INSERT INTO step_cycles (id, slug, name, cohort_size, starts_at, ends_at, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, 'draft', unixepoch(), unixepoch())
        `,
        args: [input.id, input.slug, input.name, input.cohortSize, input.startsAt, input.endsAt],
    });
}

export async function setCycleStatus(id: string, status: string): Promise<void> {
    await db.execute({
        sql: `UPDATE step_cycles SET status = ?, updated_at = unixepoch() WHERE id = ?`,
        args: [status, id],
    });
}
