import Link from "next/link"
import { Calendar, Eye, Heart, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export type PublicPostCardData = {
    id: string
    title: string
    slug: string
    excerpt?: string | null
    published_at?: number | null
    view_count?: number
    like_count?: number
    comment_count?: number
    bookmark_count?: number
    category_name?: string | null
    category_slug?: string | null
    author_name?: string | null
    author_image?: string | null
    cover_image_url?: string | null
    cover_image_alt?: string | null
    cover_image_thumb?: string | null
    tags?: { id: string; name: string; slug: string }[]
}

type Props = {
    post: PublicPostCardData
    featured?: boolean
    className?: string
}

function formatDate(ts?: number | null) {
    if (!ts) return ""
    return new Date(ts * 1000).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

function initials(name?: string | null) {
    if (!name) return "?"
    return name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
}

export function PublicPostCard({ post, featured, className }: Props) {
    const coverSrc = post.cover_image_thumb ?? post.cover_image_url

    return (
        <Link
            href={`/news/${post.slug}`}
            className={cn(
                "group flex flex-col rounded-lg border border-line bg-card overflow-hidden",
                "hover:border-[#c4c4c4] hover:shadow-soft transition-all",
                "dark:bg-[#242527] dark:border-[#333] dark:hover:border-[#555]",
                className
            )}
        >
            {coverSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={coverSrc}
                    alt={post.cover_image_alt ?? post.title}
                    className={cn(
                        "w-full object-cover",
                        featured ? "aspect-video" : "aspect-16/10"
                    )}
                    loading="lazy"
                />
            ) : (
                <div
                    className={cn(
                        "w-full bg-linear-to-br from-light to-[#ededed]",
                        "dark:from-[#2a2a2a] dark:to-[#333]",
                        featured ? "aspect-video" : "aspect-16/10"
                    )}
                />
            )}

            <div className="flex-1 flex flex-col gap-2 p-4">
                {post.category_name && (
                    <span className="text-[11px] font-semibold text-blue-dark uppercase tracking-[2.4px]">
                        {post.category_name}
                    </span>
                )}

                <h3
                    className={cn(
                        "font-semibold leading-snug line-clamp-2 group-hover:text-blue-dark transition-colors",
                        featured ? "text-xl sm:text-2xl" : "text-[16px]"
                    )}
                >
                    {post.title}
                </h3>

                {post.excerpt && (
                    <p
                        className={cn(
                            "section-copy",
                            featured ? "line-clamp-3" : "line-clamp-2"
                        )}
                    >
                        {post.excerpt}
                    </p>
                )}

                <div className="mt-auto flex items-center gap-3 pt-3 text-[11px] text-[#a1a1a1] border-t border-line dark:text-[#6b7280] dark:border-[#333]">
                    {post.author_name && (
                        <div className="flex items-center gap-1.5 min-w-0">
                            <div className="h-6 w-6 rounded-full bg-light overflow-hidden flex items-center justify-center text-[10px] font-semibold shrink-0">
                                {post.author_image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={post.author_image}
                                        alt={post.author_name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    initials(post.author_name)
                                )}
                            </div>
                            <span className="truncate">{post.author_name}</span>
                        </div>
                    )}

                    <span className="inline-flex items-center gap-1 shrink-0">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.published_at)}
                    </span>

                    <div className="ml-auto flex items-center gap-2 shrink-0">
                        <span className="inline-flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {post.view_count ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.like_count ?? 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {post.comment_count ?? 0}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}