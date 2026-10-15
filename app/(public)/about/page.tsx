import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Quote } from "lucide-react"
import { images } from "@/lib/data"

export const metadata: Metadata = {
    title: "About — STEP",
    description:
        "Learn more about STEP — a proposed youth-led, non-profit institution helping Basotho move from education and ambition to demonstrable skills, practical experience, enterprise growth and sustainable livelihoods.",
    openGraph: {
        title: "About — STEP",
        description:
            "Learn more about STEP — a proposed youth-led, non-profit institution helping Basotho move from education and ambition to demonstrable skills, practical experience, enterprise growth and sustainable livelihoods.",
    },
}

const STEPS = [
    {
        number: "01",
        title: "Learn",
        body: "Join the six-month Career Readiness Academy for training, mentorship, coaching and a verified STEP Skills Passport.",
    },
    {
        number: "02",
        title: "Gain experience",
        body: "Progress to structured, supervised work-experience placements with employer exposure and mentorship.",
    },
    {
        number: "03",
        title: "Launch & grow",
        body: "Commercialise your talent through the Entrepreneurship & Creative Economy Lab and the Schools Career Discovery Bootcamps.",
    },
]

const TESTIMONIALS = [
    {
        quote: "I had qualifications but no clear path. STEP gave me structure, mentorship, and a Skills Passport that employers actually looked at.",
        author: "Reitumetse K.",
        role: "Career Readiness Academy",
    },
    {
        quote: "The mentoring was the part I didn't know I needed. Six months later I walked into interviews with evidence, not just confidence.",
        author: "Katleho M.",
        role: "Talent Experience Pathway",
    },
    {
        quote: "As an employer, the passport told me what a candidate could actually do. We've hired two STEP graduates so far.",
        author: "Naledi R.",
        role: "HR Lead, partner organisation",
    },
]

