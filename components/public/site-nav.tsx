import Link from "next/link";
import { PenLine, LayoutDashboard } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NavShell } from "./nav-shell";
import { PublicThemeToggle } from "./public-theme-toggle";

const NAV_LINKS = [
    { href: "/posts", label: "Posts" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
];

export async function SiteNav() {
    const session = await auth.api.getSession({ headers: await headers() });
    const isAuthed = !!session?.user;
    const isStaff =
        session?.user?.role === "admin" || session?.user?.role === "moderator";

    return (
        <NavShell>
            <div className="container-x relative z-2 h-26 pt-9.5 max-md:h-19.5 max-md:pt-5">
                <div className="flex items-start max-md:items-center">
                    {/* Brand */}
                    <Link
                        href="/"
                        className="w-35 text-[15px] font-semibold leading-4.5 text-white transition-opacity hover:opacity-80"
                    >
                        General
                        <span className="block text-blue-light">Project</span>
                    </Link>

                    {/* Primary nav */}
                    <nav
                        className="ml-auto flex items-center gap-9.5 text-[11px] text-[#c4c4c4] max-[1100px]:gap-2.5 max-md:hidden"
                        aria-label="Primary"
                    >
                        {NAV_LINKS.map((link) => (
                            <NavLink key={link.href} href={link.href}>
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Auth actions */}
                    <div className="ml-auto flex items-center gap-2">
                        <PublicThemeToggle />
                        {isAuthed ? (
                            <>
                                {isStaff && (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-[11px] font-semibold text-[#c4c4c4] transition-colors hover:border-white/40 hover:text-white"
                                    >
                                        <LayoutDashboard className="h-3.5 w-3.5" />
                                        Dashboard
                                    </Link>
                                )}
                                <Link
                                    href="/dashboard/posts/new"
                                    className="btn-brand min-h-9! px-5! text-[11px]!"
                                >
                                    <PenLine className="mr-1.5 h-3.5 w-3.5" />
                                    Write
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/sign-in"
                                    className="text-[11px] font-semibold text-[#c4c4c4] px-3 py-2.5 transition-colors hover:text-white"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="btn-brand min-h-9! px-5! text-[11px]!"
                                >
                                    Get started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </NavShell>
    );
}

/* Plain server-renderable link — no client hooks needed */
function NavLink({
    href,
    children,
}: {
    href: string;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="whitespace-nowrap px-3 py-2.5 transition-colors hover:text-white"
        >
            {children}
        </Link>
    );
}