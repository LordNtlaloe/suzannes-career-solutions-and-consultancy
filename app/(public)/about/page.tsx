import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { images } from "@/lib/data"
import { Hero } from "@/components/public/hero"
import { MissionVision } from "@/components/public/mission-vision"
import { TrustBar } from "@/components/public/trust-bar"

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

export default function AboutPage() {
    return (
        <>
            <Hero
                eyebrow="ABOUT STEP"
                title="An opportunity pathway for Basotho talent."
                text="STEP links learning, mentorship, supervised experience and markets into one continuous pathway — from school and ambition to sustainable livelihoods."
            />

            {/* Story section */}
            <section className="container-x py-16 sm:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="h-100 border border-line p-2.5 shadow-soft max-md:mt-5 md:order-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={images.story}
                            alt="Participants collaborating"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="flex flex-col gap-5 md:order-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            Our Story
                        </span>
                        <h2 className="section-heading leading-tight">
                            Built on experience, driven by opportunity.
                        </h2>

                        <div className="section-copy flex flex-col gap-4 leading-relaxed">
                            <p>
                                STEP was conceived by Mammenyane Suzanne
                                Mots&rsquo;oane, founder of Suzanne&rsquo;s Career
                                Solutions &amp; Consultancy, through years of
                                supporting job seekers with applications, career
                                guidance and employability preparation.
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
                            <p>
                                Whether you&apos;re a job seeker, a professional,
                                a learner or a partner, STEP brings the same
                                principles: clear structure, verified
                                capabilities and follow-through that lasts
                                beyond a one-off event.
                            </p>
                        </div>

                        <Link
                            href="/"
                            className="text-link-brand text-blue-dark transition-opacity hover:opacity-70 mt-2"
                        >
                            Explore the programme
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="border-y border-line bg-light/82">
                <div className="container-x py-16 sm:py-20">
                    <header className="flex flex-col gap-3 max-w-2xl mb-12">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            Our values
                        </span>
                        <h2 className="section-heading">
                            How we work
                        </h2>
                        <p className="section-copy">
                            These principles guide every application, every
                            assessment, and every introduction we make.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ValueCard
                            title="Continuous pathway"
                            body="Four connected programmes move talent from school and ambition to skills, experience and livelihoods."
                        />
                        <ValueCard
                            title="Verified capabilities"
                            body="Assessed learning, mentor records and a STEP Skills Passport prove what participants can do."
                        />
                        <ValueCard
                            title="Inclusive access"
                            body="Representation across Lesotho&apos;s ten districts, with reasonable accommodations and alternative registration channels."
                        />
                        <ValueCard
                            title="Accountable partnerships"
                            body="Written scopes, agreed outcomes and safeguarding requirements apply to every engagement."
                        />
                        <ValueCard
                            title="Measured outcomes"
                            body="Published first-cycle targets for completion, competency gains, mentoring and inclusion."
                        />
                        <ValueCard
                            title="Safeguarding first"
                            body="Child safeguarding, consent and data protection are mandatory across every programme."
                        />
                    </div>
                </div>
            </section>

            <TrustBar />

            <MissionVision />
        </>
    )
}

function ValueCard({
    title,
    body,
}: {
    title: string
    body: string
}) {
    return (
        <div className="rounded-lg border border-line bg-card p-6 flex flex-col gap-3">
            <div className="h-8 w-8 rounded-full bg-blue/12 flex items-center justify-center">
                <Check className="h-4 w-4 text-blue-dark" />
            </div>
            <h3 className="font-semibold text-[16px]">{title}</h3>
            <p className="section-copy leading-relaxed">{body}</p>
        </div>
    )
}