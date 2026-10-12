import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
    currentPage: number // 1-indexed
    totalPages: number
    /** Base path, e.g. /news */
    basePath: string
    /** Current query params to preserve */
    searchParams: Record<string, string | undefined>
}

function buildHref(
    basePath: string,
    params: Record<string, string | undefined>,
    page: number
) {
    const sp = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (value && key !== "page") sp.set(key, value)
    }
    if (page > 1) sp.set("page", String(page))
    const qs = sp.toString()
    return qs ? `${basePath}?${qs}` : basePath
}

export function PublicPagination({
    currentPage,
    totalPages,
    basePath,
    searchParams,
}: Props) {
    if (totalPages <= 1) return null

    // Show up to 5 page numbers, centered on current
    const pages: (number | "ellipsis")[] = []
    const window = 2
    const start = Math.max(2, currentPage - window)
    const end = Math.min(totalPages - 1, currentPage + window)

    pages.push(1)
    if (start > 2) pages.push("ellipsis")
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push("ellipsis")
    if (totalPages > 1) pages.push(totalPages)

    return (
        <nav
            className="flex items-center justify-center gap-1 flex-wrap"
            aria-label="Pagination"
        >
            <PageLink
                href={buildHref(basePath, searchParams, Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-4 w-4" />
            </PageLink>

            {pages.map((p, i) =>
                p === "ellipsis" ? (
                    <span
                        key={`e-${i}`}
                        className="px-3 py-2 text-sm text-brand-muted"
                    >
                        …
                    </span>
                ) : (
                    <PageLink
                        key={p}
                        href={buildHref(basePath, searchParams, p)}
                        active={p === currentPage}
                    >
                        {p}
                    </PageLink>
                )
            )}

            <PageLink
                href={buildHref(
                    basePath,
                    searchParams,
                    Math.min(totalPages, currentPage + 1)
                )}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
            >
                <ChevronRight className="h-4 w-4" />
            </PageLink>
        </nav>
    )
}

function PageLink({
    href,
    active,
    disabled,
    children,
    ...rest
}: {
    href: string
    active?: boolean
    disabled?: boolean
    children: React.ReactNode
} & React.AriaAttributes) {
    if (disabled) {
        return (
            <span
                className="inline-flex items-center justify-center min-w-9 h-9 rounded-0 text-[13px] text-[#a1a1a1] opacity-50 px-3"
                {...rest}
            >
                {children}
            </span>
        )
    }
    return (
        <Link
            href={href}
            className={cn(
                "inline-flex items-center justify-center min-w-9 h-9 rounded-0 border text-[13px] font-semibold transition-colors px-3",
                active
                    ? "bg-blue-dark text-white border-blue-dark shadow-btn"
                    : "border-line text-[#a1a1a1] hover:border-blue-dark hover:text-blue-dark dark:border-[#333] dark:text-[#6b7280]"
            )}
            {...rest}
        >
            {children}
        </Link>
    )
}