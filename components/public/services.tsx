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
        title: "Career Readiness Academy",
        body: "Six months of blended training, mentorship, coaching and competency assessment — finishing with a STEP Skills Passport.",
        price: "6 months",
    },
    {
        icon: MessageSquare,
        title: "Talent Experience Pathway",
        body: "Time-bound, supervised work experience with host organisations and employer exposure.",
        price: "Placements",
    },
    {
        icon: Target,
        title: "Schools Career Discovery Bootcamps",
        body: "Fee-based career guidance and foundational digital and creative skills for secondary-school learners.",
        price: "Direct registration",
    },
    {
        icon: Rocket,
        title: "Entrepreneurship & Creative Economy Lab",
        body: "Enterprise development, creator skills, showcases, market links and paid commissions.",
        price: "Incubation",
    },
]

const COMPANY_SERVICES: Service[] = [
    {
        icon: Users,
        title: "Provide opportunities",
        body: "Employers and professional bodies offer mentorship, work-experience hosting, sector guidance and recruitment insight.",
        price: "Partner",
    },
    {
        icon: Briefcase,
        title: "Fund & support",
        body: "Development partners and funders provide institutional grants, programme sponsorship, stipend pools and monitoring support.",
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
                    The programmes
                </span>
                <h2 className="section-heading">
                    Four connected programmes
                </h2>
                <p className="section-copy">
                    One continuous pathway linking learning, mentorship,
                    supervised experience and markets — for participants and
                    the partners who open doors for them.
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