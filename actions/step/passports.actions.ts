"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import { canVerifyPassport } from "@/lib/step/access-rules";
import type { StepAccessContext } from "@/lib/step/access-rules";
import { requireAccess } from "@/actions/step/helpers";
import { passportShareSchema } from "@/lib/step/validation";
import {
    addPassportEntry,
    createPassport,
    createPassportShare,
    getLatestPassport,
    getPassportById,
    getPassportShareById,
    revokePassportShare,
    verifyPassport,
} from "@/db/queries/step/passports";

export async function verifyPassportAction(data: { participantId: string }) {
    const { userId, context } = await requireAccess();
    if (!canVerifyPassport(context)) throw new Error("You cannot verify passports.");

    let passport = await getLatestPassport(data.participantId);
    if (!passport) {
        await createPassport({
            id: `step_passport_${randomUUID()}`,
            participantId: data.participantId,
            version: 1,
        });
        passport = await getLatestPassport(data.participantId);
    }
    if (!passport) throw new Error("Failed to create passport.");

    await verifyPassport(passport.id, userId);
    revalidatePath("/step/dashboard");
    return { ok: true };
}

/**
 * Whether the signed-in user may share a given passport:
 * staff with passport rights, or the passport's own participant (self-service,
 * limited shares only).
 */
async function maySharePassport(
    context: StepAccessContext,
    passportId: string,
): Promise<{ allowed: boolean; limitedOnly: boolean }> {
    if (canVerifyPassport(context)) return { allowed: true, limitedOnly: false };
    const passport = await getPassportById(passportId);
    if (
        passport &&
        context.participant?.id === passport.participant_id &&
        passport.status === "verified"
    ) {
        return { allowed: true, limitedOnly: true };
    }
    return { allowed: false, limitedOnly: true };
}

export async function createPassportShareAction(data: {
    passportId: string;
    scope?: string;
    fields?: string[];
    expiresAt?: number | null;
}) {
    const { context } = await requireAccess();
    const { allowed, limitedOnly } = await maySharePassport(context, data.passportId);
    if (!allowed) throw new Error("You cannot share this passport.");

    const { error, value } = passportShareSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    // Participants may only create limited shares; staff may create full ones.
    if (limitedOnly && value.scope === "full") {
        throw new Error("You can only create limited shares.");
    }
    if (value.expiresAt && value.expiresAt <= Math.floor(Date.now() / 1000)) {
        throw new Error("Expiry must be in the future.");
    }

    const token = randomUUID();
    await createPassportShare({
        id: `step_share_${randomUUID()}`,
        passportId: data.passportId,
        token,
        scope: value.scope,
        fields: value.fields && value.fields.length > 0 ? JSON.stringify(value.fields) : null,
        expiresAt: value.expiresAt ?? null,
    });
    revalidatePath("/step/dashboard");
    return { token };
}

export async function revokePassportShareAction(data: { shareId: string }) {
    const { context } = await requireAccess();
    const share = await getPassportShareById(data.shareId);
    if (!share) throw new Error("Share not found.");

    const { allowed } = await maySharePassport(context, share.passport_id);
    if (!allowed) throw new Error("You cannot manage passport shares.");

    await revokePassportShare(data.shareId);
    revalidatePath("/step/dashboard");
    return { ok: true };
}

export async function addPassportEntryAction(data: {
    passportId: string;
    enrolmentId?: string | null;
    entryType: string;
    title: string;
    sourceType: string;
    sourceId: string;
}) {
    const { userId, context } = await requireAccess();
    if (!canVerifyPassport(context)) throw new Error("You cannot verify passport entries.");

    await addPassportEntry({
        id: `step_entry_${randomUUID()}`,
        passportId: data.passportId,
        enrolmentId: data.enrolmentId ?? null,
        entryType: data.entryType,
        title: data.title,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        verifiedBy: userId,
    });

    revalidatePath("/step/dashboard");
    return { ok: true };
}
