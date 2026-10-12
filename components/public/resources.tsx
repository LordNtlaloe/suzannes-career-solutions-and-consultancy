import { CalendarDays, HeartHandshake, Monitor, ShieldCheck, Users } from "lucide-react";

const RESOURCES = [
    { area: "People", need: "Programme coordinator, finance / admin support, facilitators, mentors, safeguarding focal point and M&E support", icon: Users },
    { area: "Learning & technology", need: "LMS or shared learning portal, data bundles, accessibility tools, devices, assessment and tracking systems", icon: Monitor },
    { area: "Delivery & events", need: "Training venues, school outreach, exhibition logistics, travel and accommodation support", icon: CalendarDays },
    { area: "Participant support", need: "Reasonable accommodation, hardship support, connectivity and funded stipends where approved", icon: HeartHandshake },
    { area: "Systems & assurance", need: "Registration, financial controls, insurance, legal advice, policies, reporting and audit", icon: ShieldCheck },
];

export function Resources() {
    return (
        <section className="border-y border-line bg-light/82">
            <div className="container-x py-16 sm:py-20">
                <header className="mb-12 max-w-2xl">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Resources required
                    </span>
                    <h2 className="section-heading mt-3 text-ink">
                        What it takes to deliver.
                    </h2>
                </header>

                <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                    {RESOURCES.map(({ area, need, icon: Icon }) => (
                        <div key={area} className="flex items-start gap-4">
                            <span className="grid size-12 shrink-0 place-items-center rounded-none border border-blue/25 bg-white dark:bg-[#242527]">
                                <Icon
                                    className="h-5 w-5 text-blue-dark dark:text-blue-light"
                                    strokeWidth={1.75}
                                />
                            </span>
                            <div>
                                <h3 className="text-[14px] font-semibold text-ink dark:text-white">
                                    {area}
                                </h3>
                                <p className="mt-1.5 text-[13px] leading-[1.7] text-black/60 dark:text-white/60">
                                    {need}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
