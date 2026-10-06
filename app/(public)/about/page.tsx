import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { images } from "@/lib/data"
import { Hero } from "@/components/public/hero"
import { MissionVision } from "@/components/public/mission-vision"
import { TrustBar } from "@/components/public/trust-bar"

export const metadata: Metadata = {
    title: "About — Suzannes Agency",
    description:
        "Learn more about our career agency, our mission, and the team behind it.",
    openGraph: {
        title: "About — Suzannes Agency",
        description:
            "Learn more about our career agency, our mission, and the team behind it.",
    },
}

export default function AboutPage() {
    return (
        <>
            <Hero
                eyebrow="ABOUT US"
                title="We help professionals move with purpose."
                text="From clarifying your direction to landing the right opportunity — we provide honest, practical career support built on years of experience."
            />

            {/* Story section */}
            <section className="container-x py-16 sm:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="h-100 border border-line p-2.5 shadow-soft max-md:mt-5 md:order-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={images.story}
                            alt="Professionals collaborating"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="flex flex-col gap-5 md:order-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                            Our Story
                        </span>
                        <h2 className="section-heading leading-tight">
                            Built from experience, driven by purpose.
                        </h2>

                        <div className="section-copy flex flex-col gap-4 leading-relaxed">
                            <p>
                                Suzannes Agency started with a simple observation: the
                                hiring process is broken for everyone. Candidates feel
                                like numbers. Companies struggle to find the right
                                people. And somewhere in the middle, good matches never
                                happen.
                            </p>
                            <p>
                                We founded this agency to bridge that gap — with honesty
                                on both sides, practical support at every stage, and a
                                genuine commitment to the people we work with. We don&apos;t
                                believe in volume. We believe in fit.
                            </p>
                            <p>
                                Whether you&apos;re a professional looking for your next
                                move or a company building a team, we bring the same
                                 principles: clear communication, targeted strategy, and
                                follow-through that lasts beyond the placement.
                            </p>
                        </div>

                        <Link
                            href="/services"
                            className="text-link-brand text-blue-dark transition-opacity hover:opacity-70 mt-2"
                        >
                            See our services
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
                            These principles guide every conversation, every search, and
                            every recommendation we make.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ValueCard
                            title="Honest feedback"
                            body="We tell you what we see — even when it&apos;s hard to hear. No sugar-coating, no false hope."
                        />
                        <ValueCard
                            title="Personal approach"
                            body="Every person is different. We take the time to understand your story, your goals, and your strengths."
                        />
                        <ValueCard
                            title="Real results"
                            body="We measure success by lasting placements and genuine career progression, not by how many CVs we send out."
                        />
                        <ValueCard
                            title="Transparent process"
                            body="You always know where you stand. No black boxes, no surprise fees, no unanswered questions."
                        />
                        <ValueCard
                            title="Confidentiality first"
                            body="Your search stays private until you&apos;re ready to share. We never send your details without permission."
                        />
                        <ValueCard
                            title="Long-term thinking"
                            body="A good placement is one that works for years, not months. We focus on sustainable fits."
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