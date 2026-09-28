"use client"

import { useRef, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    FieldDescription,
} from "@/components/ui/field"

export default function SecuritySettingsPage() {
    return (
        <div className="space-y-12">
            <h1 className="sr-only">Security settings</h1>
            <UpdatePasswordCard />
            {/* 
              Optional sections — uncomment once you've enabled the
              corresponding Better Auth plugins.

              <ManageTwoFactorCard />
              <ManagePasskeysCard />
            */}
        </div>
    )
}

// ---------------------------------------------------------------------------
// Password
// ---------------------------------------------------------------------------

function UpdatePasswordCard() {
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const currentPasswordRef = useRef<HTMLInputElement>(null)
    const newPasswordRef = useRef<HTMLInputElement>(null)
    const confirmPasswordRef = useRef<HTMLInputElement>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setErrors({})

        const form = e.currentTarget
        const fd = new FormData(form)

        const currentPassword = String(fd.get("current_password") ?? "")
        const newPassword = String(fd.get("password") ?? "")
        const confirmPassword = String(fd.get("password_confirmation") ?? "")

        // Client-side validation
        const next: Record<string, string> = {}
        if (!currentPassword) next.current_password = "Current password is required"
        if (!newPassword) next.password = "New password is required"
        else if (newPassword.length < 8)
            next.password = "Password must be at least 8 characters"
        if (newPassword !== confirmPassword)
            next.password_confirmation = "Passwords do not match"

        if (Object.keys(next).length > 0) {
            setErrors(next)
            if (next.current_password) currentPasswordRef.current?.focus()
            else if (next.password) newPasswordRef.current?.focus()
            else if (next.password_confirmation) confirmPasswordRef.current?.focus()
            return
        }

        setLoading(true)
        try {
            const { error } = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true,
            })

            if (error) {
                // Better Auth returns { error } on failure
                const message =
                    error.message ?? "Could not update password"
                toast.error(message)

                if (/current password/i.test(message)) {
                    setErrors({ current_password: message })
                    currentPasswordRef.current?.focus()
                } else if (/password/i.test(message)) {
                    setErrors({ password: message })
                    newPasswordRef.current?.focus()
                }
                return
            }

            toast.success("Password updated")
            form.reset()
        } catch (err: any) {
            toast.error(err?.message ?? "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="space-y-6">
            <Heading
                variant="small"
                title="Update password"
                description="Ensure your account is using a long, random password to stay secure"
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="current_password">Current password</Label>
                    <Input
                        id="current_password"
                        ref={currentPasswordRef}
                        name="current_password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Current password"
                        disabled={loading}
                        aria-invalid={!!errors.current_password}
                    />
                    {errors.current_password && (
                        <FieldDescription className="text-red-500">
                            {errors.current_password}
                        </FieldDescription>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password">New password</Label>
                    <Input
                        id="password"
                        ref={newPasswordRef}
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="New password"
                        disabled={loading}
                        aria-invalid={!!errors.password}
                    />
                    {errors.password && (
                        <FieldDescription className="text-red-500">
                            {errors.password}
                        </FieldDescription>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">
                        Confirm password
                    </Label>
                    <Input
                        id="password_confirmation"
                        ref={confirmPasswordRef}
                        name="password_confirmation"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm password"
                        disabled={loading}
                        aria-invalid={!!errors.password_confirmation}
                    />
                    {errors.password_confirmation && (
                        <FieldDescription className="text-red-500">
                            {errors.password_confirmation}
                        </FieldDescription>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={loading}>
                        {loading && (
                            <Loader2
                                className="mr-1.5 h-4 w-4 animate-spin"
                                aria-hidden
                            />
                        )}
                        Save
                    </Button>
                </div>
            </form>
        </section>
    )
}