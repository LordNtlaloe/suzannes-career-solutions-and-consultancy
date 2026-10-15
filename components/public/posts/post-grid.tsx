import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight, FileText, Folder } from "lucide-react"

import { listPublishedPostsAction, countPublishedPostsAction } from "@/actions/post.actions"

import { cn } from "@/lib/utils"
import { NewsFilters } from "./news-filters"
import { PublicPagination } from "./public-pagination"
import { PublicPostCard } from "./public-post-card"
import { PublicSearch } from "./public-search"

export type PostGridFilterOption = {
    id: string
    name: string
    slug: string
    post_count?: number
}

export type BreadcrumbItem = {
    label: string
    href?: string
}

type PostGridPageProps = {
    /** Page heading */
    title: string
    /** Short description under the heading */
    description?: string

    /** Breadcrumb trail above the heading (optional) */
    breadcrumbs?: BreadcrumbItem[]

    /** Fixed filters applied to every query — e.g. categorySlug or tagSlug */
    lockedFilters?: {
        categorySlug?: string
        tagSlug?: string
    }

    /** Current `?q=` value */
    query?: string
    /** Current `?page=` value, 1-indexed */
    page?: number
    /** Filter choices for chips (leave empty to hide) */
    categories?: PostGridFilterOption[]
    tags?: PostGridFilterOption[]
    /** Currently active slug from URL, if any (for chips) */
    activeCategorySlug?: string
    activeTagSlug?: string

    /** Base path used for pagination + filter links */
    basePath: string
    /** Extra params to preserve across pagination */
    preservedParams?: Record<string, string | undefined>

    /** Optional: shown under the heading and chips — e.g. subcategory list */
    children?: React.ReactNode

    /** Hide the search box when not needed */
    showSearch?: boolean
    /** Hide the category/tag chip filters */
    showFilters?: boolean

    /** Override page size */
    pageSize?: number
}

function formatCount(n: number, singular: string, plural?: string) {
    return `${n} ${n === 1 ? singular : plural ?? singular + "s"}`
}

export async function PostGridPage({
    title,
    description,
    breadcrumbs,
    lockedFilters,
    query,
    page = 1,
    categories = [],
    tags = [],
    activeCategorySlug,
    activeTagSlug,
    basePath,
    preservedParams = {},
    children,
    showSearch = true,
    showFilters = true,
    pageSize = 12,
}: PostGridPageProps) {
    const offset = (page - 1) * pageSize

    const filters = {
        query: query?.trim() || undefined,
        categorySlug: lockedFilters?.categorySlug ?? activeCategorySlug,
        tagSlug: lockedFilters?.tagSlug ?? activeTagSlug,
    }

    const [posts, total] = await Promise.all([
        listPublishedPostsAction({ ...filters, limit: pageSize, offset }),
        countPublishedPostsAction(filters),
    ])

    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const hasFilters = Boolean(query || activeCategorySlug || activeTagSlug)

    // Pagination params: locked filters stay out of the query string, chips are preserved
    const paginationParams: Record<string, string | undefined> = {
        q: query,
        ...(lockedFilters?.categorySlug ? {} : { category: activeCategorySlug }),
        ...(lockedFilters?.tagSlug ? {} : { tag: activeTagSlug }),
        ...preservedParams,
    }

    return (
        <div className="container-x py-14 sm:py-20">
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav
                    aria-label="Breadcrumb"
                    className="mb-6 flex items-center gap-1 text-sm text-[#a1a1a1] flex-wrap"
                >
                    {breadcrumbs.map((crumb, i) => {
                        const isLast = i === breadcrumbs.length - 1
                        return (
                            <span key={`${crumb.label}-${i}`} className="inline-flex items-center gap-1">
                                {crumb.href && !isLast ? (
                                    <Link
                                        href={crumb.href}
                                        className="text-[#a1a1a1] hover:text-blue-dark hover:underline transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className={cn(isLast && "text-ink font-semibold")}>
                                        {crumb.label}
                                    </span>
                                )}
                                {!isLast && (
                                    <ChevronRight className="h-3.5 w-3.5 text-[#a1a1a1]" />
                                )}
                            </span>
                        )
                    })}
                </nav>
            )}

            {/* Hero */}
            <header className="flex flex-col gap-3 mb-8">
                <h1 className="section-heading">
                    {title}
                </h1>
                {description && (
                    <p className="section-copy max-w-2xl">
                        {description}
                    </p>
                )}
            </header>

            {/* Optional custom content (e.g. subcategories) */}
            {children && <div className="mb-8">{children}</div>}

            {/* Search */}
            {showSearch && (
                <div className="mb-6 max-w-md">
                    <Suspense fallback={null}>
                        <PublicSearch />
                    </Suspense>
                </div>
            )}

            {/* Filters */}
            {showFilters && (categories.length > 0 || tags.length > 0) && (
                <div className="mb-8">
                    <Suspense fallback={null}>
                        <NewsFilters
                            categories={categories}
                            tags={tags}
                            activeCategorySlug={activeCategorySlug}
                            activeTagSlug={activeTagSlug}
                            basePath={basePath}
                            lockedCategory={!!lockedFilters?.categorySlug}
                            lockedTag={!!lockedFilters?.tagSlug}
                        />
                    </Suspense>
                </div>
            )}

            {/* Result count */}
            <div className="flex items-center justify-between mb-4 text-sm text-[#a1a1a1]">
                <span>
                    {formatCount(total, "post")}
                    {hasFilters && " matching your filters"}
                </span>
            </div>

            {/* Grid */}
            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 border border-line rounded-lg bg-card">
                    <FileText className="h-12 w-12 text-[#a1a1a1]" />
                    <p className="text-lg font-semibold text-ink">No posts found</p>
                    <p className="text-sm text-[#a1a1a1]">
                        {hasFilters
                            ? "Try removing some filters or search terms."
                            : "Check back soon for new content."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {posts.map((post: any, i: number) => (
                        <PublicPostCard
                            key={post.id}
                            post={post}
                            featured={i === 0 && page === 1 && !hasFilters}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-10">
                    <PublicPagination
                        currentPage={page}
                        totalPages={totalPages}
                        basePath={basePath}
                        searchParams={paginationParams}
                    />
                </div>
            )}
        </div>
    )
}