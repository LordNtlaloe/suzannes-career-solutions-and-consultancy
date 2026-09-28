import type { Metadata } from "next"
import Link from "next/link"
import { Hash } from "lucide-react"

import { getTagsWithCountsAction } from "@/actions/tag.actions"

export const metadata: Metadata = {
    title: "Tags",
    description: "Browse all tags used across our posts.",
}

export default async function TagsIndexPage() {
    const tags = (await getTagsWithCountsAction()) as Array<{
        id: string
        name: string
        slug: string
        post_count?: number
    }>

    const sorted = [...tags].sort(
        (a, b) => (b.post_count ?? 0) - (a.post_count ?? 0)
    )

    return (
        <div className="container-x py-14 sm:py-20">
            <header className="flex flex-col gap-3 mb-8">
                <h1 className="section-heading">
                    Tags
                </h1>
                <p className="section-copy max-w-2xl">
                    Browse all tags used across our posts.
                </p>
            </header>

            {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 border border-line rounded-lg bg-white">
                    <Hash className="h-12 w-12 text-[#a1a1a1]" />
                    <p className="text-lg font-semibold text-ink">No tags yet</p>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {sorted.map((tag) => (
                        <Link
                            key={tag.id}
                            href={`/tags/${tag.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-blue-dark hover:border-blue-dark hover:shadow-soft transition-all"
                        >
                            <Hash className="h-3.5 w-3.5 opacity-60" />
                            {tag.name}
                            <span className="text-[11px] text-[#a1a1a1] tabular-nums">
                                {tag.post_count ?? 0}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}