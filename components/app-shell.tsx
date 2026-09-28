// ./components/app-shell.tsx
import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { AppVariant } from "@/types";

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = "sidebar" }: Props) {
    if (variant === "header") {
        return (
            <TooltipProvider>
                <div className="flex min-h-screen w-full flex-col">{children}</div>
            </TooltipProvider>
        );
    }

    return (
        <TooltipProvider>
            <SidebarProvider defaultOpen>{children}</SidebarProvider>
        </TooltipProvider>
    );
}