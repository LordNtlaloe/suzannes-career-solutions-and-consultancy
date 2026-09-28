"use client"

import Link from "next/link"
import {
    Edit,
    Eye,
    Trash2,
    MoreHorizontal,
    Send,
    Undo2,
    MessageSquare,
    Heart,
    Bookmark,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PostStatusBadge, getPostStatus } from "./post-status-badge"
import { cn } from "@/lib/utils"

export type PostListItem = {
    id: string
    title: string
    slug: string
    excerpt?: string | null
    published: boolean | number
    scheduled_at?: number | null
    is_deleted: boolean | number
    published_at?: number | null
    updated_at: number
    view_count: number
    like_count: number
    comment_count: number
    bookmark_count: number
    category_name?: string | null
    author_name?: string | null
    cover_image_url?: string | null
    cover_image_alt?: string | null
    cover_image_thumb?: string | null
}

type PostRowProps = {
    post: PostListItem
    onEdit: (post: PostListItem) => void
    onDelete: (post: PostListItem) => void
    onPublish: (post: PostListItem) => void
    onUnpublish: (post: PostListItem) => void
    onRestore?: (post: PostListItem) => void
}

function formatDate(ts: number | null | undefined) {
    if (!ts) return "—"
    return new Date(ts * 1000).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

export function PostRow({
    post,
    onEdit,
    onDelete,
    onPublish,
    onUnpublish,
    onRestore,
}: PostRowProps) {
    const status = getPostStatus(post)
    const isPublished = status === "published"
    const coverSrc = post.cover_image_thumb ?? post.cover_image_url

    return (
        <div
            className={cn(
                "group flex items-center gap-3 rounded-md border border-line bg-white px-3 py-2.5",
                "hover:border-ink/20 transition-colors"
            )}
        >
            {/* Thumbnail */}
            <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md border border-line bg-light">
                {coverSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={coverSrc}
                        alt={post.cover_image_alt ?? post.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="h-full w-full bg-linear-to-br from-light to-light/40" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => onEdit(post)}
                        className="font-medium text-sm truncate hover:underline text-left"
                    >
                        {post.title}
                    </button>
                    <PostStatusBadge status={status} />
                    {post.category_name && (
                        <span className="text-xs text-brand-muted bg-light px-2 py-0.5 rounded">
                            {post.category_name}
                        </span>
                    )}
                </div>

                {post.excerpt && (
                    <p className="text-xs text-brand-muted line-clamp-1 mt-0.5">
                        {post.excerpt}
                    </p>
                )}

                <div className="flex items-center gap-3 text-xs text-brand-muted mt-1">
                    <span>{formatDate(post.published_at ?? post.updated_at)}</span>
                    <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {post.view_count}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {post.like_count}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" /> {post.comment_count}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Bookmark className="h-3 w-3" /> {post.bookmark_count}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                {isPublished && (
                    <Button asChild size="sm" variant="ghost">
                        <Link
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="View"
                        >
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>
                )}
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(post)}
                    aria-label="Edit"
                >
                    <Edit className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" aria-label="More">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {!isPublished && !post.is_deleted && (
                            <DropdownMenuItem onClick={() => onPublish(post)}>
                                <Send className="h-4 w-4 mr-2" />
                                {post.scheduled_at ? "Publish now" : "Publish"}
                            </DropdownMenuItem>
                        )}
                        {isPublished && (
                            <DropdownMenuItem onClick={() => onUnpublish(post)}>
                                <Undo2 className="h-4 w-4 mr-2" />
                                Unpublish
                            </DropdownMenuItem>
                        )}
                        {post.is_deleted && onRestore && (
                            <DropdownMenuItem onClick={() => onRestore(post)}>
                                <Undo2 className="h-4 w-4 mr-2" />
                                Restore
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(post)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}