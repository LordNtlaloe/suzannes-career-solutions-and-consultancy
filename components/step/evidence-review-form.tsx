"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { reviewEvidenceAction } from "@/actions/step/evidence.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EvidenceReviewForm({ evidenceId }: { evidenceId: string }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState("");

    function run(decision: "accepted" | "rejected" | "changes_requested") {
        setError(null);
        startTransition(async () => {
            try {
                await reviewEvidenceAction({ evidenceId, decision, feedback: feedback || undefined });
                toast.success(
                    decision === "accepted"
                        ? "Evidence accepted"
                        : decision === "rejected"
                          ? "Evidence rejected"
                          : "Changes requested",
                );
                router.refresh();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    return (
        <div className="flex flex-col gap-4 rounded-lg border border-line bg-card p-6">
            <h3 className="text-[15px] font-semibold">Review decision</h3>

            <div className="flex flex-col gap-1.5">
                <Label className="text-[12px] font-semibold">Feedback to participant</Label>
                <Textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="What should change, or why was this accepted?"
                    className="rounded-0 border border-input bg-input/20 px-3 py-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
            </div>

            {error && (
                <p className="rounded-0 border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                    {error}
                </p>
            )}

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    disabled={pending}
                    onClick={() => run("accepted")}
                >
                    Accept
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => run("changes_requested")}
                >
                    Request changes
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    disabled={pending}
                    onClick={() => run("rejected")}
                >
                    Reject
                </Button>
            </div>
        </div>
    );
}
