import { Compass, Telescope } from "lucide-react"

export function MissionVision() {
    return (
        <section
            id="mission"
            className="scroll-mt-16 border-y border-line bg-light/82 dark:border-[#333] dark:bg-[#1a1a1a]"
        >
            <div className="container-x py-16 sm:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Mission */}
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-2 text-blue-dark">
                            <Compass className="h-4 w-4" aria-hidden />
                            <span className="text-[11px] font-semibold uppercase tracking-[2.4px]">
                                Mission
                            </span>
                        </div>
                        <h3 className="section-heading text-[clamp(28px,3vw,34px)]! leading-snug">
                            Connect Basotho talent to learning, mentorship and
                            markets.
                        </h3>
                        <p className="section-copy leading-relaxed">
                            STEP connects Basotho talent to practical learning,
                            professional mentorship, supervised experience,
                            industry networks and markets — through inclusive,
                            accountable partnerships.
                        </p>
                        <ul className="flex flex-col gap-3 pt-2">
                            <Bullet>
                                Four connected programmes, from school to
                                sustainable livelihoods.
                            </Bullet>
                            <Bullet>
                                Measured outcomes and published first-cycle
                                targets.
                            </Bullet>
                            <Bullet>
                                Safeguarding and consent built into every
                                placement and activity.
                            </Bullet>
                        </ul>
                    </div>

                    {/* Vision */}
                    <div className="flex flex-col gap-5">
                        <div className="flex items-center gap-2 text-blue-dark">
                            <Telescope className="h-4 w-4" aria-hidden />
                            <span className="text-[11px] font-semibold uppercase tracking-[2.4px]">
                                Vision
                            </span>
                        </div>
                        <h3 className="section-heading text-[clamp(28px,3vw,34px)]! leading-snug">
                            A Lesotho where every young person can develop
                            their potential.
                        </h3>
                        <p className="section-copy leading-relaxed">
                            A Lesotho where every young person, regardless of
                            background, can develop their potential and access
                            meaningful opportunities in work, enterprise and
                            the creative economy.
                        </p>
                        <ul className="flex flex-col gap-3 pt-2">
                            <Bullet>
                                Purpose: close the gap between qualifications,
                                capabilities and opportunity.
                            </Bullet>
                            <Bullet>
                                Continuous pathways beyond one-off career
                                events or isolated training.
                            </Bullet>
                            <Bullet>
                                Representation across Lesotho&rsquo;s ten
                                districts.
                            </Bullet>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}

function Bullet({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex items-start gap-3">
            <span className="mt-2 shrink-0 inline-block h-1.5 w-1.5 rounded-full bg-blue" />
            <span className="text-[13px] text-[#a1a1a1] leading-relaxed dark:text-[#9ca3af]">
                {children}
            </span>
        </li>
    )
}