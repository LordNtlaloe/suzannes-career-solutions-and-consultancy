// lib/step/permissions.ts
//
// Server-only STEP access resolution. Resolves the signed-in user and loads
// their STEP identity, enrolments, staff role assignments (with cycle/cohort
// scope) and mentor assignments. Permission rules are pure and live in
// access-rules.ts; this file only supplies the data.
import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
    getActiveMentorAssignments,
    getActiveStaffAssignments,
    getEnrolmentsByUserId,
    getParticipantIdentity,
} from "@/db/queries/step/access";
import type { StepAccessContext } from "@/lib/step/access-rules";

export type StepSessionUser = {
    id: string;
    name?: string | null;
    email?: string | null;
};

export async function getStepSession(): Promise<StepSessionUser | null> {
    const session = await auth.api.getSession({ headers: await headers() });
    const user = session?.user;
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email };
}

export async function getStepAccessContext(): Promise<{
    user: StepSessionUser | null;
    context: StepAccessContext;
}> {
    const user = await getStepSession();
    if (!user) {
        return {
            user: null,
            context: {
                userId: "",
                participant: null,
                enrolments: [],
                staffAssignments: [],
                mentorAssignments: [],
            },
        };
    }

    const [participant, enrolments, staffAssignments, mentorAssignments] =
        await Promise.all([
            getParticipantIdentity(user.id),
            getEnrolmentsByUserId(user.id),
            getActiveStaffAssignments(user.id),
            getActiveMentorAssignments(user.id),
        ]);

    return {
        user,
        context: { userId: user.id, participant, enrolments, staffAssignments, mentorAssignments },
    };
}

export * from "@/lib/step/access-rules";
