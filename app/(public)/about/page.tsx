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
        "Learn more about STEP — a six-month incubation and opportunity pathway for 600+ Basotho participants.",
    openGraph: {
        title: "About — STEP",
        description:
            "Learn more about STEP — a six-month incubation and opportunity pathway for 600+ Basotho participants.",
    },
}

export default function AboutPage() {
    return (
        <>
            <Hero
                eyebrow="ABOUT STEP"
                title="A pathway from potential to verified readiness."
                text="STEP links learning to application, application to assessment, and verified preparedness to opportunity — for 600+ Basotho participants every intake."
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
                                STEP started with a simple observation: access
                                to learning isn&apos;t the same as preparedness.
                                Many Basotho hold qualifications, experience,
                                creative ability and viable ideas — yet remain
                                disconnected from structured development,
                                credible guidance and visible pathways into
                                opportunity.
                            </p>
                            <p>
                                We built STEP to bridge that gap. Six months of
                                learning, coaching, mentoring and practical
                                application, organised around eight industry
                                cohorts and finished with a verified STEP
                                Skills Passport. Every level is earned through
                                assessed evidence — never time served.
                            </p>
                            <p>
                                Whether you&apos;re a participant ready to be
                                developed or a partner ready to open doors,
                                STEP brings the same principles: clear
                                structure, verified progress and follow-through
                                that lasts beyond the six months.
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
                            title="Verified, not assumed"
                            body="Every level is earned through assessed evidence, audited progression and recorded decisions."
                        />
                        <ValueCard
                            title="Industry-aligned"
                            body="Eight cohorts keep learning, mentoring and practice relevant to real pathways into work."
                        />
                        <ValueCard
                            title="Participant-first"
                            body="Applications are reviewed individually, and no participant is introduced without their consent."
                        />
                        <ValueCard
                            title="Transparent process"
                            body="You always know your level, your progress and exactly what&apos;s required to advance."
                        />
                        <ValueCard
                            title="Confidentiality"
                            body="Demographic and safeguarding data is restricted to the people who genuinely need it."
                        />
                        <ValueCard
                            title="Lasting outcomes"
                            body="Success is measured by verified readiness and real opportunity — not attendance."
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