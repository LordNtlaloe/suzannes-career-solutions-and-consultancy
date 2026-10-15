"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    Loader2,
    AlertTriangle,
    Bookmark,
    Heart,
    MessageSquare,
    ArrowRight,
    User as UserIcon,
    Activity as ActivityIcon,
    Trash2,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { listBookmarksAction } from "@/actions/like.actions"
import {
    listUserLikedPostsAction,
    listUserRecentCommentsAction,
} from "@/actions/profile.actions"

import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FieldDescription } from "@/components/ui/field"
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Tab = "profile" | "activity" | "danger"

export default function ProfileSettingsPage() {
    const { data: session, isPending } = authClient.useSession()

    const [tab, setTab] = useState<Tab>("profile")

    const [bookmarks, setBookmarks] = useState<any[]>([])
    const [likedPosts, setLikedPosts] = useState<any[]>([])
    const [recentComments, setRecentComments] = useState<any[]>([])
    const [activityLoading, setActivityLoading] = useState(true)

    useEffect(() => {
        if (!session?.user) return
        let mounted = true

            ; (async () => {
                try {
                    setActivityLoading(true)
                    const [b, l, c] = await Promise.all([
                        listBookmarksAction(6, 0),
                        listUserLikedPostsAction(6),
                        listUserRecentCommentsAction(6),
                    ])
                    if (!mounted) return
                    setBookmarks(b as any[])
                    setLikedPosts(l as any[])
                    setRecentComments(c as any[])
                } catch (err) {
                    console.error("Failed to load activity", err)
                } finally {
                    if (mounted) setActivityLoading(false)
                }
            })()

        return () => {
            mounted = false
        }
    }, [session?.user?.id])

    if (isPending) {
        return (
            <div className="py-12 text-center text-sm text-brand-muted">
                Loading...
            </div>
        )
    }

    if (!session?.user) {
        return null
    }

    return (
        <div className="space-y-8">
            <h1 className="sr-only">Profile settings</h1>

            <Tabs
                value={tab}
                onValueChange={(v) => setTab(v as Tab)}
                className="space-y-8"
            >
                <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="profile" className="gap-2">
                        <UserIcon className="h-4 w-4" aria-hidden />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="gap-2">
                        <ActivityIcon className="h-4 w-4" aria-hidden />
                        Activity
                    </TabsTrigger>
                    <TabsTrigger
                        value="danger"
                        className="gap-2 data-[state=active]:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        Danger zone
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <UpdateProfileCard
                        user={{
                            id: session.user.id,
                            name: session.user.name ?? "",
                            email: session.user.email,
                            emailVerified:
                                (session.user as any).emailVerified ?? false,
                        }}
                    />
                </TabsContent>

                <TabsContent value="activity" className="mt-6">
                    <div className="space-y-12">
                        <SavedPostsList
                            posts={bookmarks}
                            loading={activityLoading}
                        />
                        <LikedPostsList
                            posts={likedPosts}
                            loading={activityLoading}
                        />
                        <RecentCommentsList
                            comments={recentComments}
                            loading={activityLoading}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="danger" className="mt-6">
                    <DeleteAccountCard />
                </TabsContent>
            </Tabs>
        </div>
    )
}

// ---------------------------------------------------------------------------
// Update profile
// ---------------------------------------------------------------------------

