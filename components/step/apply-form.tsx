"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    saveDraftApplicationAction,
    submitApplicationAction,
} from "@/actions/step/applications.actions";
import { useStepPath } from "@/components/step/step-path-provider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PATHWAYS, PARTICIPANT_GROUPS } from "@/lib/step/constants";
import type { StepCohort, StepCycle } from "@/types/step";

type DraftValues = {
    cycleId: string | null;
    cohortId: string | null;
    pathway: string;
    participantGroup: string;
    goals: string | null;
    baseline: string | null;
};

type ApplyFormProps = {
    cohorts: StepCohort[];
    cycles: StepCycle[];
    draft: DraftValues | null;
};

function formValues(form: HTMLFormElement) {
    const formData = new FormData(form);
    return {
        cycleId: (formData.get("cycleId") as string) || null,
        cohortId: (formData.get("cohortId") as string) || null,
        pathway: formData.get("pathway") as string,
        participantGroup: formData.get("participantGroup") as string,
        goals: (formData.get("goals") as string) || "",
        baseline: (formData.get("baseline") as string) || "",
    };
}

export function ApplyForm({ cohorts, cycles, draft }: ApplyFormProps) {
    const { path } = useStepPath();
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const [pending, startTransition] = useTransition();
    const [saving, startSaving] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [consent, setConsent] = useState({
        contact: false,
        data: false,
        programme: false,
    });

    const defaultCycle = draft?.cycleId ?? cycles[0]?.id ?? "";

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
            try {
                await submitApplicationAction({
                    ...formValues(e.currentTarget),
                    consentContact: consent.contact,
                    consentData: consent.data,
                    consentProgramme: consent.programme,
                });
                toast.success("Application submitted");
                router.push(path("/dashboard"));
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Something went wrong";
                setError(message);
                toast.error(message);
            }
        });
    }

    function handleSaveDraft() {
        if (!formRef.current) return;
        setError(null);
        startSaving(async () => {
            try {
                await saveDraftApplicationAction(formValues(formRef.current!));
                toast.success("Draft saved");
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Something went wrong";
                setError(message);
                toast.error(message);
            }
        });
    }

    const inputClass =
        "h-10 rounded-md border border-input bg-input/20 px-3 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
            {cycles.length > 0 && (
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="cycleId" className="text-[12px] font-semibold">
                        Intake cycle
                    </Label>
                    <select
                        id="cycleId"
                        name="cycleId"
                        defaultValue={defaultCycle}
                        className={inputClass}
                    >
                        {cycles.map((cycle) => (
                            <option key={cycle.id} value={cycle.id}>
                                {cycle.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="participantGroup" className="text-[12px] font-semibold">
                        Participant group
                    </Label>
                    <select
                        id="participantGroup"
                        name="participantGroup"
                        required
                        defaultValue={draft?.participantGroup ?? ""}
                        className={inputClass}
                    >
                        <option value="" disabled>
                            Select a group
                        </option>
                        {PARTICIPANT_GROUPS.map((group) => (
                            <option key={group.value} value={group.value}>
                                {group.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pathway" className="text-[12px] font-semibold">
                        Pathway
                    </Label>
                    <select
                        id="pathway"
                        name="pathway"
                        required
                        defaultValue={draft?.pathway ?? "employment"}
                        className={inputClass}
                    >
                        {PATHWAYS.map((p) => (
                            <option key={p.value} value={p.value}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="cohortId" className="text-[12px] font-semibold">
                    Preferred industry cohort
                </Label>
                <select
                    id="cohortId"
                    name="cohortId"
                    defaultValue={draft?.cohortId ?? ""}
                    className={inputClass}
                >
                    <option value="">No preference yet</option>
                    {cohorts.map((cohort) => (
                        <option key={cohort.id} value={cohort.id}>
                            {cohort.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="goals" className="text-[12px] font-semibold">
                    Career or enterprise goals
                </Label>
                <Textarea
                    id="goals"
                    name="goals"
                    rows={3}
                    defaultValue={draft?.goals ?? ""}
                    placeholder="What are you working towards over the next six months?"
                    className="rounded-md border border-input bg-input/20 px-3 py-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="baseline" className="text-[12px] font-semibold">
                    Where you are today
                </Label>
                <Textarea
                    id="baseline"
                    name="baseline"
                    rows={3}
                    defaultValue={draft?.baseline ?? ""}
                    placeholder="Briefly describe your current situation, experience or stage."
                    className="rounded-md border border-input bg-input/20 px-3 py-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-line bg-light/60 p-4">
                <p className="text-[12px] font-semibold">
                    Consent <span className="font-normal text-brand-muted">(required to submit)</span>
                </p>
                {(
                    [
                        ["contact", "Contact me about my application."],
                        ["data", "Process my application data for the programme."],
                        ["programme", "I commit to the six-month programme if admitted."],
                    ] as const
                ).map(([key, text]) => (
                    <label
                        key={key}
                        className="flex cursor-pointer items-start gap-2.5 text-[13px] text-brand"
                    >
                        <Checkbox
                            checked={consent[key]}
                            onCheckedChange={(checked) =>
                                setConsent((c) => ({ ...c, [key]: checked === true }))
                            }
                            className="mt-0.5"
                        />
                        <span>{text}</span>
                    </label>
                ))}
                <p className="text-[11px] leading-relaxed text-brand-muted">
                    You can withdraw consent anytime.{" "}
                    <a
                        href={path("/privacy")}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-dark underline-offset-2 hover:underline"
                    >
                        Read the full privacy notice
                    </a>
                    .
                </p>
            </div>

            {error && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                    {error}
                </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                    type="button"
                    variant="outline"
                    disabled={saving || pending}
                    onClick={handleSaveDraft}
                    className="h-10 flex-1 text-[13px]"
                >
                    {saving ? "Saving…" : "Save draft"}
                </Button>
                <Button type="submit" disabled={pending} className="h-10 flex-1 text-[13px]">
                    {pending ? "Submitting…" : "Submit application"}
                </Button>
            </div>
        </form>
    );
}
