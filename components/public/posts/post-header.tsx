import Link from "next/link"
import { Calendar, Clock, User as UserIcon } from "lucide-react"
import { CategoryBreadcrumb } from "@/components/categories/category-breadcrumb"
import { TagBadge } from "@/components/tags/tag-badge"
import { cn } from "@/lib/utils"

export type PostHeaderProps = {
    title: string
    authorName?: string | null
    authorImage?: string | null
    publishedAt?: number | null
    updatedAt?: number | null
    categoryId?: string | null
    categoryName?: string | null
    categorySlug?: string | null
    tags: { id: string; name: string; slug: string }[]
    readingMinutes?: number
    className?: string
}

function formatDate(ts?: number | null) {
    if (!ts) return ""
    return new Date(ts * 1000).toLocaleDateString(undefined, {
        month: "long",
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

export function PostHeader({
    title,
    authorName,
    authorImage,
    publishedAt,
    updatedAt,
    categoryId,
    categoryName,
    categorySlug,
    tags,
    readingMinutes,
    className,
}: PostHeaderProps) {
    const isEdited =
        updatedAt != null && publishedAt != null && updatedAt > publishedAt + 60

    return (
        <header className={cn("flex flex-col gap-4", className)}>
            {/* Breadcrumb */}
            {categoryId && (
                <CategoryBreadcrumb categoryId={categoryId} />
            )}
            {!categoryId && (
                <nav className="text-[11px] text-[#a1a1a1] dark:text-[#6b7280]">
                    <Link href="/news" className="text-link-brand text-blue-dark hover:opacity-70">
                        All news
                    </Link>
                </nav>
            )}

            {/* Title */}
            <h1 className="section-heading text-[clamp(36px,4.5vw,52px)]! leading-tight">
                {title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#a1a1a1] dark:text-[#6b7280]">
                {authorName && (
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-light overflow-hidden flex items-center justify-center text-[10px] font-semibold shrink-0 text-ink">
                            {authorImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={authorImage}
                                    alt={authorName}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                initials(authorName)
                            )}
                        </div>
                        <span className="font-semibold text-ink">
                            {authorName}
                        </span>
                    </div>
                )}

                {publishedAt && (
                    <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <time dateTime={new Date(publishedAt * 1000).toISOString()}>
                            {formatDate(publishedAt)}
                        </time>
                    </span>
                )}

                {readingMinutes != null && (
                    <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {readingMinutes} min read
                    </span>
                )}

                {isEdited && (
                    <span className="text-[11px] italic">
                        Updated {formatDate(updatedAt)}
                    </span>
                )}
            </div>

            {/* Category chip */}
            {categoryName && categorySlug && (
                <div>
                    <Link
                        href={`/categories/${categorySlug}`}
                        className="inline-flex items-center rounded-full bg-blue/12 px-3 py-1 text-[11px] font-semibold text-blue-dark hover:bg-blue/20 transition-colors"
                    >
                        {categoryName}
                    </Link>
                </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {tags.map((tag) => (
                        <TagBadge
                            key={tag.id}
                            name={tag.name}
                            slug={tag.slug}
                            asLink
                        />
                    ))}
                </div>
            )}
        </header>
    )
}