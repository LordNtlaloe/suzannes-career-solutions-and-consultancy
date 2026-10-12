import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { isProgrammeAdmin } from "@/lib/step/access-rules";
import { stepReporting } from "@/db/queries/step/dashboards";
import { levelLabel } from "@/lib/step/constants";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/admin/reporting",
        title: "Reporting",
        description: "Aggregate programme reporting.",
    });
}

export default async function ReportingPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user || !isProgrammeAdmin(context)) redirect(link("/dashboard"));

    const data = await stepReporting();
    const reach = data.reach as Record<string, unknown>;
    const byLevel = data.byLevel as Record<string, unknown>[];
    const byCohort = data.byCohort as Record<string, unknown>[];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[15px] font-semibold">Programme reporting</h2>
                <Link
                    href={link("/admin/reporting/export")}
                    className="ml-auto rounded-0 border border-line px-3 py-1.5 text-[12px] font-semibold text-blue-dark transition-colors hover:border-blue/40"
                >
                    Export CSV
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <Stat label="Applications" value={String(reach.applications ?? 0)} />
                <Stat label="Submitted" value={String(reach.submitted ?? 0)} />
                <Stat label="Admitted" value={String(reach.admitted ?? 0)} />
                <Stat label="Enrolled" value={String(data.enrolled)} />
                <Stat label="Exits" value={String(data.exits)} />
            </div>

            <div>
                <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                    Progression by level
                </h3>
                <div className="overflow-x-auto rounded-lg border border-line bg-card">
                    <table className="w-full min-w-[320px] text-left text-[13px]">
                        <thead>
                            <tr className="border-b border-line text-[11px] uppercase tracking-[1.2px] text-brand-muted">
                                <th className="px-4 py-2.5">Level</th>
                                <th className="px-4 py-2.5 text-right">Enrolled</th>
                            </tr>
                        </thead>
                        <tbody>
                            {byLevel.map((row) => (
                                <tr key={String(row.level)} className="border-b border-line last:border-0">
                                    <td className="px-4 py-2.5">{levelLabel(String(row.level))}</td>
                                    <td className="px-4 py-2.5 text-right">{String(row.c ?? 0)}</td>
                                </tr>
                            ))}
                            {byLevel.length === 0 && (
                                <tr>
                                    <td colSpan={2} className="px-4 py-6 text-center text-brand-muted">
                                        No enrolments yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div>
                <h3 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                    Completion by cohort
                </h3>
                <div className="overflow-x-auto rounded-lg border border-line bg-card">
                    <table className="w-full min-w-[420px] text-left text-[13px]">
                        <thead>
                            <tr className="border-b border-line text-[11px] uppercase tracking-[1.2px] text-brand-muted">
                                <th className="px-4 py-2.5">Cohort</th>
                                <th className="px-4 py-2.5">Cycle</th>
                                <th className="px-4 py-2.5 text-right">Enrolled</th>
                                <th className="px-4 py-2.5 text-right">Graduates</th>
                            </tr>
                        </thead>
                        <tbody>
                            {byCohort.map((row, i) => (
                                <tr key={i} className="border-b border-line last:border-0">
                                    <td className="px-4 py-2.5">{String(row.cohort_name ?? "—")}</td>
                                    <td className="px-4 py-2.5">{String(row.cycle_name ?? "—")}</td>
                                    <td className="px-4 py-2.5 text-right">{String(row.enrolled ?? 0)}</td>
                                    <td className="px-4 py-2.5 text-right">{String(row.graduates ?? 0)}</td>
                                </tr>
                            ))}
                            {byCohort.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-6 text-center text-brand-muted">
                                        No cohorts configured yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Stat label="Overdue assignments" value={String(data.overdueAssignments)} />
                <Stat label="Rejected applications" value={String(reach.rejected ?? 0)} />
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-line bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[1.8px] text-brand-muted">
                {label}
            </p>
            <p className="text-[22px] font-semibold">{value}</p>
        </div>
    );
}
