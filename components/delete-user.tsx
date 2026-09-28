"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import Heading from "@/components/heading"
import InputError from "@/components/input-error"
import PasswordInput from "@/components/password-input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"

export default function DeleteUser() {
    const router = useRouter()
    const passwordInput = useRef<HTMLInputElement>(null)
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | undefined>()
    const [processing, setProcessing] = useState(false)
    const [open, setOpen] = useState(false)

    function reset() {
        setPassword("")
        setError(undefined)
    }

    async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        await authClient.deleteUser(
            {
                password,
                callbackURL: "/",
            },
            {
                onRequest: () => {
                    setProcessing(true)
                    setError(undefined)
                },
                onSuccess: () => {
                    toast.success("Your account has been deleted.")
                    setOpen(false)
                    router.push("/")
                },
                onError: (ctx) => {
                    const message =
                        ctx.error.message ?? "Could not delete your account"
                    setError(message)
                    toast.error(message)
                    passwordInput.current?.focus()
                },
                onResponse: () => {
                    setProcessing(false)
                },
            }
        )
    }

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Delete account"
                description="Delete your account and all of its resources"
            />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Warning</p>
                    <p className="text-sm">
                        Please proceed with caution, this cannot be undone.
                    </p>
                </div>

                <Dialog
                    open={open}
                    onOpenChange={(next) => {
                        setOpen(next)
                        if (!next) reset()
                    }}
                >
                    <DialogTrigger asChild>
                        <Button
                            variant="destructive"
                            data-test="delete-user-button"
                        >
                            Delete account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>
                            Are you sure you want to delete your account?
                        </DialogTitle>
                        <DialogDescription>
                            Once your account is deleted, all of its resources
                            and data will also be permanently deleted. Please
                            enter your password to confirm you would like to
                            permanently delete your account.
                        </DialogDescription>

                        <form onSubmit={handleDelete} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">
                                    Password
                                </Label>

                                <PasswordInput
                                    id="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Password"
                                    autoComplete="current-password"
                                    disabled={processing}
                                />

                                <InputError message={error} />
                            </div>

                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={reset}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button
                                    variant="destructive"
                                    disabled={processing}
                                >
                                    <button
                                        type="submit"
                                        data-test="confirm-delete-user-button"
                                    >
                                        {processing
                                            ? "Deleting..."
                                            : "Delete account"}
                                    </button>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}