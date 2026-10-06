"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createDevelopmentActionAction } from "@/actions/step/mentoring.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Assigned = {
    id: string;
    participant_name: string;
};

export function DevelopmentActionForm({ assigned }: { assigned: Assigned[] }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [enrolmentId, setEnrolmentId] = useState("");
    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");

    function submit() {
        startTransition(async () => {
            try {
                await createDevelopmentActionAction({
                    enrolmentId,
                    title,
                    dueAt: dueDate ? Math.floor(new Date(dueDate).getTime() / 1000) : null,
                });
                toast.success("Development action created");
                setTitle("");
                setDueDate("");
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    return (
        <div className="flex flex-col gap-3 rounded-md border border-line bg-card p-4">
            <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                New development action
            </p>

            <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold">Participant</Label>
                <select
                    value={enrolmentId}
                    onChange={(e) => setEnrolmentId(e.target.value)}
                    className="h-9 rounded-md border border-input bg-input/20 px-2 text-[12px] outline-none"
                >
                    <option value="">Select participant…</option>
                    {assigned.map((a) => (
                        <option key={a.id} value={a.id}>
                            {a.participant_name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold">Action</Label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Review CV and share feedback"
                    className="h-9 rounded-md border border-input bg-input/20 px-2 text-[12px] outline-none"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <Label className="text-[11px] font-semibold">Due date (optional)</Label>
                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-9 rounded-md border border-input bg-input/20 px-2 text-[12px] outline-none"
                />
            </div>

            <Button
                type="button"
                size="sm"
                className="self-start"
                disabled={pending || !enrolmentId || !title.trim()}
                onClick={submit}
            >
                <Plus className="mr-1.5 size-3.5" />
                Add action
            </Button>
        </div>
    );
}
