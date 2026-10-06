import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { canReviewEvidence, staffAssignmentsWithRole } from "@/lib/step/access-rules";
import {
    countEvidenceReviewQueue,
    listEvidenceReviewQueue,
} from "@/db/queries/step/evidence";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/admin/evidence",
        title: "Evidence review",
        description: "Review participant evidence submissions.",
    });
}

type SearchParams = Promise<{ page?: string; status?: string }>;

const STATUSES = ["submitted", "accepted", "rejected", "changes_requested"] as const;

export default async function EvidenceQueuePage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const sp = await searchParams;
    const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
    const pageSize = 20;
    const status = STATUSES.includes(sp.status as (typeof STATUSES)[number]) ? sp.status : "submitted";

    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user || !canReviewEvidence(context)) redirect(link("/dashboard"));

    const reviewAssignments = staffAssignmentsWithRole(context, [
        "programme_admin",
        "coordinator",
        "reviewer",
    ]);
    const hasGlobal = reviewAssignments.some((a) => a.cycle_id === null);
    const scopedCycleIds = reviewAssignments
        .filter((a) => a.cycle_id !== null)
        .map((a) => a.cycle_id as string);
    const cycleId = hasGlobal ? null : scopedCycleIds[0] ?? null;

    const [evidence, total] = await Promise.all([
        listEvidenceReviewQueue({
            cycleId,
            cohortId: null,
            status,
            limit: pageSize,
            offset: (page - 1) * pageSize,
        }),
        countEvidenceReviewQueue({ cycleId, cohortId: null, status }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[15px] font-semibold">Evidence review</h2>
                <div className="ml-auto flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                        <Link
                            key={s}
                            href={`${link("/admin/evidence")}?status=${s}`}
                            className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${
                                status === s
                                    ? "bg-blue/12 text-blue-dark"
                                    : "border border-line text-brand-muted"
                            }`}
                        >
                            {s.replace("_", " ")}
                        </Link>
                    ))}
                </div>
            </div>

            {evidence.length === 0 ? (
                <p className="rounded-lg border border-line bg-light/60 p-8 text-center section-copy">
                    No evidence in this queue.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-line bg-card">
                    <table className="w-full min-w-[720px] text-left text-[13px]">
                        <thead>
                            <tr className="border-b border-line text-[11px] uppercase tracking-[1.2px] text-brand-muted">
                                <th className="px-4 py-3">Participant</th>
                                <th className="px-4 py-3">Requirement</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Submitted</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {evidence.map((ev) => (
                                <tr key={String(ev.id)} className="border-b border-line last:border-0">
                                    <td className="px-4 py-3 font-semibold">
                                        {String(ev.participant_name ?? "—")}
                                    </td>
                                    <td className="px-4 py-3">{String(ev.requirement_title ?? "—")}</td>
                                    <td className="px-4 py-3">{String(ev.title)}</td>
                                    <td className="px-4 py-3 text-[12px] text-brand-muted">
                                        {new Date(Number(ev.submitted_at) * 1000).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={link(`/admin/evidence/${ev.id}`)}
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
                {page > 1 ? (
                    <Link
                        href={`${link("/admin/evidence")}?status=${status}&page=${page - 1}`}
                        className="rounded-md border border-line px-3 py-1.5 font-semibold text-brand"
                    >
                        Previous
                    </Link>
                ) : (
                    <span />
                )}
                <span className="text-brand-muted">
                    Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                    <Link
                        href={`${link("/admin/evidence")}?status=${status}&page=${page + 1}`}
                        className="rounded-md border border-line px-3 py-1.5 font-semibold text-brand"
                    >
                        Next
                    </Link>
                ) : (
                    <span />
                )}
            </div>
        </div>
    );
}
