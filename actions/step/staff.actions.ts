"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import {
    canAdministerStaff,
    canManageCycles,
} from "@/lib/step/access-rules";
import { requireAccess } from "@/actions/step/helpers";
import { cycleSchema, staffAssignmentSchema } from "@/lib/step/validation";
import { database } from "@/db/database";
import { createCycle } from "@/db/queries/step/cycles";

export async function assignStaffAction(data: {
    userId: string;
    role: string;
    cycleId?: string | null;
    cycleCohortId?: string | null;
}) {
    const { context } = await requireAccess();
    if (!canAdministerStaff(context)) throw new Error("Only programme admins can manage staff.");

    const { error, value } = staffAssignmentSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await database.execute({
        sql: `
            INSERT INTO step_staff_assignments (id, user_id, role, cycle_id, cycle_cohort_id, active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, TRUE, unixepoch(), unixepoch())
            ON CONFLICT(user_id, role, cycle_id, cycle_cohort_id) DO UPDATE SET active = TRUE, updated_at = unixepoch()
        `,
        args: [
            `step_staff_role_${randomUUID()}`,
            value.userId,
            value.role,
            value.cycleId || null,
            value.cycleCohortId || null,
        ],
    });

    revalidatePath("/step/admin");
    return { ok: true };
}

export async function createCycleAction(data: {
    slug: string;
    name: string;
    cohortSize?: number | null;
    startsAt?: number | null;
    endsAt?: number | null;
}) {
    const { context } = await requireAccess();
    if (!canManageCycles(context)) throw new Error("Only programme admins can create cycles.");

    const { error, value } = cycleSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await createCycle({
        id: `cycle_${randomUUID()}`,
        slug: value.slug,
        name: value.name,
        cohortSize: value.cohortSize ?? null,
        startsAt: value.startsAt ?? null,
        endsAt: value.endsAt ?? null,
    });

    revalidatePath("/step/admin");
    return { ok: true };
}
