import Link from "next/link";
import { Award, Mail, Users } from "lucide-react";
import { FaLinkedin } from "react-icons/fa6";

const COMPANY_LINKS = [
    { href: "/about", label: "About" },
    { href: "/step", label: "STEP Programme" },
    { href: "/team", label: "Our Team" },
    { href: "/posts", label: "Articles" },
    { href: "/contact", label: "Contact" },
];

const MORE_LINKS = [
    { href: "/services", label: "Services" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/contact", label: "Careers" },
    { href: "/contact", label: "Terms" },
];

const SOCIAL_LINKS = [
    { href: "#", label: "LinkedIn", Icon: FaLinkedin },
    { href: "mailto:hello@generalproject.co", label: "Email", Icon: Mail },
    { href: "/team", label: "Team", Icon: Users },
    { href: "/portfolio", label: "Portfolio", Icon: Award },
];

export function SiteFooter() {
    return (
        <footer className="bg-hero-grad pb-7.5 pt-21.25 text-white">
            <div className="container-x grid grid-cols-[2fr_1fr_1fr] gap-20 max-md:grid-cols-2 max-[520px]:grid-cols-1">
                {/* About column */}
                <div className="max-md:col-span-full">
                    <Link
                        href="/"
                        className="inline-block w-35 text-[15px] font-semibold leading-4.5 text-white"
                    >
                        General
                        <span className="block text-blue-light">Project</span>
                    </Link>

                    <p className="mt-5.5 max-w-107.5 font-dm text-[13px] leading-[1.75] text-white/80">
                        We are a career agency helping professionals navigate change,
                        communicate their value and find meaningful next opportunities.
                    </p>

                    <div className="mt-6.25 flex gap-2.5">
                        {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="grid h-7.5 w-7.5 place-items-center rounded-full bg-blue/12 transition-colors hover:bg-blue/25"
                            >
                                <Icon size={16} />
                            </a>
                        ))}
                    </div>
                </div>

                {/* Company column */}
                <div>
                    <h3 className="mb-5.5 font-dm text-[15px]">Company</h3>
                    {COMPANY_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="mt-3.5 block font-dm text-[13px] text-white/85 transition-opacity hover:opacity-70"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* More column */}
                <div>
                    <h3 className="mb-5.5 font-dm text-[15px]">More</h3>
                    {MORE_LINKS.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="mt-3.5 block font-dm text-[13px] text-white/85 transition-opacity hover:opacity-70"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Bottom bar */}
            <div className="container-x mt-16.25 flex justify-between gap-5 border-t border-white/10 pt-17.5 font-dm text-[12px] text-[#c4c4c4] max-[520px]:flex-col">
                <span>
                    © 2026 General Project Career Agency. All rights reserved.
                </span>
                <Link href="/contact" className="transition-opacity hover:opacity-70">
                    Privacy Policy
                </Link>
            </div>
        </footer>
    );
}