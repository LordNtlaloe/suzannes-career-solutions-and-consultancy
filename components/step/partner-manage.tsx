"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    approvePartnerAction,
    createAgreementAction,
    createContributionAction,
} from "@/actions/step/partners.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const inputClass =
    "h-9 rounded-0 border border-input bg-input/20 px-2 text-[12px] outline-none focus-visible:border-ring";

export function PartnerManage({ partnerId }: { partnerId: string }) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [agreementTitle, setAgreementTitle] = useState("");
    const [area, setArea] = useState("learning");
    const [description, setDescription] = useState("");

    function approve() {
        startTransition(async () => {
            try {
                await approvePartnerAction({ partnerId });
                toast.success("Partner approved");
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    function addAgreement() {
        startTransition(async () => {
            try {
                await createAgreementAction({ partnerId, title: agreementTitle });
                toast.success("Agreement recorded");
                setAgreementTitle("");
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    function addContribution() {
        startTransition(async () => {
            try {
                await createContributionAction({
                    partnerId,
                    area,
                    description: description || undefined,
                });
                toast.success("Contribution recorded");
                setDescription("");
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <Button type="button" size="sm" disabled={pending} onClick={approve}>
                    Approve (records written approval)
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="flex flex-col gap-3 rounded-lg border border-line bg-card p-5">
                    <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                        Agreement
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] font-semibold">Title</Label>
                        <input
                            value={agreementTitle}
                            onChange={(e) => setAgreementTitle(e.target.value)}
                            placeholder="e.g. 2026 cohort placement agreement"
                            className={inputClass}
                        />
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        className="self-start"
                        disabled={pending || !agreementTitle.trim()}
                        onClick={addAgreement}
                    >
                        Add agreement
                    </Button>
                </div>

                <div className="flex flex-col gap-3 rounded-lg border border-line bg-card p-5">
                    <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                        Contribution
                    </p>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] font-semibold">Area</Label>
                        <select
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            className={inputClass}
                        >
                            <option value="learning">Learning</option>
                            <option value="mentoring">Mentoring</option>
                            <option value="placement">Placement</option>
                            <option value="funding">Funding</option>
                            <option value="assessment">Assessment</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] font-semibold">Description</Label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What the partner contributes"
                            className={inputClass}
                        />
                    </div>
                    <Button
                        type="button"
                        size="sm"
                        className="self-start"
                        disabled={pending}
                        onClick={addContribution}
                    >
                        Add contribution
                    </Button>
                </div>
            </div>
        </div>
    );
}
