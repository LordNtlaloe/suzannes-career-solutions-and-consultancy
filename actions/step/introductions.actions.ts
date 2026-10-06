"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

import {
    canManageIntroductions,
    participantCanAccessIntroduction,
} from "@/lib/step/access-rules";
import { requireAccess } from "@/actions/step/helpers";
import {
    introductionOutcomeSchema,
    introductionSchema,
    providerSchema,
} from "@/lib/step/validation";
import {
    createIntroduction,
    createProvider,
    getIntroductionById,
    markIntroductionMade,
    recordIntroductionConsent,
    recordIntroductionOutcome,
} from "@/db/queries/step/introductions";

export async function createProviderAction(data: {
    name: string;
    contactEmail?: string | null;
    partnerId?: string | null;
}) {
    const { context } = await requireAccess();
    if (!canManageIntroductions(context)) throw new Error("You cannot manage providers.");

    const { error, value } = providerSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await createProvider({
        id: `step_provider_${randomUUID()}`,
        name: value.name,
        contactEmail: value.contactEmail || null,
        partnerId: value.partnerId || null,
    });

    revalidatePath("/step/partners");
    return { ok: true };
}

export async function createIntroductionAction(data: {
    participantId: string;
    providerId: string;
}) {
    const { userId, context } = await requireAccess();
    if (!canManageIntroductions(context)) throw new Error("You cannot create introductions.");

    const { error, value } = introductionSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await createIntroduction({
        id: `step_intro_${randomUUID()}`,
        participantId: value.participantId,
        providerId: value.providerId,
        createdBy: userId,
    });

    revalidatePath("/step/partners");
    return { ok: true };
}

/** A participant consents to (or declines) an introduction made for them. */
export async function consentIntroductionAction(data: {
    introductionId: string;
    consent: boolean;
}) {
    const { context } = await requireAccess();

    const introduction = await getIntroductionById(data.introductionId);
    if (!introduction) throw new Error("Introduction not found.");

    if (!participantCanAccessIntroduction(context, introduction.participant_id)) {
        throw new Error("You cannot consent to this introduction.");
    }

    await recordIntroductionConsent({
        introductionId: introduction.id,
        consented: data.consent,
    });

    revalidatePath("/step/dashboard");
    revalidatePath("/step/partners");
    return { ok: true };
}

export async function markIntroductionMadeAction(data: { introductionId: string }) {
    const { context } = await requireAccess();
    if (!canManageIntroductions(context)) throw new Error("You cannot manage introductions.");

    await markIntroductionMade(data.introductionId);
    revalidatePath("/step/partners");
    return { ok: true };
}

export async function recordIntroductionOutcomeAction(data: {
    introductionId: string;
    outcomeStatus: string;
    outcome?: string | null;
}) {
    const { context } = await requireAccess();
    if (!canManageIntroductions(context)) throw new Error("You cannot manage introductions.");

    const { error, value } = introductionOutcomeSchema.validate(data);
    if (error) throw new Error(error.details[0].message);

    await recordIntroductionOutcome({
        introductionId: value.introductionId,
        outcomeStatus: value.outcomeStatus,
        outcome: value.outcome || null,
    });

    revalidatePath("/step/partners");
    return { ok: true };
}
