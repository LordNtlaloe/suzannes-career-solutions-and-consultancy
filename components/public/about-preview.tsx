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
                        Built by people who&apos;ve seen what access without
                        structure does.
                    </h2>
                    <div className="section-copy flex flex-col gap-4 leading-relaxed">
                        <p>
                            STEP was co-founded by Mammenyane Suzanne
                            Mots&rsquo;oane and Thabo Maibi, bringing together
                            years of supporting job seekers with artificial
                            intelligence and technology entrepreneurship.
                        </p>
                        <p>
                            Together they designed a continuous, non-profit
                            pathway: four connected programmes linking
                            learning, mentorship, supervised experience and
                            markets, finished with a verified STEP Skills
                            Passport.
                        </p>
                    </div>
                    <div>
                        <Link
                            href="/about"
                            className="text-link-brand text-blue-dark transition-opacity hover:opacity-70"
                        >
                            Read our full story
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                        </Link>
                    </div>
                </div>

                {/* Right column — visual anchor */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard value="4" label="Connected programmes" />
                    <StatCard value="75%" label="Completion target" />
                    <StatCard value="80%" label="Mentoring target" />
                    <StatCard value="10" label="Districts served" />
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