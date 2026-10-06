import Link from "next/link";
import type { AuthLayoutProps } from "@/types";

import AppLogoIcon from "@/components/app-logo-icon";

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const name = "Suzanne's Career Agency";

    return (
        <div className="bg-hero-grad relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-zinc-900 p-10 text-white lg:flex dark:border-r">
                <Link
                    href="/"
                    className="relative z-20 flex items-center text-lg font-medium"
                >
                    <AppLogoIcon className="mr-2 size-8 fill-current text-white" />
                    {name}
                </Link>
            </div>

            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-87.5">
                    <Link
                        href="/"
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10 fill-current text-white sm:h-12" />
                    </Link>

                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>

                        <p className="text-sm text-balance text-brand-muted">
                            {description}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
