import {
    BriefcaseBusiness,
    Clock3,
    ShieldCheck,
    Target,
} from "lucide-react";
import { SectionIntro } from "./section-intro";
import { differentiators } from "@/lib/data";


const ICONS = [BriefcaseBusiness, Target, Clock3, ShieldCheck];

export function DifferentiatorsSection() {
    return (
        <section className="py-[85px] pb-[100px]">
            <div className="container-x">
                {/* Accent line */}
                <div className="ml-[5px] mb-[20px] h-[5px] w-[90px] bg-gradient-to-r from-blue-light to-blue" />

                <SectionIntro
                    heading={
                        <>
                            What Makes STEP
                            <br />
                            Different?
                        </>
                    }
                >
                    STEP turns access to learning into verified preparedness —
                    through industry cohorts, assessed progression and a Skills
                    Passport that employers can trust.
                </SectionIntro>

                <div className="mt-[58px] grid grid-cols-1 gap-[36px] max-[1100px]:gap-[20px] md:grid-cols-2 lg:grid-cols-4">
                    {differentiators.map((item, index) => {
                        const Icon = ICONS[index];
                        return (
                            <article key={item.title}>
                                <div className="grid h-[74px] w-[74px] place-items-center rounded-full bg-blue shadow-[0_0_0_10px_rgba(35,135,192,.12)]">
                                    <div className="grid place-items-center text-white [&>svg]:h-[30px] [&>svg]:w-[30px]">
                                        <Icon />
                                    </div>
                                </div>

                                <h3 className="mt-[26px] text-[18px] font-semibold">
                                    {item.title}
                                </h3>

                                <p className="section-copy mt-[12px]">{item.text}</p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}