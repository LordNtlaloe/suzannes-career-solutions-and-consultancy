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
                            Close the gap between access and preparedness.
                        </h3>
                        <p className="section-copy leading-relaxed">
                            STEP exists to convert access to learning into
                            verified preparedness — linking learning to
                            application, application to assessment, and
                            verified readiness to opportunity.
                        </p>
                        <ul className="flex flex-col gap-3 pt-2">
                            <Bullet>
                                600+ Basotho participants supported each intake.
                            </Bullet>
                            <Bullet>
                                Every level is earned through assessed
                                evidence.
                            </Bullet>
                            <Bullet>
                                No participant is introduced without their
                                consent.
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
                            A Basotho workforce that is seen, verified and
                            opportunity-ready.
                        </h3>
                        <p className="section-copy leading-relaxed">
                            We want STEP to be the pathway people trust — not
                            because it promises work, but because it proves
                            readiness and opens doors fairly.
                        </p>
                        <ul className="flex flex-col gap-3 pt-2">
                            <Bullet>
                                Verified by evidence, not by connections.
                            </Bullet>
                            <Bullet>
                                Open across every career stage and industry.
                            </Bullet>
                            <Bullet>
                                Outcomes that last beyond the six months.
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