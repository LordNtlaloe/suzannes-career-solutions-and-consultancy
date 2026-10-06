"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    submitComplaintAction,
    submitSafeguardingReportAction,
} from "@/actions/step/safeguarding.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const inputClass =
    "h-9 rounded-md border border-input bg-input/20 px-2 text-[12px] outline-none focus-visible:border-ring";

export function SafeguardingSubmit() {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [kind, setKind] = useState<"complaint" | "safeguarding">("complaint");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [riskLevel, setRiskLevel] = useState("medium");

    function submit() {
        startTransition(async () => {
            try {
                if (kind === "complaint") {
                    await submitComplaintAction({ subject, body: body || undefined });
                } else {
                    await submitSafeguardingReportAction({
                        subject,
                        body: body || undefined,
                        riskLevel,
                    });
                }
                toast.success("Submitted. A programme administrator will review it.");
                setSubject("");
                setBody("");
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-card p-5">
            <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold">Type</Label>
                <select
                    value={kind}
                    onChange={(e) => setKind(e.target.value as "complaint" | "safeguarding")}
                    className={inputClass}
                >
                    <option value="complaint">Complaint</option>
                    <option value="safeguarding">Safeguarding concern</option>
                </select>
            </div>

            {kind === "safeguarding" && (
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-semibold">Risk level</Label>
                    <select
                        value={riskLevel}
                        onChange={(e) => setRiskLevel(e.target.value)}
                        className={inputClass}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
            )}

            <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold">Subject</Label>
                <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={inputClass}
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold">Details</Label>
                <Textarea
                    rows={3}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="rounded-md border border-input bg-input/20 px-2 py-1.5 text-[12px] outline-none"
                />
            </div>

            <Button
                type="button"
                size="sm"
                className="self-start"
                disabled={pending || !subject.trim()}
                onClick={submit}
            >
                Submit
            </Button>
        </div>
    );
}
