import { getStepAccessContext } from "@/lib/step/permissions";
import {
    countIntroductions,
    listEnrolledParticipants,
    listIntroductions,
    listProviders,
} from "@/db/queries/step/introductions";
import { IntroductionsManager } from "@/components/step/introductions-manager";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/partners/introductions",
        title: "Introductions",
        description: "Consented introductions to opportunity providers.",
    });
}

export default async function IntroductionsPage() {
    await getStepAccessContext(); // auth enforced by the layout

    const [providers, participants, introductions, total] = await Promise.all([
        listProviders(),
        listEnrolledParticipants(),
        listIntroductions({ limit: 100, offset: 0 }),
        countIntroductions(),
    ]);

    return (
        <div className="flex flex-col gap-4">
            <p className="text-[12px] text-brand-muted">
                {total} introduction{total === 1 ? "" : "s"} recorded. Participants
                consent before an introduction is made.
            </p>
            <IntroductionsManager
                providers={providers.map((p) => ({
                    id: p.id,
                    name: p.name,
                    contact_email: p.contact_email,
                }))}
                participants={participants.map((p) => ({
                    participant_id: String(p.participant_id),
                    participant_name: String(p.participant_name),
                }))}
                introductions={introductions.map((i) => ({
                    id: String(i.id),
                    participant_name: String(i.participant_name),
                    provider_name: String(i.provider_name),
                    status: String(i.status),
                    outcome_status: (i.outcome_status as string | null) ?? null,
                    outcome: (i.outcome as string | null) ?? null,
                    introduced_at: (i.introduced_at as number | null) ?? null,
                }))}
            />
        </div>
    );
}
