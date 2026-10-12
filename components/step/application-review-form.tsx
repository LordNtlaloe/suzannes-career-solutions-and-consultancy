"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { reviewApplicationAction } from "@/actions/step/applications.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ApplicationReviewForm({ applicationId }: { applicationId: string }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [reviewNote, setReviewNote] = useState("");
    const [feedback, setFeedback] = useState("");

    function run(status: "under_review" | "admitted" | "rejected") {
        setError(null);
        startTransition(async () => {
            try {
                await reviewApplicationAction({
                    applicationId,
                    status,
                    reviewNote: reviewNote || undefined,
                    feedback: feedback || undefined,
                });
                toast.success(
                    status === "admitted"
                        ? "Application admitted"
                        : status === "rejected"
                          ? "Application rejected"
                          : "Moved to under review",
                );
                router.refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    const textareaClass =
        "rounded-0 border border-input bg-input/20 px-3 py-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

    return (
        <div className="flex flex-col gap-4 rounded-lg border border-line bg-card p-6">
            <h3 className="text-[15px] font-semibold">Decision</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[12px] font-semibold">
                        Private review note{" "}
                        <span className="font-normal text-brand-muted">(staff only)</span>
                    </Label>
                    <Textarea
                        rows={3}
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Internal notes…"
                        className={textareaClass}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[12px] font-semibold">
                        Feedback to applicant{" "}
                        <span className="font-normal text-brand-muted">(visible to them)</span>
                    </Label>
                    <Textarea
                        rows={3}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Feedback the participant can see…"
                        className={textareaClass}
                    />
                </div>
            </div>

            {error && (
                <p className="rounded-0 border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                    {error}
                </p>
            )}

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => run("under_review")}
                >
                    Mark under review
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    disabled={pending}
                    onClick={() => run("rejected")}
                >
                    Reject
                </Button>
                <Button
                    type="button"
                    disabled={pending}
                    onClick={() => run("admitted")}
                >
                    {pending ? "Working…" : "Admit applicant"}
                </Button>
            </div>
        </div>
    );
}
