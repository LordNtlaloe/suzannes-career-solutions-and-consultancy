import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getStepAccessContext } from "@/lib/step/permissions";
import { isMentor } from "@/lib/step/access-rules";
import { mentorDashboard } from "@/db/queries/step/dashboards";
import { DevelopmentActionForm } from "@/components/step/development-action-form";
import { levelLabel, pathwayLabel } from "@/lib/step/constants";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/dashboard/mentor",
        title: "Mentor Dashboard",
        description: "Your assigned participants and sessions.",
    });
}

export default async function MentorDashboardPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const { user, context } = await getStepAccessContext();
    if (!user) redirect(`/sign-in?callbackUrl=${encodeURIComponent(link("/dashboard/mentor"))}`);
    if (!isMentor(context)) redirect(link("/dashboard"));

    const data = await mentorDashboard(user.id);

    const now = data.now;
    const dayStart = now - (now % 86400);
    const todaySessions = data.sessions.filter(
        (s) => s.scheduled_at && Number(s.scheduled_at) >= dayStart && Number(s.scheduled_at) < dayStart + 86400,
    );
    const upcomingSessions = data.sessions.filter(
        (s) => s.scheduled_at && Number(s.scheduled_at) >= dayStart + 86400,
    );

    return (
        <section className="container-x py-10 sm:py-14">
            <div className="mx-auto max-w-3xl">
                <header className="mb-8 flex flex-col gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Mentor
                    </span>
                    <h1 className="section-heading">Your mentees.</h1>
                </header>

                <div className="flex flex-col gap-8">
                    {/* Today's sessions first */}
                    {todaySessions.length > 0 && (
                        <div>
                            <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                                Today&rsquo;s sessions ({todaySessions.length})
                            </h2>
                            <div className="flex flex-col gap-3">
                                {todaySessions.map((s) => (
                                    <Link
                                        key={String(s.id)}
                                        href={link(`/dashboard/mentor/sessions/${s.id}`)}
                                        className="rounded-md border border-blue/30 bg-blue/5 p-4 transition-colors hover:border-blue/60"
                                    >
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                            <p className="text-[14px] font-semibold">{String(s.title)}</p>
                                            {s.scheduled_at ? (
                                                <span className="text-[12px] text-brand-muted">
                                                    {new Date(Number(s.scheduled_at) * 1000).toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            ) : null}
                                            <span className="ml-auto text-[12px] font-semibold text-blue-dark">
                                                Take attendance →
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {upcomingSessions.length > 0 && (
                        <div>
                            <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                                Upcoming sessions ({upcomingSessions.length})
                            </h2>
                            <div className="flex flex-col gap-3">
                                {upcomingSessions.map((s) => (
                                    <Link
                                        key={String(s.id)}
                                        href={link(`/dashboard/mentor/sessions/${s.id}`)}
                                        className="flex items-center justify-between rounded-md border border-line bg-card px-4 py-3 transition-colors hover:border-blue/40"
                                    >
                                        <p className="text-[14px] font-semibold">{String(s.title)}</p>
                                        {s.scheduled_at ? (
                                            <span className="text-[12px] text-brand-muted">
                                                {new Date(Number(s.scheduled_at) * 1000).toLocaleString()}
                                            </span>
                                        ) : null}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assigned participants with last interaction */}
                    <div>
                        <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                            Assigned participants ({data.assigned.length})
                        </h2>
                        <div className="flex flex-col gap-3">
                            {data.assigned.map((a) => {
                                const last = Number(a.last_interaction ?? 0);
                                return (
                                    <div
                                        key={String(a.id)}
                                        className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-line bg-card px-4 py-3"
                                    >
                                        <p className="text-[14px] font-semibold">
                                            {String(a.participant_name)}
                                        </p>
                                        <span className="text-[12px] text-brand-muted">
                                            {String(a.cycle_name)} · {String(a.cohort_name ?? "No cohort")}
                                        </span>
                                        <span className="text-[12px] font-semibold text-blue-dark">
                                            {levelLabel(String(a.level))} · {pathwayLabel(String(a.pathway))}
                                        </span>
                                        <span className="ml-auto text-[12px] text-brand-muted">
                                            {last > 0
                                                ? `Last interaction ${new Date(last * 1000).toLocaleDateString()}`
                                                : "No interaction yet"}
                                        </span>
                                    </div>
                                );
                            })}
                            {data.assigned.length === 0 && (
                                <p className="section-copy">No assigned participants.</p>
                            )}
                        </div>
                    </div>

                    {/* Development actions + inline creation */}
                    <div>
                        <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                            Development actions ({data.actions.length})
                        </h2>
                        <div className="flex flex-col gap-4">
                            <DevelopmentActionForm
                                assigned={data.assigned.map((a) => ({
                                    id: String(a.id),
                                    participant_name: String(a.participant_name),
                                }))}
                            />
                            <div className="flex flex-col gap-2">
                                {data.actions.map((a) => (
                                    <div
                                        key={String(a.id)}
                                        className="flex items-center justify-between rounded-md border border-line bg-light/60 px-4 py-2.5"
                                    >
                                        <div>
                                            <p className="text-[13px] font-semibold">{String(a.title)}</p>
                                            <p className="text-[12px] text-brand-muted">
                                                {String(a.participant_name)}
                                            </p>
                                        </div>
                                        <span className="text-[12px] text-brand-muted">
                                            {String(a.status)}
                                        </span>
                                    </div>
                                ))}
                                {data.actions.length === 0 && (
                                    <p className="section-copy">No open development actions.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
