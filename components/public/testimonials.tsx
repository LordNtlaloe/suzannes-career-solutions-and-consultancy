import { Quote } from "lucide-react"

type Testimonial = {
    quote: string
    author: string
    role: string
}

const TESTIMONIALS: Testimonial[] = [
    {
        quote: "I had qualifications but no clear path. STEP gave me structure, a cohort, and a Skills Passport that employers actually looked at.",
        author: "Reitumetse K.",
        role: "STEP Graduate, Business & Finance",
    },
    {
        quote: "The mentoring was the part I didn't know I needed. Six months later I walked into interviews with evidence, not just confidence.",
        author: "Thabo M.",
        role: "STEP Graduate, Technology & Data",
    },
    {
        quote: "As an employer, the passport told me what a candidate could actually do. We've hired two STEP graduates so far.",
        author: "Naledi R.",
        role: "HR Lead, partner organisation",
    },
]

export function Testimonials() {
    return (
        <section className="container-x py-16 sm:py-20">
            <header className="flex flex-col gap-3 max-w-2xl mb-12">
                <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                    Testimonials
                </span>
                <h2 className="section-heading">
                    What people say
                </h2>
                <p className="section-copy">
                    Unedited, from participants and partners who&apos;ve been
                    through the programme.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {TESTIMONIALS.map((t) => (
                    <figure
                        key={t.author}
                        className="flex flex-col gap-4 rounded-lg border border-line bg-white p-6 hover:shadow-soft transition-shadow dark:bg-[#242527] dark:border-[#333]"
                    >
                        <Quote
                            className="h-5 w-5 text-blue/60"
                            aria-hidden
                        />
                        <blockquote className="text-[13px] leading-relaxed text-ink dark:text-[#d4d4d4]">
                            {t.quote}
                        </blockquote>
                        <figcaption className="mt-auto flex flex-col gap-0.5 pt-2 border-t border-line dark:border-[#333]">
                            <span className="text-[13px] font-semibold text-ink dark:text-[#f6f6f6]">
                                {t.author}
                            </span>
                            <span className="text-[11px] text-[#a1a1a1] dark:text-[#9ca3af]">
                                {t.role}
                            </span>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </section>
    )
}