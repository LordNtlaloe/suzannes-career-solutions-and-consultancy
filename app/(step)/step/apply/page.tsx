import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getLatestApplicationByUser } from "@/db/queries/step/applications";
import { getOpenCycles, getStepCohorts } from "@/db/queries/step/cycles";
import { getParticipantByUser } from "@/db/queries/step/enrolments";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";
import { applicationStatusLabel } from "@/lib/step/constants";
import { ApplyForm } from "@/components/step/apply-form";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/apply",
        title: "Apply to STEP",
        description: "Apply to join the STEP six-month incubation programme.",
    });
}

export default async function StepApplyPage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        redirect(
            `/sign-in?callbackUrl=${encodeURIComponent(link("/apply"))}`,
        );
    }

    const [cohorts, cycles, application, participant] = await Promise.all([
        getStepCohorts(),
        getOpenCycles(),
        getLatestApplicationByUser(session.user.id),
        getParticipantByUser(session.user.id),
    ]);

    const hasActiveApplication =
        application && ["submitted", "under_review", "admitted"].includes(application.status);

    const draft =
        application?.status === "draft"
            ? {
                  cycleId: application.cycle_id,
                  cohortId: application.cohort_id,
                  pathway: application.pathway,
                  participantGroup: application.participant_group,
                  goals: application.goals,
                  baseline: application.baseline,
              }
            : null;

    return (
        <section className="container-x py-14 sm:py-20">
            <div className="mx-auto max-w-2xl">
                <header className="mb-8 flex flex-col gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Application
                    </span>
                    <h1 className="section-heading">Apply to STEP.</h1>
                    <p className="section-copy">
                        Tell us where you are and where you want to go. The programme
                        team reviews every application before cohort allocation.
                    </p>
                </header>

                {participant ? (
                    <div className="rounded-lg border border-line bg-light/60 p-6">
                        <p className="text-[15px] font-semibold">
                            You&rsquo;re already a STEP participant.
                        </p>
                        <p className="section-copy mt-2">
                            Head to your dashboard to track your journey.
                        </p>
                        <Link href={link("/dashboard")} className="btn-brand mt-4 inline-flex">
                            Go to dashboard
                        </Link>
                    </div>
                ) : hasActiveApplication ? (
                    <div className="rounded-lg border border-line bg-light/60 p-6">
                        <p className="text-[15px] font-semibold">
                            Your application is {applicationStatusLabel(application!.status).toLowerCase()}.
                        </p>
                        <p className="section-copy mt-2">
                            You can track progress from your dashboard. You&rsquo;ll be
                            able to see your cohort and level once admitted.
                        </p>
                        <Link href={link("/dashboard")} className="btn-brand mt-4 inline-flex">
                            View status
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 rounded-lg border border-line bg-light/60 p-6">
                            <h2 className="text-[13px] font-semibold">Before you apply</h2>
                            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <h3 className="text-[11px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                                        Who can apply
                                    </h3>
                                    <p className="section-copy mt-1.5">
                                        STEP is for people ready to commit to a six-month
                                        programme of learning, mentoring and practical
                                        application. You&rsquo;ll need regular time to
                                        complete coursework and attend sessions.
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-[11px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                                        What to expect
                                    </h3>
                                    <ul className="section-copy mt-1.5 flex flex-col gap-1">
                                        <li>• Your application is reviewed by the programme team.</li>
                                        <li>• If admitted, you&rsquo;re placed in a cohort and level.</li>
                                        <li>• You learn, practise, and get verified along the way.</li>
                                        <li>• You finish with a STEP Skills Passport.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <ApplyForm cohorts={cohorts} cycles={cycles} draft={draft} />
                    </>
                )}
            </div>
        </section>
    );
}
