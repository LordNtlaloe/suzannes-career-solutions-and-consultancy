"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"
import { toast } from "sonner"

import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { UserInfo } from "@/components/user-info"
import { useMobileNavigation } from "@/hooks/use-mobile-navigation"
import { authClient } from "@/lib/auth-client"
import { User } from "@/types"

type Props = {
    user: User
}

export function UserMenuContent({ user }: Props) {
    const router = useRouter()
    const cleanup = useMobileNavigation()

    const handleLogout = async () => {
        cleanup()

        await authClient.signOut(
            {},
            {
                onSuccess: () => {
                    router.push("/sign-in")
                    router.refresh()
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message ?? "Could not log out")
                },
            }
        )
    }

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem>
                    <Link
                        className="block w-full cursor-pointer"
                        href="/settings/profile"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                className="block w-full cursor-pointer"
                onClick={handleLogout}
                data-test="logout-button"
            >
                <LogOut className="mr-2" />
                Log out
            </DropdownMenuItem>
        </>
    )
}