"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, LogOut, Menu, UserRound } from "lucide-react";
import type { StepRoleKey } from "@/lib/step/access-rules";
import { useStepPath } from "@/components/step/step-path-provider";
import { authClient } from "@/lib/auth-client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ROLE_LABELS: Record<StepRoleKey, string> = {
    participant: "Participant",
    staff: "Staff",
    mentor: "Mentor",
    admin: "Programme admin",
};

type StepNavProps = {
    signedIn: boolean;
    userName?: string | null;
    roles: StepRoleKey[];
    hasAdminTools: boolean;
    hasPartners: boolean;
};

export function StepNav({ signedIn, userName, roles, hasAdminTools, hasPartners }: StepNavProps) {
    const { path } = useStepPath();
    const pathname = usePathname();
    const router = useRouter();

    const links = [
        { href: path("/"), label: "Home" },
        { href: path("/apply"), label: "Apply" },
    ];

    if (signedIn) {
        links.push({ href: path("/dashboard"), label: "Dashboard" });
    }

    const activeRole: StepRoleKey | null =
        pathname.includes("/dashboard/participant") ? "participant"
        : pathname.includes("/dashboard/mentor") ? "mentor"
        : pathname.includes("/dashboard/staff") ? "staff"
        : pathname.includes("/dashboard/admin") ? "admin"
        : null;

    const handleSignOut = async () => {
        await authClient.signOut(
            {},
            {
                onSuccess: () => {
                    router.push(path("/"));
                    router.refresh();
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message ?? "Could not sign out");
                },
            },
        );
    };

    const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(pathname)}`;

    return (
        <header className="bg-hero-grad text-white">
            <div className="container-x flex h-18 items-center gap-6">
                <Link
                    href={path("/")}
                    className="flex items-center gap-2 text-[15px] font-semibold"
                >
                    <GraduationCap className="size-5 text-blue-light" />
                    STEP
                </Link>

                {/* Desktop links */}
                <nav className="hidden items-center gap-7 text-[13px] text-[#e6e6e6] sm:flex">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="rounded-sm transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white/70"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-3">
                    {signedIn ? (
                        <>
                            {/* Workspace switcher (A5) + name/role badge (A6) */}
                            {roles.length > 0 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex max-w-52 items-center gap-2 rounded-0 border border-white/20 px-3 py-1.5 text-left text-[12px] font-semibold text-white transition-colors hover:border-white/40"
                                        >
                                            <UserRound className="size-3.5 shrink-0 text-blue-light" />
                                            <span className="truncate">
                                                {userName || "Account"}
                                            </span>
                                            {activeRole && (
                                                <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-blue-light sm:inline">
                                                    {ROLE_LABELS[activeRole]}
                                                </span>
                                            )}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            {userName || "STEP workspaces"}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {roles.map((role) => (
                                            <DropdownMenuItem key={role} asChild>
                                                <Link href={path(`/dashboard/${role}`)}>
                                                    {ROLE_LABELS[role]}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onSelect={handleSignOut}
                                        >
                                            <LogOut className="size-3.5" />
                                            Sign out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            {roles.length === 0 && (
                                <span className="hidden max-w-40 truncate text-[12px] text-[#e6e6e6] sm:inline">
                                    {userName || "Signed in"}
                                </span>
                            )}

                            {hasAdminTools && (
                                <Link
                                    href={path("/admin")}
                                    className="hidden rounded-0 border border-white/20 px-3 py-1.5 text-[12px] font-semibold text-[#e6e6e6] transition-colors hover:border-white/40 hover:text-white sm:inline-flex"
                                >
                                    Admin
                                </Link>
                            )}

                            {hasPartners && (
                                <Link
                                    href={path("/partners")}
                                    className="hidden rounded-0 border border-white/20 px-3 py-1.5 text-[12px] font-semibold text-[#e6e6e6] transition-colors hover:border-white/40 hover:text-white sm:inline-flex"
                                >
                                    Partners
                                </Link>
                            )}

                            <button
                                type="button"
                                onClick={handleSignOut}
                                className="hidden items-center gap-1.5 rounded-0 border border-white/20 px-3 py-1.5 text-[12px] font-semibold text-[#e6e6e6] transition-colors hover:border-white/40 hover:text-white sm:inline-flex"
                            >
                                <LogOut className="size-3.5" />
                                Sign out
                            </button>
                        </>
                    ) : (
                        <Link
                            href={signInHref}
                            className="hidden btn-brand min-h-9! px-5! text-[12px]! sm:inline-flex"
                        >
                            Sign in
                        </Link>
                    )}

                    {/* Mobile menu trigger (A1) */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-white sm:hidden"
                                aria-label="Open menu"
                            >
                                <Menu className="size-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72 bg-hero-grad text-white">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2 text-white">
                                    <GraduationCap className="size-5 text-blue-light" />
                                    STEP
                                </SheetTitle>
                            </SheetHeader>

                            <div className="flex flex-1 flex-col gap-1 px-6 pb-6">
                                {signedIn && userName && (
                                    <p className="mb-3 truncate text-[12px] text-[#e6e6e6]">
                                        Signed in as{" "}
                                        <span className="font-semibold text-white">{userName}</span>
                                    </p>
                                )}

                                {links.map((link) => (
                                    <SheetClose key={link.href} asChild>
                                        <Link
                                            href={link.href}
                                            className="rounded-0 px-3 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
                                        >
                                            {link.label}
                                        </Link>
                                    </SheetClose>
                                ))}

                                {signedIn && roles.map((role) => (
                                    <SheetClose key={`role-${role}`} asChild>
                                        <Link
                                            href={path(`/dashboard/${role}`)}
                                            className="rounded-0 px-3 py-2.5 text-[14px] text-[#e6e6e6] transition-colors hover:bg-white/10 hover:text-white"
                                        >
                                            {ROLE_LABELS[role]} workspace
                                        </Link>
                                    </SheetClose>
                                ))}

                                {signedIn && hasAdminTools && (
                                    <SheetClose asChild>
                                        <Link
                                            href={path("/admin")}
                                            className="rounded-0 px-3 py-2.5 text-[14px] text-[#e6e6e6] transition-colors hover:bg-white/10 hover:text-white"
                                        >
                                            Admin
                                        </Link>
                                    </SheetClose>
                                )}

                                {signedIn && hasPartners && (
                                    <SheetClose asChild>
                                        <Link
                                            href={path("/partners")}
                                            className="rounded-0 px-3 py-2.5 text-[14px] text-[#e6e6e6] transition-colors hover:bg-white/10 hover:text-white"
                                        >
                                            Partners
                                        </Link>
                                    </SheetClose>
                                )}

                                <div className="mt-3 border-t border-white/20 pt-3">
                                    {signedIn ? (
                                        <SheetClose asChild>
                                            <button
                                                type="button"
                                                onClick={handleSignOut}
                                                className="flex w-full items-center gap-2 rounded-0 px-3 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-white/10"
                                            >
                                                <LogOut className="size-4" />
                                                Sign out
                                            </button>
                                        </SheetClose>
                                    ) : (
                                        <SheetClose asChild>
                                            <Link
                                                href={signInHref}
                                                className="flex w-full items-center justify-center rounded-0 bg-white px-3 py-2.5 text-[14px] font-semibold text-hero-grad"
                                            >
                                                Sign in
                                            </Link>
                                        </SheetClose>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
