// actions/step/helpers.ts
//
// Shared server-side helpers for STEP server actions. This file is NOT a
// "use server" module — it is imported by the per-domain action files and only
// ever runs on the server.
import "server-only";

import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { getStepAccessContext } from "@/lib/step/permissions";
import type { StepAccessContext } from "@/lib/step/access-rules";
import { getCycleById, getOpenCycles } from "@/db/queries/step/cycles";
import {
    getLatestNoticeVersion,
    recordConsent,
} from "@/db/queries/step/applications";

export async function getSession() {
    return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
    const session = await getSession();
    if (!session?.user) throw new Error("You must be signed in.");
    return session;
}

/** Resolve the signed-in user and their STEP access context, or throw. */
export async function requireAccess(): Promise<{
    userId: string;
    context: StepAccessContext;
}> {
    const { user, context } = await getStepAccessContext();
    if (!user) throw new Error("You must be signed in.");
    return { userId: user.id, context };
}

export async function resolveCycle(cycleId?: string | null): Promise<string> {
    if (cycleId) {
        const cycle = await getCycleById(cycleId);
        if (!cycle) throw new Error("Selected intake cycle no longer exists.");
        return cycle.id;
    }
    const open = await getOpenCycles();
    if (open.length === 0) throw new Error("No intake cycle is currently open.");
    return open[0].id;
}

/** Record the three application consents as grant events under the current notice version. */
export async function recordApplicationConsents(userId: string): Promise<void> {
    for (const scope of ["contact", "data", "programme"] as const) {
        const noticeVersion = Math.max(1, await getLatestNoticeVersion(userId, scope));
        await recordConsent({
            id: `step_consent_${randomUUID()}`,
            userId,
            scope,
            noticeVersion,
            action: "grant",
            recordedBy: userId,
        });
    }
}
