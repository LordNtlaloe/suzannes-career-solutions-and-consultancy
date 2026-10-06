import Link from "next/link";
import { headers } from "next/headers";
import { ArrowRight } from "lucide-react";
import { getStepCohorts } from "@/db/queries/step/cycles";
import { listApprovedPartners } from "@/db/queries/step/partners";
import { stepPath } from "@/lib/step/config";
import { stepPageMetadata } from "@/lib/step/metadata";
import { JOURNEY_PHASES, PARTICIPANT_GROUPS, PARTICIPANT_LEVELS } from "@/lib/step/constants";

export async function generateMetadata() {
    return stepPageMetadata({
        path: "/",
        title: "STEP — Skills, Talent & Employment Pathway",
        description:
            "A six-month industry-based incubation and opportunity pathway for 600 Basotho participants.",
    });
}

export default async function StepHomePage() {
    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const link = (p: string) => stepPath(host, p);
    const [cohorts, approvedPartners] = await Promise.all([
        getStepCohorts(),
        listApprovedPartners(),
    ]);

    return (
        <>
            <section className="bg-hero-grad relative overflow-hidden text-white">
                <div className="container-x relative z-2 py-20 sm:py-24">
                    <p className="mb-5 text-[11px] font-semibold tracking-[2.4px] text-blue-light">
                        SKILLS, TALENT &amp; EMPLOYMENT PATHWAY
                    </p>
                    <h1 className="max-w-[760px] text-[clamp(42px,5vw,64px)] font-medium leading-[1.12] tracking-[-2px]">
                        Six months. Real skills. Verified readiness.
                    </h1>
                    <p className="mt-6 max-w-[590px] text-[14px] leading-[1.8] text-[#c8c8c8]">
                        STEP converts access to learning into verified preparedness for
                        600 Basotho participants &mdash; through learning, coaching,
                        mentoring, practical application and assessment.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Link href={link("/apply")} className="btn-brand">
                            Apply to STEP
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                            href={link("/apply")}
                            className="inline-flex items-center rounded-md border border-white/25 px-5 py-2.5 text-[12px] font-semibold text-white transition-colors hover:border-white/50"
                        >
                            Check my application status
                        </Link>
                        <Link
                            href="#cohorts"
                            className="inline-flex items-center rounded-md border border-white/25 px-5 py-2.5 text-[12px] font-semibold text-white transition-colors hover:border-white/50"
                        >
                            Explore cohorts
                        </Link>
                    </div>
                </div>
            </section>

            {/* Proposition */}
            <section className="container-x py-16 sm:py-20">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    <div className="flex flex-col gap-4">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            Why STEP
                        </span>
                        <h2 className="section-heading">
                            Access alone isn&apos;t preparedness.
                        </h2>
                    </div>
                    <div className="section-copy flex flex-col gap-4 leading-relaxed">
                        <p>
                            Many Basotho hold qualifications, experience, creative
                            ability or viable business ideas &mdash; yet remain
                            disconnected from structured development, credible
                            guidance and visible pathways into opportunity.
                        </p>
                        <p>
                            STEP links learning to application, application to
                            assessment, and verified preparedness to opportunity.
                            Participants finish with a STEP Skills Passport and
                            curated, non-exclusive introductions to opportunity
                            providers.
                        </p>
                    </div>
                </div>
            </section>

            {/* Cohorts */}
            <section id="cohorts" className="border-y border-line bg-light/82">
                <div className="container-x py-16 sm:py-20">
                    <header className="mb-12 flex max-w-2xl flex-col gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            Industry cohorts
                        </span>
                        <h2 className="section-heading">Eight pathways into work.</h2>
                        <p className="section-copy">
                            Participants are organised into industry-based cohorts with
                            relevant learning, mentoring and practical exposure.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {cohorts.map((cohort) => (
                            <div
                                key={cohort.id}
                                className="flex flex-col gap-3 rounded-lg border border-line bg-card p-6"
                            >
                                <h3 className="font-semibold text-[15px] leading-snug">
                                    {cohort.name}
                                </h3>
                                <p className="section-copy leading-relaxed">
                                    {cohort.fields}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Participant groups + journey */}
            <section className="container-x py-16 sm:py-20">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
                    <div className="flex flex-col gap-6">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            Who it&rsquo;s for
                        </span>
                        <h2 className="section-heading">Across every career stage.</h2>
                        <ul className="flex flex-col gap-3">
                            {PARTICIPANT_GROUPS.map((group) => (
                                <li
                                    key={group.value}
                                    className="flex items-center gap-3 text-[14px] text-brand"
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue" />
                                    {group.label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col gap-6">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            The six-month journey
                        </span>
                        <ol className="flex flex-col gap-4">
                            {JOURNEY_PHASES.map((phase, i) => (
                                <li
                                    key={phase.key}
                                    className="flex gap-4 rounded-lg border border-line bg-card p-5"
                                >
                                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue/12 text-[12px] font-semibold text-blue-dark">
                                        {i + 1}
                                    </span>
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-[15px] font-semibold">
                                            {phase.title}{" "}
                                            <span className="font-normal text-brand-muted">
                                                &mdash; {phase.focus}
                                            </span>
                                        </h3>
                                        <p className="section-copy">
                                            Evidence: {phase.evidence}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            {/* Progression levels */}
            <section className="border-y border-line bg-light/82">
                <div className="container-x py-16 sm:py-20">
                    <header className="mb-10 flex max-w-2xl flex-col gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            Progression
                        </span>
                        <h2 className="section-heading">Earn every level.</h2>
                    </header>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                        {PARTICIPANT_LEVELS.map((level) => (
                            <div
                                key={level.value}
                                className="flex flex-col gap-2 rounded-lg border border-line bg-card p-5"
                            >
                                <span className="text-[10px] font-semibold uppercase tracking-[1.8px] text-blue">
                                    {level.short}
                                </span>
                                <h3 className="text-[15px] font-semibold">
                                    {level.label}
                                </h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="border-y border-line bg-light/82">
                <div className="container-x py-16 sm:py-20">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                        <div className="flex flex-col gap-4">
                            <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                                Partners
                            </span>
                            <h2 className="section-heading">
                                Help 600 Basotho get work-ready.
                            </h2>
                        </div>
                        <div className="section-copy flex flex-col gap-4 leading-relaxed">
                            <p>
                                Employers, funders and opportunity providers support
                                STEP with learning, mentoring, practical placements and
                                introductions. Partners see aggregate results or
                                consented, field-scoped Skills Passport shares &mdash;
                                never the talent pool directly.
                            </p>
                            <p>
                                Interested in contributing or providing opportunities?
                                Tell the programme team and we&rsquo;ll be in touch.
                            </p>
                            <Link
                                href="/contact"
                                className="btn-brand self-start"
                            >
                                Partner enquiry
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>

                            {approvedPartners.length > 0 && (
                                <div className="mt-4 border-t border-line pt-4">
                                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[1.2px] text-brand-muted">
                                        Approved partners
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {approvedPartners.map((partner) => (
                                            <span
                                                key={partner.id}
                                                className="rounded-md border border-line bg-card px-3 py-1.5 text-[13px] font-semibold"
                                            >
                                                {partner.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="container-x py-16 sm:py-20">
                <div className="rounded-2xl border border-line bg-linear-to-br from-blue/10 via-card to-muted p-8 text-center shadow-soft sm:p-12">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Ready to begin?
                    </span>
                    <h2 className="section-heading mt-3 leading-tight">
                        Apply to join the inaugural cohort.
                    </h2>
                    <p className="section-copy mx-auto mt-4 max-w-xl">
                        Registration is open to committed Basotho participants across
                        every career stage.
                    </p>
                    <Link href={link("/apply")} className="btn-brand mt-6 inline-flex">
                        Start your application
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </section>
        </>
    );
}
