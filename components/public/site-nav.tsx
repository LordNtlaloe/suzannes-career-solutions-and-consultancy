"use client";

import Link from "next/link";
import { Menu, PenLine, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavShell } from "./nav-shell";
import { PublicThemeToggle } from "./public-theme-toggle";
import { useSession } from "@/lib/auth-client";

const NAV_LINKS = [
    { href: "/posts", label: "Posts" },
    { href: "/step", label: "STEP" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
];

export function SiteNav() {
    const { data: session } = useSession();
    const isAuthed = !!session?.user;
    const isStaff =
        session?.user?.role === "admin" || session?.user?.role === "moderator";
    const [open, setOpen] = useState(false);

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

                    {/* Desktop primary nav */}
                    <nav
                        className="ml-auto hidden items-center gap-9.5 text-[11px] text-[#c4c4c4] max-[1100px]:gap-2.5 md:flex"
                        aria-label="Primary"
                    >
                        {NAV_LINKS.map((link) => (
                            <NavLink key={link.href} href={link.href}>
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Auth actions — hidden on small mobile */}
                    <div className="ml-auto flex items-center gap-2 max-sm:hidden">
                        <PublicThemeToggle />
                        {isAuthed ? (
                            <>
                                {isStaff && (
                                    <Link
                                        href="/dashboard"
                                        className="hidden items-center gap-1.5 rounded-md border border-white/20 px-3 py-1.5 text-[11px] font-semibold text-[#c4c4c4] transition-colors hover:border-white/40 hover:text-white md:inline-flex"
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
                                    className="hidden text-[11px] font-semibold text-[#c4c4c4] px-3 py-2.5 transition-colors hover:text-white md:inline"
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

                    {/* Mobile hamburger */}
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <button
                                type="button"
                                className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-[#c4c4c4] hover:text-white md:hidden"
                                aria-label="Open menu"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-72 border-l border-white/10 bg-[#222]/95 backdrop-blur-xl"
                        >
                            <SheetTitle className="sr-only">
                                Navigation menu
                            </SheetTitle>
                            <div className="mt-8 flex flex-col gap-6">
                                {/* Mobile nav links */}
                                <nav className="flex flex-col gap-1" aria-label="Mobile">
                                    {NAV_LINKS.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            className="rounded-md px-3 py-2.5 text-sm text-[#c4c4c4] transition-colors hover:bg-white/10 hover:text-white"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </nav>

                                {/* Mobile auth actions */}
                                <div className="border-t border-white/10 pt-4">
                                    <PublicThemeToggle />
                                    <div className="mt-4 flex flex-col gap-2">
                                        {isAuthed ? (
                                            <>
                                                {isStaff && (
                                                    <Link
                                                        href="/dashboard"
                                                        onClick={() => setOpen(false)}
                                                        className="inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-[#c4c4c4] transition-colors hover:bg-white/10 hover:text-white"
                                                    >
                                                        <LayoutDashboard className="h-4 w-4" />
                                                        Dashboard
                                                    </Link>
                                                )}
                                                <Link
                                                    href="/dashboard/posts/new"
                                                    onClick={() => setOpen(false)}
                                                    className="btn-brand mt-1 inline-flex items-center justify-center text-xs!"
                                                >
                                                    <PenLine className="mr-1.5 h-3.5 w-3.5" />
                                                    Write
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link
                                                    href="/sign-in"
                                                    onClick={() => setOpen(false)}
                                                    className="rounded-md px-3 py-2.5 text-sm text-[#c4c4c4] transition-colors hover:bg-white/10 hover:text-white"
                                                >
                                                    Sign in
                                                </Link>
                                                <Link
                                                    href="/sign-up"
                                                    onClick={() => setOpen(false)}
                                                    className="btn-brand mt-1 inline-flex items-center justify-center text-xs!"
                                                >
                                                    Get started
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
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