"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStepPath } from "@/components/step/step-path-provider";
import {
    applicationStatusLabel,
    participantGroupLabel,
    pathwayLabel,
} from "@/lib/step/constants";
import { bulkAssignReviewerAction, bulkSetUnderReviewAction } from "@/actions/step/applications.actions";
import type { StepApplicationWithRelations, StepCycle, StepCohort } from "@/types/step";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    draft: "outline",
    submitted: "secondary",
    under_review: "outline",
    admitted: "default",
    rejected: "destructive",
    withdrawn: "outline",
};

type Reviewer = { id: string; name?: string | null; email?: string | null };

export function ApplicationsBrowser({
    applications,
    total,
    page,
    pageSize,
    status,
    cycleId,
    cohortId,
    pathway,
    q,
    from,
    cycles,
    cohorts,
    pathways,
    reviewers,
}: {
    applications: StepApplicationWithRelations[];
    total: number;
    page: number;
    pageSize: number;
    status: string;
    cycleId: string;
    cohortId: string;
    pathway: string;
    q: string;
    from: string;
    cycles: StepCycle[];
    cohorts: StepCohort[];
    pathways: { value: string; label: string }[];
    reviewers: Reviewer[];
}) {
    const { path } = useStepPath();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [pending, startTransition] = useTransition();
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [reviewerId, setReviewerId] = useState("");

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const selectable = applications.filter(
        (a) => a.status === "submitted" || a.status === "under_review",
    );

    const allSelected = useMemo(
        () => selectable.length > 0 && selectable.every((a) => selected.has(a.id)),
        [selectable, selected],
    );

    function updateQuery(next: Record<string, string | number>) {
        const params = new URLSearchParams(searchParams.toString());
        for (const [key, value] of Object.entries(next)) {
            if (value === "" || value === "all" || (typeof value === "number" && value <= 1)) {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        }
        router.push(`${path("/admin/applications")}?${params.toString()}`);
    }

    function toggle(id: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleAll() {
        setSelected(() => {
            if (allSelected) return new Set();
            return new Set(selectable.map((a) => a.id));
        });
    }

    function runBulk(action: () => Promise<{ ok: boolean; updated?: number }>, done: string) {
        startTransition(async () => {
            try {
                const result = await action();
                toast.success(`${done}${result.updated ? ` (${result.updated})` : ""}`);
                setSelected(new Set());
                router.refresh();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    const inputClass =
        "h-9 rounded-md border border-input bg-input/20 px-3 text-[12px] outline-none focus-visible:border-ring";

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-3">
                <select
                    aria-label="Status"
                    value={status}
                    onChange={(e) => updateQuery({ status: e.target.value, page: 1 })}
                    className={inputClass}
                >
                    <option value="all">All statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under review</option>
                    <option value="admitted">Admitted</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select
                    aria-label="Cycle"
                    value={cycleId}
                    onChange={(e) => updateQuery({ cycle: e.target.value, page: 1 })}
                    className={inputClass}
                >
                    <option value="all">All cycles</option>
                    {cycles.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <select
                    aria-label="Cohort"
                    value={cohortId}
                    onChange={(e) => updateQuery({ cohort: e.target.value, page: 1 })}
                    className={inputClass}
                >
                    <option value="all">All cohorts</option>
                    {cohorts.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <select
                    aria-label="Pathway"
                    value={pathway}
                    onChange={(e) => updateQuery({ pathway: e.target.value, page: 1 })}
                    className={inputClass}
                >
                    <option value="all">All pathways</option>
                    {pathways.map((p) => (
                        <option key={p.value} value={p.value}>
                            {p.label}
                        </option>
                    ))}
                </select>
                <input
                    aria-label="Search name or email"
                    placeholder="Search name or email"
                    defaultValue={q}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") updateQuery({ q: (e.target as HTMLInputElement).value });
                    }}
                    className={inputClass}
                />
                <input
                    aria-label="Submitted on or after"
                    type="date"
                    defaultValue={from}
                    onChange={(e) => updateQuery({ from: e.target.value })}
                    className={inputClass}
                />
                <span className="ml-auto self-center text-[12px] text-brand-muted">
                    {total} application{total === 1 ? "" : "s"}
                </span>
            </div>

            {selected.size > 0 && (
                <div className="flex flex-wrap items-center gap-3 rounded-lg border border-blue/30 bg-blue/5 p-3">
                    <span className="text-[12px] font-semibold text-blue-dark">
                        {selected.size} selected
                    </span>
                    <select
                        aria-label="Assign reviewer"
                        value={reviewerId}
                        onChange={(e) => setReviewerId(e.target.value)}
                        className={inputClass}
                    >
                        <option value="">Choose reviewer…</option>
                        {reviewers.map((r) => (
                            <option key={String(r.id)} value={String(r.id)}>
                                {r.name ?? r.email ?? r.id}
                            </option>
                        ))}
                    </select>
                    <Button
                        type="button"
                        size="sm"
                        disabled={pending || !reviewerId}
                        onClick={() =>
                            runBulk(
                                () =>
                                    bulkAssignReviewerAction({
                                        applicationIds: Array.from(selected),
                                        reviewerUserId: reviewerId,
                                    }),
                                "Reviewer assigned",
                            )
                        }
                    >
                        Assign reviewer
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                            runBulk(
                                () =>
                                    bulkSetUnderReviewAction({
                                        applicationIds: Array.from(selected),
                                    }),
                                "Moved to under review",
                            )
                        }
                    >
                        Move to under review
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelected(new Set())}
                    >
                        Clear
                    </Button>
                </div>
            )}

            {applications.length === 0 ? (
                <p className="rounded-lg border border-line bg-light/60 p-8 text-center section-copy">
                    No applications match these filters.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-line bg-card">
                    <table className="w-full min-w-[760px] text-left text-[13px]">
                        <thead>
                            <tr className="border-b border-line text-[11px] uppercase tracking-[1.2px] text-brand-muted">
                                <th className="px-3 py-3">
                                    <input
                                        type="checkbox"
                                        aria-label="Select all"
                                        checked={allSelected}
                                        onChange={toggleAll}
                                        className="size-4 accent-blue"
                                    />
                                </th>
                                <th className="px-4 py-3">Applicant</th>
                                <th className="px-4 py-3">Cohort</th>
                                <th className="px-4 py-3">Pathway</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id} className="border-b border-line last:border-0">
                                    <td className="px-3 py-3">
                                        {(app.status === "submitted" || app.status === "under_review") && (
                                            <input
                                                type="checkbox"
                                                aria-label={`Select ${app.applicant_name ?? "application"}`}
                                                checked={selected.has(app.id)}
                                                onChange={() => toggle(app.id)}
                                                className="size-4 accent-blue"
                                            />
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold">{app.applicant_name ?? "—"}</p>
                                        <p className="text-[12px] text-brand-muted">{app.applicant_email ?? ""}</p>
                                    </td>
                                    <td className="px-4 py-3">{app.cohort_name ?? "No preference"}</td>
                                    <td className="px-4 py-3">
                                        {pathwayLabel(app.pathway)}
                                        <span className="block text-[11px] text-brand-muted">
                                            {participantGroupLabel(app.participant_group)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant={STATUS_VARIANT[app.status] ?? "secondary"}>
                                            {applicationStatusLabel(app.status)}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={path(`/admin/applications/${app.id}`)}
                                            className="font-semibold text-blue-dark transition-opacity hover:opacity-70"
                                        >
                                            Review →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex items-center justify-between text-[12px]">
                <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => updateQuery({ page: page - 1 })}
                    className="rounded-md border border-line px-3 py-1.5 font-semibold text-brand disabled:opacity-40"
                >
                    Previous
                </button>
                <span className="text-brand-muted">
                    Page {page} of {totalPages}
                </span>
                <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => updateQuery({ page: page + 1 })}
                    className="rounded-md border border-line px-3 py-1.5 font-semibold text-brand disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