function UpdateProfileCard({
    user,
}: {
    user: { id: string; name: string; email: string; emailVerified: boolean }
}) {
    const router = useRouter()
    const [name, setName] = useState(user.name)
    const [email, setEmail] = useState(user.email)
    const [loading, setLoading] = useState(false)
    const [sendingVerify, setSendingVerify] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const emailChanged = email.trim() !== user.email

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setErrors({})

        const next: Record<string, string> = {}
        if (!name.trim()) next.name = "Name is required"
        if (!email.trim()) next.email = "Email is required"
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            next.email = "Enter a valid email address"

        if (Object.keys(next).length > 0) {
            setErrors(next)
            return
        }

        setLoading(true)
        try {
            if (name !== user.name) {
                const { error } = await authClient.updateUser({ name })
                if (error) {
                    toast.error(error.message ?? "Could not update name")
                    return
                }
            }

            if (emailChanged) {
                const { error } = await authClient.changeEmail({
                    newEmail: email.trim(),
                    callbackURL: "/studio/settings/profile",
                })
                if (error) {
                    toast.error(error.message ?? "Could not update email")
                    return
                }
                toast.success(
                    "Check your inbox to verify the new email address"
                )
            } else {
                toast.success("Profile updated")
            }

            router.refresh()
        } catch (err: any) {
            toast.error(err?.message ?? "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    async function handleResendVerification() {
        setSendingVerify(true)
        try {
            const { error } = await authClient.sendVerificationEmail({
                email: user.email,
                callbackURL: "/studio/settings/profile",
            })
            if (error) {
                toast.error(error.message ?? "Could not resend email")
                return
            }
            toast.success("Verification email sent")
        } catch (err: any) {
            toast.error(err?.message ?? "Something went wrong")
        } finally {
            setSendingVerify(false)
        }
    }

    return (
        <section className="space-y-6">
            <Heading
                variant="small"
                title="Profile"
                description="Update your name and email address"
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        autoComplete="name"
                        required
                        disabled={loading}
                        aria-invalid={!!errors.name}
                    />
                    {errors.name && (
                        <FieldDescription className="text-red-500">
                            {errors.name}
                        </FieldDescription>
                    )}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        autoComplete="email"
                        required
                        disabled={loading}
                        aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                        <FieldDescription className="text-red-500">
                            {errors.email}
                        </FieldDescription>
                    )}
                </div>

                {!user.emailVerified && (
                    <div className="rounded-0 border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
                        <p>
                            Your email address is unverified.{" "}
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                disabled={sendingVerify}
                                className="underline underline-offset-4 hover:no-underline disabled:opacity-60"
                            >
                                {sendingVerify
                                    ? "Sending..."
                                    : "Resend verification email"}
                            </button>
                        </p>
                    </div>
                )}

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

// ---------------------------------------------------------------------------
// Activity — saved posts
// ---------------------------------------------------------------------------

function SavedPostsList({
    posts,
    loading,
}: {
    posts: any[]
    loading: boolean
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Bookmark
                        className="h-4 w-4 text-brand-muted"
                        aria-hidden
                    />
                    <h2 className="text-lg font-semibold">Saved posts</h2>
                    {posts.length > 0 && (
                        <span className="text-xs text-brand-muted">
                            {posts.length}
                        </span>
                    )}
                </div>
                {posts.length > 0 && (
                    <Button asChild variant="ghost" size="sm" className="-mr-2">
                        <Link href="/studio/saved">
                            See all
                            <ArrowRight
                                className="ml-1 h-3.5 w-3.5"
                                aria-hidden
                            />
                        </Link>
                    </Button>
                )}
            </div>

            {loading ? (
                <ActivitySkeleton />
            ) : posts.length === 0 ? (
                <EmptyRow
                    message="You haven't saved any posts yet."
                    actionLabel="Browse posts"
                    actionHref="/news"
                />
            ) : (
                <ul className="flex flex-col gap-2">
                    {posts.map((p) => (
                        <ActivityPostRow key={p.id} post={p} />
                    ))}
                </ul>
            )}
        </section>
    )
}

// ---------------------------------------------------------------------------
// Activity — liked posts
// ---------------------------------------------------------------------------

function LikedPostsList({
    posts,
    loading,
}: {
    posts: any[]
    loading: boolean
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Heart
                        className="h-4 w-4 text-brand-muted"
                        aria-hidden
                    />
                    <h2 className="text-lg font-semibold">Liked posts</h2>
                    {posts.length > 0 && (
                        <span className="text-xs text-brand-muted">
                            {posts.length}
                        </span>
                    )}
                </div>
            </div>

            {loading ? (
                <ActivitySkeleton />
            ) : posts.length === 0 ? (
                <EmptyRow
                    message="You haven't liked any posts yet."
                    actionLabel="Find something to read"
                    actionHref="/news"
                />
            ) : (
                <ul className="flex flex-col gap-2">
                    {posts.map((p) => (
                        <ActivityPostRow key={p.id} post={p} />
                    ))}
                </ul>
            )}
        </section>
    )
}

// ---------------------------------------------------------------------------
// Activity — recent comments
// ---------------------------------------------------------------------------

function RecentCommentsList({
    comments,
    loading,
}: {
    comments: any[]
    loading: boolean
}) {
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <MessageSquare
                        className="h-4 w-4 text-brand-muted"
                        aria-hidden
                    />
                    <h2 className="text-lg font-semibold">Recent comments</h2>
                    {comments.length > 0 && (
                        <span className="text-xs text-brand-muted">
                            {comments.length}
                        </span>
                    )}
                </div>
            </div>

            {loading ? (
                <ActivitySkeleton />
            ) : comments.length === 0 ? (
                <EmptyRow
                    message="You haven't commented on anything yet."
                    actionLabel="Find a post"
                    actionHref="/news"
                />
            ) : (
                <ul className="flex flex-col gap-2">
                    {comments.map((c) => (
                        <li key={c.id}>
                            <Link
                                href={`/news/${c.post_slug}#comment-${c.id}`}
                                className="flex flex-col gap-1.5 rounded-lg border border-line bg-white p-3 hover:border-ink/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue dark:bg-[#242527]"
                            >
                                <div className="flex items-center gap-2 text-xs text-brand-muted">
                                    <span className="truncate">
                                        on
                                        <span className="text-ink font-medium">
                                            {c.post_title}
                                        </span>
                                    </span>
                                    <span className="ml-auto shrink-0">
                                        {formatRelative(c.created_at)}
                                    </span>
                                </div>
                                <p className="text-sm line-clamp-2">
                                    {c.body}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

// ---------------------------------------------------------------------------
// Shared activity pieces
// ---------------------------------------------------------------------------

function ActivityPostRow({ post }: { post: any }) {
    const cover = post.cover_image_thumb ?? post.cover_image_url

    return (
        <li>
            <Link
                href={`/news/${post.slug}`}
                className="flex items-center gap-3 rounded-lg border border-line bg-white p-3 hover:border-ink/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue dark:bg-[#242527]"
            >
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-0 border border-line bg-light">
                    {cover ? (
                        <Image
                            src={cover}
                            alt={post.cover_image_alt ?? post.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-linear-to-br from-light to-light/40" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    {post.category_name && (
                        <span className="text-[10px] font-medium text-blue uppercase tracking-wide">
                            {post.category_name}
                        </span>
                    )}
                    <p className="text-sm font-medium truncate">
                        {post.title}
                    </p>
                    {post.excerpt && (
                        <p className="text-xs text-brand-muted line-clamp-1">
                            {post.excerpt}
                        </p>
                    )}
                </div>
            </Link>
        </li>
    )
}

function ActivitySkeleton() {
    return (
        <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-line bg-white p-3 dark:bg-[#242527]"
                >
                    <div className="h-12 w-16 shrink-0 rounded-0 bg-light animate-pulse" />
                    <div className="flex-1 flex flex-col gap-2">
                        <div className="h-3.5 w-3/4 rounded bg-light animate-pulse" />
                        <div className="h-3 w-1/2 rounded bg-light animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    )
}

function EmptyRow({
    message,
    actionLabel,
    actionHref,
}: {
    message: string
    actionLabel?: string
    actionHref?: string
}) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-line bg-white py-8 text-center dark:bg-[#242527]">
            <p className="text-sm text-brand-muted">{message}</p>
            {actionLabel && actionHref && (
                <Button asChild variant="outline" size="sm">
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            )}
        </div>
    )
}

function formatRelative(ts: number) {
    const diff = Math.floor(Date.now() / 1000) - ts
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return new Date(ts * 1000).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

// ---------------------------------------------------------------------------
// Delete account
// ---------------------------------------------------------------------------

function DeleteAccountCard() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [loading, setLoading] = useState(false)

    const CONFIRM_WORD = "delete my account"

    async function handleDelete() {
        if (confirm.trim().toLowerCase() !== CONFIRM_WORD) {
            toast.error(`Type "${CONFIRM_WORD}" to confirm`)
            return
        }

        setLoading(true)
        try {
            const { error } = await authClient.deleteUser({ password })
            if (error) {
                toast.error(error.message ?? "Could not delete account")
                return
            }

            toast.success("Account deleted")
            router.push("/")
            router.refresh()
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
                title="Delete account"
                description="Permanently delete your account and all associated data."
            />

            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                    <div className="shrink-0 h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle
                            className="h-4 w-4 text-destructive"
                            aria-hidden
                        />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm">
                            Once your account is deleted, all of its resources
                            and data will be permanently erased. This cannot be
                            undone.
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setOpen(true)}
                    >
                        Delete account
                    </Button>
                </div>
            </div>

            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your account and remove all of your data
                            from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="delete-password">
                                Your password
                            </Label>
                            <Input
                                id="delete-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                disabled={loading}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="delete-confirm">Confirmation</Label>
                            <Input
                                id="delete-confirm"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder={`Type "${CONFIRM_WORD}"`}
                                disabled={loading}
                            />
                            <FieldDescription>
                                Type{" "}
                                <span className="font-mono">{CONFIRM_WORD}</span>{" "}
                                to confirm.
                            </FieldDescription>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={
                                loading ||
                                !password ||
                                confirm.trim().toLowerCase() !== CONFIRM_WORD
                            }
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        className="mr-1.5 h-4 w-4 animate-spin"
                                        aria-hidden
                                    />
                                    Deleting...
                                </>
                            ) : (
                                "Delete account"
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    )
}