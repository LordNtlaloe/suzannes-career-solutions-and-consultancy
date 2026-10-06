"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createPartnerAction } from "@/actions/step/partners.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const inputClass =
    "h-9 rounded-md border border-input bg-input/20 px-2 text-[12px] outline-none focus-visible:border-ring";

export function PartnerForm() {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [areas, setAreas] = useState("");

    function submit() {
        startTransition(async () => {
            try {
                await createPartnerAction({
                    name,
                    contactEmail: contactEmail || undefined,
                    website: website || undefined,
                    contributionAreas: areas
                        ? areas.split(",").map((a) => a.trim()).filter(Boolean)
                        : null,
                });
                toast.success("Partner recorded (awaiting approval)");
                setName("");
                setContactEmail("");
                setWebsite("");
                setAreas("");
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-line bg-card p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                New partner
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-semibold">Name</Label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Partner organisation"
                        className={inputClass}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-semibold">Contact email</Label>
                    <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={inputClass}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-semibold">Website</Label>
                    <input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://…"
                        className={inputClass}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-[11px] font-semibold">
                        Contribution areas{" "}
                        <span className="font-normal text-brand-muted">(comma separated)</span>
                    </Label>
                    <input
                        value={areas}
                        onChange={(e) => setAreas(e.target.value)}
                        placeholder="learning, mentoring"
                        className={inputClass}
                    />
                </div>
            </div>
            <Button
                type="button"
                size="sm"
                className="self-start"
                disabled={pending || !name.trim()}
                onClick={submit}
            >
                <Plus className="mr-1.5 size-3.5" />
                Add partner
            </Button>
        </div>
    );
}
