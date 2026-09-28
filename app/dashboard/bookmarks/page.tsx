"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Bookmark, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { SectionCards } from "@/components/section-cards"
import {
    listBookmarksAction,
    countBookmarksAction,
    toggleBookmarkAction,
} from "@/actions/like.actions"

type SavedPost = {
    id: string
    title: string
    slug: string
    excerpt?: string | null
    published_at?: number | null
    view_count?: number
    like_count?: number
    comment_count?: number
    cover_image_url?: string | null
    cover_image_thumb?: string | null
    cover_image_alt?: string | null
    category_name?: string | null
    bookmark_id: string
    bookmarked_at: number
}

export default function SavedPostsPage() {
    const [posts, setPosts] = useState<SavedPost[]>([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        try {
            setLoading(true)
            const [rows, count] = await Promise.all([
                listBookmarksAction(100, 0),
                countBookmarksAction(),
            ])
            setPosts(rows as unknown as SavedPost[])
            setTotal(count)
        } catch (err: any) {
            toast.error(err?.message ?? "Failed to load saved posts")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    async function handleRemove(postId: string) {
        try {
            await toggleBookmarkAction(postId)
            toast.success("Removed from saved")
            load()
        } catch (err: any) {
            toast.error(err?.message ?? "Failed")
        }
    }

    return (
        <div className="flex flex-col gap-6 px-3 py-4">
            <div className="px-1">
                <h1 className="text-3xl font-bold">Saved posts</h1>
                <p className="text-brand-muted">
                    Posts you've bookmarked for later
                </p>
            </div>

            <SectionCards
                cards={[
                    {
                        label: "Saved Posts",
                        value: total,
                        icon: Bookmark,
                        footerTitle: "Your reading list",
                        footerDescription: "Posts you bookmarked",
                    },
                ]}
            />

            <div className="rounded-lg border border-line bg-white p-3 sm:p-4">
                {loading ? (
                    <p className="text-center text-brand-muted py-8">
                        Loading...
                    </p>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                        <Bookmark className="h-10 w-10 text-brand-muted" />
                        <p className="text-brand-muted">
                            No saved posts yet
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/posts">Browse posts</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {posts.map((post) => {
                            const cover =
                                post.cover_image_thumb ?? post.cover_image_url
                            return (
                                <div
                                    key={post.bookmark_id}
                                    className="flex items-center gap-3 rounded-md border border-line bg-light px-3 py-2.5 hover:border-ink/20 transition-colors"
                                >
                                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-line bg-light">
                                        {cover ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={cover}
                                                alt={post.cover_image_alt ?? post.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-linear-to-br from-light to-light/40" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/posts/${post.slug}`}
                                            className="font-medium text-sm truncate hover:underline block"
                                        >
                                            {post.title}
                                        </Link>
                                        {post.excerpt && (
                                            <p className="text-xs text-brand-muted line-clamp-1 mt-0.5">
                                                {post.excerpt}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemove(post.id)}
                                        aria-label="Remove from saved"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}