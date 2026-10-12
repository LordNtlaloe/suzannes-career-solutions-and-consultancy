import {
    Building2,
    GraduationCap,
    HandCoins,
    HeartHandshake,
    Monitor,
    Palette,
} from "lucide-react";

const PARTNERS = [
    {
        category: "Employers and professional bodies",
        contribution: "Mentors, guest experts, work-experience hosts, sector guidance and recruitment insight",
        icon: Building2,
    },
    {
        category: "Universities, schools and training providers",
        contribution: "Curriculum input, facilitators, learning content, venues and certification pathways",
        icon: GraduationCap,
    },
    {
        category: "Technology and digital learning organisations",
        contribution: "Learning platforms, software access, data / connectivity, devices and digital mentoring",
        icon: Monitor,
    },
    {
        category: "Creative industries and enterprise support organisations",
        contribution: "Industry briefs, exhibition space, buyer links, incubation and portfolio reviews",
        icon: Palette,
    },
    {
        category: "Development partners, foundations and funders",
        contribution: "Institutional grants, programme sponsorship, stipend pools and monitoring support",
        icon: HandCoins,
    },
    {
        category: "Community and inclusion organisations",
        contribution: "District outreach, disability inclusion, referrals and safeguarding advice",
        icon: HeartHandshake,
    },
];

export function Partnerships() {
    return (
        <section id="partners" className="border-y border-line bg-light/82">
            <div className="container-x py-16 sm:py-20">
                <header className="mx-auto mb-12 max-w-2xl text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Partnerships
                    </span>
                    <h2 className="section-heading mt-3 text-ink">
                        Partners by function.
                    </h2>
                    <p className="mt-4 text-[15px] leading-[28px] text-black/70 dark:text-white/70">
                        STEP seeks partners by function rather than by name, guided
                        by written scopes, mutually agreed outcomes, safeguarding
                        and data protection requirements.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                    {PARTNERS.map(({ category, contribution, icon: Icon }) => (
                        <div
                            key={category}
                            className="flex items-start gap-4 border-t border-line pt-6"
                        >
                            <span className="grid size-12 shrink-0 place-items-center rounded-full border border-blue/25 bg-blue/5">
                                <Icon
                                    className="h-5 w-5 text-blue-dark dark:text-blue-light"
                                    strokeWidth={1.75}
                                />
                            </span>
                            <div>
                                <h3 className="text-[14px] font-semibold text-ink dark:text-white">
                                    {category}
                                </h3>
                                <p className="mt-1.5 text-[13px] leading-[1.7] text-black/60 dark:text-white/60">
                                    {contribution}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mx-auto mt-12 max-w-3xl text-center text-[14px] leading-[1.9] text-black/70 dark:text-white/70">
                    Depending on the engagement, STEP will use letters of
                    collaboration, memoranda of understanding, service agreements,
                    volunteer terms, host placement agreements and data-sharing
                    agreements. Public announcements will follow written approval
                    from relevant partners.
                </p>
            </div>
        </section>
    );
}
