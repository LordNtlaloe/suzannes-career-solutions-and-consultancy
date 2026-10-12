import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Hero } from "@/components/public/hero"
import { Services } from "@/components/public/services"
import { Process } from "@/components/public/process"
import { Testimonials } from "@/components/public/testimonials"

export const metadata: Metadata = {
    title: "The Programmes — STEP",
    description:
        "STEP's four connected programmes: the Career Readiness Academy, Talent Experience Pathway, Schools Career Discovery Bootcamps and Entrepreneurship & Creative Economy Lab.",
    openGraph: {
        title: "The Programmes — STEP",
        description:
            "STEP's four connected programmes: the Career Readiness Academy, Talent Experience Pathway, Schools Career Discovery Bootcamps and Entrepreneurship & Creative Economy Lab.",
    },
}

export default function ServicesPage() {
    return (
        <>
            <Hero
                eyebrow="THE PROGRAMMES"
                title="Four programmes, one continuous pathway."
                text="STEP links learning, mentorship, supervised experience and markets — from school and ambition to sustainable livelihoods."
            />

            <Services />

            <Process />

            <section className="container-x py-16 sm:py-20">
                <div className="rounded-2xl border border-line bg-linear-to-br from-blue/10 via-card to-muted p-8 sm:p-12 shadow-soft text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Not sure which programme fits?
                    </span>
                    <h2 className="section-heading mt-3 leading-tight">
                        Register your interest and we&apos;ll help.
                    </h2>
                    <p className="section-copy mt-4 max-w-xl mx-auto">
                        The three open-call pathways launch their pilot
                        recruitment no earlier than February 2027. School
                        bootcamps use direct paid registration.
                    </p>
                    <Link
                        href="/apply"
                        className="btn-brand mt-6 inline-flex"
                    >
                        Register your interest
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </section>

            <Testimonials />
        </>
    )
}