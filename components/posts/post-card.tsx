import Link from "next/link"
import { Calendar, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

export type PublicPostCardData = {
    id: string
    title: string
    slug: string
    excerpt?: string | null
    published_at?: number | null
    view_count?: number
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
    // Prefer the CDN thumbnail for the card grid, fall back to the full URL
    const coverSrc = post.cover_image_thumb ?? post.cover_image_url

    return (
        <Link
            href={`/news/${post.slug}`}
            className={cn(
                "group flex flex-col rounded-lg border border-line bg-white overflow-hidden dark:bg-[#242527]",
                "hover:border-ink/20 hover:shadow-soft transition-all",
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
                        "w-full bg-linear-to-br from-light to-light/40",
                        featured ? "aspect-video" : "aspect-16/10"
                    )}
                />
            )}

            <div className="flex-1 flex flex-col gap-2 p-4">
                {post.category_name && (
                    <span className="text-xs font-medium text-blue uppercase tracking-wide">
                        {post.category_name}
                    </span>
                )}

                <h3
                    className={cn(
                        "font-semibold leading-snug line-clamp-2 group-hover:underline",
                        featured ? "text-xl sm:text-2xl" : "text-base"
                    )}
                >
                    {post.title}
                </h3>

                {post.excerpt && (
                    <p
                        className={cn(
                            "text-sm text-brand-muted",
                            featured ? "line-clamp-3" : "line-clamp-2"
                        )}
                    >
                        {post.excerpt}
                    </p>
                )}

                <div className="mt-auto flex items-center gap-3 pt-3 text-xs text-brand-muted border-t border-line">
                    {post.author_name && (
                        <div className="flex items-center gap-1.5 min-w-0">
                            <div className="h-6 w-6 rounded-full bg-light overflow-hidden flex items-center justify-center text-[10px] font-medium shrink-0">
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
                    <span className="ml-auto inline-flex items-center gap-1 shrink-0">
                        <Eye className="h-3 w-3" />
                        {post.view_count ?? 0}
                    </span>
                </div>
            </div>
        </Link>
    )
}