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
        title: "Resume & portfolio review",
        body: "A written critique plus a 30-minute call. We tell you what's working, what isn't, and what to cut.",
        price: "From $150",
    },
    {
        icon: MessageSquare,
        title: "Interview coaching",
        body: "Mock interviews tailored to the roles you're targeting. Feedback that's specific, not generic.",
        price: "From $200",
    },
    {
        icon: Target,
        title: "Career strategy session",
        body: "Two hours to map where you want to be in 3–5 years and the concrete steps to get there.",
        price: "From $250",
    },
    {
        icon: Rocket,
        title: "Job search sprint",
        body: "Six weeks of hands-on support: applications, outreach, negotiation, and offer review.",
        price: "From $1,200",
    },
]

const COMPANY_SERVICES: Service[] = [
    {
        icon: Users,
        title: "Contingency search",
        body: "We run the search, you pay only on a successful hire. Typical time to shortlist: 3–4 weeks.",
        price: "% of salary",
    },
    {
        icon: Briefcase,
        title: "Retained search",
        body: "For senior or hard-to-fill roles. Deeper search, dedicated partner, better guarantees.",
        price: "Custom",
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
                    Services
                </span>
                <h2 className="section-heading">
                    How we help
                </h2>
                <p className="section-copy">
                    Practical support for people building careers and companies
                    building teams.
                </p>
            </header>

            {/* Candidates */}
            <div className="mb-14">
                <h3 className="text-[11px] font-semibold uppercase tracking-[2.4px] text-[#a1a1a1] mb-4">
                    For candidates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {CANDIDATE_SERVICES.map((s) => (
                        <ServiceCard key={s.title} {...s} />
                    ))}
                </div>
            </div>

            {/* Companies */}
            <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[2.4px] text-[#a1a1a1] mb-4">
                    For companies
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