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
                            Make hiring work for the people inside it.
                        </h3>
                        <p className="section-copy leading-relaxed">
                            We exist to close the gap between the careers
                            people want and the teams that need them — with
                            honesty on both sides, and none of the noise.
                        </p>
                        <ul className="flex flex-col gap-3 pt-2">
                            <Bullet>
                                Every candidate gets a real response, not an
                                automated rejection.
                            </Bullet>
                            <Bullet>
                                Every role has a real salary range, published
                                upfront.
                            </Bullet>
                            <Bullet>
                                We never send your CV to a company without
                                asking first.
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
                            A world where hiring is a conversation, not a
                            lottery.
                        </h3>
                        <p className="section-copy leading-relaxed">
                            We want to be the agency people recommend not
                            because they got a job, but because they were
                            treated like a person the whole way through.
                        </p>
                        <ul className="flex flex-col gap-3 pt-2">
                            <Bullet>
                                Referred by name — trusted because we earned
                                it.
                            </Bullet>
                            <Bullet>
                                Remote-first, worldwide. Careers shouldn&apos;t
                                depend on a postcode.
                            </Bullet>
                            <Bullet>
                                Placements that last. Promotions that follow.
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