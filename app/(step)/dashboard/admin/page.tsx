import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { isProgrammeAdmin } from "@/lib/step/access-rules";
import { adminDashboard } from "@/db/queries/step/dashboards";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";
import { AdminSubNav } from "@/components/step/admin-sub-nav";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/dashboard/admin",
        title: "Programme Admin",
        description: "STEP programme configuration and reporting.",
    });
}

export default async function AdminDashboardPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(link("/dashboard/admin"))}`);
    if (!isProgrammeAdmin(context)) redirect(link("/dashboard"));

    const data = await adminDashboard();
    const totals = data.totals as Record<string, unknown>;

    return (
        <section className="container-x py-10 sm:py-14">
            <div className="mx-auto max-w-3xl">
                <header className="mb-6 flex flex-col gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Programme admin
                    </span>
                    <h1 className="section-heading">Programme overview.</h1>
                </header>

                <div className="mb-8">
                    <AdminSubNav />
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Stat label="Participants" value={String(totals.participants ?? 0)} />
                    <Stat label="Active enrolments" value={String(totals.active_enrolments ?? 0)} />
                    <Stat label="Admitted" value={String(totals.admitted ?? 0)} />
                    <Stat label="Verified passports" value={String(totals.verified_passports ?? 0)} />
                </div>

                <div className="mt-8">
                    <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                        Intake cycles ({data.cycles.length})
                    </h2>
                    <div className="flex flex-col gap-2">
                        {data.cycles.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center justify-between rounded-0 border border-line bg-card px-4 py-3"
                            >
                                <p className="text-[14px] font-semibold">{c.name}</p>
                                <span className="text-[12px] text-brand-muted">{c.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                        Staff assignments ({data.staff.length})
                    </h2>
                    <div className="flex flex-col gap-2">
                        {data.staff.map((s) => (
                            <div
                                key={String(s.id)}
                                className="flex items-center justify-between rounded-0 border border-line bg-light/60 px-4 py-2.5"
                            >
                                <p className="text-[13px] font-semibold">
                                    {String(s.staff_name ?? s.user_id)}
                                </p>
                                <span className="text-[12px] text-brand-muted">{String(s.role)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
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
