"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import {
    canManageEnrolments,
    canMentor,
    mentorCanAccessEnrolment,
} from "@/lib/step/access-rules";
import { requireAccess } from "@/actions/step/helpers";
import { attendanceSchema, developmentActionSchema } from "@/lib/step/validation";
import { getEnrolmentById } from "@/db/queries/step/enrolments";
import {
    createDevelopmentAction,
    getSessionForMentor,
    recordAttendance,
} from "@/db/queries/step/mentoring";

export async function createDevelopmentActionAction(data: {
    enrolmentId: string;
    title: string;
    dueAt?: number | null;
}) {
    const { userId, context } = await requireAccess();

    const { error, value } = developmentActionSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    const isAssignedMentor =
        canMentor(context) && mentorCanAccessEnrolment(context, value.enrolmentId);
    const enrolment = await getEnrolmentById(value.enrolmentId);
    const isScopedStaff =
        !!enrolment &&
        canManageEnrolments(context, {
            cycleId: enrolment.cycle_id,
            cohortId: enrolment.cycle_cohort_id,
        });

    if (!isAssignedMentor && !isScopedStaff) {
        throw new Error("You cannot create development actions for this enrolment.");
    }

    await createDevelopmentAction({
        id: `step_dev_${randomUUID()}`,
        enrolmentId: value.enrolmentId,
        title: value.title,
        dueAt: value.dueAt ?? null,
        createdBy: userId,
    });

    revalidatePath("/step/dashboard");
    return { ok: true };
}

export async function recordAttendanceAction(data: {
    sessionId: string;
    enrolmentId: string;
    attended: boolean;
    feedback?: string | null;
}) {
    const { userId, context } = await requireAccess();
    if (!canMentor(context)) throw new Error("You are not a STEP mentor.");

    const { error, value } = attendanceSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    // The session must belong to this mentor and the enrolment must be assigned
    // to them — never trust the browser-supplied enrolment id alone.
    const session = await getSessionForMentor(value.sessionId, userId);
    if (!session) throw new Error("Session not found or not yours.");

    const assigned = mentorCanAccessEnrolment(context, value.enrolmentId);
    if (!assigned) throw new Error("This participant is not assigned to you.");

    await recordAttendance({
        id: `step_att_${randomUUID()}`,
        sessionId: value.sessionId,
        enrolmentId: value.enrolmentId,
        attended: value.attended,
        feedback: value.feedback ?? null,
    });

    revalidatePath("/step/dashboard");
    return { ok: true };
}
