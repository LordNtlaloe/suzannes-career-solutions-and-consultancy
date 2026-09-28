import type { AuthLayoutProps } from "@/types";

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <>
            <div className="space-y-2 text-center">
                <h1 className="text-xl font-medium text-white">
                    {title}
                </h1>
                <p className="text-center text-sm text-white/70">
                    {description}
                </p>
            </div>
            {children}
        </>
    );
}