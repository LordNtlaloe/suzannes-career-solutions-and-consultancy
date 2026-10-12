import { Atom, Eye, Trophy } from "lucide-react";
import { images } from "@/lib/data";

export function VisionMission() {
    return (
        <section className="container-x py-16 sm:py-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                    <span className="grid h-20 w-20 place-items-center rounded-full border border-blue/25 bg-blue/5">
                        <Eye className="h-9 w-9 text-blue-dark" strokeWidth={1.5} />
                    </span>
                    <h3 className="mt-5 text-[22px] font-normal text-ink">
                        Our Vision
                    </h3>
                    <p className="mt-4 max-w-[268px] text-[16px] font-light leading-[28px] text-black/70">
                        A Lesotho where every young person, regardless of
                        background, can develop their potential and access
                        meaningful opportunities in work, enterprise and the
                        creative economy.
                    </p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <span className="grid h-20 w-20 place-items-center rounded-full border border-blue/25 bg-blue/5">
                        <Trophy className="h-9 w-9 text-blue-dark" strokeWidth={1.5} />
                    </span>
                    <h3 className="mt-5 text-[22px] font-normal text-ink">
                        Our Mission
                    </h3>
                    <p className="mt-4 max-w-[268px] text-[16px] font-light leading-[28px] text-black/70">
                        To connect Basotho talent to practical learning,
                        professional mentorship, supervised experience,
                        industry networks and markets through inclusive,
                        accountable partnerships.
                    </p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <span className="grid h-20 w-20 place-items-center rounded-full border border-blue/25 bg-blue/5">
                        <Atom className="h-9 w-9 text-blue-dark" strokeWidth={1.5} />
                    </span>
                    <h3 className="mt-5 text-[22px] font-normal text-ink">
                        Our Values
                    </h3>
                    <p className="mt-4 max-w-[268px] text-[16px] font-light leading-[28px] text-black/70">
                        Inclusive, accountable and evidence-driven.
                        Safeguarding, consent and fair selection are built
                        into every programme, with representation sought
                        across Lesotho&rsquo;s ten districts.
                    </p>
                </div>
            </div>

            {/* Photo collage + statement */}
            <div className="mt-20 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <div className="relative mx-auto w-full max-w-[668px]">
                    <img
                        src={images.story}
                        alt="Volunteers and participants at work"
                        className="h-[544px] w-full rounded-none object-cover"
                        loading="lazy"
                    />
                    <img
                        src={images.consultant}
                        alt="Supporting young talent"
                        className="absolute -bottom-10 -right-8 h-[200px] w-[200px] rounded-none border-[5px] border-white object-cover shadow-soft sm:h-[280px] sm:w-[280px] lg:h-[343px] lg:w-[343px]"
                        loading="lazy"
                    />
                </div>

                <div>
                    <h2 className="max-w-[613px] text-[clamp(28px,3vw,42px)] font-semibold leading-[1.25] text-blue-dark">
                        What we do to make a difference.
                    </h2>
                    <p className="mt-6 max-w-[593px] text-[18px] font-light leading-[32px] text-black/70">
                        STEP links learning, mentorship, supervised experience
                        and markets into one continuous pathway &mdash; so young
                        Basotho can move from education and ambition to
                        demonstrable skills, practical experience, enterprise
                        growth and sustainable livelihoods.
                    </p>
                </div>
            </div>
        </section>
    );
}
