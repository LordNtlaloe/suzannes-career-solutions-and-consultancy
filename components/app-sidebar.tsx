// ./components/app-sidebar.tsx
"use client"
import Link from "next/link";
import { BookIcon, Bookmark, BookOpen, ChartBarStacked, FolderGit2, Group, LayoutGrid, Tag } from "lucide-react";
import AppLogo from "@/components/app-logo";
import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { SidebarThemeToggle } from "@/components/sidebar-theme-toggle";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavItem } from "@/types";

const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/studio",
        icon: LayoutGrid,
    },
    {
        title: "Taxonomy",
        href: "",
        icon: ChartBarStacked,
        items: [
            {
                title: "Categories",
                href: "/studio/categories",
                icon: Group
            },
            {
                title: "Tags",
                href: "/studio/tags",
                icon: Tag

            },
        ],
    },
    {
        title: "News",
        href: "/studio/posts",
        icon: BookIcon,
    },
    {
        title: "Bookmarks",
        href: "/studio/bookmarks",
        icon: Bookmark,
    }
];

const footerNavItems: NavItem[] = [
    {
        title: "Repository",
        href: "https://github.com/laravel/react-starter-kit",
        icon: FolderGit2,
    },
    {
        title: "Documentation",
        href: "https://laravel.com/docs/starter-kits#react",
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/studio">
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarThemeToggle />
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}