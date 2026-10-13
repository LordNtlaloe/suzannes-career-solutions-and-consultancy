"use client"

import { useState, type ComponentProps, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function SignUpPage() {
    return <SignupForm />
}

function SignupForm({
    className,
    ...props
}: ComponentProps<"form">) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirm-password") as string

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        setLoading(true)

        try {
            await authClient.signUp.email(
                {
                    name,
                    email,
                    password,
                    callbackURL: "/dashboard",
                },
                {
                    onSuccess: () => {
                        toast.success("Account created! Welcome aboard.")
                        router.push("/dashboard")
                    },
                    onError: (ctx) => {
                        toast.error(
                            ctx.error.message ?? "Could not create account"
                        )
                    },
                }
            )
        } catch {
            toast.error("Unable to create account. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form
            {...props}
            className={cn("flex flex-col gap-5", className)}
            onSubmit={handleSubmit}
        >
            <FieldGroup className="flex flex-col gap-4">
                <Field>
                    <FieldLabel
                        htmlFor="name"
                        className="text-[11px] font-semibold uppercase tracking-[1.2px] text-white/80"
                    >
                        Full Name
                    </FieldLabel>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="John Doe"
                        required
                        disabled={loading}
                        className="h-10 rounded-0 border border-white/20 bg-white/10 px-3 text-[13px] text-white placeholder:text-white/40 focus:border-blue-light focus:ring-1 focus:ring-blue-light"
                    />
                </Field>

                <Field>
                    <FieldLabel
                        htmlFor="email"
                        className="text-[11px] font-semibold uppercase tracking-[1.2px] text-white/80"
                    >
                        Email
                    </FieldLabel>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="m@example.com"
                        required
                        disabled={loading}
                        className="h-10 rounded-0 border border-white/20 bg-white/10 px-3 text-[13px] text-white placeholder:text-white/40 focus:border-blue-light focus:ring-1 focus:ring-blue-light"
                    />
                    <p className="mt-1 text-[11px] text-white/50">
                        We&apos;ll use this to contact you. We will not share
                        your email with anyone else.
                    </p>
                </Field>

                <Field>
                    <FieldLabel
                        htmlFor="password"
                        className="text-[11px] font-semibold uppercase tracking-[1.2px] text-white/80"
                    >
                        Password
                    </FieldLabel>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        disabled={loading}
                        className="h-10 rounded-0 border border-white/20 bg-white/10 px-3 text-[13px] text-white placeholder:text-white/40 focus:border-blue-light focus:ring-1 focus:ring-blue-light"
                    />
                    <p className="mt-1 text-[11px] text-white/50">
                        Must be at least 8 characters long.
                    </p>
                </Field>

                <Field>
                    <FieldLabel
                        htmlFor="confirm-password"
                        className="text-[11px] font-semibold uppercase tracking-[1.2px] text-white/80"
                    >
                        Confirm Password
                    </FieldLabel>
                    <Input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        disabled={loading}
                        className="h-10 rounded-0 border border-white/20 bg-white/10 px-3 text-[13px] text-white placeholder:text-white/40 focus:border-blue-light focus:ring-1 focus:ring-blue-light"
                    />
                    <p className="mt-1 text-[11px] text-white/50">
                        Please confirm your password.
                    </p>
                </Field>

                <Field>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-brand w-full min-h-10! text-[11px]!"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </Field>

                <p className="text-center text-[11px] text-white/60">
                    Already have an account?{" "}
                    <a
                        href="/sign-in"
                        className="font-semibold text-blue-light underline-offset-4 transition-colors hover:text-white"
                    >
                        Sign in
                    </a>
                </p>
            </FieldGroup>
        </form>
    )
}