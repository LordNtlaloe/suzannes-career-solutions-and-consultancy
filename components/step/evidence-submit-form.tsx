"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { submitEvidenceAction } from "@/actions/step/evidence.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EvidenceSubmitForm({ assignmentId }: { assignmentId: string }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                await submitEvidenceAction({
                    assignmentId,
                    kind: String(formData.get("kind") ?? "text"),
                    title: String(formData.get("title") ?? ""),
                    body: String(formData.get("body") ?? ""),
                });
                toast.success("Evidence submitted");
                router.refresh();
                e.currentTarget.reset();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    const inputClass =
        "h-9 rounded-md border border-input bg-input/20 px-3 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-line bg-card p-6">
            <h3 className="text-[15px] font-semibold">Submit evidence</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="kind" className="text-[12px] font-semibold">Type</Label>
                    <select id="kind" name="kind" defaultValue="text" className={inputClass}>
                        <option value="text">Written reflection</option>
                        <option value="link">Link</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="title" className="text-[12px] font-semibold">Title</Label>
                    <input
                        id="title"
                        name="title"
                        required
                        className={inputClass}
                        placeholder="What are you submitting?"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="body" className="text-[12px] font-semibold">
                    Content or link
                </Label>
                <Textarea
                    id="body"
                    name="body"
                    rows={4}
                    required
                    placeholder="Describe your work, or paste a link to it."
                    className="rounded-md border border-input bg-input/20 px-3 py-2 text-[13px] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
            </div>

            {error && (
                <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                    {error}
                </p>
            )}

            <Button type="submit" disabled={pending} className="h-10 w-full text-[13px]">
                {pending ? "Submitting…" : "Submit evidence"}
            </Button>
        </form>
    );
}
