"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
    createIntroductionAction,
    createProviderAction,
    markIntroductionMadeAction,
    recordIntroductionOutcomeAction,
} from "@/actions/step/introductions.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const inputClass =
    "h-9 rounded-0 border border-input bg-input/20 px-2 text-[12px] outline-none focus-visible:border-ring";

type Provider = { id: string; name: string; contact_email?: string | null };
type Participant = { participant_id: string; participant_name: string };
type Introduction = {
    id: string;
    participant_name: string;
    provider_name: string;
    status: string;
    outcome_status?: string | null;
    outcome?: string | null;
    introduced_at?: number | null;
};

export function IntroductionsManager({
    providers,
    participants,
    introductions,
}: {
    providers: Provider[];
    participants: Participant[];
    introductions: Introduction[];
}) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const [providerName, setProviderName] = useState("");
    const [providerEmail, setProviderEmail] = useState("");

    const [participantId, setParticipantId] = useState("");
    const [providerId, setProviderId] = useState("");

    const [outcomes, setOutcomes] = useState<Record<string, { status: string; text: string }>>({});

    function run(action: () => Promise<unknown>, done: string, reset?: () => void) {
        startTransition(async () => {
            try {
                await action();
                toast.success(done);
                reset?.();
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    function setOutcome(id: string, patch: Partial<{ status: string; text: string }>) {
        setOutcomes((prev) => {
            const existing = prev[id] ?? { status: "pending", text: "" };
            return { ...prev, [id]: { ...existing, ...patch } };
        });
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="flex flex-col gap-3 rounded-lg border border-line bg-card p-5">
                    <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                        New opportunity provider
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] font-semibold">Name</Label>
                        <input
                            value={providerName}
                            onChange={(e) => setProviderName(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] font-semibold">Contact email</Label>
                        <input
                            type="email"
                            value={providerEmail}
                            onChange={(e) => setProviderEmail(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        className="self-start"
                        disabled={pending || !providerName.trim()}
                        onClick={() =>
                            run(
                                () =>
                                    createProviderAction({
                                        name: providerName,
                                        contactEmail: providerEmail || undefined,
                                    }),
                                "Provider added",
                                () => {
                                    setProviderName("");
                                    setProviderEmail("");
                                },
                            )
                        }
                    >
                        <Plus className="mr-1.5 size-3.5" />
                        Add provider
                    </Button>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border border-line bg-card p-5">
                    <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                        New introduction
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] font-semibold">Participant</Label>
                        <select
                            value={participantId}
                            onChange={(e) => setParticipantId(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Select participant…</option>
                            {participants.map((p) => (
                                <option key={p.participant_id} value={p.participant_id}>
                                    {p.participant_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] font-semibold">Provider</Label>
                        <select
                            value={providerId}
                            onChange={(e) => setProviderId(e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Select provider…</option>
                            {providers.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        className="self-start"
                        disabled={pending || !participantId || !providerId}
                        onClick={() =>
                            run(
                                () =>
                                    createIntroductionAction({
                                        participantId,
                                        providerId,
                                    }),
                                "Introduction requested",
                                () => {
                                    setParticipantId("");
                                    setProviderId("");
                                },
                            )
                        }
                    >
                        Request introduction
                    </Button>
                </div>
            </div>

            {introductions.length === 0 ? (
                <p className="rounded-lg border border-line bg-light/60 p-8 text-center section-copy">
                    No introductions yet.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {introductions.map((i) => {
                        const o = outcomes[i.id] ?? { status: i.outcome_status ?? "pending", text: i.outcome ?? "" };
                        return (
                            <div
                                key={i.id}
                                className="flex flex-col gap-3 rounded-0 border border-line bg-card p-4"
                            >
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <p className="text-[14px] font-semibold">{i.participant_name}</p>
                                    <span className="text-[12px] text-brand-muted">→ {i.provider_name}</span>
                                    <span className="ml-auto rounded-full bg-blue/12 px-3 py-1 text-[11px] font-semibold text-blue-dark">
                                        {i.status}
                                    </span>
                                </div>

                                {i.status === "consented" && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="self-start"
                                        disabled={pending}
                                        onClick={() =>
                                            run(
                                                () => markIntroductionMadeAction({ introductionId: i.id }),
                                                "Marked as made",
                                            )
                                        }
                                    >
                                        Mark introduced
                                    </Button>
                                )}

                                {["made", "outcome_recorded"].includes(i.status) && (
                                    <div className="flex flex-wrap items-end gap-2">
                                        <div className="flex flex-col gap-1.5">
                                            <Label className="text-[11px] font-semibold">Outcome</Label>
                                            <select
                                                value={o.status}
                                                onChange={(e) => setOutcome(i.id, { status: e.target.value })}
                                                className={inputClass}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="interview">Interview</option>
                                                <option value="hired">Hired</option>
                                                <option value="declined">Declined</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-1 flex-col gap-1.5">
                                            <Label className="text-[11px] font-semibold">Note (optional)</Label>
                                            <input
                                                value={o.text}
                                                onChange={(e) => setOutcome(i.id, { text: e.target.value })}
                                                className={inputClass}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={pending}
                                            onClick={() =>
                                                run(
                                                    () =>
                                                        recordIntroductionOutcomeAction({
                                                            introductionId: i.id,
                                                            outcomeStatus: o.status,
                                                            outcome: o.text || undefined,
                                                        }),
                                                    "Outcome recorded",
                                                )
                                            }
                                        >
                                            Save outcome
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
