import Link from "next/link"

type Props = {
    name: string
    slug: string
    postCount?: number
    asLink?: boolean
}

export function CategoryBadge({ name, slug, postCount, asLink }: Props) {
    const content = (
        <span className="inline-flex items-center gap-1 rounded-full bg-light px-2.5 py-0.5 text-xs font-medium text-brand-muted hover:bg-line">
            {name}
            {typeof postCount === "number" && (
                <span className="opacity-60">· {postCount}</span>
            )}
        </span>
    )

    if (asLink) {
        return <Link href={`/categories/${slug}`}>{content}</Link>
    }
    return content
}