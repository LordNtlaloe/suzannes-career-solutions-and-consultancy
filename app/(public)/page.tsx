import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticlesSection } from "@/components/public/article-section";
import { ClientStrip } from "@/components/public/client-strip";
import { DifferentiatorsSection } from "@/components/public/differentiators-section";
import { HeroSection } from "@/components/public/hero-section";
import { PortfolioSection } from "@/components/public/portfolio-section";
import { ServicesSection } from "@/components/public/service-section";
import { StorySection } from "@/components/public/story-section";
import { TeamSection } from "@/components/public/team-section";
import { TestimonialSection } from "@/components/public/testimonial-section";
import { getStepCohorts } from "@/db/queries/step/cycles";
import { listApprovedPartners } from "@/db/queries/step/partners";
import {
    JOURNEY_PHASES,
    PARTICIPANT_GROUPS,
    PARTICIPANT_LEVELS,
} from "@/lib/step/constants";

export const metadata: Metadata = {
    title: "STEP — Skills, Talent & Employment Pathway",
    description:
        "A six-month industry-based incubation and opportunity pathway for 600 Basotho participants — through learning, coaching, mentoring, practical application and assessment.",
    openGraph: {
        title: "STEP — Skills, Talent & Employment Pathway",
        description:
            "Six months. Real skills. Verified readiness. A pathway for 600 Basotho participants into learning, opportunity and work.",
        type: "website",
    },
};

const REGISTER_STEPS = [
    {
        title: "Apply online",
        body: "Complete the short application and tell us which pathway fits you. You can save it as a draft and come back later.",
    },
    {
        title: "Programme review",
        body: "Every application is reviewed by the programme team. Admitted applicants are placed in a cohort and level.",
    },
    {
        title: "Baseline & plan",
        body: "A baseline profile and development plan set your starting level and your six-month pathway.",
    },
    {
        title: "Learn, practise and verify",
        body: "Complete learning, mentoring and assessed practice, then finish with a verified STEP Skills Passport.",
    },
];

const FAQS = [
    {
        q: "What is STEP?",
        a: "STEP — Skills, Talent & Employment Pathway — is a six-month industry-based incubation and opportunity pathway for 600 Basotho participants. It links learning to application, application to assessment, and verified preparedness to opportunity.",
    },
    {
        q: "Who can apply?",
        a: "STEP is for committed Basotho participants at every career stage: students and recent graduates, entry-level, mid-career and experienced professionals, entrepreneurs, and emerging creators.",
    },
    {
        q: "How do I get started?",
        a: "Apply online through the application portal. You can save your application as a draft and return later, and the programme team reviews every submission before cohort allocation.",
    },
    {
        q: "How long is the programme?",
        a: "Six months, structured from a baseline and development plan through learning, coaching and mentoring, practical application, and a final validation and transition.",
    },
    {
        q: "What are the industry cohorts?",
        a: "Participants are organised into eight industry cohorts: Business & Finance; Technology & Data; Media & Creative; Engineering & Infrastructure; Health & Impact; Environment & Agriculture; Governance & Law; and Entrepreneurship.",
    },
    {
        q: "What do I finish with?",
        a: "A verified STEP Skills Passport and curated, non-exclusive introductions to opportunity providers — proof of what you can do, not just what you have studied.",
    },
    {
        q: "Can organisations get involved?",
        a: "Yes. Employers and opportunity providers can offer placements, projects and introductions; funders and sponsors can support the programme; and mentors and coaches can guide participants. Contact the programme team to discuss partnering.",
    },
];