export default function AboutPage() {
    return (
        <>
            {/* Hero */}
            <section className="bg-hero-grad text-white">
                <div className="container-x grid grid-cols-1 items-center gap-12 py-20 sm:py-24 lg:grid-cols-2">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue-light">
                            About STEP
                        </p>
                        <h1 className="mt-5 text-[clamp(40px,5vw,64px)] font-medium leading-[1.15] tracking-[-2px]">
                            Building connections,
                            <br />
                            creating impact.
                        </h1>
                        <p className="mt-6 max-w-xl text-[14px] leading-[1.8] text-[#c8c8c8]">
                            STEP links learning, mentorship, supervised
                            experience and markets into one continuous pathway —
                            from school and ambition to sustainable livelihoods.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[images.story, images.service1, images.project1, images.consultant].map(
                            (src, i) => (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    key={src + i}
                                    src={src}
                                    alt=""
                                    className="h-[190px] w-full object-cover sm:h-[240px]"
                                />
                            )
                        )}
                    </div>
                </div>
            </section>

            {/* Who we are */}
            <section className="container-x py-16 sm:py-20">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    <div className="flex flex-col gap-5">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            Who we are
                        </span>
                        <h2 className="section-heading leading-tight">
                            Built on experience, driven by opportunity.
                        </h2>

                        <div className="section-copy flex flex-col gap-4 leading-relaxed">
                            <p>
                                STEP was co-founded by Mammenyane Suzanne
                                Mots&rsquo;oane and Thabo Maibi. Suzanne is the
                                founder and CEO of Suzanne&rsquo;s Career Solutions
                                &amp; Consultancy (SCS Consultancy) and holds a
                                Master of Arts in Development Studies; Thabo is
                                an engineer, AI researcher and technology
                                entrepreneur who founded Career Agent, an
                                AI-powered career platform.
                            </p>
                            <p>
                                A strong CV or a single coaching session could
                                not overcome missing skills, experience and
                                networks. STEP is the independent, longer-term
                                response: a proposed non-profit institution
                                running four connected programmes — the Career
                                Readiness Academy, the Talent Experience
                                Pathway, Schools Career Discovery Bootcamps and
                                the Entrepreneurship &amp; Creative Economy Lab.
                            </p>
                        </div>

                        <Link
                            href="/services"
                            className="text-link-brand text-blue-dark transition-opacity hover:opacity-70 mt-2"
                        >
                            Explore the programme
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                        </Link>
                    </div>

                    <div className="h-100 border border-line p-2.5 shadow-soft max-md:mt-5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={images.story}
                            alt="Participants collaborating"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* How STEP works */}
            <section className="border-y border-line bg-light/82">
                <div className="container-x py-16 sm:py-20">
                    <header className="mx-auto mb-12 max-w-2xl text-center">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            How STEP works
                        </span>
                        <h2 className="section-heading mt-3 text-ink">
                            From ambition to opportunity.
                        </h2>
                        <p className="section-copy mt-4">
                            Three steps connect learning, experience and markets
                            into one continuous pathway.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {STEPS.map((step) => (
                            <div
                                key={step.number}
                                className="flex flex-col gap-4 border-t-2 border-blue pt-6"
                            >
                                <span className="text-[42px] font-semibold leading-none text-blue-dark">
                                    {step.number}
                                </span>
                                <h3 className="text-[18px] font-semibold text-ink">
                                    {step.title}
                                </h3>
                                <p className="text-[14px] leading-[26px] text-black/60 dark:text-white/60">
                                    {step.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Committed */}
            <section className="container-x py-16 sm:py-20">
                <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                    <div className="flex flex-col gap-5">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            Our commitment
                        </span>
                        <h2 className="section-heading leading-tight">
                            Together, we&apos;re committed to opportunity for
                            every young Basotho.
                        </h2>
                        <p className="section-copy max-w-xl leading-relaxed">
                            Inclusive, accountable and evidence-driven —
                            safeguarding, consent and fair selection are built
                            into every programme, with representation sought
                            across Lesotho&rsquo;s ten districts.
                        </p>
                        <Link href="/apply" className="btn-brand mt-3 self-start">
                            Apply to STEP
                        </Link>
                    </div>

                    <div className="h-100 border border-line p-2.5 shadow-soft max-md:mt-5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={images.project2}
                            alt="Skills development in action"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Our story */}
            <section className="bg-hero-grad text-white">
                <div className="container-x grid grid-cols-1 items-center gap-12 py-16 sm:py-20 lg:grid-cols-2">
                    <div className="flex flex-col gap-5">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue-light">
                            Our story
                        </span>
                        <h2 className="text-[clamp(32px,4vw,44px)] font-semibold leading-tight">
                            Co-founded to close the gap.
                        </h2>
                        <div className="flex flex-col gap-4 text-[14px] leading-[1.8] text-[#c8c8c8]">
                            <p>
                                The Skills, Talent &amp; Employment Pathway was
                                co-founded by Mammenyane Suzanne Mots&rsquo;oane and
                                Thabo Maibi in response to a shared challenge: too
                                many capable young Basotho struggle to translate
                                education, talent and ambition into demonstrable
                                skills, credible work experience and meaningful
                                economic opportunity.
                            </p>
                            <p>
                                Their collaboration combines direct experience of
                                the barriers faced by job seekers with the
                                potential of technology to improve access,
                                matching, learning and career navigation.
                            </p>
                        </div>

                        <blockquote className="mt-4 flex gap-4 border-l-2 border-blue pl-5">
                            <Quote
                                className="h-6 w-6 shrink-0 text-blue-light"
                                aria-hidden
                            />
                            <div>
                                <p className="text-[16px] font-light leading-[1.7] text-white">
                                    A short event can raise awareness, but rarely
                                    provides the sustained support required to
                                    demonstrate competence or enter opportunity
                                    networks.
                                </p>
                                <footer className="mt-3 text-[12px] text-[#c8c8c8]">
                                    Mammenyane Suzanne Mots&rsquo;oane, Co-founder
                                </footer>
                            </div>
                        </blockquote>
                    </div>

                    <div className="h-[420px] w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={images.consultant}
                            alt="STEP co-founder Mammenyane Suzanne Mots'oane"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Living our mission */}
            <section className="container-x py-16 sm:py-20">
                <header className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Living our mission
                    </span>
                    <h2 className="section-heading mt-3 text-ink">
                        What people say.
                    </h2>
                    <p className="section-copy mt-4">
                        From participants and partners who&apos;ve been through the
                        programme.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {TESTIMONIALS.map((t) => (
                        <figure
                            key={t.author}
                            className="flex flex-col gap-4 border border-line bg-white p-6 shadow-soft dark:border-[#333] dark:bg-[#242527]"
                        >
                            <Quote
                                className="h-5 w-5 text-blue/60"
                                aria-hidden
                            />
                            <blockquote className="text-[13px] leading-relaxed text-ink dark:text-[#d4d4d4]">
                                {t.quote}
                            </blockquote>
                            <figcaption className="mt-auto flex flex-col gap-0.5 border-t border-line pt-2 dark:border-[#333]">
                                <span className="text-[13px] font-semibold text-ink dark:text-[#f6f6f6]">
                                    {t.author}
                                </span>
                                <span className="text-[11px] text-[#a1a1a1] dark:text-[#9ca3af]">
                                    {t.role}
                                </span>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            {/* CTA + links */}
            <section className="container-x pb-20">
                <div className="flex flex-col items-center gap-6 bg-hero-grad px-6 py-16 text-center text-white sm:py-20">
                    <h2 className="text-[clamp(32px,4vw,44px)] font-semibold leading-tight">
                        Your pathway starts here.
                    </h2>
                    <p className="max-w-xl text-[14px] leading-[1.8] text-[#c8c8c8]">
                        Learn, gain experience and launch — with mentorship,
                        verified capabilities and access to opportunity networks.
                    </p>
                    <Link href="/apply" className="btn-brand">
                        Apply to STEP
                    </Link>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                    <Link
                        href="/contact"
                        className="group flex flex-col gap-2 border-t-2 border-line pt-5 transition-colors hover:border-blue"
                    >
                        <span className="text-[14px] font-semibold text-ink">
                            Partner with STEP
                        </span>
                        <span className="section-copy">
                            Host talent, mentor, or fund a pathway.
                        </span>
                        <ArrowRight className="h-4 w-4 text-blue-dark transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                        href="/apply"
                        className="group flex flex-col gap-2 border-t-2 border-line pt-5 transition-colors hover:border-blue"
                    >
                        <span className="text-[14px] font-semibold text-ink">
                            Apply to STEP
                        </span>
                        <span className="section-copy">
                            Join an open-call pilot pathway.
                        </span>
                        <ArrowRight className="h-4 w-4 text-blue-dark transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                        href="/services"
                        className="group flex flex-col gap-2 border-t-2 border-line pt-5 transition-colors hover:border-blue"
                    >
                        <span className="text-[14px] font-semibold text-ink">
                            Explore the programme
                        </span>
                        <span className="section-copy">
                            See the four connected pillars.
                        </span>
                        <ArrowRight className="h-4 w-4 text-blue-dark transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </section>
        </>
    )
}