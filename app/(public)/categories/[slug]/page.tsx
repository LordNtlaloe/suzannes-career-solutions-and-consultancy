
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { FolderTree, ChevronRight } from "lucide-react"

import { getCategoriesWithCountsAction } from "@/actions/category.actions"
import { getTagsWithCountsAction } from "@/actions/tag.actions"
import {
    getCategoryBySlug,
    getCategoryPathToRoot,
    getSubcategory,
} from "@/db/queries/categories"
import { PostGridPage } from "@/components/public/posts/post-grid"

type PageProps = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{
        q?: string
        tag?: string
        page?: string
    }>
}

// ---------- Metadata ----------

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const category = await getCategoryBySlug(slug)
    if (!category) return { title: "Category not found" }

    const name = (category as any).name as string
    const description =
        (category as any).description ??
        `Posts filed under ${name}.`

    return {
        title: `${name} — Posts`,
        description,
        openGraph: {
            title: `${name} — Posts`,
            description,
        },
    }
}

// ---------- Page ----------

export default async function CategoryArchivePage({
    params,
    searchParams,
}: PageProps) {
    const { slug } = await params
    const sp = await searchParams

    const category = await getCategoryBySlug(slug)
    if (!category) notFound()

    const cat = category as unknown as {
        id: string
        name: string
        slug: string
        description: string | null
        parent_id: string | null
    }

    const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1)

    // Fetch in parallel: parent path, subcategories, global filter options
    const [pathToRoot, subcategories, allCategories, allTags] = await Promise.all([
        getCategoryPathToRoot(cat.id),
        getSubcategory(cat.id),
        getCategoriesWithCountsAction(),
        getTagsWithCountsAction(),
    ])

    // Breadcrumbs: Home > Posts > [ancestors] > Current
    const ancestors = (pathToRoot as any[]).slice(0, -1) // exclude self
    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Posts", href: "/posts" },
        ...ancestors.map((a) => ({
            label: a.name as string,
            href: `/categories/${a.slug}`,
        })),
        { label: cat.name },
    ]

    const description =
        cat.description ?? `Posts filed under ${cat.name}.`

    const subcats = (subcategories as any[]) ?? []

    return (
        <PostGridPage
            title={cat.name}
            description={description}
            breadcrumbs={breadcrumbs}
            query={sp.q}
            page={page}
            lockedFilters={{ categorySlug: cat.slug }}
            categories={allCategories as any}
            tags={allTags as any}
            activeTagSlug={sp.tag}
            basePath={`/categories/${cat.slug}`}
            showFilters
        >
            {/* Subcategory strip — only if there are children */}
            {subcats.length > 0 && (
                <section className="flex flex-col gap-3">
                    <h2 className="text-sm font-medium text-brand-muted uppercase tracking-wide flex items-center gap-2">
                        <FolderTree className="h-3.5 w-3.5" />
                        Subcategories
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {subcats.map((sub) => (
                            <Link
                                key={sub.id}
                                href={`/categories/${sub.slug}`}
                                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium hover:bg-line transition-colors"
                            >
                                {sub.name}
                                {typeof sub.post_count === "number" && (
                                    <span className="text-xs text-brand-muted tabular-nums">
                                        {sub.post_count}
                                    </span>
                                )}
                                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </PostGridPage>
    )
}