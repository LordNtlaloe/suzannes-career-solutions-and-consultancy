import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Hero } from "@/components/public/hero"
import { Services } from "@/components/public/services"
import { Process } from "@/components/public/process"
import { Testimonials } from "@/components/public/testimonials"

export const metadata: Metadata = {
    title: "Services — Suzannes Agency",
    description:
        "Career coaching, interview preparation, talent matching, and hiring support for professionals and companies.",
    openGraph: {
        title: "Services — Suzannes Agency",
        description:
            "Career coaching, interview preparation, talent matching, and hiring support for professionals and companies.",
    },
}

export default function ServicesPage() {
    return (
        <>
            <Hero
                eyebrow="SERVICES"
                title="Career support that actually fits."
                text="Practical, honest services for professionals navigating their next move and companies building great teams."
            />

            <Services />

            <Process />

            <section className="container-x py-16 sm:py-20">
                <div className="rounded-2xl border border-line bg-linear-to-br from-blue/5 via-white to-white p-8 sm:p-12 shadow-soft text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Not sure where to start?
                    </span>
                    <h2 className="section-heading mt-3 leading-tight">
                        Book a free 20-minute call.
                    </h2>
                    <p className="section-copy mt-4 max-w-xl mx-auto">
                        No pitch deck, no sales script — just a conversation to see if
                        we&apos;re a fit. We&apos;ll tell you honestly if we think we can help.
                    </p>
                    <Link
                        href="/contact"
                        className="btn-brand mt-6 inline-flex"
                    >
                        Get in touch
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </section>

            <Testimonials />
        </>
    )
}