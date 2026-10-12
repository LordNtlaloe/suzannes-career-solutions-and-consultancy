"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    declareConflictAction,
    resolveComplaintAction,
    resolveConflictDeclarationAction,
    resolveSafeguardingReportAction,
} from "@/actions/step/safeguarding.actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const inputClass =
    "h-9 rounded-0 border border-input bg-input/20 px-2 text-[12px] outline-none focus-visible:border-ring";

type Complaint = {
    id: string;
    subject: string;
    body?: string | null;
    status: string;
    reporter_name?: string | null;
    resolution?: string | null;
};
type Report = {
    id: string;
    subject: string;
    body?: string | null;
    risk_level: string;
    status: string;
    reporter_name?: string | null;
    outcome?: string | null;
};
type Declaration = {
    id: string;
    related_party: string;
    relationship?: string | null;
    interest_type: string;
    details?: string | null;
    status: string;
    staff_name?: string | null;
};

export function SafeguardingManage({
    complaints,
    reports,
    declarations,
}: {
    complaints: Complaint[];
    reports: Report[];
    declarations: Declaration[];
}) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const [complaintStatus, setComplaintStatus] = useState<Record<string, string>>({});
    const [complaintResolution, setComplaintResolution] = useState<Record<string, string>>({});
    const [reportStatus, setReportStatus] = useState<Record<string, string>>({});
    const [reportOutcome, setReportOutcome] = useState<Record<string, string>>({});

    const [relatedParty, setRelatedParty] = useState("");
    const [relationship, setRelationship] = useState("");
    const [interestType, setInterestType] = useState("other");
    const [details, setDetails] = useState("");

    function run(action: () => Promise<unknown>, done: string) {
        startTransition(async () => {
            try {
                await action();
                toast.success(done);
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Conflict declaration form */}
            <div className="flex flex-col gap-3 rounded-lg border border-line bg-card p-5">
                <p className="text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                    Declare a conflict of interest
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] font-semibold">Related party</Label>
                        <input
                            value={relatedParty}
                            onChange={(e) => setRelatedParty(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] font-semibold">Relationship</Label>
                        <input
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                            placeholder="e.g. family member, former employer"
                            className={inputClass}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] font-semibold">Interest type</Label>
                        <select
                            value={interestType}
                            onChange={(e) => setInterestType(e.target.value)}
                            className={inputClass}
                        >
                            <option value="financial">Financial</option>
                            <option value="personal">Personal</option>
                            <option value="employment">Employment</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[11px] font-semibold">Details</Label>
                        <input
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>
                <Button
                    type="button"
                    size="sm"
                    className="self-start"
                    disabled={pending || !relatedParty.trim()}
                    onClick={() =>
                        run(
                            () =>
                                declareConflictAction({
                                    relatedParty,
                                    relationship: relationship || undefined,
                                    interestType,
                                    details: details || undefined,
                                }),
                            "Declaration recorded",
                        )
                    }
                >
                    Submit declaration
                </Button>
            </div>

            {/* Complaints */}
            <div>
                <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                    Complaints ({complaints.length})
                </h3>
                {complaints.length === 0 ? (
                    <p className="section-copy">No complaints.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {complaints.map((c) => (
                            <div key={c.id} className="flex flex-col gap-3 rounded-0 border border-line bg-card p-4">
                                <div>
                                    <p className="text-[14px] font-semibold">{c.subject}</p>
                                    {c.body ? <p className="section-copy mt-1">{c.body}</p> : null}
                                    <p className="mt-1 text-[11px] text-brand-muted">
                                        {c.reporter_name ?? "Anonymous"} · {c.status}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-end gap-2">
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-[11px] font-semibold">Status</Label>
                                        <select
                                            value={complaintStatus[c.id] ?? c.status}
                                            onChange={(e) =>
                                                setComplaintStatus((p) => ({ ...p, [c.id]: e.target.value }))
                                            }
                                            className={inputClass}
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_review">In review</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="dismissed">Dismissed</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-1 flex-col gap-1.5">
                                        <Label className="text-[11px] font-semibold">Resolution</Label>
                                        <input
                                            value={complaintResolution[c.id] ?? c.resolution ?? ""}
                                            onChange={(e) =>
                                                setComplaintResolution((p) => ({ ...p, [c.id]: e.target.value }))
                                            }
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
                                                    resolveComplaintAction({
                                                        complaintId: c.id,
                                                        status: complaintStatus[c.id] ?? c.status,
                                                        resolution: complaintResolution[c.id] ?? undefined,
                                                    }),
                                                "Complaint updated",
                                            )
                                        }
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Safeguarding reports */}
            <div>
                <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                    Safeguarding reports ({reports.length})
                </h3>
                {reports.length === 0 ? (
                    <p className="section-copy">No safeguarding reports.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {reports.map((r) => (
                            <div key={r.id} className="flex flex-col gap-3 rounded-0 border border-line bg-card p-4">
                                <div>
                                    <p className="text-[14px] font-semibold">{r.subject}</p>
                                    {r.body ? <p className="section-copy mt-1">{r.body}</p> : null}
                                    <p className="mt-1 text-[11px] text-brand-muted">
                                        {r.reporter_name ?? "Anonymous"} · risk {r.risk_level} · {r.status}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-end gap-2">
                                    <div className="flex flex-col gap-1.5">
                                        <Label className="text-[11px] font-semibold">Status</Label>
                                        <select
                                            value={reportStatus[r.id] ?? r.status}
                                            onChange={(e) =>
                                                setReportStatus((p) => ({ ...p, [r.id]: e.target.value }))
                                            }
                                            className={inputClass}
                                        >
                                            <option value="open">Open</option>
                                            <option value="investigating">Investigating</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-1 flex-col gap-1.5">
                                        <Label className="text-[11px] font-semibold">Outcome</Label>
                                        <input
                                            value={reportOutcome[r.id] ?? r.outcome ?? ""}
                                            onChange={(e) =>
                                                setReportOutcome((p) => ({ ...p, [r.id]: e.target.value }))
                                            }
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
                                                    resolveSafeguardingReportAction({
                                                        reportId: r.id,
                                                        status: reportStatus[r.id] ?? r.status,
                                                        outcome: reportOutcome[r.id] ?? undefined,
                                                    }),
                                                "Report updated",
                                            )
                                        }
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Conflict declarations */}
            <div>
                <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                    Conflict declarations ({declarations.length})
                </h3>
                {declarations.length === 0 ? (
                    <p className="section-copy">No declarations.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {declarations.map((d) => (
                            <div
                                key={d.id}
                                className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-0 border border-line bg-light/60 px-4 py-3"
                            >
                                <div>
                                    <p className="text-[13px] font-semibold">
                                        {d.related_party} <span className="font-normal text-brand-muted">({d.interest_type})</span>
                                    </p>
                                    {d.relationship ? (
                                        <p className="text-[12px] text-brand-muted">{d.relationship}</p>
                                    ) : null}
                                </div>
                                <span className="text-[12px] text-brand-muted">{d.staff_name ?? "—"}</span>
                                <span className="ml-auto rounded-full bg-blue/12 px-3 py-1 text-[11px] font-semibold text-blue-dark">
                                    {d.status}
                                </span>
                                {d.status === "declared" && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={pending}
                                        onClick={() =>
                                            run(
                                                () =>
                                                    resolveConflictDeclarationAction({
                                                        declarationId: d.id,
                                                        status: "resolved",
                                                    }),
                                                "Declaration resolved",
                                            )
                                        }
                                    >
                                        Mark resolved
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
