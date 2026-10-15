import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { images } from "@/lib/data";

const PILLARS = [
    {
        title: "Career Readiness Academy",
        gain: "Six months of training, mentorship, coaching and competency assessment",
        body: "A six-month blended programme combining online learning, workshops, peer support, career coaching and mentoring. Participants complete a skills baseline, a learning plan, assessed assignments and a STEP Skills Passport documenting evidence of competence.",
        modules:
            "Core modules include workplace communication, digital productivity, financial literacy, professional conduct, problem-solving, CVs, applications and interviews, sector-specific career pathways, responsible use of AI, leadership and teamwork.",
        image: images.service1,
    },
    {
        title: "Talent Experience Pathway",
        gain: "Structured, supervised work-experience opportunities and employer exposure",
        body: "A progression route for eligible participants into time-bound, supervised work-experience assignments with host organisations — remote project support, hybrid placements, community assignments and supervised roles alongside professionals.",
        modules:
            "Each placement requires a written agreement, scope of work, named supervisor, learning objectives, feedback, safeguarding measures and a review of labour and immigration rules where relevant. Hosts must not use unpaid placements to replace paid jobs; stipends are pursued through dedicated funding and are not guaranteed.",
        image: images.service2,
    },
    {
        title: "Schools Career Discovery Bootcamps",
        gain: "Fee-based career guidance and foundational digital and creative skills",
        body: "Annual, age-appropriate bootcamps for secondary-school learners, designed to improve subject and career choices and introduce practical digital and creative skills. Learners join through direct registration with a published fee; there is no competitive call.",
        modules:
            "Activities include career-interest exploration, industry talks, education pathways, introductory design and content skills, digital safety and portfolio mini-projects. School and parent/guardian consent, child safeguarding and accessibility are mandatory.",
        image: images.service3,
    },
    {
        title: "Entrepreneurship & Creative Economy Lab",
        gain: "Enterprise development, creator skills, showcases, market links and commissions",
        body: "An incubation and exposure pathway for early-stage entrepreneurs, artists, designers, filmmakers, musicians, photographers and digital creators — combining business fundamentals, intellectual property, pricing, responsible content production, branding, portfolio building and customer development.",
        modules:
            "Outputs may include creative briefs, exhibitions, pop-up showcases, demo days, buyer introductions and opportunities for paid commissions. STEP encourages fair contracts, ownership clarity and payment for commercial work.",
        image: images.project3,
    },
];

export function ProgrammePillars() {
    return (
        <>
            {/* Programme at a glance */}
            <section
                id="programmes"
                className="relative overflow-hidden bg-light py-16 text-ink dark:bg-[#202020] dark:text-white sm:py-24"
            >
                {/* Subtle blue glow */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-linear-to-br from-blue/10 via-transparent to-transparent dark:hidden"
                />

                <div className="container-x relative z-1">
                    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
                        {/* Left: heading, pillars and CTA */}
                        <div className="flex flex-col">
                            <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue-dark dark:text-blue-light">
                                Programme at a glance
                            </span>
                            <h2 className="mt-3 max-w-140 text-[clamp(28px,3.4vw,42px)] font-semibold leading-[1.2] text-ink dark:text-white">
                                Four programme pillars.
                            </h2>
                            <p className="mt-5 max-w-140 text-[16px] font-light leading-7 text-ink/70 dark:text-white/70">
                                STEP will support job seekers, emerging professionals,
                                secondary-school learners, entrepreneurs and creative
                                talent through four connected programmes.
                            </p>

                            <ol className="mt-9 flex flex-col gap-5">
                                {PILLARS.map((pillar, i) => (
                                    <li key={pillar.title} className="flex gap-4">
                                        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-blue/25 bg-blue/5 text-[13px] font-semibold text-blue-dark dark:border-blue-light/40 dark:bg-blue-light/10 dark:text-blue-light">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div className="flex flex-col gap-1">
                                            <h3 className="text-[16px] font-semibold text-ink dark:text-white">
                                                {pillar.title}
                                            </h3>
                                            <p className="max-w-120 text-[14px] font-light leading-6 text-ink/60 dark:text-white/60">
                                                {pillar.gain}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>

                            <div className="mt-10">
                                <Link
                                    href="/apply"
                                    className="inline-flex items-center gap-3 rounded-full bg-blue px-8 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-blue-dark"
                                >
                                    Apply to STEP
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>

                        {/* Right: framed image */}
                        <div className="relative">
                            <div
                                aria-hidden
                                className="absolute -bottom-5 -left-5 h-full w-full rounded-none bg-blue-light/50"
                            />
                            <img
                                src={images.project2}
                                alt="STEP participants collaborating"
                                className="relative h-105 w-full rounded-none object-cover shadow-soft sm:h-125 lg:h-145"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Programme details */}
            <section className="bg-white py-16 dark:bg-[#202020] sm:py-24">
                <div className="container-x">
                    <div className="flex flex-col gap-16 sm:gap-24">
                        {PILLARS.map((pillar, i) => {
                            const flip = i % 2 === 1;
                            return (
                                <div
                                    key={pillar.title}
                                    className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center lg:gap-0"
                                >
                                    {/* Image */}
                                    <div className={flip ? "lg:order-2" : "lg:order-1"}>
                                        <img
                                            src={pillar.image}
                                            alt={pillar.title}
                                            className="h-64 w-full object-cover sm:h-80 lg:h-115"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Text */}
                                    <div
                                        className={`flex flex-col justify-center py-2 ${
                                            flip
                                                ? "lg:order-1 lg:pr-16"
                                                : "lg:order-2 lg:pl-16"
                                        }`}
                                    >
                                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue-dark dark:text-blue-light">
                                            Pillar {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <h3 className="mt-4 text-[clamp(24px,2.6vw,34px)] font-semibold leading-[1.2] text-ink dark:text-white">
                                            {pillar.title}
                                        </h3>
                                        <p className="mt-4 text-[15px] font-semibold text-blue-dark dark:text-blue-light">
                                            {pillar.gain}
                                        </p>
                                        <p className="mt-4 text-[15px] font-light leading-7 text-ink/70 dark:text-white/70">
                                            {pillar.body}
                                        </p>
                                        <p className="mt-3 text-[14px] font-light leading-6.5 text-ink/60 dark:text-white/60">
                                            {pillar.modules}
                                        </p>
                                        <Link
                                            href="/services"
                                            className="group mt-7 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[1.5px] text-blue-dark transition-colors hover:text-blue dark:text-blue-light dark:hover:text-blue-light/80"
                                        >
                                            Learn more
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Launch and sequencing */}
                    <div className="mt-16 rounded-lg border border-line bg-light/60 p-6 dark:border-[#333] dark:bg-[#242527]">
                        <h3 className="text-[13px] font-semibold text-ink dark:text-white">
                            Launch and sequencing
                        </h3>
                        <p className="mt-2 text-[13px] leading-[1.8] text-ink/70 dark:text-white/70">
                            STEP will be introduced at the Career Excellence Youth Seminar
                            on 24 October 2026. Institutional setup and partnership
                            development will precede a planned public call for three pilot
                            pathways in February 2027. School bootcamps will use direct paid
                            registration, not a competitive application call.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