export default async function HomePage() {
    const [cohorts, approvedPartners] = await Promise.all([
        getStepCohorts(),
        listApprovedPartners(),
    ]);

    return (
        <>
            {/* Original landing design — rebranded to STEP */}
            <HeroSection />
            <ClientStrip />
            <ServicesSection />
            <DifferentiatorsSection />

            {/* Industry cohorts */}
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

            {/* How to get started */}
            <section className="container-x py-16 sm:py-20">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.4fr]">
                    <div className="flex flex-col gap-6">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            How to get started
                        </span>
                        <h2 className="section-heading">
                            Four steps to a verified passport.
                        </h2>
                        <p className="section-copy">
                            Registration is open to committed Basotho participants
                            across every career stage. The programme team reviews every
                            application before cohort allocation.
                        </p>
                        <Link href="/apply" className="btn-brand self-start">
                            Apply now
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>

                    <ol className="flex flex-col gap-4">
                        {REGISTER_STEPS.map((step, i) => (
                            <li
                                key={step.title}
                                className="flex gap-4 rounded-lg border border-line bg-card p-5"
                            >
                                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue/12 text-[12px] font-semibold text-blue-dark">
                                    {i + 1}
                                </span>
                                <div className="flex flex-col gap-1">
                                    <h3 className="text-[15px] font-semibold">
                                        {step.title}
                                    </h3>
                                    <p className="section-copy">{step.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Original landing design continues */}
            <TeamSection />
            <StorySection />

            {/* Partners / get involved */}
            <section className="border-y border-line bg-light/82">
                <div className="container-x py-16 sm:py-20">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                        <div className="flex flex-col gap-4">
                            <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                                Get involved
                            </span>
                            <h2 className="section-heading">
                                Help 600 Basotho get work-ready.
                            </h2>
                            <p className="section-copy">
                                STEP works because partners open doors. Here&rsquo;s
                                how you can contribute:
                            </p>
                            <ul className="flex flex-col gap-3">
                                <li className="flex items-start gap-3 text-[14px] text-brand">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                                    <span>
                                        <strong>Employers &amp; opportunity providers</strong>
                                        {" "}— offer placements, projects, introductions
                                        or hiring pathways.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3 text-[14px] text-brand">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                                    <span>
                                        <strong>Funders &amp; sponsors</strong>
                                        {" "}— support learning, mentoring and practical
                                        exposure.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3 text-[14px] text-brand">
                                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" />
                                    <span>
                                        <strong>Mentors &amp; coaches</strong>
                                        {" "}— guide participants through the six-month
                                        journey.
                                    </span>
                                </li>
                            </ul>
                        </div>
                        <div className="section-copy flex flex-col gap-4 leading-relaxed">
                            <p>
                                Partners see aggregate results or consented,
                                field-scoped Skills Passport shares &mdash; never the
                                talent pool directly.
                            </p>
                            <p>
                                Interested in contributing or providing opportunities?
                                Tell the programme team and we&rsquo;ll be in touch.
                            </p>
                            <Link href="/contact" className="btn-brand self-start">
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

            {/* FAQ */}
            <section className="container-x py-16 sm:py-20">
                <header className="mb-10 flex max-w-2xl flex-col gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        FAQ
                    </span>
                    <h2 className="section-heading">
                        Frequently asked questions.
                    </h2>
                    <p className="section-copy">
                        Everything you need to know about applying,
                        participating and getting involved.
                    </p>
                </header>

                <div className="flex flex-col gap-3">
                    {FAQS.map((faq) => (
                        <details
                            key={faq.q}
                            className="group rounded-lg border border-line bg-card"
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
                                {faq.q}
                                <span className="shrink-0 text-[20px] font-normal leading-none text-blue-dark transition-transform group-open:rotate-45">
                                    +
                                </span>
                            </summary>
                            <p className="section-copy px-5 pb-5 leading-relaxed">
                                {faq.a}
                            </p>
                        </details>
                    ))}
                </div>
            </section>

            {/* News & updates, portfolio and testimonials — original design */}
            <ArticlesSection />
            <PortfolioSection />
            <TestimonialSection />

            {/* CTA */}
            <section className="container-x py-16 sm:py-20">
                <div className="rounded-2xl border border-line bg-linear-to-br from-blue/10 via-card to-muted p-8 text-center shadow-soft sm:p-12">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Ready to begin?
                    </span>
                    <h2 className="section-heading mt-3 leading-tight">
                        Apply to join the next cohort.
                    </h2>
                    <p className="section-copy mx-auto mt-4 max-w-xl">
                        Registration is open to committed Basotho participants across
                        every career stage.
                    </p>
                    <Link href="/apply" className="btn-brand mt-6 inline-flex">
                        Start your application
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </section>
        </>
    );
}
