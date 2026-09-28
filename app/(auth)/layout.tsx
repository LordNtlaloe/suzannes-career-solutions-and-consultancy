import Link from "next/link"
import AuthLayout from "@/layouts/auth-layout"

export default function AutenticationhLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthLayout>
            <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12 text-white">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col items-center gap-4">
                            <Link
                                href="/"
                                className="w-35 text-[15px] font-semibold leading-4.5 text-white transition-opacity hover:opacity-80"
                            >
                                General
                                <span className="block text-blue-light">Project</span>
                            </Link>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </AuthLayout>
    )
}