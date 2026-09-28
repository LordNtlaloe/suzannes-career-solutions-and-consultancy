"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { cn } from "cn"
import { authClient } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type SearchParams = { callbackUrl?: string; error?: string }

type LoginFormProps = Omit<React.ComponentProps<"form">, "children"> & {
    searchParams?: SearchParams | Promise<SearchParams>
}

export default function LoginForm({
    className,
    searchParams,
    ...props
}: LoginFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    // searchParams may arrive already-resolved or as the raw Next.js
    // Promise — use() unwraps a Promise and passes plain objects through.
    const resolvedSearchParams =
        searchParams instanceof Promise ? use(searchParams) : searchParams
    const callbackURL = resolvedSearchParams?.callbackUrl ?? "/dashboard"

    // Surface an error that arrived via the URL (e.g. ?error=session_expired)
    useEffect(() => {
        if (resolvedSearchParams?.error) {
            toast.error(resolvedSearchParams.error)
        }
    }, [resolvedSearchParams?.error])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        await authClient.signIn.email(
            {
                email,
                password,
                callbackURL,
            },
            {
                onRequest: () => {
                    setLoading(true)
                },
                onSuccess: () => {
                    toast.success("Welcome back!")
                    router.push(callbackURL)
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message ?? "Invalid email or password")
                },
                onResponse: () => {
                    setLoading(false)
                },
            }
        )
    }

    return (
        <form
            className={cn("flex flex-col gap-5", className)}
            onSubmit={handleSubmit}
            {...props}
        >
            <FieldGroup className="flex flex-col gap-4">
                <Field>
                    <FieldLabel htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[1.2px] text-white/80">
                        Email
                    </FieldLabel>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        disabled={loading}
                        className="h-10 rounded-md border border-white/20 bg-white/10 px-3 text-[13px] text-white placeholder:text-white/40 focus:border-blue-light focus:ring-1 focus:ring-blue-light"
                    />
                </Field>
                <Field>
                    <div className="flex items-center">
                        <FieldLabel htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[1.2px] text-white/80">
                            Password
                        </FieldLabel>
                        <a
                            href="#"
                            className="ml-auto text-[11px] text-white/60 underline-offset-4 transition-colors hover:text-white"
                        >
                            Forgot?
                        </a>
                    </div>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        disabled={loading}
                        className="h-10 rounded-md border border-white/20 bg-white/10 px-3 text-[13px] text-white placeholder:text-white/40 focus:border-blue-light focus:ring-1 focus:ring-blue-light"
                    />
                </Field>
                <Field>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-brand w-full min-h-10! text-[11px]!"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </Field>
                <p className="text-center text-[11px] text-white/60">
                    Don&apos;t have an account?{" "}
                    <a href="/sign-up" className="font-semibold text-blue-light underline-offset-4 transition-colors hover:text-white">
                        Sign up
                    </a>
                </p>
            </FieldGroup>
        </form>
    )
}