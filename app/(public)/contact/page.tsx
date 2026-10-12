import type { Metadata } from "next"
import Link from "next/link"
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react"
import { FaLinkedin } from "react-icons/fa6"
import { Hero } from "@/components/public/hero"
import { ContactCta } from "@/components/public/contact-cta"

export const metadata: Metadata = {
    title: "Contact — STEP",
    description:
        "Get in touch with the STEP programme team. Apply to join a cohort or talk to us about partnering.",
    openGraph: {
        title: "Contact — STEP",
        description:
            "Get in touch with the STEP programme team. Apply to join a cohort or talk to us about partnering.",
    },
}

const CONTACT_INFO = [
    {
        icon: Mail,
        label: "Email",
        value: "hello@step.org.ls",
        href: "mailto:hello@step.org.ls",
    },
    {
        icon: Phone,
        label: "Phone",
        value: "+266 2200 0000",
        href: "tel:+26622000000",
    },
    {
        icon: MapPin,
        label: "Location",
        value: "Lesotho — serving Basotho participants",
        href: null,
    },
    {
        icon: FaLinkedin,
        label: "LinkedIn",
        value: "Connect with us",
        href: "#",
    },
]

export default function ContactPage() {
    return (
        <>
            <Hero
                eyebrow="CONTACT"
                title="Talk to the STEP team."
                text="Whether you want to join the next cohort or partner with the programme — the first step is a conversation."
            />

            <ContactCta />

            {/* Alternative contact methods */}
            <section className="border-y border-line bg-light/82">
                <div className="container-x py-16 sm:py-20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {CONTACT_INFO.map((item) => {
                            const Icon = item.icon
                            const content = (
                                <div className="rounded-lg border border-line bg-card p-6 flex flex-col gap-3 items-center text-center hover:shadow-soft transition-shadow">
                                    <div className="h-10 w-10 rounded-full bg-blue/12 flex items-center justify-center">
                                        <Icon className="h-5 w-5 text-blue-dark" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-[#a1a1a1]">
                                            {item.label}
                                        </span>
                                        <span className="text-[14px] font-semibold text-ink">
                                            {item.value}
                                        </span>
                                    </div>
                                </div>
                            )

                            if (item.href) {
                                return (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        className="block"
                                    >
                                        {content}
                                    </a>
                                )
                            }

                            return (
                                <div key={item.label}>
                                    {content}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA to services */}
            <section className="container-x py-16 sm:py-20">
                <div className="text-center flex flex-col items-center gap-4">
                    <span className="text-[11px] font-semibold uppercase tracking-[2.4px] text-blue">
                        Not ready to apply yet?
                    </span>
                    <h2 className="section-heading leading-tight max-w-2xl">
                        Learn more about the programmes first.
                    </h2>
                    <p className="section-copy max-w-lg">
                        Explore the four programmes and the delivery model. When
                        you&apos;re ready, we&apos;re here.
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                        <Link href="/" className="btn-brand">
                            Explore the programme
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        <Link
                            href="/about"
                            className="text-link-brand text-blue-dark transition-opacity hover:opacity-70"
                        >
                            About STEP
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    )
}