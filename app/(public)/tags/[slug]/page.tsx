import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { getCategoriesWithCountsAction } from "@/actions/category.actions"
import { getTagsWithCountsAction, getTagWithCountBySlugAction } from "@/actions/tag.actions"
import { PostGridPage } from "@/components/public/posts/post-grid"

type PageProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{
        q?: string
        category?: string
        page?: string
    }>
}

// ---------- Metadata ----------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const tag = await getTagWithCountBySlugAction(slug)
    if (!tag) return { title: "Tag not found" }

    const name = tag.name as string
    const description = `Posts tagged with #${name}.`

    return {
        title: `#${name} — Posts`,
        description,
        openGraph: {
            title: `#${name} — Posts`,
            description,
        },
    }
}

// ---------- Page ----------

export default async function TagArchivePage({ params, searchParams }: PageProps) {
    const { slug } = await params
    const sp = await searchParams

    const tag = await getTagWithCountBySlugAction(slug)
    if (!tag) notFound()

    const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)

    const [categories, tags] = await Promise.all([
        getCategoriesWithCountsAction(),
        getTagsWithCountsAction(),
    ])

    const total = tag.post_count ?? 0
    const description =
        total > 0
            ? `${total} ${total === 1 ? "post" : "posts"} tagged #${tag.name}.`
            : `No posts tagged #${tag.name} yet.`

    return (
        <PostGridPage
            title={`#${tag.name}`}
            description={description}
            breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "News", href: "/news" },
                { label: "Tags", href: "/tags" },
                { label: `#${tag.name}` },
            ]}
            query={sp.q}
            page={page}
            lockedFilters={{ tagSlug: tag.slug }}
            categories={categories as any}
            tags={tags as any}
            activeCategorySlug={sp.category}
            basePath={`/tags/${tag.slug}`}
            showFilters
        />
    )
}