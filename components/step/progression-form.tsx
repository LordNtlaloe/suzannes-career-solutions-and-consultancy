"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { recordProgressionAction } from "@/actions/step/progression.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PARTICIPANT_LEVELS } from "@/lib/step/constants";

export function ProgressionForm({
    enrolmentId,
    currentLevel,
}: {
    enrolmentId: string;
    currentLevel: string;
}) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [toLevel, setToLevel] = useState("");
    const [overrideReason, setOverrideReason] = useState("");

    function submit(decision: "approved" | "override") {
        setError(null);
        startTransition(async () => {
            try {
                await recordProgressionAction({
                    enrolmentId,
                    toLevel,
                    decision,
                    overrideReason: overrideReason || undefined,
                });
                toast.success("Progression recorded");
                router.refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    return (
        <div className="flex flex-col gap-3 rounded-0 border border-line bg-light/60 p-4">
            <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold">Advance to level</Label>
                <select
                    value={toLevel}
                    onChange={(e) => setToLevel(e.target.value)}
                    className="h-9 rounded-0 border border-input bg-input/20 px-2 text-[12px] outline-none"
                >
                    <option value="">Select level…</option>
                    {PARTICIPANT_LEVELS.filter(
                        (l) => l.value !== currentLevel,
                    ).map((l) => (
                        <option key={l.value} value={l.value}>
                            {l.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold">
                    Override reason{" "}
                    <span className="font-normal text-brand-muted">(required for override)</span>
                </Label>
                <Textarea
                    rows={2}
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Why is the requirement being waived?"
                    className="rounded-0 border border-input bg-input/20 px-2 py-1.5 text-[12px] outline-none"
                />
            </div>

            {error && (
                <p className="rounded-0 border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-[11px] text-destructive">
                    {error}
                </p>
            )}

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    size="sm"
                    disabled={pending || !toLevel}
                    onClick={() => submit("approved")}
                >
                    Approve
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending || !toLevel}
                    onClick={() => submit("override")}
                >
                    Override
                </Button>
            </div>
        </div>
    );
}
