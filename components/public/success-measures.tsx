import {
    Briefcase,
    GraduationCap,
    HeartHandshake,
    Lightbulb,
    TrendingUp,
    Users,
} from "lucide-react";
import { images } from "@/lib/data";

const MEASURES = [
    {
        stat: "75%",
        label: "Academy completion",
        target: "At least 75% of enrolled participants complete required learning",
        icon: GraduationCap,
        image: images.service1,
    },
    {
        stat: "70%",
        label: "Competency gains",
        target: "At least 70% of assessed completers improve on agreed baseline measures",
        icon: TrendingUp,
        image: images.service3,
    },
    {
        stat: "80%",
        label: "Mentorship",
        target: "At least 80% of completers receive documented mentoring or coaching",
        icon: Users,
        image: images.consultant,
    },
    {
        label: "Experience placements",
        target: "Track number matched, completion, supervision quality and stipend coverage; set numeric target after host commitments",
        icon: Briefcase,
        image: images.project2,
    },
    {
        label: "Enterprise / creative outcomes",
        target: "Track portfolios, products, paid commissions, sales and buyer introductions",
        icon: Lightbulb,
        image: images.project4,
    },
    {
        label: "Inclusion",
        target: "Report participation and completion by district, gender and disability status where consented",
        icon: HeartHandshake,
        image: images.story,
    },
];

export function SuccessMeasures() {
    return (
        <section className="border-y border-line bg-light/82">
            <div className="container-x py-16 sm:py-20">
                <header className="mx-auto mb-12 max-w-full text-center">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        First-cycle success measures
                    </span>
                    <h2 className="section-heading mt-3 text-ink">Indicative targets.</h2>
                    <p className="mt-4 text-[15px] leading-[28px] text-black/70 dark:text-white/70">
                        All targets are indicative and will be confirmed after
                        funding, capacity assessment and baseline collection.
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {MEASURES.map(({ icon: Icon, stat, label, target, image }) => (
                        <div
                            key={label}
                            className="relative flex flex-col gap-3 overflow-hidden rounded-lg border border-line p-6"
                        >
                            <img
                                src={image}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/60" />
                            <div className="relative z-1 flex items-center justify-between">
                                <span className="grid size-11 place-items-center rounded-full border border-white/40 bg-white/10">
                                    <Icon
                                        className="h-5 w-5 text-white"
                                        strokeWidth={1.75}
                                    />
                                </span>
                                {stat ? (
                                    <strong className="text-2xl font-bold text-white">
                                        {stat}
                                    </strong>
                                ) : null}
                            </div>
                            <h3 className="relative z-1 text-[15px] font-semibold text-white">
                                {label}
                            </h3>
                            <p className="relative z-1 text-[13px] leading-[1.8] text-white/85">
                                {target}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
