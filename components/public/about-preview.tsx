import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function AboutPreview() {
    return (
        <section
            id="about"
            className="scroll-mt-16 container-x py-16 sm:py-20"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="flex flex-col gap-5">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        About
                    </span>
                    <h2 className="section-heading leading-tight">
                        Built by people who&apos;ve been on both sides of the
                        table.
                    </h2>
                    <div className="section-copy flex flex-col gap-4 leading-relaxed">
                        <p>
                            Suzannes Agency started because we got tired of
                            watching good people get filtered out by systems
                            that were never designed to see them.
                        </p>
                        <p>
                            After years in recruiting, we learned something
                            simple: most hiring isn&apos;t broken. It&apos;s just
                            impersonal. We started this agency to do it
                            differently — slow enough to understand a person,
                            selective enough to only send candidates we believe
                            in, direct enough to say when it&apos;s not a fit.
                        </p>
                    </div>
                    <div>
                        <Link
                            href="#contact"
                            className="text-link-brand text-blue-dark transition-opacity hover:opacity-70"
                        >
                            Read our full story
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                        </Link>
                    </div>
                </div>

                {/* Right column — visual anchor */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard value="12+" label="Years in recruiting" />
                    <StatCard value="480" label="Placements made" />
                    <StatCard value="94%" label="One-year retention" />
                    <StatCard value="38" label="Partner companies" />
                </div>
            </div>
        </section>
    )
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="rounded-lg border border-line bg-white p-5 flex flex-col gap-1 dark:bg-[#242527] dark:border-[#333]">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-blue-dark">
                {value}
            </span>
            <span className="text-[11px] text-[#a1a1a1] uppercase tracking-[2.4px]">
                {label}
            </span>
        </div>
    )
}