import type { Metadata } from "next"
import {
    getCategoriesWithCountsAction,
} from "@/actions/category.actions"
import { getTagsWithCountsAction } from "@/actions/tag.actions"
import { PostGridPage } from "@/components/public/posts/post-grid"

type SearchParams = Promise<{
    q?: string
    category?: string
    tag?: string
    page?: string
}>

export async function generateMetadata({
    searchParams,
}: {
    searchParams: SearchParams
}): Promise<Metadata> {
    const sp = await searchParams
    const parts: string[] = []

    if (sp.category) parts.push(sp.category)
    if (sp.tag) parts.push(`#${sp.tag}`)
    if (sp.q) parts.push(`"${sp.q}"`)

    const title = parts.length ? `News — ${parts.join(" ")}` : "News"

    return {
        title,
        description:
            "Read the latest news, updates, and tutorials from the team.",
        openGraph: {
            title,
            description:
                "Read the latest news, updates, and tutorials from the team.",
        },
    }
}

export default async function PublicPostsPage({
    searchParams,
}: {
    searchParams: SearchParams
}) {
    const sp = await searchParams
    const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)

    const [categories, tags] = await Promise.all([
        getCategoriesWithCountsAction(),
        getTagsWithCountsAction(),
    ])

    return (
        <PostGridPage
            title="News & Updates"
            description="News, updates, and notes from the team."
            query={sp.q}
            page={page}
            activeCategorySlug={sp.category}
            activeTagSlug={sp.tag}
            categories={categories as any}
            tags={tags as any}
            basePath="/news"
        />
    )
}