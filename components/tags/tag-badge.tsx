import Link from "next/link"
import { Hash } from "lucide-react"

type Props = {
    name: string
    slug: string
    postCount?: number
    asLink?: boolean
    onRemove?: () => void
}

export function TagBadge({
    name,
    slug,
    postCount,
    asLink = false,
    onRemove,
}: Props) {
    const content = (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue/12 px-2.5 py-0.5 text-[11px] font-semibold text-blue-dark hover:bg-blue/20">
            <Hash className="h-3 w-3" />
            {name}
            {typeof postCount === "number" && (
                <span className="opacity-60">· {postCount}</span>
            )}
        </span>
    )

    if (onRemove) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue/12 pl-2.5 pr-1 py-0.5 text-[11px] font-semibold text-blue-dark">
                <Hash className="h-3 w-3" />
                {name}
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-1 rounded-full hover:bg-blue/25 px-1 leading-none"
                    aria-label={`Remove ${name}`}
                >
                    ×
                </button>
            </span>
        )
    }

    if (asLink) {
        return <Link href={`/tags/${slug}`}>{content}</Link>
    }
    return content
}