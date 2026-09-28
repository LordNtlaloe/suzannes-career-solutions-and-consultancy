import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { getCategoryPathToRoot } from "@/db/queries/categories"

type Props = {
    categoryId: string
}

export async function CategoryBreadcrumb({ categoryId }: Props) {
    const path = (await getCategoryPathToRoot(categoryId)) as unknown as Array<{
        id: string
        name: string
        slug: string
    }>

    if (!path.length) return null

    return (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] text-[#a1a1a1] flex-wrap">
            <Link href="/categories" className="text-blue-dark hover:opacity-70 transition-opacity">
                Categories
            </Link>
            {path.map((node, i) => {
                const isLast = i === path.length - 1
                return (
                    <span key={node.id} className="inline-flex items-center gap-1">
                        <ChevronRight className="h-3 w-3" />
                        {isLast ? (
                            <span className="text-ink font-semibold">{node.name}</span>
                        ) : (
                            <Link
                                href={`/categories/${node.slug}`}
                                className="text-blue-dark hover:opacity-70 transition-opacity"
                            >
                                {node.name}
                            </Link>
                        )}
                    </span>
                )
            })}
        </nav>
    )
}