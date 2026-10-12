import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Hero } from "@/components/public/hero"
import { Services } from "@/components/public/services"
import { Process } from "@/components/public/process"
import { Testimonials } from "@/components/public/testimonials"

export const metadata: Metadata = {
    title: "The Programme — STEP",
    description:
        "The STEP six-month pathway: learning, coaching, mentoring, practical application and a verified Skills Passport.",
    openGraph: {
        title: "The Programme — STEP",
        description:
            "The STEP six-month pathway: learning, coaching, mentoring, practical application and a verified Skills Passport.",
    },
}

export default function ServicesPage() {
    return (
        <>
            <Hero
                eyebrow="THE PROGRAMME"
                title="A pathway that fits where you are."
                text="Six structured months of learning, coaching, mentoring and assessed practice — organised around eight industry cohorts."
            />

            <Services />

            <Process />

            <section className="container-x py-16 sm:py-20">
                <div className="rounded-2xl border border-line bg-linear-to-br from-blue/10 via-card to-muted p-8 sm:p-12 shadow-soft text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Not sure which pathway fits?
                    </span>
                    <h2 className="section-heading mt-3 leading-tight">
                        Apply and we&apos;ll help you find out.
                    </h2>
                    <p className="section-copy mt-4 max-w-xl mx-auto">
                        Registration is open to committed Basotho participants
                        across every career stage. The programme team reviews
                        every application before cohort allocation.
                    </p>
                    <Link
                        href="/apply"
                        className="btn-brand mt-6 inline-flex"
                    >
                        Apply to STEP
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </section>

            <Testimonials />
        </>
    )
}