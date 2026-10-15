"use client"

import { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FolderTree, Hash } from "lucide-react"
import { Filters } from "./filters/filters"
import { createFilterQuery, createFilterRule } from "./filters/filters-query"
import type { FilterField, FilterQuery } from "./filters/filters-types"

type Option = {
    id: string
    name: string
    slug: string
    post_count?: number
}

type Props = {
    categories: Option[]
    tags: Option[]
    basePath: string
    activeCategorySlug?: string
    activeTagSlug?: string
    lockedCategory?: boolean
    lockedTag?: boolean
}

export function NewsFilters({
    categories,
    tags,
    basePath,
    activeCategorySlug,
    activeTagSlug,
    lockedCategory,
    lockedTag,
}: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const fields = useMemo<FilterField[]>(() => {
        const result: FilterField[] = []
        if (!lockedCategory && categories.length > 0) {
            result.push({
                id: "category",
                label: "Category",
                type: "select",
                icon: <FolderTree className="h-4 w-4" />,
                options: categories.map((category) => ({
                    value: category.slug,
                    label: category.name,
                    count: category.post_count,
                })),
            })
        }
        if (!lockedTag && tags.length > 0) {
            result.push({
                id: "tag",
                label: "Tag",
                type: "select",
                icon: <Hash className="h-4 w-4" />,
                options: tags.map((tag) => ({
                    value: tag.slug,
                    label: tag.name,
                    count: tag.post_count,
                })),
            })
        }
        return result
    }, [categories, tags, lockedCategory, lockedTag])

    const query = useMemo<FilterQuery>(() => {
        const rules = []
        if (!lockedCategory && activeCategorySlug) {
            rules.push(
                createFilterRule({
                    id: "category-rule",
                    path: ["category"],
                    value: activeCategorySlug,
                })
            )
        }
        if (!lockedTag && activeTagSlug) {
            rules.push(
                createFilterRule({
                    id: "tag-rule",
                    path: ["tag"],
                    value: activeTagSlug,
                })
            )
        }
        return createFilterQuery(rules)
    }, [activeCategorySlug, activeTagSlug, lockedCategory, lockedTag])

    const handleChange = (next: FilterQuery) => {
        const params = new URLSearchParams(searchParams.toString())
        const categoryRule = next.rules.find((rule) => rule.path[0] === "category")
        const tagRule = next.rules.find((rule) => rule.path[0] === "tag")

        if (categoryRule && typeof categoryRule.value === "string") {
            params.set("category", categoryRule.value)
        } else {
            params.delete("category")
        }

        if (tagRule && typeof tagRule.value === "string") {
            params.set("tag", tagRule.value)
        } else {
            params.delete("tag")
        }

        params.delete("page")
        const qs = params.toString()
        router.push(qs ? `${basePath}?${qs}` : basePath)
    }

    if (fields.length === 0) return null

    return (
        <Filters
            fields={fields}
            query={query}
            onQueryChange={handleChange}
            showClear
        />
    )
}
