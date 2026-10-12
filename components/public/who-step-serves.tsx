import Link from "next/link";
import { Briefcase, GraduationCap, Lightbulb } from "lucide-react";

export function WhoStepServes() {
    return (
        <section className="container-x py-16 sm:py-20">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
                {/* Left column */}
                <div className="flex flex-col justify-center border-l-[3px] border-blue pl-8">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Target beneficiaries &amp; access
                    </span>
                    <h2 className="mt-3 text-[clamp(36px,4vw,56px)] font-bold leading-[1.1] text-ink">
                        Who STEP
                        <br />
                        serves.
                    </h2>
                    <p className="mt-6 max-w-md text-[15px] leading-[28px] text-black/70 dark:text-white/70">
                        STEP will seek representation across Lesotho&rsquo;s ten
                        districts, including rural youth, women, young parents,
                        persons with disabilities and those with limited digital
                        access.
                    </p>
                    <Link
                        href="/apply"
                        className="group mt-8 inline-flex flex-col items-start"
                    >
                        <span className="bg-blue px-6 py-4 text-[13px] font-semibold uppercase tracking-[2px] text-light">
                            Get involved
                        </span>
                        <span className="mt-2 h-[2px] w-24 bg-blue-dark transition-all duration-300 group-hover:w-32 dark:bg-blue-light" />
                    </Link>
                </div>

                {/* Right column: beneficiary groups */}
                <div className="flex flex-col justify-center gap-8">
                    {[
                        {
                            icon: Briefcase,
                            title: "Job seekers & emerging professionals",
                            text: "Graduates, unemployed youth, career changers and early-career professionals join through open application, with selection based on motivation, readiness, inclusion and available places. Eligible completers may progress to supervised work experience.",
                        },
                        {
                            icon: Lightbulb,
                            title: "Entrepreneurs, artists & creators",
                            text: "Aspiring entrepreneurs, artists, designers, filmmakers, musicians and content creators join the Creative Economy Lab pilot to commercialise their talent and build portfolios.",
                        },
                        {
                            icon: GraduationCap,
                            title: "School learners",
                            text: "Secondary-school learners join the Career Discovery Bootcamps through direct registration and fee payment, with subsidised places sought where possible.",
                        },
                    ].map(({ icon: Icon, title, text }) => (
                        <div key={title} className="flex items-start gap-5">
                            <span className="grid size-16 shrink-0 place-items-center rounded-full border-2 border-blue bg-white dark:bg-[#242527]">
                                <Icon
                                    className="h-7 w-7 text-blue-dark dark:text-blue-light"
                                    strokeWidth={1.75}
                                />
                            </span>
                            <div>
                                <h3 className="text-[17px] font-semibold text-ink dark:text-white">
                                    {title}
                                </h3>
                                <p className="mt-1.5 text-[14px] leading-[24px] text-black/60 dark:text-white/60">
                                    {text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
