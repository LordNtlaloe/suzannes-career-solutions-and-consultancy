import {
    FileText,
    MessageSquare,
    Target,
    Users,
    Briefcase,
    Rocket,
} from "lucide-react"

type Service = {
    icon: React.ElementType
    title: string
    body: string
    price: string
}

const CANDIDATE_SERVICES: Service[] = [
    {
        icon: FileText,
        title: "Apply & baseline",
        body: "Register online, get reviewed by the programme team, and start from a baseline profile that places you on the right pathway.",
        price: "Month 0",
    },
    {
        icon: MessageSquare,
        title: "Learning & coaching",
        body: "Structured coursework, coaching and mentoring delivered around your industry cohort.",
        price: "Months 1–3",
    },
    {
        icon: Target,
        title: "Practical application",
        body: "Assessed projects and real-world practice that turn learning into demonstrated skill.",
        price: "Month 4",
    },
    {
        icon: Rocket,
        title: "Verified readiness",
        body: "Readiness assessment, progression decisions and a verified STEP Skills Passport.",
        price: "Months 5–6",
    },
]

const COMPANY_SERVICES: Service[] = [
    {
        icon: Users,
        title: "Provide opportunities",
        body: "Offer placements, projects, introductions or hiring pathways for verified participants.",
        price: "Partner",
    },
    {
        icon: Briefcase,
        title: "Contribute & mentor",
        body: "Fund, mentor or support the programme and gain consented, field-scoped access to outcomes.",
        price: "Partner",
    },
]

export function Services() {
    return (
        <section
            id="services"
            className="scroll-mt-16 container-x py-16 sm:py-20"
        >
            <header className="flex flex-col gap-3 max-w-2xl mb-12">
                <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                    The programme
                </span>
                <h2 className="section-heading">
                    How STEP works
                </h2>
                <p className="section-copy">
                    A structured six-month pathway for participants — and a
                    clear way for partners to open doors for them.
                </p>
            </header>

            {/* Participants */}
            <div className="mb-14">
                <h3 className="text-[11px] font-semibold uppercase tracking-[2.4px] text-[#a1a1a1] mb-4">
                    For participants
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {CANDIDATE_SERVICES.map((s) => (
                        <ServiceCard key={s.title} {...s} />
                    ))}
                </div>
            </div>

            {/* Partners */}
            <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[2.4px] text-[#a1a1a1] mb-4">
                    For partners
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {COMPANY_SERVICES.map((s) => (
                        <ServiceCard key={s.title} {...s} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function ServiceCard({
    icon: Icon,
    title,
    body,
    price,
}: Service) {
    return (
        <div className="rounded-lg border border-line bg-white p-5 flex flex-col gap-3 hover:border-[#c4c4c4] hover:shadow-soft transition-all dark:bg-[#242527] dark:border-[#333] dark:hover:border-[#555]">
            <div className="h-10 w-10 rounded-full bg-blue/12 flex items-center justify-center">
                <Icon className="h-5 w-5 text-blue-dark" aria-hidden />
            </div>
            <div className="flex flex-col gap-1">
                <h4 className="font-semibold text-[16px]">{title}</h4>
                <p className="section-copy leading-relaxed">
                    {body}
                </p>
            </div>
            <div className="mt-auto pt-2 text-[11px] font-semibold text-blue-dark">
                {price}
            </div>
        </div>
    )
}