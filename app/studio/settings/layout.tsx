"use client"

import Link from "next/link"
import type { PropsWithChildren } from "react"
import { usePathname } from "next/navigation"

import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const sidebarNavItems = [
    { title: "Profile", href: "/studio/settings/profile" },
    { title: "Security", href: "/studio/settings/security" },
    { title: "Appearance", href: "/studio/settings/appearance" },
] as const

export default function SettingsLayout({ children }: PropsWithChildren) {
    const pathname = usePathname()

    const isCurrentOrParentUrl = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`)

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item) => (
                            <Button
                                key={item.href}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn("w-full justify-start", {
                                    "bg-light": isCurrentOrParentUrl(item.href),
                                })}
                            >
                                <Link href={item.href}>{item.title}</Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    )
}